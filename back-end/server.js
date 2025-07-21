require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const winston = require('winston');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth.route');
const bcrypt = require('bcrypt');
const { combine, timestamp, printf } = winston.format;

// 1. Cấu hình logging
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5 * 1024 * 1024
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// Tạo thư mục logs nếu chưa tồn tại
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Cấu hình CORS chi tiết
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Middleware bảo mật
app.use(helmet());
app.use(bodyParser.json({ limit: '10kb' }));

// 3. Giới hạn request rate
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // giới hạn mỗi IP 100 requests
});
app.use('/api/', limiter);

// 4. Kết nối database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');
    
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('🔄 Database đã đồng bộ (alter)');
    }
  } catch (error) {
    console.error('❌ Lỗi database:', error);
    process.exit(1); // Thoát nếu không kết nối được database
  }
}

// 5. Routes
app.use('/api/auth', authRoutes);

// 6. Route kiểm tra sức khỏe
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 7. Xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('🔥 Lỗi:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Lỗi server' : err.message;
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 2. Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Cấu hình MySQL Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'dulieuduongbo',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  timezone: '+00:00'
}).promise();

// 4. Xử lý sự kiện kết nối
pool.on('connection', (connection) => {
  logger.info(`MySQL connection established (ID: ${connection.threadId})`);
  setInterval(() => connection.ping(), 30000);
});

pool.on('acquire', (connection) => {
  logger.debug(`Connection acquired (ID: ${connection.threadId})`);
});

pool.on('release', (connection) => {
  logger.debug(`Connection released (ID: ${connection.threadId})`);
});

pool.on('error', (err) => {
  logger.error('MySQL Pool Error:', {
    code: err.code,
    message: err.message,
    stack: err.stack
  });
});

// 5. Hàm kiểm tra kết nối database
async function checkDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1');
    logger.info('Database connection check: OK');
    return true;
  } catch (err) {
    logger.error('Database connection check failed:', {
      code: err.code,
      message: err.message
    });
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// 6. Middleware xử lý upload file
function createUploadMiddleware(loaiDoiTuong, doiTuongID = 'temp') {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(__dirname, 'uploads', loaiDoiTuong.toUpperCase(), String(doiTuongID));
      
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      cb(null, filename);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip'];
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Loại file ${ext} không được hỗ trợ`));
      }
    }
  }).array('files', 5); // Tối đa 5 files
}

// 7. Health Check Endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  const status = dbStatus ? 200 : 503;

  res.status(status).json({
    status: dbStatus ? 'healthy' : 'unhealthy',
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});
app.post('/api/nhathau', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('START TRANSACTION');

    const {
      TenNhaThau,
      Loai,
      MaSoThue,
      DiaChiTruSo,
      SoDienThoai,
      Email,
      NguoiDaiDien,
      ChucVuNguoiDaiDien,
      GiayPhepKinhDoanh,
      NgayCap,
      NoiCap,
      GhiChu
    } = req.body;

    // Validate required fields
    if (!TenNhaThau || !MaSoThue) {
      throw { code: 'MISSING_FIELDS', message: 'Tên nhà thầu và mã số thuế là bắt buộc' };
    }

    // 1. Thêm nhà thầu vào bảng nhathau
    const [nhathauResult] = await connection.query(
      `INSERT INTO nhathau (
        TenNhaThau, Loai, MaSoThue, DiaChiTruSo, SoDienThoai,
        Email, NguoiDaiDien, ChucVuNguoiDaiDien, GiayPhepKinhDoanh,
        NgayCap, NoiCap, GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TenNhaThau, Loai, MaSoThue, DiaChiTruSo, SoDienThoai,
        Email, NguoiDaiDien, ChucVuNguoiDaiDien, GiayPhepKinhDoanh,
        NgayCap, NoiCap, GhiChu
      ]
    );

    const NhaThauID = nhathauResult.insertId;

    // 2. Tạo tài khoản tự động nếu có email
    let taiKhoanResult = null;
    let plainPassword = null;
    
    if (Email) {
      try {
        // Tạo username từ email
        const username = Email.split('@')[0];
        
        // Tạo password: username + 6 số random
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        plainPassword = `${username}${randomSuffix}`;
        
        // Lấy ID tiếp theo cho tài khoản
        const [maxIdResult] = await connection.query(
          'SELECT MAX(NguoiDungID) as maxId FROM taikhoan'
        );
        const nextId = (maxIdResult[0].maxId || 0) + 1;
        
        // Tạo tài khoản (KHÔNG băm mật khẩu)
        [taiKhoanResult] = await connection.query(
          `INSERT INTO taikhoan (
            NguoiDungID, TenDangNhap, MatKhau, HoTen, Email, 
            PhanQuyenID, NhaThauID, TrangThai
          ) VALUES (?, ?, ?, ?, ?, 9, ?, 1)`,
          [nextId, Email, plainPassword, TenNhaThau, Email, NhaThauID]
        );
      } catch (tkError) {
        console.error('Lỗi khi tạo tài khoản:', tkError);
        // Không rollback nếu chỉ lỗi tạo tài khoản
      }
    }

    await connection.query('COMMIT');
    
    // 3. Trả về response
    const response = {
      success: true,
      message: 'Thêm nhà thầu thành công',
      NhaThauID,
      ...(taiKhoanResult && { 
        TaiKhoanInfo: {
          NguoiDungID: taiKhoanResult.insertId,
          TenDangNhap: Email,
          MatKhau: plainPassword, // Trả về mật khẩu gốc
          GhiChu: 'Vui lòng lưu lại mật khẩu này'
        }
      })
    };

    res.status(201).json(response);

  } catch (error) {
    await connection.query('ROLLBACK');
    
    console.error('Lỗi khi thêm nhà thầu:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: error.sqlMessage.includes('MaSoThue') 
          ? 'Mã số thuế đã tồn tại' 
          : 'Email đã được sử dụng' 
      });
    }
    
    res.status(error.code === 'MISSING_FIELDS' ? 400 : 500).json({ 
      success: false,
      error: error.message || 'Lỗi server khi thêm nhà thầu' 
    });
  } finally {
    connection.release();
  }
});
app.post('/capNhatTienDoTatCa', async (req, res) => {
  try {
    // Lấy tất cả dự án tổng
    const [duAnTongList] = await pool.query(
      'SELECT DuAnID FROM duan'
    );
    
    const currentTime = new Date(); // Thời điểm hiện tại
    
    // Gọi stored procedure cho từng dự án và cập nhật thời gian
    await Promise.all(duAnTongList.map(async (duAn) => {
      // Cập nhật tiến độ dự án
      await pool.query('CALL CapNhatTienDoDuAn(?)', [duAn.DuAnID]);
      
      // Cập nhật thời gian cập nhật gần nhất
      await pool.query(
        'UPDATE duan SET ThoiGianCapNhatGanNhat = ? WHERE DuAnID = ?',
        [currentTime, duAn.DuAnID]
      );
    }));
    
    res.json({
      success: true,
      message: `Đã cập nhật tiến độ và thời gian cập nhật cho ${duAnTongList.length} dự án tổng`,
      thoiGianCapNhat: currentTime.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tiến độ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/goiThau/capNhatPhanTramTatCa', async (req, res) => {
  try {
    // Lấy tất cả gói thầu
    const [goiThauList] = await pool.query(
      'SELECT GoiThau_ID FROM goithau'
    );
    
    const currentTime = new Date(); // Thời điểm hiện tại
    
    // Gọi stored procedure để tính toán và cập nhật phần trăm cho tất cả gói thầu
    await pool.query('CALL CalculateAllGoiThauPercentages()');
    
    // Cập nhật thời gian cập nhật gần nhất cho tất cả gói thầu
    await Promise.all(goiThauList.map(async (goiThau) => {
      await pool.query(
        'UPDATE goithau SET ThoiGianCapNhatGanNhat = ? WHERE GoiThau_ID = ?',
        [currentTime, goiThau.GoiThau_ID]
      );
    }));
    
    res.json({
      success: true,
      message: `Đã cập nhật phần trăm tiến độ và thời gian cập nhật cho ${goiThauList.length} gói thầu`,
      thoiGianCapNhat: currentTime.toISOString()
    });
  } catch (error) {
    console.error('Error updating all package percentages:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phần trăm tiến độ các gói thầu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/duAnTongList', async (req, res) => {
  try {
    const [duAnTongList] = await pool.query(
      'SELECT * FROM duan WHERE ParentID IS NULL'
    );

    if (duAnTongList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án TỔNG nào'
      });
    }

    const result = await Promise.all(duAnTongList.map(async (duAnTong) => {
      const duAnId = duAnTong.DuAnID;
      
      // Lấy tất cả dự án thành phần
      const [duAnThanhPhan] = await pool.query(
        'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC', 
        [duAnId]
      );

      // Danh sách tất cả ID dự án (chính + thành phần)
      const allProjectIds = [duAnId, ...duAnThanhPhan.map(d => d.DuAnID)];

      // 1. Lấy tất cả hạng mục với trạng thái
      const [allHangMuc] = await pool.query(`
        SELECT 
          hm.HangMucID,
          CASE
            WHEN (SELECT SUM(kh.KhoiLuongKeHoach) 
                  FROM quanlykehoach kh 
                  WHERE kh.HangMucID = hm.HangMucID) <= 0 THEN 'KHONG_XAC_DINH'
            WHEN (SELECT SUM(td.KhoiLuongThucHien) 
                  FROM tiendothuchien td 
                  JOIN quanlykehoach kh ON td.KeHoachID = kh.KeHoachID
                  WHERE kh.HangMucID = hm.HangMucID) >= 
                 (SELECT SUM(kh.KhoiLuongKeHoach) 
                  FROM quanlykehoach kh 
                  WHERE kh.HangMucID = hm.HangMucID) THEN 'HOAN_THANH'
            WHEN CURRENT_DATE > (SELECT MAX(kh.NgayKetThuc) 
                                FROM quanlykehoach kh 
                                WHERE kh.HangMucID = hm.HangMucID) THEN 'CHAM_TIEN_DO'
            ELSE 'KE_HOACH'
          END as trangThai
        FROM hangmuc hm
        JOIN goithau gt ON hm.GoiThauID = gt.GoiThau_ID
        WHERE gt.DuAn_ID IN (?)
      `, [allProjectIds]);

      // 2. Tính toán số lượng hạng mục theo trạng thái
      let soHangMucHoanThanh = 0;
      let soHangMucChamTienDo = 0;
      let soHangMucKeHoach = 0;

      allHangMuc.forEach(hm => {
        if (hm.trangThai === 'HOAN_THANH') soHangMucHoanThanh++;
        else if (hm.trangThai === 'CHAM_TIEN_DO') soHangMucChamTienDo++;
        else soHangMucKeHoach++; // Bao gồm cả 'KE_HOACH' và 'KHONG_XAC_DINH'
      });

      const tongSoHangMuc = allHangMuc.length;

      // 3. Tính phần trăm theo yêu cầu
      const phanTramHoanThanh = tongSoHangMuc > 0 
        ? (soHangMucHoanThanh / tongSoHangMuc) * 100 
        : 0;
      
      const phanTramChamTienDo = tongSoHangMuc > 0
        ? (soHangMucChamTienDo / tongSoHangMuc) * 100
        : 0;
      
      const phanTramKeHoach = 100 - phanTramHoanThanh - phanTramChamTienDo;

      // 4. Lấy thông tin khác (gói thầu, nhà thầu...)
      const [goiThauCount] = await pool.query(
        'SELECT COUNT(*) as count FROM goithau WHERE DuAn_ID IN (?)',
        [allProjectIds]
      );

      const [contractors] = await pool.query(`
        SELECT DISTINCT n.* 
        FROM nhathau n
        JOIN goithau_nhathau gn ON n.NhaThauID = gn.NhaThauID
        JOIN goithau g ON gn.GoiThau_ID = g.GoiThau_ID
        WHERE g.DuAn_ID IN (?)
      `, [allProjectIds]);

      return {
        ...duAnTong,
        soLuongDuAnThanhPhan: duAnThanhPhan.length,
        soLuongGoiThau: goiThauCount[0].count,
        danhSachNhaThau: contractors,
        thongKe: {
          tongSoHangMuc,
          soHangMucHoanThanh,
          soHangMucChamTienDo,
          soHangMucKeHoach,
          phanTramHoanThanh: phanTramHoanThanh.toFixed(2),
          phanTramChamTienDo: phanTramChamTienDo.toFixed(2),
          phanTramKeHoach: phanTramKeHoach.toFixed(2)
        }
      };
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        sql: error.sql
      } : undefined
    });
  }
});
app.get('/duAnTong', async (req, res) => {
  try {
    const [duAnTongList] = await pool.query(
      'SELECT * FROM duan WHERE ParentID IS NULL'
    );

    if (duAnTongList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án TỔNG nào'
      });
    }

    const result = await Promise.all(duAnTongList.map(async (duAnTong) => {
      const duAnId = duAnTong.DuAnID;
      
      // Get all sub-projects
      const [duAnThanhPhan] = await pool.query(
        'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC', 
        [duAnId]
      );

      // Initialize totals
      let tongKhoiLuongKeHoach = 0;
      let tongKhoiLuongHoanThanh = 0;
      let tongKhoiLuongChamTienDo = 0;
      let soLuongGoiThau = 0;

      // Process each sub-project
      const duAnThanhPhanWithDetails = await Promise.all(duAnThanhPhan.map(async (duAnTP) => {
        // Get all contract packages for this sub-project
        const [goiThauList] = await pool.query(
          'SELECT * FROM goithau WHERE DuAn_ID = ? ORDER BY GoiThau_ID ASC',
          [duAnTP.DuAnID]
        );

        // Cập nhật tổng số gói thầu
        soLuongGoiThau += goiThauList.length;

        // Process each contract package
        const goiThauWithDetails = await Promise.all(goiThauList.map(async (goiThau) => {
          // Get all work items for this contract package
          const [hangMucList] = await pool.query(
            'SELECT * FROM hangmuc WHERE GoiThauID = ? ORDER BY HangMucID ASC',
            [goiThau.GoiThau_ID]
          );

          // Process each work item
          const hangMucWithDetails = await Promise.all(hangMucList.map(async (hangMuc) => {
            // Get all plans for this work item
            const [keHoachList] = await pool.query(
              'SELECT * FROM quanlykehoach WHERE HangMucID = ? ORDER BY KeHoachID ASC',
              [hangMuc.HangMucID]
            );

            // Process each plan
            const keHoachWithDetails = await Promise.all(keHoachList.map(async (keHoach) => {
              // Get all progress records for this plan
              const [tienDoList] = await pool.query(
                'SELECT * FROM tiendothuchien WHERE KeHoachID = ? ORDER BY NgayCapNhat ASC',
                [keHoach.KeHoachID]
              );

              // Calculate total actual quantity for this plan
              const tongThucHien = tienDoList.reduce((sum, td) => sum + td.KhoiLuongThucHien, 0);
              
              // Check if plan is completed (actual >= planned)
              const isHoanThanh = tongThucHien >= keHoach.KhoiLuongKeHoach;
              
              // Check if plan is delayed (not completed and past end date)
              const isChamTienDo = !isHoanThanh && new Date() > new Date(keHoach.NgayKetThuc);
              
              // Calculate quantities
              const khoiLuongHoanThanh = isHoanThanh ? keHoach.KhoiLuongKeHoach : 0;
              const khoiLuongChamTienDo = isChamTienDo ? (keHoach.KhoiLuongKeHoach - tongThucHien) : 0;

              return {
                keHoachId: keHoach.KeHoachID,
                khoiLuongKeHoach: keHoach.KhoiLuongKeHoach,
                khoiLuongHoanThanh,
                khoiLuongChamTienDo,
                ngayKetThuc: keHoach.NgayKetThuc
              };
            }));

            // Aggregate quantities for work item
            const hangMucKhoiLuong = keHoachWithDetails.reduce((acc, curr) => ({
              khoiLuongKeHoach: acc.khoiLuongKeHoach + curr.khoiLuongKeHoach,
              khoiLuongHoanThanh: acc.khoiLuongHoanThanh + curr.khoiLuongHoanThanh,
              khoiLuongChamTienDo: acc.khoiLuongChamTienDo + curr.khoiLuongChamTienDo
            }), { khoiLuongKeHoach: 0, khoiLuongHoanThanh: 0, khoiLuongChamTienDo: 0 });

            return {
              ...hangMuc,
              ...hangMucKhoiLuong
            };
          }));

          // Aggregate quantities for contract package
          const goiThauKhoiLuong = hangMucWithDetails.reduce((acc, curr) => ({
            khoiLuongKeHoach: acc.khoiLuongKeHoach + curr.khoiLuongKeHoach,
            khoiLuongHoanThanh: acc.khoiLuongHoanThanh + curr.khoiLuongHoanThanh,
            khoiLuongChamTienDo: acc.khoiLuongChamTienDo + curr.khoiLuongChamTienDo
          }), { khoiLuongKeHoach: 0, khoiLuongHoanThanh: 0, khoiLuongChamTienDo: 0 });

          return {
            ...goiThau,
            ...goiThauKhoiLuong,
            hangMuc: hangMucWithDetails
          };
        }));

        // Aggregate quantities for sub-project
        const duAnTPKhoiLuong = goiThauWithDetails.reduce((acc, curr) => ({
          khoiLuongKeHoach: acc.khoiLuongKeHoach + curr.khoiLuongKeHoach,
          khoiLuongHoanThanh: acc.khoiLuongHoanThanh + curr.khoiLuongHoanThanh,
          khoiLuongChamTienDo: acc.khoiLuongChamTienDo + curr.khoiLuongChamTienDo
        }), { khoiLuongKeHoach: 0, khoiLuongHoanThanh: 0, khoiLuongChamTienDo: 0 });

        // Get coordinates from first and last contract package
        const coordinates = goiThauList.length > 0 ? {
          start: {
            lat: goiThauList[0].ToaDo_BatDau_Y,
            lng: goiThauList[0].ToaDo_BatDau_X
          },
          end: {
            lat: goiThauList[goiThauList.length - 1].ToaDo_KetThuc_Y,
            lng: goiThauList[goiThauList.length - 1].ToaDo_KetThuc_X
          }
        } : null;

        return {
          ...duAnTP,
          ...duAnTPKhoiLuong,
          coordinates,
          goiThau: goiThauWithDetails
        };
      }));

      // Calculate totals for main project
      const mainProjectTotals = duAnThanhPhanWithDetails.reduce((acc, curr) => ({
        khoiLuongKeHoach: acc.khoiLuongKeHoach + curr.khoiLuongKeHoach,
        khoiLuongHoanThanh: acc.khoiLuongHoanThanh + curr.khoiLuongHoanThanh,
        khoiLuongChamTienDo: acc.khoiLuongChamTienDo + curr.khoiLuongChamTienDo
      }), { khoiLuongKeHoach: 0, khoiLuongHoanThanh: 0, khoiLuongChamTienDo: 0 });

      // Calculate percentages
      const phanTramHoanThanh = mainProjectTotals.khoiLuongKeHoach > 0 
        ? (mainProjectTotals.khoiLuongHoanThanh / mainProjectTotals.khoiLuongKeHoach) * 100 
        : 0;
      
      const phanTramChamTienDo = mainProjectTotals.khoiLuongKeHoach > 0 
        ? (mainProjectTotals.khoiLuongChamTienDo / mainProjectTotals.khoiLuongKeHoach) * 100 
        : 0;
      
      const phanTramKeHoach = 100 - phanTramHoanThanh - phanTramChamTienDo;

      return {
        ...duAnTong,
        ...mainProjectTotals,
        soLuongDuAnThanhPhan: duAnThanhPhan.length,
        soLuongGoiThau: soLuongGoiThau, 
        phanTramHoanThanh: phanTramHoanThanh.toFixed(2),
        phanTramChamTienDo: phanTramChamTienDo.toFixed(2),
        phanTramKeHoach: phanTramKeHoach.toFixed(2),
        coordinates: duAnThanhPhanWithDetails[0]?.coordinates || null,
        duAnThanhPhan: duAnThanhPhanWithDetails
      };
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      PhanQuyenID: decoded.PhanQuyenID,
      NhaThauID: decoded.NhaThauID
      // ... các thông tin khác
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
app.get('/duAnList', async (req, res) => {
  try {
    const { nhaThauID } = req.query; // Nhận từ URL params
    
    let query = 'SELECT DuAnID, TenDuAn FROM duan';
    let params = [];
    
    if (nhaThauID) {
      query = `
        SELECT DISTINCT d.DuAnID, d.TenDuAn 
        FROM duan d
        JOIN goithau g ON d.DuAnID = g.DuAn_ID
        JOIN goithau_nhathau gn ON g.GoiThau_ID = gn.GoiThau_ID
        WHERE gn.NhaThauID = ?
        ORDER BY d.TenDuAn
      `;
      params = [nhaThauID];
    }

    const [duAnList] = await pool.query(query, params);
    res.json({ success: true, data: duAnList });
  } catch (error) {
    console.error('Lỗi database:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});
app.get('/duAnThanhPhan/:duAnId', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;
    const [duAnTong] = await pool.query(
      'SELECT * FROM duan WHERE DuAnID = ? AND ParentID IS NULL',
      [duAnId]
    );

    if (duAnTong.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án TỔNG với ID này'
      });
    }

    // 2. Lấy các dự án thành phần
    const [duAnThanhPhan] = await pool.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Tính toán khối lượng kế hoạch và thực hiện tổng thể
    let tongKhoiLuongKeHoach = 0;
    let tongKhoiLuongThucHien = 0;

    // Lấy tất cả gói thầu thuộc dự án tổng
    const [allGoiThau] = await pool.query(
      `SELECT gt.GoiThau_ID 
       FROM goithau gt
       JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE d.DuAnID = ? OR d.ParentID = ?`,
      [duAnId, duAnId]
    );

    if (allGoiThau.length > 0) {
      const goiThauIds = allGoiThau.map(gt => gt.GoiThau_ID);
      
      // Tính tổng khối lượng kế hoạch của toàn bộ dự án tổng
      const [tongKeHoach] = await pool.query(
        `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
         FROM quanlykehoach kh
         JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
         WHERE hm.GoiThauID IN (?)`,
        [goiThauIds]
      );
      tongKhoiLuongKeHoach = tongKeHoach[0].tongKeHoach || 0;

      // Tính tổng khối lượng thực hiện của toàn bộ dự án tổng
      const [tongThucHien] = await pool.query(
        `SELECT SUM(td.KhoiLuongThucHien) as tongThucHien
         FROM tiendothuchien td
         JOIN quanlykehoach kh ON td.KeHoachID = kh.KeHoachID
         JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
         WHERE hm.GoiThauID IN (?)`,
        [goiThauIds]
      );
      tongKhoiLuongThucHien = tongThucHien[0].tongThucHien || 0;
    }

    // 4. Lấy thông tin chi tiết cho từng dự án thành phần
    const duAnThanhPhanWithDetails = await Promise.all(
      duAnThanhPhan.map(async (duAnTP) => {
        // Lấy các gói thầu thuộc dự án thành phần này
        const [goiThauTP] = await pool.query(
          `SELECT gt.* 
           FROM goithau gt
           WHERE gt.DuAn_ID = ?
           ORDER BY gt.GoiThau_ID ASC`,
          [duAnTP.DuAnID]
        );

        // Tính toán khối lượng kế hoạch và thực hiện cho từng dự án thành phần
        let khoiLuongKeHoachTP = 0;
        let khoiLuongThucHienTP = 0;
        let phanTramKeHoach = 0;
        let phanTramHoanThanh = 0;
        let phanTramChamTienDo = 0;

        if (goiThauTP.length > 0) {
          const goiThauIds = goiThauTP.map(gt => gt.GoiThau_ID);
          
          // Tính tổng khối lượng kế hoạch của dự án thành phần
          const [keHoachTP] = await pool.query(
            `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
             FROM quanlykehoach kh
             JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
             WHERE hm.GoiThauID IN (?)`,
            [goiThauIds]
          );
          khoiLuongKeHoachTP = keHoachTP[0].tongKeHoach || 0;

          // Tính tổng khối lượng thực hiện của dự án thành phần
          const [thucHienTP] = await pool.query(
            `SELECT SUM(td.KhoiLuongThucHien) as tongThucHien
             FROM tiendothuchien td
             JOIN quanlykehoach kh ON td.KeHoachID = kh.KeHoachID
             JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
             WHERE hm.GoiThauID IN (?)`,
            [goiThauIds]
          );
          khoiLuongThucHienTP = thucHienTP[0].tongThucHien || 0;

          // Tính phần trăm
          if (tongKhoiLuongKeHoach > 0) {
            phanTramKeHoach = (khoiLuongKeHoachTP / tongKhoiLuongKeHoach) * 100;
            phanTramHoanThanh = (khoiLuongThucHienTP / tongKhoiLuongKeHoach) * 100;
            phanTramChamTienDo = Math.max(phanTramKeHoach - phanTramHoanThanh, 0);
          }
        }

        // Xác định tọa độ đầu cuối cho dự án thành phần
        let toaDoDauTP = null;
        let toaDoCuoiTP = null;

        if (goiThauTP.length > 0) {
          const firstGoiThauTP = goiThauTP[0];
          toaDoDauTP = {
            x: firstGoiThauTP.ToaDo_BatDau_X,
            y: firstGoiThauTP.ToaDo_BatDau_Y
          };

          const lastGoiThauTP = goiThauTP[goiThauTP.length - 1];
          toaDoCuoiTP = {
            x: lastGoiThauTP.ToaDo_KetThuc_X,
            y: lastGoiThauTP.ToaDo_KetThuc_Y
          };
        }

        // Lấy số lượng hạng mục cho dự án thành phần
        let countHangMuc = 0;
        if (goiThauTP.length > 0) {
          const goiThauIds = goiThauTP.map(gt => gt.GoiThau_ID);
          const [hangMuc] = await pool.query(
            `SELECT COUNT(*) as count FROM hangmuc WHERE GoiThauID IN (?)`,
            [goiThauIds]
          );
          countHangMuc = hangMuc[0].count;
        }

        return {
          DuAnID: duAnTP.DuAnID,
          TenDuAn: duAnTP.TenDuAn,
          TinhThanh: duAnTP.TinhThanh,
          ChuDauTu: duAnTP.ChuDauTu,
          NgayKhoiCong: duAnTP.NgayKhoiCong,
          TrangThai: duAnTP.TrangThai,
          NguonVon: duAnTP.NguonVon,
          TongChieuDai: duAnTP.TongChieuDai,
          KeHoachHoanThanh: duAnTP.KeHoachHoanThanh,
          MoTaChung: duAnTP.MoTaChung,
          ParentID: duAnTP.ParentID,
          coordinates: {
            start: toaDoDauTP ? { lat: toaDoDauTP.y, lng: toaDoDauTP.x } : null,
            end: toaDoCuoiTP ? { lat: toaDoCuoiTP.y, lng: toaDoCuoiTP.x } : null
          },
          soLuongHangMuc: countHangMuc,
          khoiLuongKeHoach: khoiLuongKeHoachTP,
          khoiLuongThucHien: khoiLuongThucHienTP,
          phanTramKeHoach: phanTramKeHoach.toFixed(2),
          phanTramHoanThanh: phanTramHoanThanh.toFixed(2),
          phanTramChamTienDo: phanTramChamTienDo.toFixed(2)
        };
      })
    );

    res.json({
      success: true,
      data: {
        duAnTong: {
          DuAnID: duAnTong[0].DuAnID,
          TenDuAn: duAnTong[0].TenDuAn,
          TinhThanh: duAnTong[0].TinhThanh,
          ChuDauTu: duAnTong[0].ChuDauTu,
          NgayKhoiCong: duAnTong[0].NgayKhoiCong,
          TrangThai: duAnTong[0].TrangThai,
          NguonVon: duAnTong[0].NguonVon,
          TongChieuDai: duAnTong[0].TongChieuDai,
          KeHoachHoanThanh: duAnTong[0].KeHoachHoanThanh,
          MoTaChung: duAnTong[0].MoTaChung,
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoach,
          tongKhoiLuongThucHien: tongKhoiLuongThucHien,
          phanTramHoanThanhTong: tongKhoiLuongKeHoach > 0 
            ? ((tongKhoiLuongThucHien / tongKhoiLuongKeHoach) * 100).toFixed(2)
            : "0.00"
        },
        duAnThanhPhan: duAnThanhPhanWithDetails
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/duAn/goiThau/:duAnId', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Verify project exists
    const [duAn] = await pool.query(
      'SELECT * FROM duan WHERE DuAnID = ?',
      [duAnId]
    );

    if (duAn.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án với ID này'
      });
    }

    // 2. Get all packages of the project
    const [goiThau] = await pool.query(
      `SELECT 
        gt.*,
        nt.TenNhaThau,
        (SELECT COUNT(*) FROM hangmuc WHERE GoiThauID = gt.GoiThau_ID) AS SoHangMuc
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       WHERE gt.DuAn_ID = ?
       ORDER BY gt.GoiThau_ID ASC`,
      [duAnId]
    );

    res.json({
      success: true,
      data: goiThau
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/goiThau/chiTiet/:goiThauId', async (req, res) => {
  try {
    const goiThauId = req.params.goiThauId;

    // 1. Lấy thông tin cơ bản của gói thầu và chủ đầu tư
    const [goiThau] = await pool.query(
      `SELECT gt.*, nt.*, d.TenDuAn, d.DuAnID, cd.TenNhaThau AS TenChuDauTu
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
       LEFT JOIN nhathau cd ON d.ChuDauTu = cd.NhaThauID
       WHERE gt.GoiThau_ID = ?`,
      [goiThauId]
    );

    if (goiThau.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói thầu với ID này' });
    }

    // 2. Lấy danh sách nhà thầu liên quan
    let routeData = null;
    if (goiThau[0].PathData) {
      // Nếu có KML: Parse JSON từ PathData
      routeData = {
        type: 'kml',
        path: JSON.parse(goiThau[0].PathData)
      };
    } else {
      // Nếu không có KML: Dùng tọa độ đầu-cuối
      routeData = {
        type: 'default',
        start: [goiThau[0].ToaDo_BatDau_X, goiThau[0].ToaDo_BatDau_Y],
        end: [goiThau[0].ToaDo_KetThuc_X, goiThau[0].ToaDo_KetThuc_Y]
      };
    }
    const [nhaThauLienQuan] = await pool.query(
      `SELECT nt.*, gtn.VaiTro
       FROM goithau_nhathau gtn
       JOIN nhathau nt ON gtn.NhaThauID = nt.NhaThauID
       WHERE gtn.GoiThau_ID = ? AND gtn.VaiTro = 'Nhà thầu chính'`,
      [goiThauId]
    );

    // 3. Lấy dữ liệu khối lượng thi công
    const [khoiLuongThiCong] = await pool.query(
      `SELECT klt.*, nt.TenNhaThau
       FROM khoiluong_thicong klt
       JOIN nhathau nt ON klt.NhaThauID = nt.NhaThauID
       WHERE klt.GoiThau_ID = ?
       ORDER BY klt.KhoiLuong_ID DESC`,
      [goiThauId]
    );

    // 4. Tính toán khối lượng theo cách mới
    // 4.1. Lấy tất cả hạng mục thuộc gói thầu
    const [hangMucList] = await pool.query(
      `SELECT HangMucID, TenHangMuc FROM hangmuc WHERE GoiThauID = ?`,
      [goiThauId]
    );

    // 4.2. Tính tổng khối lượng kế hoạch của toàn bộ gói thầu
    const [tongKhoiLuongResult] = await pool.query(
      `SELECT SUM(KhoiLuongKeHoach) AS TongKhoiLuong
       FROM quanlykehoach
       WHERE HangMucID IN (SELECT HangMucID FROM hangmuc WHERE GoiThauID = ?)`,
      [goiThauId]
    );
    const tongKhoiLuong = tongKhoiLuongResult[0].TongKhoiLuong || 1; // Tránh chia cho 0

    // 4.3. Tính khối lượng hoàn thành, đang làm và chậm tiến độ
    const [keHoachList] = await pool.query(
      `SELECT 
        q.KeHoachID,
        q.HangMucID,
        q.KhoiLuongKeHoach,
        q.NgayKetThuc,
        COALESCE(SUM(t.KhoiLuongThucHien), 0) AS KhoiLuongThucHien
       FROM quanlykehoach q
       LEFT JOIN tiendothuchien t ON q.KeHoachID = t.KeHoachID
       WHERE q.HangMucID IN (SELECT HangMucID FROM hangmuc WHERE GoiThauID = ?)
       GROUP BY q.KeHoachID, q.HangMucID, q.KhoiLuongKeHoach, q.NgayKetThuc`,
      [goiThauId]
    );

    // Phân loại các kế hoạch
    const now = new Date();
    let khoiLuongHoanThanh = 0;
    let khoiLuongDangLam = 0;
    let khoiLuongChamTienDo = 0;

    keHoachList.forEach(keHoach => {
      const ngayKetThuc = new Date(keHoach.NgayKetThuc);
      if (keHoach.KhoiLuongThucHien >= keHoach.KhoiLuongKeHoach) {
        khoiLuongHoanThanh += keHoach.KhoiLuongKeHoach;
      } else if (now > ngayKetThuc) {
        khoiLuongChamTienDo += keHoach.KhoiLuongThucHien;
      } else {
        khoiLuongDangLam += keHoach.KhoiLuongThucHien;
      }
    });

    // Tính phần trăm
    const calculatePercentage = (value, total) => {
      const percent = (value / total) * 100;
      return Math.min(Math.max(Math.round(percent), 0), 100); // Đảm bảo 0-100%
    };

    const phanTramHoanThanh = calculatePercentage(khoiLuongHoanThanh, tongKhoiLuong);
    const phanTramDangLam = calculatePercentage(khoiLuongDangLam, tongKhoiLuong);
    const phanTramChamTienDo = calculatePercentage(khoiLuongChamTienDo, tongKhoiLuong);
    const phanTramKeHoach = 100 - phanTramHoanThanh - phanTramDangLam - phanTramChamTienDo;

    const phanTram = {
      keHoach: phanTramKeHoach,
      dangLam: phanTramDangLam,
      hoanThanh: phanTramHoanThanh,
      chamTienDo: phanTramChamTienDo
    };

    // 5. Lấy chi tiết tiến độ thi công
    const [tienDoThiCong] = await pool.query(
      `SELECT 
        q.*, 
        hm.TenHangMuc,
        nt.TenNhaThau,
        COALESCE(SUM(t.KhoiLuongThucHien), 0) AS KhoiLuongThucHien,
        CASE 
          WHEN COALESCE(SUM(t.KhoiLuongThucHien), 0) >= q.KhoiLuongKeHoach THEN 'Đã hoàn thành'
          WHEN CURDATE() > q.NgayKetThuc THEN CONCAT('Chậm tiến độ ', DATEDIFF(CURDATE(), q.NgayKetThuc), ' ngày')
          ELSE CONCAT('Đang thực hiện (còn ', DATEDIFF(q.NgayKetThuc, CURDATE()), ' ngày)')
        END AS TrangThai
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       JOIN nhathau nt ON q.NhaThauID = nt.NhaThauID
       LEFT JOIN tiendothuchien t ON q.KeHoachID = t.KeHoachID
       WHERE hm.GoiThauID = ?
       GROUP BY q.KeHoachID
       ORDER BY q.NgayKetThuc ASC`,
      [goiThauId]
    );

    // 6. Lấy thông tin vướng mắc
    const [vuongMac] = await pool.query(
      `SELECT vm.*, q.TenCongTac, hm.TenHangMuc
       FROM vuongmac vm
       JOIN quanlykehoach q ON vm.KeHoachID = q.KeHoachID
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       WHERE hm.GoiThauID = ? AND vm.NgayKetThuc IS NULL
       ORDER BY vm.MucDo DESC, vm.NgayPhatSinh DESC`,
      [goiThauId]
    );

    // 7. Đánh giá rủi ro
    const overdueItems = tienDoThiCong.filter(item => item.TrangThai.includes('Chậm tiến độ'));
    const criticalItems = tienDoThiCong.filter(item => item.TrangThai.includes('Đang thực hiện') && 
      new Date(item.NgayKetThuc) <= new Date(new Date().setDate(new Date().getDate() + 7)));
    
    let danhGiaRuiRo = 'Ổn định';
    let riskScore = overdueItems.length * 2 + criticalItems.length;
    if (riskScore > 5) danhGiaRuiRo = 'Rủi ro cao';
    else if (riskScore > 2) danhGiaRuiRo = 'Có rủi ro';

    res.json({
      success: true,
      data: {
        thongTinChung: {
          ...goiThau[0],
          nhaThau: nhaThauLienQuan,
          routeData,
          danhGiaRuiRo,
          riskScore,
          khoiLuongThiCong,
          phanTram
        },
        tienDo: {
          phanTram,
          chiTiet: tienDoThiCong,
          danhGiaRuiRo,
          riskScore,
          khoiLuongHoanThanh,
          khoiLuongDangLam,
          khoiLuongChamTienDo,
          tongKhoiLuong
        },
        vuongMac,
        tongQuan: {
          tongHangMuc: hangMucList.length,
          tongCongTac: tienDoThiCong.length,
          congTacHoanThanh: tienDoThiCong.filter(item => item.TrangThai === 'Đã hoàn thành').length,
          congTacQuaHan: overdueItems.length,
          tongKhoiLuongThiCong: khoiLuongThiCong.length,
          tongKhoiLuongKeHoach: tongKhoiLuong,
          tongKhoiLuongThucHien: khoiLuongHoanThanh + khoiLuongDangLam + khoiLuongChamTienDo
        }
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/duAnThanhPhan/:duAnThanhPhanId/detail', async (req, res) => {
  try {
    const duAnThanhPhanId = req.params.duAnThanhPhanId;

    // 1. Check if component project exists
    const [duAnThanhPhan] = await pool.query(
      'SELECT * FROM duan WHERE DuAnID = ? AND ParentID IS NOT NULL',
      [duAnThanhPhanId]
    );

    if (duAnThanhPhan.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án thành phần với ID này'
      });
    }

    const duAnTP = duAnThanhPhan[0];

    // 2. Get all packages of this component project
    const [goiThauTP] = await pool.query(
      `SELECT gt.* 
       FROM goithau gt
       WHERE gt.DuAn_ID = ?
       ORDER BY gt.GoiThau_ID ASC`,
      [duAnTP.DuAnID]
    );

    // 3. Get detailed information including work items, plans, and progress
    const goiThauWithDetails = await Promise.all(
      goiThauTP.map(async (goiThau) => {
        // Get work items of the package
        const [hangMucList] = await pool.query(
          `SELECT * FROM hangmuc 
           WHERE GoiThauID = ?
           ORDER BY HangMucID ASC`,
          [goiThau.GoiThau_ID]
        );

        // Get detailed information for each work item
        const hangMucWithDetails = await Promise.all(
          hangMucList.map(async (hangMuc) => {
            // Get plans of the work item
            const [keHoachList] = await pool.query(
              `SELECT kh.*, nt.TenNhaThau 
               FROM quanlykehoach kh
               JOIN nhathau nt ON kh.NhaThauID = nt.NhaThauID
               WHERE kh.HangMucID = ?
               ORDER BY kh.KeHoachID ASC`,
              [hangMuc.HangMucID]
            );

            // Get execution progress for each plan
            const keHoachWithDetails = await Promise.all(
              keHoachList.map(async (keHoach) => {
                const [tienDoList] = await pool.query(
                  `SELECT * FROM tiendothuchien 
                   WHERE KeHoachID = ?
                   ORDER BY NgayCapNhat DESC`,
                  [keHoach.KeHoachID]
                );

                // Calculate total executed quantity
                const tongThucHien = tienDoList.reduce((sum, item) => sum + item.KhoiLuongThucHien, 0);

                return {
                  ...keHoach,
                  tienDoThucHien: tienDoList,
                  tongKhoiLuongThucHien: tongThucHien,
                  phanTramHoanThanh: keHoach.KhoiLuongKeHoach > 0 
                    ? (tongThucHien / keHoach.KhoiLuongKeHoach * 100).toFixed(2)
                    : "0.00"
                };
              })
            );

            // Calculate total planned and executed quantities for the work item
            const tongKhoiLuongKeHoach = keHoachWithDetails.reduce((sum, item) => sum + item.KhoiLuongKeHoach, 0);
            const tongKhoiLuongThucHien = keHoachWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongThucHien, 0);

            return {
              ...hangMuc,
              keHoach: keHoachWithDetails,
              tongKhoiLuongKeHoach: tongKhoiLuongKeHoach,
              tongKhoiLuongThucHien: tongKhoiLuongThucHien,
              phanTramHoanThanh: tongKhoiLuongKeHoach > 0 
                ? (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100).toFixed(2)
                : "0.00"
            };
          })
        );

        // Calculate total planned and executed quantities for the package
        const tongKhoiLuongKeHoachGT = hangMucWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongKeHoach, 0);
        const tongKhoiLuongThucHienGT = hangMucWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongThucHien, 0);

        return {
          ...goiThau,
          hangMuc: hangMucWithDetails,
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoachGT,
          tongKhoiLuongThucHien: tongKhoiLuongThucHienGT,
          phanTramHoanThanh: tongKhoiLuongKeHoachGT > 0 
            ? (tongKhoiLuongThucHienGT / tongKhoiLuongKeHoachGT * 100).toFixed(2)
            : "0.00"
        };
      })
    );

    // Calculate total planned and executed quantities for the component project
    const tongKhoiLuongKeHoachTP = goiThauWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongKeHoach, 0);
    const tongKhoiLuongThucHienTP = goiThauWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongThucHien, 0);

    res.json({
      success: true,
      data: {
        DuAnID: duAnTP.DuAnID,
        TenDuAn: duAnTP.TenDuAn,
        goiThau: goiThauWithDetails,
        tongKhoiLuongKeHoach: tongKhoiLuongKeHoachTP,
        tongKhoiLuongThucHien: tongKhoiLuongThucHienTP,
        phanTramHoanThanh: tongKhoiLuongKeHoachTP > 0 
          ? (tongKhoiLuongThucHienTP / tongKhoiLuongKeHoachTP * 100).toFixed(2)
          : "0.00",
        // Add contractor information if needed
        nhaThau: duAnTP.NhaThauID ? await getNhaThauInfo(duAnTP.NhaThauID) : null
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
async function getNhaThauInfo(nhaThauId) {
  const [nhaThau] = await pool.query(
    'SELECT * FROM nhathau WHERE NhaThauID = ?',
    [nhaThauId]
  );
  return nhaThau.length > 0 ? nhaThau[0] : null;
};
app.get('/du-an/:duAnId/tong-hop', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Lấy thông tin cơ bản của dự án (bao gồm cả thông tin nhà thầu nếu có)
    const [duAn] = await pool.query(
      `SELECT d.*, nt.* 
       FROM duan d
       LEFT JOIN nhathau nt ON d.ChuDauTu = nt.NhaThauID
       WHERE d.DuAnID = ?`,
      [duAnId]
    );

    if (duAn.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án với ID này'
      });
    }

    const currentDuAn = duAn[0];
    const isDuAnTong = currentDuAn.ParentID === null;

    // 2. Lấy loại hình dự án
    const [loaiHinh] = await pool.query(
      `SELECT lh.* FROM loaihinh lh
       JOIN doituongloaihinh dlh ON lh.LoaiHinh_ID = dlh.LoaiHinh_ID
       WHERE dlh.DoiTuong_ID = ? AND dlh.LoaiDoiTuong = 'duan'`,
      [duAnId]
    );

    // 3. Lấy thuộc tính loại hình và giá trị
    const [thuocTinh] = await pool.query(
      `SELECT tt.*, gt.GiaTri 
       FROM thuoctinhloaihinh tt
       LEFT JOIN giatrithuoctinh gt ON tt.ThuocTinh_ID = gt.ThuocTinh_ID 
         AND gt.DoiTuong_ID = ? AND gt.LoaiDoiTuong = 'duan'
       WHERE tt.LoaiHinh_ID = ?`,
      [duAnId, loaiHinh[0]?.LoaiHinh_ID]
    );

    // 4. Chuẩn bị thông tin chủ đầu tư
    let chuDauTuInfo = null;
    if (currentDuAn.NhaThauID) {
      chuDauTuInfo = {
        nhaThauId: currentDuAn.NhaThauID,
        tenNhaThau: currentDuAn.TenNhaThau,
        maSoThue: currentDuAn.MaSoThue,
        diaChiTruSo: currentDuAn.DiaChiTruSo,
        soDienThoai: currentDuAn.SoDienThoai,
        email: currentDuAn.Email,
        nguoiDaiDien: currentDuAn.NguoiDaiDien,
        chucVuNguoiDaiDien: currentDuAn.ChucVuNguoiDaiDien
      };
    }

    // 5. Xác định danh sách dự án cần xử lý
    let duAnList = [];
    if (isDuAnTong) {
      // Lấy tất cả dự án thành phần nếu là dự án tổng
      const [duAnThanhPhan] = await pool.query(
        'SELECT * FROM duan WHERE ParentID = ?',
        [duAnId]
      );
      duAnList = [currentDuAn, ...duAnThanhPhan];
    } else {
      // Nếu là dự án thành phần, chỉ lấy chính nó
      duAnList = [currentDuAn];
    }

    // 6. Lấy tất cả gói thầu liên quan
    const [allGoiThau] = await pool.query(
      `SELECT gt.*, nt.* 
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       WHERE gt.DuAn_ID IN (${duAnList.map(da => da.DuAnID).join(',')})`
    );

    // 7. Lấy tất cả hạng mục
    const [allHangMuc] = await pool.query(
      `SELECT hm.* FROM hangmuc hm
       WHERE hm.GoiThauID IN (${allGoiThau.map(gt => gt.GoiThau_ID).join(',') || 'NULL'})`
    );

    // 8. Lấy tất cả kế hoạch
    const [allKeHoach] = await pool.query(
      `SELECT kh.* FROM quanlykehoach kh
       WHERE kh.HangMucID IN (${allHangMuc.map(hm => hm.HangMucID).join(',') || 'NULL'})`
    );

    // 9. Lấy tất cả tiến độ thực hiện
    const [allTienDo] = await pool.query(
      `SELECT td.* FROM tiendothuchien td
       WHERE td.KeHoachID IN (${allKeHoach.map(kh => kh.KeHoachID).join(',') || 'NULL'})`
    );

    // 10. Lấy tất cả vướng mắc
    const [allVuongMac] = await pool.query(
      `SELECT vm.* FROM vuongmac vm
       WHERE vm.KeHoachID IN (${allKeHoach.map(kh => kh.KeHoachID).join(',') || 'NULL'})`
    );

    // 11. Lấy tất cả tài liệu liên quan
    const [allTaiLieu] = await pool.query(
      `SELECT * FROM tailieu 
       WHERE (LoaiDoiTuong = 'DUAN' AND DoiTuongID IN (${duAnList.map(da => da.DuAnID).join(',')}))
         OR (LoaiDoiTuong = 'GOITHAU' AND DoiTuongID IN (${allGoiThau.map(gt => gt.GoiThau_ID).join(',') || 'NULL'}))
         OR (LoaiDoiTuong = 'HANGMUC' AND DoiTuongID IN (${allHangMuc.map(hm => hm.HangMucID).join(',') || 'NULL'}))
         OR (LoaiDoiTuong = 'KEHOACH' AND DoiTuongID IN (${allKeHoach.map(kh => kh.KeHoachID).join(',') || 'NULL'}))`
    );

    // 12. Tạo cấu trúc phân cấp (ngoại trừ level dự án)
    const phanCapGoiThau = allGoiThau.map(gt => {
      const hangMuc = allHangMuc.filter(hm => hm.GoiThauID === gt.GoiThau_ID);
      
      const hangMucWithDetails = hangMuc.map(hm => {
        const keHoach = allKeHoach.filter(kh => kh.HangMucID === hm.HangMucID);
        
        const keHoachWithDetails = keHoach.map(kh => {
          const tienDo = allTienDo.filter(td => td.KeHoachID === kh.KeHoachID);
          const vuongMac = allVuongMac.filter(vm => vm.KeHoachID === kh.KeHoachID);
          
          return {
            ...kh,
            tienDo,
            vuongMac
          };
        });
        
        return {
          ...hm,
          keHoach: keHoachWithDetails
        };
      });
      
      return {
        ...gt,
        hangMuc: hangMucWithDetails
      };
    });

    // 13. Tổng hợp dữ liệu theo cấu trúc yêu cầu
    const result = {
      success: true,
      data: {
        // Thông tin dự án (không phân cấp)
        thongTinDuAn: {
          ...currentDuAn,
          loaiHinh: loaiHinh[0] || null,
          thuocTinh: thuocTinh.map(tt => ({
            thuocTinhId: tt.ThuocTinh_ID,
            tenThuocTinh: tt.TenThuocTinh,
            kieuDuLieu: tt.KieuDuLieu,
            donVi: tt.DonVi,
            giaTri: tt.GiaTri
          })),
          chuDauTu: chuDauTuInfo
        },
        
        // Danh sách phẳng (như cũ)
        danhSachDuAn: duAnList.map(da => ({
          duAnId: da.DuAnID,
          tenDuAn: da.TenDuAn,
          parentId: da.ParentID,
          isDuAnTong: da.ParentID === null
        })),
        danhSachGoiThau: allGoiThau.map(gt => ({
          goiThauId: gt.GoiThau_ID,
          tenGoiThau: gt.TenGoiThau,
          duAnId: gt.DuAn_ID,
          giaTriHopDong: gt.GiaTriHĐ,
          nhaThau: gt.NhaThauID ? {
            nhaThauId: gt.NhaThauID,
            tenNhaThau: gt.TenNhaThau,
            maSoThue: gt.MaSoThue
          } : null,
          trangThai: gt.TrangThai
        })),
        danhSachHangMuc: allHangMuc.map(hm => ({
          hangMucId: hm.HangMucID,
          tenHangMuc: hm.TenHangMuc,
          goiThauId: hm.GoiThauID,
          loaiHangMuc: hm.LoaiHangMuc
        })),
        danhSachKeHoach: allKeHoach.map(kh => ({
          keHoachId: kh.KeHoachID,
          tenCongTac: kh.TenCongTac,
          hangMucId: kh.HangMucID,
          khoiLuongKeHoach: kh.KhoiLuongKeHoach,
          donViTinh: kh.DonViTinh,
          ngayBatDau: kh.NgayBatDau,
          ngayKetThuc: kh.NgayKetThuc
        })),
        danhSachTienDo: allTienDo.map(td => ({
          tienDoId: td.TienDoID,
          keHoachId: td.KeHoachID,
          ngayCapNhat: td.NgayCapNhat,
          khoiLuongThucHien: td.KhoiLuongThucHien,
          donViTinh: td.DonViTinh
        })),
        danhSachVuongMac: allVuongMac.map(vm => ({
          vuongMacId: vm.VuongMacID,
          keHoachId: vm.KeHoachID,
          loaiVuongMac: vm.LoaiVuongMac,
          moTaChiTiet: vm.MoTaChiTiet,
          ngayPhatSinh: vm.NgayPhatSinh,
          ngayKetThuc: vm.NgayKetThuc,
          mucDo: vm.MucDo
        })),
        danhSachTaiLieu: allTaiLieu.map(tl => ({
          taiLieuId: tl.TaiLieuID,
          loaiDoiTuong: tl.LoaiDoiTuong,
          doiTuongId: tl.DoiTuongID,
          tenTaiLieu: tl.TenTaiLieu,
          loaiTaiLieu: tl.LoaiTaiLieu,
          duongDan: tl.DuongDan
        })),
        
        // Dữ liệu phân cấp (ngoại trừ level dự án)
        phanCap: {
          goiThau: phanCapGoiThau
        }
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/duAn/:duAnId/detail', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Kiểm tra dự án tổng có tồn tại không
    const [duAnTong] = await pool.query(
      'SELECT * FROM duan WHERE DuAnID = ? AND ParentID IS NULL',
      [duAnId]
    );

    if (duAnTong.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án TỔNG với ID này'
      });
    }

    // 2. Lấy các dự án thành phần
    const [duAnThanhPhan] = await pool.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Lấy thông tin chi tiết cho từng dự án thành phần
    const duAnThanhPhanWithDetails = await Promise.all(
      duAnThanhPhan.map(async (duAnTP) => {
        // Lấy các gói thầu thuộc dự án thành phần này
        const [goiThauList] = await pool.query(
          `SELECT gt.*, nt.TenNhaThau, nt.MaSoThue 
           FROM goithau gt
           LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
           WHERE gt.DuAn_ID = ?
           ORDER BY gt.GoiThau_ID ASC`,
          [duAnTP.DuAnID]
        );

        // Lấy thông tin chi tiết các gói thầu
        const goiThauWithCategories = await Promise.all(
          goiThauList.map(async (goiThau) => {
            // Lấy các loại hạng mục của gói thầu
            const [loaiHangMucList] = await pool.query(
              `SELECT DISTINCT LoaiHangMuc 
               FROM hangmuc 
               WHERE GoiThauID = ? AND LoaiHangMuc IS NOT NULL
               ORDER BY LoaiHangMuc ASC`,
              [goiThau.GoiThau_ID]
            );

            // Lấy thông tin chi tiết từng loại hạng mục
            const loaiHangMucWithDetails = await Promise.all(
              loaiHangMucList.map(async (loaiHangMuc) => {
                // Lấy các hạng mục thuộc loại này
                const [hangMucList] = await pool.query(
                  `SELECT * FROM hangmuc 
                   WHERE GoiThauID = ? AND LoaiHangMuc = ?
                   ORDER BY HangMucID ASC`,
                  [goiThau.GoiThau_ID, loaiHangMuc.LoaiHangMuc]
                );

                // Lấy thông tin kế hoạch và gộp luôn khối lượng thực thi
                const hangMucWithKeHoach = await Promise.all(
                  hangMucList.map(async (hangMuc) => {
                    // Lấy kế hoạch và thông tin thực thi
                    const [keHoachWithTienDo] = await pool.query(
                      `SELECT 
                        kh.KeHoachID,
                        kh.TenCongTac,
                        kh.KhoiLuongKeHoach,
                        kh.DonViTinh,
                        kh.NgayBatDau,
                        kh.NgayKetThuc,
                        kh.GhiChu,
                        COALESCE(SUM(td.KhoiLuongThucHien), 0) AS TongThucHien,
                        MAX(td.NgayCapNhat) AS NgayCapNhatGanNhat
                       FROM quanlykehoach kh
                       LEFT JOIN tiendothuchien td ON kh.KeHoachID = td.KeHoachID
                       WHERE kh.HangMucID = ?
                       GROUP BY kh.KeHoachID
                       ORDER BY kh.KeHoachID ASC`,
                      [hangMuc.HangMucID]
                    );

                    // Format dữ liệu kế hoạch
                    const formattedKeHoach = keHoachWithTienDo.map(kh => ({
                      keHoachId: kh.KeHoachID,
                      tenCongTac: kh.TenCongTac,
                      khoiLuongKeHoach: kh.KhoiLuongKeHoach,
                      donViTinh: kh.DonViTinh,
                      ngayBatDau: kh.NgayBatDau,
                      ngayKetThuc: kh.NgayKetThuc,
                      ghiChu: kh.GhiChu,
                      tongKhoiLuongThucHien: kh.TongThucHien,
                      ngayCapNhatGanNhat: kh.NgayCapNhatGanNhat,
                      phanTramHoanThanh: kh.KhoiLuongKeHoach > 0 
                        ? Math.min(100, (kh.TongThucHien / kh.KhoiLuongKeHoach * 100)).toFixed(2)
                        : "0.00"
                    }));

                    // Tính tổng cho hạng mục
                    const tongKhoiLuongKeHoach = formattedKeHoach.reduce(
                      (sum, item) => sum + (item.khoiLuongKeHoach || 0), 0
                    );
                    const tongKhoiLuongThucHien = formattedKeHoach.reduce(
                      (sum, item) => sum + (item.tongKhoiLuongThucHien || 0), 0
                    );

                    return {
                      hangMucId: hangMuc.HangMucID,
                      tenHangMuc: hangMuc.TenHangMuc,
                      loaiHangMuc: hangMuc.LoaiHangMuc,
                      tieuDeChiTiet: hangMuc.TieuDeChiTiet,
                      mayMocThietBi: hangMuc.MayMocThietBi,
                      nhanLucThiCong: hangMuc.NhanLucThiCong,
                      thoiGianHoanThanh: hangMuc.ThoiGianHoanThanh,
                      ghiChu: hangMuc.GhiChu,
                      danhSachKeHoach: formattedKeHoach,
                      tongKhoiLuongKeHoach: tongKhoiLuongKeHoach,
                      tongKhoiLuongThucHien: tongKhoiLuongThucHien,
                      phanTramHoanThanh: tongKhoiLuongKeHoach > 0 
                        ? Math.min(100, (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100)).toFixed(2)
                        : "0.00"
                    };
                  })
                );

                // Tính tổng cho loại hạng mục
                const tongKhoiLuongKeHoachLoai = hangMucWithKeHoach.reduce(
                  (sum, hm) => sum + (hm.tongKhoiLuongKeHoach || 0), 0
                );
                const tongKhoiLuongThucHienLoai = hangMucWithKeHoach.reduce(
                  (sum, hm) => sum + (hm.tongKhoiLuongThucHien || 0), 0
                );

                return {
                  loaiHangMuc: loaiHangMuc.LoaiHangMuc,
                  danhSachHangMuc: hangMucWithKeHoach,
                  tongKhoiLuongKeHoach: tongKhoiLuongKeHoachLoai,
                  tongKhoiLuongThucHien: tongKhoiLuongThucHienLoai,
                  phanTramHoanThanh: tongKhoiLuongKeHoachLoai > 0 
                    ? Math.min(100, (tongKhoiLuongThucHienLoai / tongKhoiLuongKeHoachLoai * 100)).toFixed(2)
                    : "0.00"
                };
              })
            );

            // Tính tổng cho gói thầu
            const tongKhoiLuongKeHoachGoiThau = loaiHangMucWithDetails.reduce(
              (sum, loai) => sum + (loai.tongKhoiLuongKeHoach || 0), 0
            );
            const tongKhoiLuongThucHienGoiThau = loaiHangMucWithDetails.reduce(
              (sum, loai) => sum + (loai.tongKhoiLuongThucHien || 0), 0
            );

            return {
              goiThauId: goiThau.GoiThau_ID,
              tenGoiThau: goiThau.TenGoiThau,
              giaTriHopDong: goiThau.GiaTriHĐ,
              kmBatDau: goiThau.Km_BatDau,
              kmKetThuc: goiThau.Km_KetThuc,
              toaDoBatDau: {
                x: goiThau.ToaDo_BatDau_X,
                y: goiThau.ToaDo_BatDau_Y
              },
              toaDoKetThuc: {
                x: goiThau.ToaDo_KetThuc_X,
                y: goiThau.ToaDo_KetThuc_Y
              },
              ngayKhoiCong: goiThau.NgayKhoiCong,
              ngayHoanThanh: goiThau.NgayHoanThanh,
              trangThai: goiThau.TrangThai,
              nhaThau: goiThau.NhaThauID ? {
                nhaThauId: goiThau.NhaThauID,
                tenNhaThau: goiThau.TenNhaThau,
                maSoThue: goiThau.MaSoThue
              } : null,
              danhSachLoaiHangMuc: loaiHangMucWithDetails,
              tongKhoiLuongKeHoach: tongKhoiLuongKeHoachGoiThau,
              tongKhoiLuongThucHien: tongKhoiLuongThucHienGoiThau,
              phanTramHoanThanh: tongKhoiLuongKeHoachGoiThau > 0 
                ? Math.min(100, (tongKhoiLuongThucHienGoiThau / tongKhoiLuongKeHoachGoiThau * 100)).toFixed(2)
                : "0.00"
            };
          })
        );

        // Tính tổng cho dự án thành phần
        const tongKhoiLuongKeHoachDuAn = goiThauWithCategories.reduce(
          (sum, gt) => sum + (gt.tongKhoiLuongKeHoach || 0), 0
        );
        const tongKhoiLuongThucHienDuAn = goiThauWithCategories.reduce(
          (sum, gt) => sum + (gt.tongKhoiLuongThucHien || 0), 0
        );

        return {
          duAnId: duAnTP.DuAnID,
          tenDuAn: duAnTP.TenDuAn,
          ngayBatDau: duAnTP.NgayBatDau,
          ngayKetThuc: duAnTP.NgayKetThuc,
          danhSachGoiThau: goiThauWithCategories,
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoachDuAn,
          tongKhoiLuongThucHien: tongKhoiLuongThucHienDuAn,
          phanTramHoanThanh: tongKhoiLuongKeHoachDuAn > 0 
            ? Math.min(100, (tongKhoiLuongThucHienDuAn / tongKhoiLuongKeHoachDuAn * 100)).toFixed(2)
            : "0.00"
        };
      })
    );

    // Tính tổng cho toàn bộ dự án tổng
    const tongKhoiLuongKeHoachTong = duAnThanhPhanWithDetails.reduce(
      (sum, da) => sum + (da.tongKhoiLuongKeHoach || 0), 0
    );
    const tongKhoiLuongThucHienTong = duAnThanhPhanWithDetails.reduce(
      (sum, da) => sum + (da.tongKhoiLuongThucHien || 0), 0
    );

    res.json({
      success: true,
      data: {
        duAnTong: {
          duAnId: duAnTong[0].DuAnID,
          tenDuAn: duAnTong[0].TenDuAn,
          ngayBatDau: duAnTong[0].NgayBatDau,
          ngayKetThuc: duAnTong[0].NgayKetThuc,
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoachTong,
          tongKhoiLuongThucHien: tongKhoiLuongThucHienTong,
          phanTramHoanThanh: tongKhoiLuongKeHoachTong > 0 
            ? Math.min(100, (tongKhoiLuongThucHienTong / tongKhoiLuongKeHoachTong * 100)).toFixed(2)
            : "0.00"
        },
        duAnThanhPhan: duAnThanhPhanWithDetails
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/api/du-an/:duAnId/tien-do-chi-tiet', async (req, res) => {
  try {
    const { duAnId } = req.params;

    const query = `
      SELECT 
        h.HangMucID,
        h.TenHangMuc,
        h.LoaiHangMuc,
        h.ThoiGianHoanThanh AS HanHoanThanh,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'NhaThauID', nt.NhaThauID,
            'TenNhaThau', nt.TenNhaThau,
            'NgayBatDau', k.NgayBatDau,
            'NgayKetThuc', k.NgayKetThuc,
            'KhoiLuongKeHoach', k.KhoiLuongKeHoach,
            'DonViTinh', k.DonViTinh,
            'KhoiLuongThucHien', IFNULL((
              SELECT SUM(t.KhoiLuongThucHien) 
              FROM tiendothuchien t 
              WHERE t.KeHoachID = k.KeHoachID
            ), 0),
            'PhanTramHoanThanh', ROUND(
              IFNULL((
                SELECT SUM(t.KhoiLuongThucHien) 
                FROM tiendothuchien t 
                WHERE t.KeHoachID = k.KeHoachID
              ), 0) / k.KhoiLuongKeHoach * 100, 2
            ),
            'TinhTrang', CASE
              WHEN k.NgayKetThuc < CURDATE() AND IFNULL((
                SELECT SUM(t.KhoiLuongThucHien) 
                FROM tiendothuchien t 
                WHERE t.KeHoachID = k.KeHoachID
              ), 0) >= k.KhoiLuongKeHoach THEN 'Hoàn thành'
              WHEN k.NgayKetThuc < CURDATE() THEN 'Chậm tiến độ'
              ELSE 'Đang thực hiện'
            END
          )
        ) AS DanhSachNhaThau
      FROM duan d
      JOIN goithau g ON d.DuAnID = g.DuAn_ID
      JOIN hangmuc h ON g.GoiThau_ID = h.GoiThauID
      JOIN quanlykehoach k ON h.HangMucID = k.HangMucID
      JOIN nhathau nt ON k.NhaThauID = nt.NhaThauID
      WHERE d.DuAnID = ?
      GROUP BY h.HangMucID, h.TenHangMuc, h.LoaiHangMuc, h.ThoiGianHoanThanh
      ORDER BY h.HangMucID;
    `;

    const [results] = await pool.query(query, [duAnId]);

    // Lấy thông tin cơ bản dự án
    const [duAnInfo] = await pool.query('SELECT DuAnID, TenDuAn FROM duan WHERE DuAnID = ?', [duAnId]);

    if (duAnInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Parse JSON và tính toán tổng hợp
    const hangMucList = results.map(item => ({
      ...item,
      DanhSachNhaThau: JSON.parse(item.DanhSachNhaThau)
    }));

    const tongHop = {
      TongHangMuc: hangMucList.length,
      HangMucHoanThanh: hangMucList.filter(hm => 
        hm.DanhSachNhaThau.some(nt => nt.TinhTrang === 'Hoàn thành')
      ).length,
      HangMucChamTienDo: hangMucList.filter(hm => 
        hm.DanhSachNhaThau.some(nt => nt.TinhTrang === 'Chậm tiến độ')
      ).length
    };

    res.json({
      success: true,
      data: {
        DuAn: duAnInfo[0],
        TongHop: tongHop,
        ChiTiet: hangMucList
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu tiến độ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy dữ liệu tiến độ'
    });
  }
});
app.get('/hangMuc/:duAnId/detail', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Kiểm tra dự án có tồn tại không và xác định loại dự án
    const [duAn] = await pool.query(
      'SELECT DuAnID, TenDuAn, ParentID, NgayKhoiCong, KeHoachHoanThanh FROM duan WHERE DuAnID = ?',
      [duAnId]
    );

    if (duAn.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án với ID này'
      });
    }

    const currentProject = duAn[0];

    // 2. Hàm lấy chi tiết gói thầu, hạng mục, kế hoạch và tiến độ (đã cập nhật)
    const getGoiThauDetails = async (duAnId) => {
      // Lấy các gói thầu thuộc dự án
      const [goiThauList] = await pool.query(
        `SELECT gt.*, nt.TenNhaThau, nt.MaSoThue 
         FROM goithau gt
         LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
         WHERE gt.DuAn_ID = ?
         ORDER BY gt.GoiThau_ID ASC`,
        [duAnId]
      );

      // Lấy thông tin chi tiết các gói thầu
      const goiThauWithHangMuc = await Promise.all(
        goiThauList.map(async (goiThau) => {
          // Lấy tất cả hạng mục của gói thầu
          const [hangMucList] = await pool.query(
            `SELECT * FROM hangmuc 
             WHERE GoiThauID = ?
             ORDER BY HangMucID ASC`,
            [goiThau.GoiThau_ID]
          );

          // Lấy thông tin kế hoạch và khối lượng thực thi cho từng hạng mục (đã cập nhật)
          const hangMucWithKeHoach = await Promise.all(
            hangMucList.map(async (hangMuc) => {
              // Lấy danh sách kế hoạch với nhà thầu và tiến độ thực hiện
              const [keHoachList] = await pool.query(
                `SELECT kh.*, nt.TenNhaThau 
                 FROM quanlykehoach kh
                 JOIN nhathau nt ON kh.NhaThauID = nt.NhaThauID
                 WHERE kh.HangMucID = ?
                 ORDER BY kh.KeHoachID ASC`,
                [hangMuc.HangMucID]
              );

              // Lấy chi tiết tiến độ thực hiện cho từng kế hoạch
              const keHoachWithTienDo = await Promise.all(
                keHoachList.map(async (keHoach) => {
                  const [tienDoList] = await pool.query(
                    `SELECT * FROM tiendothuchien 
                     WHERE KeHoachID = ?
                     ORDER BY NgayCapNhat DESC`,
                    [keHoach.KeHoachID]
                  );

                  // Tính tổng khối lượng đã thực hiện
                  const tongThucHien = tienDoList.reduce((sum, item) => sum + item.KhoiLuongThucHien, 0);

                  return {
                    keHoachId: keHoach.KeHoachID,
                    tenCongTac: keHoach.TenCongTac,
                    khoiLuongKeHoach: keHoach.KhoiLuongKeHoach,
                    donViTinh: keHoach.DonViTinh,
                    ngayBatDau: keHoach.NgayBatDau,
                    ngayKetThuc: keHoach.NgayKetThuc,
                    ghiChu: keHoach.GhiChu,
                    tenNhaThau: keHoach.TenNhaThau,
                    tienDoThucHien: tienDoList,
                    tongKhoiLuongThucHien: tongThucHien,
                    ngayCapNhatGanNhat: tienDoList[0]?.NgayCapNhat || null,
                    phanTramHoanThanh: keHoach.KhoiLuongKeHoach > 0 
                      ? Math.min(100, (tongThucHien / keHoach.KhoiLuongKeHoach * 100)).toFixed(2)
                      : "0.00"
                  };
                })
              );

              // Tính tổng cho hạng mục
              const tongKhoiLuongKeHoach = keHoachWithTienDo.reduce(
                (sum, item) => sum + (item.khoiLuongKeHoach || 0), 0
              );
              const tongKhoiLuongThucHien = keHoachWithTienDo.reduce(
                (sum, item) => sum + (item.tongKhoiLuongThucHien || 0), 0
              );

              return {
                hangMucId: hangMuc.HangMucID,
                tenHangMuc: hangMuc.TenHangMuc,
                loaiHangMuc: hangMuc.LoaiHangMuc,
                tieuDeChiTiet: hangMuc.TieuDeChiTiet,
                mayMocThietBi: hangMuc.MayMocThietBi,
                nhanLucThiCong: hangMuc.NhanLucThiCong,
                thoiGianHoanThanh: hangMuc.ThoiGianHoanThanh,
                ghiChu: hangMuc.GhiChu,
                danhSachKeHoach: keHoachWithTienDo,
                tongKhoiLuongKeHoach,
                tongKhoiLuongThucHien,
                phanTramHoanThanh: tongKhoiLuongKeHoach > 0 
                  ? Math.min(100, (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100)).toFixed(2)
                  : "0.00"
              };
            })
          );

          // Tính tổng cho gói thầu
          const tongKhoiLuongKeHoachGoiThau = hangMucWithKeHoach.reduce(
            (sum, hm) => sum + (hm.tongKhoiLuongKeHoach || 0), 0
          );
          const tongKhoiLuongThucHienGoiThau = hangMucWithKeHoach.reduce(
            (sum, hm) => sum + (hm.tongKhoiLuongThucHien || 0), 0
          );

          return {
            goiThauId: goiThau.GoiThau_ID,
            tenGoiThau: goiThau.TenGoiThau,
            giaTriHopDong: goiThau.GiaTriHĐ,
            kmBatDau: goiThau.Km_BatDau,
            kmKetThuc: goiThau.Km_KetThuc,
            toaDoBatDau: { x: goiThau.ToaDo_BatDau_X, y: goiThau.ToaDo_BatDau_Y },
            toaDoKetThuc: { x: goiThau.ToaDo_KetThuc_X, y: goiThau.ToaDo_KetThuc_Y },
            ngayKhoiCong: goiThau.NgayKhoiCong,
            ngayHoanThanh: goiThau.NgayHoanThanh,
            trangThai: goiThau.TrangThai,
            nhaThau: goiThau.NhaThauID ? {
              nhaThauId: goiThau.NhaThauID,
              tenNhaThau: goiThau.TenNhaThau,
              maSoThue: goiThau.MaSoThue
            } : null,
            danhSachHangMuc: hangMucWithKeHoach,
            tongKhoiLuongKeHoach: tongKhoiLuongKeHoachGoiThau,
            tongKhoiLuongThucHien: tongKhoiLuongThucHienGoiThau,
            phanTramHoanThanh: tongKhoiLuongKeHoachGoiThau > 0 
              ? Math.min(100, (tongKhoiLuongThucHienGoiThau / tongKhoiLuongKeHoachGoiThau * 100)).toFixed(2)
              : "0.00"
          };
        })
      );

      // Tính tổng cho dự án
      const tongKhoiLuongKeHoach = goiThauWithHangMuc.reduce(
        (sum, gt) => sum + (gt.tongKhoiLuongKeHoach || 0), 0
      );
      const tongKhoiLuongThucHien = goiThauWithHangMuc.reduce(
        (sum, gt) => sum + (gt.tongKhoiLuongThucHien || 0), 0
      );

      return {
        duAnId: duAnId,
        danhSachGoiThau: goiThauWithHangMuc,
        tongKhoiLuongKeHoach,
        tongKhoiLuongThucHien,
        phanTramHoanThanh: tongKhoiLuongKeHoach > 0 
          ? Math.min(100, (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100)).toFixed(2)
          : "0.00"
      };
    };

    // 3. Hàm kiểm tra và lấy tất cả dự án con (đệ quy)
    const getAllChildProjects = async (parentId) => {
      const [childProjects] = await pool.query(
        'SELECT DuAnID, TenDuAn, ParentID FROM duan WHERE ParentID = ?',
        [parentId]
      );
      
      let allChildren = [];
      
      for (const child of childProjects) {
        const grandchildren = await getAllChildProjects(child.DuAnID);
        allChildren.push(child, ...grandchildren);
      }
      
      return allChildren;
    };

    // 4. Xử lý theo loại dự án
    let responseData = { success: true, data: {} };

    // Kiểm tra xem đây là dự án cha hay con
    if (currentProject.ParentID === null) {
      // Dự án cha - có thể có cả dự án con và gói thầu trực tiếp
      const [directChildProjects] = await pool.query(
        'SELECT DuAnID, TenDuAn, NgayKhoiCong, KeHoachHoanThanh FROM duan WHERE ParentID = ?',
        [duAnId]
      );

      // Lấy tất cả các dự án con (bao gồm cả cháu, chắt...)
      const allChildProjects = await getAllChildProjects(duAnId);
      const allChildProjectIds = allChildProjects.map(p => p.DuAnID);

      // Lấy tất cả gói thầu trực tiếp thuộc dự án cha
      const directTenders = await getGoiThauDetails(duAnId);

      // Lấy thông tin chi tiết cho từng dự án con
      const childProjectDetails = await Promise.all(
        directChildProjects.map(async (childProject) => {
          const details = await getGoiThauDetails(childProject.DuAnID);
          return {
            duAnId: childProject.DuAnID,
            tenDuAn: childProject.TenDuAn,
            ngayBatDau: childProject.NgayKhoiCong,
            ngayKetThuc: childProject.KeHoachHoanThanh,
            ...details
          };
        })
      );

      // Lấy tất cả gói thầu từ các dự án con (bao gồm cả cháu, chắt...)
      let allTendersFromChildren = [];
      if (allChildProjectIds.length > 0) {
        const [allTenders] = await pool.query(
          `SELECT gt.*, nt.TenNhaThau, nt.MaSoThue 
           FROM goithau gt
           LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
           WHERE gt.DuAn_ID IN (?)
           ORDER BY gt.GoiThau_ID ASC`,
          [allChildProjectIds]
        );
        allTendersFromChildren = allTenders;
      }

      // Tính tổng tất cả khối lượng (bao gồm từ dự án con và gói thầu trực tiếp)
      const totalPlannedVolume = 
        directTenders.tongKhoiLuongKeHoach + 
        childProjectDetails.reduce((sum, da) => sum + (da.tongKhoiLuongKeHoach || 0), 0);
      
      const totalActualVolume = 
        directTenders.tongKhoiLuongThucHien + 
        childProjectDetails.reduce((sum, da) => sum + (da.tongKhoiLuongThucHien || 0), 0);

      responseData.data = {
        duAnTong: {
          duAnId: currentProject.DuAnID,
          tenDuAn: currentProject.TenDuAn,
          ngayBatDau: currentProject.NgayKhoiCong,
          ngayKetThuc: currentProject.KeHoachHoanThanh,
          danhSachDuAnCon: childProjectDetails,
          danhSachGoiThauTrucTiep: directTenders.danhSachGoiThau,
          danhSachGoiThauTuDuAnCon: allTendersFromChildren,
          tongKhoiLuongKeHoach: totalPlannedVolume,
          tongKhoiLuongThucHien: totalActualVolume,
          phanTramHoanThanh: totalPlannedVolume > 0 
            ? Math.min(100, (totalActualVolume / totalPlannedVolume * 100)).toFixed(2)
            : "0.00"
        }
      };
    } else {
      // Dự án con - giữ logic hiện tại
      const [parentProject] = await pool.query(
        'SELECT DuAnID, TenDuAn FROM duan WHERE DuAnID = ?',
        [currentProject.ParentID]
      );

      const projectDetails = await getGoiThauDetails(duAnId);

      responseData.data = {
        duAnTong: parentProject.length > 0 ? {
          duAnId: parentProject[0].DuAnID,
          tenDuAn: parentProject[0].TenDuAn
        } : null,
        duAnThanhPhan: {
          duAnId: currentProject.DuAnID,
          tenDuAn: currentProject.TenDuAn,
          ngayBatDau: currentProject.NgayKhoiCong,
          ngayKetThuc: currentProject.KeHoachHoanThanh,
          ...projectDetails
        }
      };
    }

    res.json(responseData);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/:duAnId/hang-muc', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;
    const { trangThai } = req.query;

    // 1. Lấy thông tin dự án
    const [duAnRows] = await pool.query(
      `SELECT DuAnID, TenDuAn, ParentID FROM duan WHERE DuAnID = ?`,
      [duAnId]
    );

    if (duAnRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án với ID này'
      });
    }

    const duAn = duAnRows[0];

    // 2. Xác định danh sách dự án (bao gồm cả dự án con nếu có)
    let duAnIds = [duAnId];
    if (!duAn.ParentID) {
      const [subDuAnRows] = await pool.query(
        `SELECT DuAnID FROM duan WHERE ParentID = ?`,
        [duAnId]
      );
      duAnIds = duAnIds.concat(subDuAnRows.map(row => row.DuAnID));
    }

    // 3. Query lấy dữ liệu hạng mục
    let hangMucQuery = `
      SELECT 
        h.HangMucID,
        h.TenHangMuc,
        h.LoaiHangMuc,
        gt.TenGoiThau,
        gt.DuAn_ID,
        GROUP_CONCAT(DISTINCT kh.KeHoachID SEPARATOR ',') as KeHoachIDs
      FROM hangmuc h
      JOIN goithau gt ON h.GoiThauID = gt.GoiThau_ID
      JOIN quanlykehoach kh ON h.HangMucID = kh.HangMucID
      WHERE gt.DuAn_ID IN (?)
      GROUP BY h.HangMucID
    `;

    // Thực thi query hạng mục
    const [hangMucRows] = await pool.query(hangMucQuery, [duAnIds]);

    // 4. Lấy tất cả KeHoachIDs để query kế hoạch và nhà thầu
    const allKeHoachIDs = hangMucRows
      .filter(row => row.KeHoachIDs)
      .flatMap(row => row.KeHoachIDs.split(','))
      .filter((value, index, self) => self.indexOf(value) === index);

    // 5. Query lấy dữ liệu kế hoạch và nhà thầu
    let keHoachDetails = [];
    if (allKeHoachIDs.length > 0) {
      // Query kế hoạch kèm thông tin nhà thầu
      const [keHoachRows] = await pool.query(`
        SELECT 
          kh.KeHoachID,
          kh.HangMucID,
          kh.TenCongTac,
          kh.KhoiLuongKeHoach,
          kh.DonViTinh,
          kh.NgayBatDau,
          kh.NgayKetThuc,
          COALESCE(SUM(td.KhoiLuongThucHien), 0) as KhoiLuongThucHien,
          MAX(td.NgayCapNhat) as NgayCapNhatGanNhat,
          h.TenHangMuc,
          gt.TenGoiThau,
          nt.NhaThauID,
          nt.TenNhaThau,
          nt.Loai as LoaiNhaThau,
          nt.MaSoThue,
          nt.DiaChiTruSo,
          CASE
            WHEN kh.KhoiLuongKeHoach <= 0 THEN 'KHONG_XAC_DINH'
            WHEN COALESCE(SUM(td.KhoiLuongThucHien), 0) >= kh.KhoiLuongKeHoach THEN 'HOAN_THANH'
            WHEN CURRENT_DATE > kh.NgayKetThuc THEN 'CHAM_TIEN_DO'
            ELSE 'DANG_THUC_HIEN'
          END as TrangThai
        FROM quanlykehoach kh
        LEFT JOIN tiendothuchien td ON kh.KeHoachID = td.KeHoachID
        JOIN hangmuc h ON kh.HangMucID = h.HangMucID
        JOIN goithau gt ON h.GoiThauID = gt.GoiThau_ID
        JOIN nhathau nt ON kh.NhaThauID = nt.NhaThauID
        WHERE kh.KeHoachID IN (?)
        GROUP BY kh.KeHoachID
      `, [allKeHoachIDs]);

      keHoachDetails = keHoachRows.map(row => ({
        id: row.KeHoachID,
        hangMucId: row.HangMucID,
        tenHangMuc: row.TenHangMuc,
        tenGoiThau: row.TenGoiThau,
        tenCongTac: row.TenCongTac,
        batDau: row.NgayBatDau?.toISOString().split('T')[0],
        ketThuc: row.NgayKetThuc?.toISOString().split('T')[0],
        khoiLuongKeHoach: row.KhoiLuongKeHoach,
        khoiLuongThucHien: row.KhoiLuongThucHien,
        donViTinh: row.DonViTinh,
        ngayCapNhat: row.NgayCapNhatGanNhat?.toISOString().split('T')[0],
        trangThai: row.TrangThai,
        phanTramHoanThanh: row.KhoiLuongKeHoach > 0 
          ? Math.min((row.KhoiLuongThucHien / row.KhoiLuongKeHoach) * 100, 100).toFixed(2)
          : '0',
        nhaThau: {
          id: row.NhaThauID,
          tenNhaThau: row.TenNhaThau,
          loai: row.LoaiNhaThau,
          maSoThue: row.MaSoThue,
          diaChi: row.DiaChiTruSo
        }
      }));
    }

    // 6. Phân loại kế hoạch theo trạng thái
    const keHoachPhanLoai = {
      hoanThanh: keHoachDetails.filter(k => k.trangThai === 'HOAN_THANH'),
      chamTienDo: keHoachDetails.filter(k => k.trangThai === 'CHAM_TIEN_DO'),
      dangThucHien: keHoachDetails.filter(k => k.trangThai === 'DANG_THUC_HIEN'),
      khongXacDinh: keHoachDetails.filter(k => k.trangThai === 'KHONG_XAC_DINH')
    };

    // 7. Trả kết quả
    res.json({
      success: true,
      data: {
        duAn: {
          id: duAn.DuAnID,
          tenDuAn: duAn.TenDuAn,
          loaiDuAn: duAn.ParentID ? 'DU_AN_THANH_PHAN' : 'DU_AN_CHA'
        },
        keHoach: {
          tatCa: keHoachDetails,
          phanLoai: keHoachPhanLoai
        }
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách hạng mục:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách hạng mục',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        sql: error.sql
      } : undefined
    });
  }
});

app.post('/kehoach/them-tiendo/:keHoachId', createUploadMiddleware('TIENDO'), async (req, res) => {
  try {
    const keHoachId = req.params.keHoachId;
    const {
      khoiLuongThucHien,
      donViTinh,
      moTaVuongMac,
      loaiVuongMac,
      ghiChu
    } = req.body;

    const ngayCapNhat = new Date().toISOString().split('T')[0];

    // 1. Kiểm tra dữ liệu đầu vào
    if (!khoiLuongThucHien || isNaN(khoiLuongThucHien)) {
      return res.status(400).json({
        success: false,
        message: 'Khối lượng thực hiện không hợp lệ'
      });
    }

    // 2. Bắt đầu transaction
    await pool.query('START TRANSACTION');

    // 3. Kiểm tra kế hoạch tồn tại
    const [keHoach] = await pool.query(
      'SELECT * FROM quanlykehoach WHERE KeHoachID = ?',
      [keHoachId]
    );

    if (keHoach.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kế hoạch với ID này'
      });
    }

    // 4. Thêm tiến độ mới
    const [tienDoResult] = await pool.query(
      `INSERT INTO tiendothuchien 
       (KeHoachID, NgayCapNhat, KhoiLuongThucHien, DonViTinh, MoTaVuongMac, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        keHoachId,
        ngayCapNhat,
        khoiLuongThucHien,
        donViTinh || keHoach[0].DonViTinh,
        moTaVuongMac,
        ghiChu
      ]
    );

    const tienDoId = tienDoResult.insertId;

    // 5. Xử lý vướng mắc nếu có
    let vuongMacId = null;
    if (moTaVuongMac && loaiVuongMac) {
      const [vuongMacResult] = await pool.query(
        `INSERT INTO vuongmac 
         (KeHoachID, LoaiVuongMac, MoTaChiTiet, NgayPhatSinh, MucDo)
         VALUES (?, ?, ?, ?, ?)`,
        [
          keHoachId,
          loaiVuongMac,
          moTaVuongMac,
          ngayCapNhat,
          'Nho'
        ]
      );
      vuongMacId = vuongMacResult.insertId;
    }

    // 6. Xử lý upload nhiều file
    const taiLieuResults = [];
    if (req.files && req.files.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'TIENDO', String(tienDoId));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of req.files) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [result] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'TIENDO',
            tienDoId,
            file.originalname,
            'KHAC',
            `/Uploads/TIENDO/${tienDoId}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: result.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/TIENDO/${tienDoId}/${file.filename}`
        });
      }
    }

    // 7. Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Thêm tiến độ và vướng mắc thành công',
      data: {
        tienDoId,
        vuongMacId,
        taiLieu: taiLieuResults
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    
    // Xóa file đã upload nếu có lỗi
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Lỗi khi xóa file tạm:', err);
        }
      });
    }

    console.error('Lỗi hệ thống:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi thêm tiến độ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/nhaThauList', async (req, res) => {
  try {
    // Lấy tất cả nhà thầu từ database
    const [results] = await pool.query('SELECT * FROM nhathau ORDER BY TenNhaThau ASC');
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhà thầu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách nhà thầu'
    });
  }
});
app.get('/tien-do/:keHoachId', async (req, res) => {
  try {
      const keHoachId = req.params.keHoachId;
      
      // 1. Lấy thông tin cơ bản của kế hoạch
      const [keHoach] = await pool.query(`
          SELECT * FROM quanlykehoach 
          WHERE KeHoachID = ?
      `, [keHoachId]);

      if (!keHoach || keHoach.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Không tìm thấy kế hoạch'
          });
      }

      // 2. Lấy tất cả tiến độ thực hiện của kế hoạch này
      const [tienDoList] = await pool.query(`
          SELECT * FROM tiendothuchien 
          WHERE KeHoachID = ?
          ORDER BY NgayCapNhat DESC
      `, [keHoachId]);

      // 3. Tính tổng khối lượng đã thực hiện
      const [tongKhoiLuong] = await pool.query(`
          SELECT SUM(KhoiLuongThucHien) as tongThucHien 
          FROM tiendothuchien 
          WHERE KeHoachID = ?
      `, [keHoachId]);

      // 4. Tính phần trăm hoàn thành
      const phanTramHoanThanh = tongKhoiLuong[0].tongThucHien 
          ? (tongKhoiLuong[0].tongThucHien / keHoach[0].KhoiLuongKeHoach * 100).toFixed(2)
          : 0;

      res.json({
          success: true,
          data: {
              thongTinKeHoach: keHoach[0],
              danhSachTienDo: tienDoList,
              tongKhoiLuongThucHien: tongKhoiLuong[0].tongThucHien || 0,
              phanTramHoanThanh: parseFloat(phanTramHoanThanh)
          }
      });

  } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tiến độ:', error);
      res.status(500).json({
          success: false,
          message: 'Lỗi server khi lấy dữ liệu tiến độ'
      });
  }
});
app.get('/duAn/:duAnId/vuongMac', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Kiểm tra loại dự án
    const [duAnInfo] = await pool.query(
      `SELECT DuAnID, TenDuAn, ParentID 
       FROM duan 
       WHERE DuAnID = ?`,
      [duAnId]
    );

    if (duAnInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    const isDuAnTong = duAnInfo[0].ParentID === null;
    let listDuAnIds = [duAnId];

    // 2. Nếu là dự án tổng, lấy tất cả dự án thành phần
    if (isDuAnTong) {
      const [duAnThanhPhan] = await pool.query(
        `SELECT DuAnID FROM duan WHERE ParentID = ?`,
        [duAnId]
      );
      if (duAnThanhPhan.length > 0) {
        listDuAnIds = duAnThanhPhan.map(d => d.DuAnID);
      }
    }

    // 3. Lấy tất cả gói thầu thuộc các dự án
    const [goiThauList] = await pool.query(
      `SELECT gt.GoiThau_ID, gt.TenGoiThau, gt.DuAn_ID, d.TenDuAn
       FROM goithau gt
       JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE gt.DuAn_ID IN (?)`,
      [listDuAnIds]
    );

    // 4. Lấy thông tin vướng mắc đầy đủ
    const result = await Promise.all(
      goiThauList.map(async (goiThau) => {
        const [hangMucList] = await pool.query(
          `SELECT hm.HangMucID, hm.TenHangMuc 
           FROM hangmuc hm
           WHERE hm.GoiThauID = ?`,
          [goiThau.GoiThau_ID]
        );

        const thongTinVuongMac = await Promise.all(
          hangMucList.map(async (hangMuc) => {
            const [vuongMacList] = await pool.query(
              `SELECT 
                vm.VuongMacID,
                vm.KeHoachID,
                vm.NguoiBaoCaoID,
                vm.LoaiVuongMac,
                vm.MoTaChiTiet,
                vm.NgayPhatSinh,
                vm.NgayKetThuc,
                vm.MucDo,
                vm.BienPhapXuLy,
                vm.TrangThaiXuLy,
                vm.NgayCapNhat,
                vm.NoiDungXuLy,
                kh.TenCongTac,
                tk.HoTen AS NguoiBaoCao
               FROM vuongmac vm
               JOIN quanlykehoach kh ON vm.KeHoachID = kh.KeHoachID
               LEFT JOIN taikhoan tk ON vm.NguoiBaoCaoID = tk.NguoiDungID
               WHERE kh.HangMucID = ?`,
              [hangMuc.HangMucID]
            );

            return {
              TenHangMuc: hangMuc.TenHangMuc,
              VuongMac: vuongMacList.map(vm => ({
                // Thông tin cơ bản
                VuongMacID: vm.VuongMacID,
                KeHoachID: vm.KeHoachID,
                TenCongTac: vm.TenCongTac,
                
                // Thông tin vướng mắc
                LoaiVuongMac: vm.LoaiVuongMac,
                MoTaChiTiet: vm.MoTaChiTiet,
                NgayPhatSinh: vm.NgayPhatSinh,
                NgayKetThuc: vm.NgayKetThuc,
                MucDo: vm.MucDo,
                
                // Thông tin xử lý
                BienPhapXuLy: vm.BienPhapXuLy,
                TrangThaiXuLy: vm.TrangThaiXuLy,
                NgayCapNhat: vm.NgayCapNhat,
                NoiDungXuLy: vm.NoiDungXuLy,
                
                // Thông tin người báo cáo
                NguoiBaoCao: vm.NguoiBaoCaoID ? {
                  NguoiDungID: vm.NguoiBaoCaoID,
                  HoTen: vm.NguoiBaoCao
                } : null
              }))
            };
          })
        );

        return {
          TenDuAn: goiThau.TenDuAn,
          TenGoiThau: goiThau.TenGoiThau,
          ThongTinVuongMac: thongTinVuongMac
        };
      })
    );

    res.json({
      success: true,
      data: {
        TenDuAn: duAnInfo[0].TenDuAn,
        LoaiDuAn: isDuAnTong ? 'Dự án tổng' : 'Dự án thành phần',
        DanhSachGoiThau: result
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy thông tin vướng mắc:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// API Cập nhật vướng mắc
app.put('/api/vuongmac/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('START TRANSACTION');
    
    const vuongMacId = req.params.id;
    const {
      MoTaChiTiet,
      BienPhapXuLy,
      TrangThaiXuLy,
      NoiDungXuLy
    } = req.body;

    // Cập nhật thông tin vướng mắc
    await connection.query(
      `UPDATE vuongmac SET
        MoTaChiTiet = ?,
        BienPhapXuLy = ?,
        TrangThaiXuLy = ?,
        NoiDungXuLy = ?,
        NgayCapNhat = CURRENT_TIMESTAMP
      WHERE VuongMacID = ?`,
      [
        MoTaChiTiet,
        BienPhapXuLy,
        TrangThaiXuLy,
        NoiDungXuLy,
        vuongMacId
      ]
    );

    await connection.query('COMMIT');
    res.json({ success: true, message: 'Cập nhật vướng mắc thành công' });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Lỗi khi cập nhật vướng mắc:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống khi cập nhật vướng mắc' 
    });
  } finally {
    connection.release();
  }
});
app.get('/api/phan-quyen', async (req, res) => {
  try {
    const [phanQuyenList] = await pool.query('SELECT * FROM phanquyen ORDER BY PhanQuyenID ASC');
    res.json({
      success: true,
      data: phanQuyenList
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phân quyền:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách phân quyền'
    });
  }
});
app.get('/api/tai-khoan', async (req, res) => {
  try {
    const { search, phanQuyenId } = req.query;
    let query = `
      SELECT 
        tk.*, 
        pq.TenQuyen,
        nt.TenNhaThau
      FROM taikhoan tk
      LEFT JOIN phanquyen pq ON tk.PhanQuyenID = pq.PhanQuyenID
      LEFT JOIN nhathau nt ON tk.NhaThauID = nt.NhaThauID
    `;
    const params = [];

    // Thêm điều kiện tìm kiếm
    const conditions = [];
    if (search) {
      conditions.push(`
        (tk.HoTen LIKE ? OR 
        tk.TenDangNhap LIKE ? OR 
        tk.Email LIKE ? OR 
        nt.TenNhaThau LIKE ?)
      `);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (phanQuyenId) {
      conditions.push('tk.PhanQuyenID = ?');
      params.push(phanQuyenId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY tk.NguoiDungID ASC';

    const [taiKhoanList] = await pool.query(query, params);
    
    // Trả về toàn bộ dữ liệu bao gồm mật khẩu
    res.json({
      success: true,
      data: taiKhoanList
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tài khoản:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách tài khoản'
    });
  }
});
app.put('/api/tai-khoan/:id/phan-quyen', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('START TRANSACTION');
    
    const userId = req.params.id;
    const { PhanQuyenID } = req.body;

    // Kiểm tra tài khoản tồn tại
    const [user] = await connection.query(
      'SELECT * FROM taikhoan WHERE NguoiDungID = ?', 
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    // Kiểm tra quyền tồn tại
    const [permission] = await connection.query(
      'SELECT * FROM phanquyen WHERE PhanQuyenID = ?', 
      [PhanQuyenID]
    );
    
    if (permission.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy quyền được chọn'
      });
    }

    // Cập nhật quyền
    await connection.query(
      'UPDATE taikhoan SET PhanQuyenID = ? WHERE NguoiDungID = ?',
      [PhanQuyenID, userId]
    );

    await connection.query('COMMIT');
    res.json({
      success: true,
      message: 'Cập nhật phân quyền thành công'
    });
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Lỗi khi cập nhật phân quyền:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật phân quyền'
    });
  } finally {
    connection.release();
  }
});
app.get('/hangMuc/:duAnId/vuongMac', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Kiểm tra dự án có tồn tại không
    const [duAn] = await pool.query(
      'SELECT DuAnID, TenDuAn, ParentID, NgayKhoiCong, KeHoachHoanThanh FROM duan WHERE DuAnID = ?',
      [duAnId]
    );

    if (duAn.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án với ID này'
      });
    }

    const currentProject = duAn[0];

    // 2. Hàm lấy chi tiết vướng mắc cho một dự án
    const getVuongMacDetails = async (projectId) => {
      // Lấy các gói thầu thuộc dự án
      const [goiThauList] = await pool.query(
        `SELECT gt.*, nt.TenNhaThau, nt.MaSoThue 
         FROM goithau gt
         LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
         WHERE gt.DuAn_ID = ?
         ORDER BY gt.GoiThau_ID ASC`,
        [projectId]
      );

      // Lấy thông tin chi tiết các gói thầu
      const goiThauWithHangMuc = await Promise.all(
        goiThauList.map(async (goiThau) => {
          // Lấy tất cả hạng mục của gói thầu
          const [hangMucList] = await pool.query(
            `SELECT * FROM hangmuc 
             WHERE GoiThauID = ?
             ORDER BY HangMucID ASC`,
            [goiThau.GoiThau_ID]
          );

          // Lấy thông tin vướng mắc cho từng hạng mục
          const hangMucWithVuongMac = await Promise.all(
            hangMucList.map(async (hangMuc) => {
              const [vuongMacList] = await pool.query(
                `SELECT 
                  vm.VuongMacID,
                  vm.KeHoachID,
                  vm.LoaiVuongMac,
                  vm.MoTaChiTiet,
                  vm.NgayPhatSinh,
                  vm.NgayKetThuc,
                  vm.MucDo,
                  vm.BienPhapXuLy,
                  kh.TenCongTac,
                  kh.KhoiLuongKeHoach,
                  kh.DonViTinh
                 FROM vuongmac vm
                 LEFT JOIN quanlykehoach kh ON vm.KeHoachID = kh.KeHoachID
                 WHERE kh.HangMucID = ?
                 ORDER BY vm.VuongMacID ASC`,
                [hangMuc.HangMucID]
              );

              // Format dữ liệu vướng mắc
              const formattedVuongMac = vuongMacList.map(vm => ({
                vuongMacId: vm.VuongMacID,
                keHoachId: vm.KeHoachID,
                tenCongTac: vm.TenCongTac,
                khoiLuongKeHoach: vm.KhoiLuongKeHoach,
                donViTinh: vm.DonViTinh,
                loaiVuongMac: vm.LoaiVuongMac,
                moTaChiTiet: vm.MoTaChiTiet,
                ngayPhatSinh: vm.NgayPhatSinh,
                ngayKetThuc: vm.NgayKetThuc,
                mucDo: vm.MucDo,
                bienPhapXuLy: vm.BienPhapXuLy,
                trangThai: vm.BienPhapXuLy ? 'Đã phê duyệt' : 'Chưa phê duyệt'
              }));

              // Đếm vướng mắc theo trạng thái
              const tongVuongMac = formattedVuongMac.length;
              const soVuongMacDaPheDuyet = formattedVuongMac.filter(
                vm => vm.trangThai === 'Đã phê duyệt'
              ).length;
              const soVuongMacChuaPheDuyet = tongVuongMac - soVuongMacDaPheDuyet;

              return {
                hangMucId: hangMuc.HangMucID,
                tenHangMuc: hangMuc.TenHangMuc,
                loaiHangMuc: hangMuc.LoaiHangMuc,
                tieuDeChiTiet: hangMuc.TieuDeChiTiet,
                mayMocThietBi: hangMuc.MayMocThietBi,
                nhanLucThiCong: hangMuc.NhanLucThiCong,
                thoiGianHoanThanh: hangMuc.ThoiGianHoanThanh,
                ghiChu: hangMuc.GhiChu,
                danhSachVuongMac: formattedVuongMac,
                tongVuongMac,
                soVuongMacDaPheDuyet,
                soVuongMacChuaPheDuyet
              };
            })
          );

          // Tính tổng cho gói thầu
          const tongVuongMacGoiThau = hangMucWithVuongMac.reduce(
            (sum, hm) => sum + (hm.tongVuongMac || 0), 0
          );
          const tongDaPheDuyetGoiThau = hangMucWithVuongMac.reduce(
            (sum, hm) => sum + (hm.soVuongMacDaPheDuyet || 0), 0
          );
          const tongChuaPheDuyetGoiThau = hangMucWithVuongMac.reduce(
            (sum, hm) => sum + (hm.soVuongMacChuaPheDuyet || 0), 0
          );

          return {
            goiThauId: goiThau.GoiThau_ID,
            tenGoiThau: goiThau.TenGoiThau,
            giaTriHopDong: goiThau.GiaTriHĐ,
            kmBatDau: goiThau.Km_BatDau,
            kmKetThuc: goiThau.Km_KetThuc,
            toaDoBatDau: { x: goiThau.ToaDo_BatDau_X, y: goiThau.ToaDo_BatDau_Y },
            toaDoKetThuc: { x: goiThau.ToaDo_KetThuc_X, y: goiThau.ToaDo_KetThuc_Y },
            ngayKhoiCong: goiThau.NgayKhoiCong,
            ngayHoanThanh: goiThau.NgayHoanThanh,
            trangThai: goiThau.TrangThai,
            nhaThau: goiThau.NhaThauID ? {
              nhaThauId: goiThau.NhaThauID,
              tenNhaThau: goiThau.TenNhaThau,
              maSoThue: goiThau.MaSoThue
            } : null,
            danhSachHangMuc: hangMucWithVuongMac,
            tongVuongMac: tongVuongMacGoiThau,
            tongDaPheDuyet: tongDaPheDuyetGoiThau,
            tongChuaPheDuyet: tongChuaPheDuyetGoiThau
          };
        })
      );

      // Tính tổng cho dự án
      const tongVuongMac = goiThauWithHangMuc.reduce(
        (sum, gt) => sum + (gt.tongVuongMac || 0), 0
      );
      const tongDaPheDuyet = goiThauWithHangMuc.reduce(
        (sum, gt) => sum + (gt.tongDaPheDuyet || 0), 0
      );
      const tongChuaPheDuyet = goiThauWithHangMuc.reduce(
        (sum, gt) => sum + (gt.tongChuaPheDuyet || 0), 0
      );

      return {
        duAnId: projectId,
        danhSachGoiThau: goiThauWithHangMuc,
        tongVuongMac,
        tongDaPheDuyet,
        tongChuaPheDuyet
      };
    };

    // 3. Hàm lấy tất cả dự án con (đệ quy)
    const getAllChildProjects = async (parentId) => {
      const [childProjects] = await pool.query(
        'SELECT DuAnID, TenDuAn, ParentID FROM duan WHERE ParentID = ?',
        [parentId]
      );
      
      let allChildren = [];
      
      for (const child of childProjects) {
        const grandchildren = await getAllChildProjects(child.DuAnID);
        allChildren.push(child, ...grandchildren);
      }
      
      return allChildren;
    };

    // 4. Xử lý theo loại dự án
    let responseData = { success: true, data: {} };

    if (currentProject.ParentID === null) {
      // Dự án cha - có thể có cả dự án con và gói thầu trực tiếp
      const [directChildProjects] = await pool.query(
        'SELECT DuAnID, TenDuAn, NgayKhoiCong, KeHoachHoanThanh FROM duan WHERE ParentID = ?',
        [duAnId]
      );

      // Lấy tất cả các dự án con (bao gồm cả cháu, chắt...)
      const allChildProjects = await getAllChildProjects(duAnId);
      const allChildProjectIds = allChildProjects.map(p => p.DuAnID);

      // Lấy vướng mắc từ gói thầu trực tiếp thuộc dự án cha
      const directTenders = await getVuongMacDetails(duAnId);

      // Lấy thông tin chi tiết cho từng dự án con
      const childProjectDetails = await Promise.all(
        directChildProjects.map(async (childProject) => {
          const details = await getVuongMacDetails(childProject.DuAnID);
          return {
            duAnId: childProject.DuAnID,
            tenDuAn: childProject.TenDuAn,
            ngayBatDau: childProject.NgayKhoiCong,
            ngayKetThuc: childProject.KeHoachHoanThanh,
            ...details
          };
        })
      );

      // Lấy tất cả vướng mắc từ các dự án con (bao gồm cả cháu, chắt...)
      let allVuongMacFromChildren = {
        tongVuongMac: 0,
        tongDaPheDuyet: 0,
        tongChuaPheDuyet: 0
      };
      
      if (allChildProjectIds.length > 0) {
        // Tính tổng vướng mắc từ tất cả dự án con
        for (const child of childProjectDetails) {
          allVuongMacFromChildren.tongVuongMac += child.tongVuongMac || 0;
          allVuongMacFromChildren.tongDaPheDuyet += child.tongDaPheDuyet || 0;
          allVuongMacFromChildren.tongChuaPheDuyet += child.tongChuaPheDuyet || 0;
        }
      }

      // Tính tổng tất cả vướng mắc (bao gồm từ dự án con và gói thầu trực tiếp)
      const totalVuongMac = 
        directTenders.tongVuongMac + allVuongMacFromChildren.tongVuongMac;
      const totalDaPheDuyet = 
        directTenders.tongDaPheDuyet + allVuongMacFromChildren.tongDaPheDuyet;
      const totalChuaPheDuyet = 
        directTenders.tongChuaPheDuyet + allVuongMacFromChildren.tongChuaPheDuyet;

      responseData.data = {
        duAnTong: {
          duAnId: currentProject.DuAnID,
          tenDuAn: currentProject.TenDuAn,
          ngayBatDau: currentProject.NgayKhoiCong,
          ngayKetThuc: currentProject.KeHoachHoanThanh,
          danhSachDuAnCon: childProjectDetails,
          danhSachGoiThauTrucTiep: directTenders.danhSachGoiThau,
          tongVuongMac: totalVuongMac,
          tongDaPheDuyet: totalDaPheDuyet,
          tongChuaPheDuyet: totalChuaPheDuyet
        }
      };
    } else {
      // Dự án con - giữ logic hiện tại
      const [parentProject] = await pool.query(
        'SELECT DuAnID, TenDuAn FROM duan WHERE DuAnID = ?',
        [currentProject.ParentID]
      );

      const projectDetails = await getVuongMacDetails(duAnId);

      responseData.data = {
        duAnTong: parentProject.length > 0 ? {
          duAnId: parentProject[0].DuAnID,
          tenDuAn: parentProject[0].TenDuAn
        } : null,
        duAnThanhPhan: {
          duAnId: currentProject.DuAnID,
          tenDuAn: currentProject.TenDuAn,
          ngayBatDau: currentProject.NgayKhoiCong,
          ngayKetThuc: currentProject.KeHoachHoanThanh,
          ...projectDetails
        }
      };
    }

    res.json(responseData);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/duAntp/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Truy vấn chi tiết dự án thành phần (có ParentID không null)
    const [rows] = await pool.query(
      'SELECT * FROM DuAn WHERE DuAnID = ?', 
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy dự án thành phần với ID ${id}`
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(`Lỗi khi truy vấn dự án thành phần ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết dự án thành phần'
    });
  }
});
app.get('/duAn/:duAnId', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;
    const [duAnTong] = await pool.query(
      'SELECT * FROM duan WHERE DuAnID = ? AND ParentID IS NULL',
      [duAnId]
    );

    if (duAnTong.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án TỔNG với ID này'
      });
    }

    // 2. Lấy các dự án thành phần
    const [duAnThanhPhan] = await pool.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Tính toán khối lượng kế hoạch và thực hiện tổng thể
    let tongKhoiLuongKeHoach = 0;
    let tongKhoiLuongThucHien = 0;

    // Lấy tất cả gói thầu thuộc dự án tổng
    const [allGoiThau] = await pool.query(
      `SELECT gt.GoiThau_ID 
       FROM goithau gt
       JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE d.DuAnID = ? OR d.ParentID = ?`,
      [duAnId, duAnId]
    );

    if (allGoiThau.length > 0) {
      const goiThauIds = allGoiThau.map(gt => gt.GoiThau_ID);

      // Tính tổng khối lượng kế hoạch của toàn bộ dự án tổng
      const [tongKeHoach] = await pool.query(
        `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
         FROM quanlykehoach kh
         JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
         WHERE hm.GoiThauID IN (?)`,
        [goiThauIds]
      );
      tongKhoiLuongKeHoach = tongKeHoach[0].tongKeHoach || 0;

      // Tính tổng khối lượng thực hiện của toàn bộ dự án tổng
      const [tongThucHien] = await pool.query(
        `SELECT SUM(td.KhoiLuongThucHien) as tongThucHien
         FROM tiendothuchien td
         JOIN quanlykehoach kh ON td.KeHoachID = kh.KeHoachID
         JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
         WHERE hm.GoiThauID IN (?)`,
        [goiThauIds]
      );
      tongKhoiLuongThucHien = tongThucHien[0].tongThucHien || 0;
    }

    // 4. Lấy thông tin chi tiết cho từng dự án thành phần
    const duAnThanhPhanWithDetails = await Promise.all(
      duAnThanhPhan.map(async (duAnTP) => {
        // Lấy các gói thầu thuộc dự án thành phần này
        const [goiThauTP] = await pool.query(
          `SELECT gt.* 
           FROM goithau gt
           WHERE gt.DuAn_ID = ?
           ORDER BY gt.GoiThau_ID ASC`,
          [duAnTP.DuAnID]
        );

        // Tính toán khối lượng kế hoạch và thực hiện cho từng dự án thành phần
        let khoiLuongKeHoachTP = 0;
        let khoiLuongThucHienTP = 0;
        let phanTramKeHoach = 0;
        let phanTramHoanThanh = 0;
        let phanTramChamTienDo = 0;

        if (goiThauTP.length > 0) {
          const goiThauIds = goiThauTP.map(gt => gt.GoiThau_ID);

          // Tính tổng khối lượng kế hoạch của dự án thành phần
          const [keHoachTP] = await pool.query(
            `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
             FROM quanlykehoach kh
             JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
             WHERE hm.GoiThauID IN (?)`,
            [goiThauIds]
          );
          khoiLuongKeHoachTP = keHoachTP[0].tongKeHoach || 0;

          // Tính tổng khối lượng thực hiện của dự án thành phần
          const [thucHienTP] = await pool.query(
            `SELECT SUM(td.KhoiLuongThucHien) as tongThucHien
             FROM tiendothuchien td
             JOIN quanlykehoach kh ON td.KeHoachID = kh.KeHoachID
             JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
             WHERE hm.GoiThauID IN (?)`,
            [goiThauIds]
          );
          khoiLuongThucHienTP = thucHienTP[0].tongThucHien || 0;

          // Tính phần trăm
          if (tongKhoiLuongKeHoach > 0) {
            phanTramKeHoach = (khoiLuongKeHoachTP / tongKhoiLuongKeHoach) * 100;
            phanTramHoanThanh = (khoiLuongThucHienTP / tongKhoiLuongKeHoach) * 100;
            phanTramChamTienDo = Math.max(phanTramKeHoach - phanTramHoanThanh, 0);
          }
        }

        // Xác định tọa độ đầu cuối cho dự án thành phần
        let toaDoDauTP = null;
        let toaDoCuoiTP = null;

        if (goiThauTP.length > 0) {
          const firstGoiThauTP = goiThauTP[0];
          toaDoDauTP = {
            x: firstGoiThauTP.ToaDo_BatDau_X,
            y: firstGoiThauTP.ToaDo_BatDau_Y
          };

          const lastGoiThauTP = goiThauTP[goiThauTP.length - 1];
          toaDoCuoiTP = {
            x: lastGoiThauTP.ToaDo_KetThuc_X,
            y: lastGoiThauTP.ToaDo_KetThuc_Y
          };
        }

        // Lấy số lượng hạng mục cho dự án thành phần
        let countHangMuc = 0;
        if (goiThauTP.length > 0) {
          const goiThauIds = goiThauTP.map(gt => gt.GoiThau_ID);
          const [hangMuc] = await pool.query(
            `SELECT COUNT(*) as count FROM hangmuc WHERE GoiThauID IN (?)`,
            [goiThauIds]
          );
          countHangMuc = hangMuc[0].count;
        }

        return {
          DuAnID: duAnTP.DuAnID,
          TenDuAn: duAnTP.TenDuAn,
          TinhThanh: duAnTP.TinhThanh,
          ChuDauTu: duAnTP.ChuDauTu,
          NgayKhoiCong: duAnTP.NgayKhoiCong,
          TrangThai: duAnTP.TrangThai,
          NguonVon: duAnTP.NguonVon,
          TongChieuDai: duAnTP.TongChieuDai,
          KeHoachHoanThanh: duAnTP.KeHoachHoanThanh,
          MoTaChung: duAnTP.MoTaChung,
          ParentID: duAnTP.ParentID,
          coordinates: {
            start: toaDoDauTP ? { lat: toaDoDauTP.y, lng: toaDoDauTP.x } : null,
            end: toaDoCuoiTP ? { lat: toaDoCuoiTP.y, lng: toaDoCuoiTP.x } : null
          },
          soLuongHangMuc: countHangMuc,
          khoiLuongKeHoach: khoiLuongKeHoachTP,
          khoiLuongThucHien: khoiLuongThucHienTP,
          phanTramKeHoach: phanTramKeHoach.toFixed(2),
          phanTramHoanThanh: phanTramHoanThanh.toFixed(2),
          phanTramChamTienDo: phanTramChamTienDo.toFixed(2)
        };
      })
    );

    res.json({
      success: true,
      data: {
        DuAnID: duAnTong[0].DuAnID,
        TenDuAn: duAnTong[0].TenDuAn,
        TinhThanh: duAnTong[0].TinhThanh,
        ChuDauTu: duAnTong[0].ChuDauTu,
        NgayKhoiCong: duAnTong[0].NgayKhoiCong,
        TrangThai: duAnTong[0].TrangThai,
        NguonVon: duAnTong[0].NguonVon,
        TongChieuDai: duAnTong[0].TongChieuDai,
        KeHoachHoanThanh: duAnTong[0].KeHoachHoanThanh,
        MoTaChung: duAnTong[0].MoTaChung,
        tongKhoiLuongKeHoach: tongKhoiLuongKeHoach,
        tongKhoiLuongThucHien: tongKhoiLuongThucHien,
        phanTramHoanThanhTong: tongKhoiLuongKeHoach > 0
          ? ((tongKhoiLuongThucHien / tongKhoiLuongKeHoach) * 100).toFixed(2)
          : "0.00",
        duAnThanhPhan: duAnThanhPhanWithDetails
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi truy vấn dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/duAnChiTiet/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin cơ bản của dự án
    const [duan] = await pool.query('SELECT * FROM duan WHERE DuAnID = ?', [id]);
    if (!duan || duan.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dự án không tồn tại'
      });
    }

    // Lấy loại hình dự án
    const [loaiHinh] = await pool.query(
      'SELECT LoaiHinh_ID FROM doituongloaihinh WHERE DoiTuong_ID = ? AND LoaiDoiTuong = "duan"',
      [id]
    );

    // Lấy các thuộc tính của dự án
    const [thuocTinh] = await pool.query(
      'SELECT ThuocTinh_ID, GiaTri FROM giatrithuoctinh WHERE DoiTuong_ID = ? AND LoaiDoiTuong = "duan"',
      [id]
    );

    // Chuyển đổi thuộc tính thành object
    const thuocTinhValues = {};
    thuocTinh.forEach(item => {
      thuocTinhValues[item.ThuocTinh_ID] = item.GiaTri;
    });

    // Lấy danh sách tài liệu
    const [taiLieu] = await pool.query(
      'SELECT TaiLieuID, TenTaiLieu, LoaiTaiLieu, DuongDan, MoTa FROM tailieu WHERE DoiTuongID = ? AND LoaiDoiTuong = "DUAN"',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...duan[0],
        LoaiHinh_ID: loaiHinh[0]?.LoaiHinh_ID || null,
        ThuocTinhValues: thuocTinhValues,
        TaiLieu: taiLieu
      }
    });

  } catch (error) {
    console.error('Error getting project details:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy thông tin dự án',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.put('/duan/:id', createUploadMiddleware('DUAN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy dữ liệu từ form-data
    const {
      TenDuAn,
      TinhThanh,
      ChuDauTu,
      NgayKhoiCong,
      TrangThai,
      NguonVon,
      TongChieuDai,
      KeHoachHoanThanh,
      MoTaChung,
      ParentID,
      LoaiHinh_ID,
      ThuocTinhValues,
      deletedFiles // Danh sách file IDs cần xóa (nếu có)
    } = req.body;

    // Parse JSON string nếu có
    const thuocTinhValuesParsed = ThuocTinhValues ? JSON.parse(ThuocTinhValues) : {};

    // Validate required fields
    if (!TenDuAn || !LoaiHinh_ID) {
      // Xóa file đã upload nếu validate fail
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (TenDuAn, LoaiHinh_ID)'
      });
    }

    // Kiểm tra dự án có tồn tại không
    const [existingProject] = await pool.query('SELECT * FROM duan WHERE DuAnID = ?', [id]);
    if (!existingProject || existingProject.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dự án không tồn tại'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // Update main project info
    await pool.query(
      `UPDATE duan SET
        TenDuAn = ?,
        TinhThanh = ?,
        ChuDauTu = ?,
        NgayKhoiCong = ?,
        TrangThai = ?,
        NguonVon = ?,
        TongChieuDai = ?,
        KeHoachHoanThanh = ?,
        MoTaChung = ?,
        ParentID = ?
      WHERE DuAnID = ?`,
      [
        TenDuAn, 
        TinhThanh || null, 
        ChuDauTu || null, 
        NgayKhoiCong || null,
        TrangThai || 'Đang chuẩn bị', 
        NguonVon || 'Ngân sách', 
        TongChieuDai || null, 
        KeHoachHoanThanh || null,
        MoTaChung || null, 
        ParentID || null,
        id
      ]
    );

    // Update project type
    await pool.query(
      'UPDATE doituongloaihinh SET LoaiHinh_ID = ? WHERE DoiTuong_ID = ? AND LoaiDoiTuong = "duan"',
      [LoaiHinh_ID, id]
    );

    // Xóa các thuộc tính cũ
    await pool.query(
      'DELETE FROM giatrithuoctinh WHERE DoiTuong_ID = ? AND LoaiDoiTuong = "duan"',
      [id]
    );

    // Thêm lại các thuộc tính mới
    if (thuocTinhValuesParsed && typeof thuocTinhValuesParsed === 'object') {
      for (const [ThuocTinh_ID, GiaTri] of Object.entries(thuocTinhValuesParsed)) {
        await pool.query(
          `INSERT INTO giatrithuoctinh 
          (ThuocTinh_ID, DoiTuong_ID, LoaiDoiTuong, GiaTri)
          VALUES (?, ?, "duan", ?)`,
          [ThuocTinh_ID, id, GiaTri]
        );
      }
    }

    // Xử lý xóa file nếu có
    if (deletedFiles) {
      const deletedFilesArray = Array.isArray(deletedFiles) ? deletedFiles : [deletedFiles];
      
      for (const fileId of deletedFilesArray) {
        // Lấy thông tin file để xóa vật lý
        const [fileInfo] = await pool.query(
          'SELECT DuongDan FROM tailieu WHERE TaiLieuID = ?',
          [fileId]
        );
        
        if (fileInfo && fileInfo.length > 0) {
          const filePath = path.join(__dirname, fileInfo[0].DuongDan);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        }
        
        // Xóa record trong DB
        await pool.query(
          'DELETE FROM tailieu WHERE TaiLieuID = ?',
          [fileId]
        );
      }
    }

    // Xử lý upload file mới
    const taiLieuResults = [];
    if (req.files && req.files.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'DUAN', String(id));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of req.files) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [fileResult] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'DUAN',
            id,
            file.originalname,
            'KHAC',
            `/Uploads/DUAN/${id}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: fileResult.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/DUAN/${id}/${file.filename}`
        });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật dự án thành công',
      data: {
        DuAnID: id,
        LoaiHinh_ID,
        ThuocTinhValues: thuocTinhValuesParsed,
        taiLieu: taiLieuResults
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    
    // Clean up uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật dự án',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/duan/tao-moi', createUploadMiddleware('DUAN'), async (req, res) => {
  try {
    // Lấy dữ liệu từ form-data
    const {
      TenDuAn,
      TinhThanh,
      ChuDauTu,
      NgayKhoiCong,
      TrangThai,
      NguonVon,
      TongChieuDai,
      KeHoachHoanThanh,
      MoTaChung,
      ParentID,
      LoaiHinh_ID,
      ThuocTinhValues
    } = req.body;

    // Parse JSON string nếu có
    const thuocTinhValuesParsed = ThuocTinhValues ? JSON.parse(ThuocTinhValues) : {};

    // Validate required fields
    if (!TenDuAn || !LoaiHinh_ID) {
      // Xóa file đã upload nếu validate fail
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (TenDuAn, LoaiHinh_ID)'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // Insert main project info
    const [result] = await pool.query(
      `INSERT INTO duan (
        TenDuAn, TinhThanh, ChuDauTu, NgayKhoiCong,
        TrangThai, NguonVon, TongChieuDai, KeHoachHoanThanh,
        MoTaChung, ParentID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TenDuAn, 
        TinhThanh || null, 
        ChuDauTu || null, 
        NgayKhoiCong || null,
        TrangThai || 'Đang chuẩn bị', 
        NguonVon || 'Ngân sách', 
        TongChieuDai || null, 
        KeHoachHoanThanh || null,
        MoTaChung || null, 
        ParentID || null
      ]
    );

    const DuAnID = result.insertId;

    // Link project to its type
    await pool.query(
      'INSERT INTO doituongloaihinh (DoiTuong_ID, LoaiDoiTuong, LoaiHinh_ID) VALUES (?, "duan", ?)',
      [DuAnID, LoaiHinh_ID]
    );

    // Insert attribute values if provided
    if (thuocTinhValuesParsed && typeof thuocTinhValuesParsed === 'object') {
      for (const [ThuocTinh_ID, GiaTri] of Object.entries(thuocTinhValuesParsed)) {
        await pool.query(
          `INSERT INTO giatrithuoctinh 
          (ThuocTinh_ID, DoiTuong_ID, LoaiDoiTuong, GiaTri)
          VALUES (?, ?, "duan", ?)`,
          [ThuocTinh_ID, DuAnID, GiaTri]
        );
      }
    }

    // Handle file uploads
    const taiLieuResults = [];
    if (req.files && req.files.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'DUAN', String(DuAnID));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of req.files) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [fileResult] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'DUAN',
            DuAnID,
            file.originalname,
            'KHAC',
            `/Uploads/DUAN/${DuAnID}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: fileResult.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/DUAN/${DuAnID}/${file.filename}`
        });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Tạo dự án mới thành công',
      data: {
        DuAnID,
        LoaiHinh_ID,
        ThuocTinhValues: thuocTinhValuesParsed,
        taiLieu: taiLieuResults
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    
    // Clean up uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tạo dự án',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/goithau/tao-moi', createUploadMiddleware('GOITHAU'), async (req, res) => {
  try {
    const {
      TenGoiThau,
      DuAn_ID,
      GiaTriHĐ,
      Km_BatDau,
      Km_KetThuc,
      ToaDo_BatDau_X,
      ToaDo_BatDau_Y,
      ToaDo_KetThuc_X,
      ToaDo_KetThuc_Y,
      NgayKhoiCong,
      NgayHoanThanh,
      TrangThai,
      NhaThauID,
      LoaiHinh_ID,
      ThuocTinhValues
    } = req.body;

    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Xử lý file KML nếu có
    let pathData = null;
    const kmlFile = req.files?.find(file => 
      path.extname(file.originalname).toLowerCase() === '.kml'
    );

    if (kmlFile) {
      try {
        const kmlContent = fs.readFileSync(kmlFile.path, 'utf-8');
        const kmlDom = new DOMParser().parseFromString(kmlContent);
        const geoJson = kml(kmlDom);
        
        if (geoJson.features?.[0]?.geometry?.coordinates) {
          pathData = JSON.stringify(geoJson.features[0].geometry.coordinates);
        }
        fs.unlinkSync(kmlFile.path); // Xóa file tạm sau khi xử lý
      } catch (error) {
        console.error('Lỗi xử lý KML:', error);
        // Vẫn tiếp tục xử lý dù KML lỗi
      }
    }

    // 2. Insert main tender package info (thêm PathData)
    const [goiThauResult] = await pool.query(
      `INSERT INTO goithau (
        TenGoiThau, DuAn_ID, GiaTriHĐ, Km_BatDau, Km_KetThuc,
        ToaDo_BatDau_X, ToaDo_BatDau_Y, ToaDo_KetThuc_X, ToaDo_KetThuc_Y,
        NgayKhoiCong, NgayHoanThanh, TrangThai, NhaThauID, PathData
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TenGoiThau, DuAn_ID, GiaTriHĐ, Km_BatDau, Km_KetThuc,
        ToaDo_BatDau_X, ToaDo_BatDau_Y, ToaDo_KetThuc_X, ToaDo_KetThuc_Y,
        NgayKhoiCong, NgayHoanThanh, TrangThai, NhaThauID, pathData
      ]
    );

    const GoiThau_ID = goiThauResult.insertId;

    // 3. Insert into goithau_nhathau table if NhaThauID is provided
    if (NhaThauID) {
      await pool.query(
        'INSERT INTO goithau_nhathau (GoiThau_ID, NhaThauID, VaiTro) VALUES (?, ?, ?)',
        [GoiThau_ID, NhaThauID, 'Nhà thầu chính']
      );
    }

    // 4. Link tender package to its type
    if (LoaiHinh_ID) {
      await pool.query(
        'INSERT INTO doituongloaihinh (DoiTuong_ID, LoaiDoiTuong, LoaiHinh_ID) VALUES (?, "goithau", ?)',
        [GoiThau_ID, LoaiHinh_ID]
      );

      // 5. Insert attribute values if provided
      if (ThuocTinhValues && typeof ThuocTinhValues === 'object') {
        for (const [ThuocTinh_ID, GiaTri] of Object.entries(ThuocTinhValues)) {
          await pool.query(
            `INSERT INTO giatrithuoctinh 
            (ThuocTinh_ID, DoiTuong_ID, LoaiDoiTuong, GiaTri)
            VALUES (?, ?, "goithau", ?)`,
            [ThuocTinh_ID, GoiThau_ID, GiaTri]
          );
        }
      }
    }

    // 6. Handle other file uploads (non-KML)
    const taiLieuResults = [];
    const otherFiles = req.files?.filter(file => 
      path.extname(file.originalname).toLowerCase() !== '.kml'
    ) || [];

    if (otherFiles.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'GOITHAU', String(GoiThau_ID));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of otherFiles) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [fileResult] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'GOITHAU',
            GoiThau_ID,
            file.originalname,
            'KHAC',
            `/Uploads/GOITHAU/${GoiThau_ID}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: fileResult.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/GOITHAU/${GoiThau_ID}/${file.filename}`
        });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Tạo gói thầu mới thành công',
      data: {
        GoiThau_ID,
        LoaiHinh_ID,
        ThuocTinhValues,
        taiLieu: taiLieuResults,
        hasKml: !!pathData
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    
    // Clean up uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    console.error('Error creating tender package:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tạo gói thầu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.delete('/goithau/xoa/:GoiThau_ID', async (req, res) => {
  try {
    const { GoiThau_ID } = req.params;

    // Kiểm tra GoiThau_ID hợp lệ
    if (!GoiThau_ID || isNaN(GoiThau_ID)) {
      return res.status(400).json({
        success: false,
        message: 'GoiThau_ID không hợp lệ'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Lấy danh sách tài liệu để xóa file vật lý sau
    const [taiLieuRows] = await pool.query(
      'SELECT DuongDan FROM tailieu WHERE LoaiDoiTuong = ? AND DoiTuongID = ?',
      ['GOITHAU', GoiThau_ID]
    );

    // 2. Xóa dữ liệu liên quan từ các bảng
    // Xóa thuộc tính của gói thầu
    await pool.query(
      'DELETE FROM giatrithuoctinh WHERE LoaiDoiTuong = ? AND DoiTuong_ID = ?',
      ['goithau', GoiThau_ID]
    );

    // Xóa liên kết loại hình
    await pool.query(
      'DELETE FROM doituongloaihinh WHERE LoaiDoiTuong = ? AND DoiTuong_ID = ?',
      ['goithau', GoiThau_ID]
    );

    // Xóa liên kết nhà thầu
    await pool.query(
      'DELETE FROM goithau_nhathau WHERE GoiThau_ID = ?',
      [GoiThau_ID]
    );

    // Xóa tài liệu
    await pool.query(
      'DELETE FROM tailieu WHERE LoaiDoiTuong = ? AND DoiTuongID = ?',
      ['GOITHAU', GoiThau_ID]
    );

    // Xóa gói thầu chính
    const [deleteResult] = await pool.query(
      'DELETE FROM goithau WHERE GoiThau_ID = ?',
      [GoiThau_ID]
    );

    // Kiểm tra xem gói thầu có tồn tại và bị xóa không
    if (deleteResult.affectedRows === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói thầu'
      });
    }

    // 3. Xóa thư mục và file vật lý
    const folderPath = path.join(__dirname, 'Uploads', 'GOITHAU', String(GoiThau_ID));
    if (fs.existsSync(folderPath)) {
      try {
        fs.rmSync(folderPath, { recursive: true, force: true });
      } catch (err) {
        console.error('Error deleting folder:', err);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Xóa gói thầu thành công',
      data: { GoiThau_ID }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting tender package:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xóa gói thầu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.put('/goithau/sua/:GoiThau_ID', createUploadMiddleware('GOITHAU'), async (req, res) => {
  try {
    const { GoiThau_ID } = req.params;
    const {
      TenGoiThau,
      DuAn_ID,
      GiaTriHĐ,
      Km_BatDau,
      Km_KetThuc,
      ToaDo_BatDau_X,
      ToaDo_BatDau_Y,
      ToaDo_KetThuc_X,
      ToaDo_KetThuc_Y,
      NgayKhoiCong,
      NgayHoanThanh,
      TrangThai,
      NhaThauID,
      LoaiHinh_ID,
      ThuocTinhValues,
      TaiLieuXoa // Danh sách ID tài liệu cần xóa
    } = req.body;

    // Kiểm tra GoiThau_ID hợp lệ
    if (!GoiThau_ID || isNaN(GoiThau_ID)) {
      return res.status(400).json({
        success: false,
        message: 'GoiThau_ID không hợp lệ'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Kiểm tra gói thầu tồn tại
    const [existingGoiThau] = await pool.query(
      'SELECT * FROM goithau WHERE GoiThau_ID = ?',
      [GoiThau_ID]
    );

    if (existingGoiThau.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói thầu'
      });
    }

    // 2. Cập nhật thông tin gói thầu chính
    await pool.query(
      `UPDATE goithau SET
        TenGoiThau = ?, DuAn_ID = ?, GiaTriHĐ = ?, Km_BatDau = ?, Km_KetThuc = ?,
        ToaDo_BatDau_X = ?, ToaDo_BatDau_Y = ?, ToaDo_KetThuc_X = ?, ToaDo_KetThuc_Y = ?,
        NgayKhoiCong = ?, NgayHoanThanh = ?, TrangThai = ?, NhaThauID = ?
      WHERE GoiThau_ID = ?`,
      [
        TenGoiThau || existingGoiThau[0].TenGoiThau,
        DuAn_ID || existingGoiThau[0].DuAn_ID,
        GiaTriHĐ || existingGoiThau[0].GiaTriHĐ,
        Km_BatDau || existingGoiThau[0].Km_BatDau,
        Km_KetThuc || existingGoiThau[0].Km_KetThuc,
        ToaDo_BatDau_X || existingGoiThau[0].ToaDo_BatDau_X,
        ToaDo_BatDau_Y || existingGoiThau[0].ToaDo_BatDau_Y,
        ToaDo_KetThuc_X || existingGoiThau[0].ToaDo_KetThuc_X,
        ToaDo_KetThuc_Y || existingGoiThau[0].ToaDo_KetThuc_Y,
        NgayKhoiCong || existingGoiThau[0].NgayKhoiCong,
        NgayHoanThanh || existingGoiThau[0].NgayHoanThanh,
        TrangThai || existingGoiThau[0].TrangThai,
        NhaThauID || existingGoiThau[0].NhaThauID,
        GoiThau_ID
      ]
    );

    // 3. Cập nhật liên kết nhà thầu
    if (NhaThauID) {
      await pool.query(
        'DELETE FROM goithau_nhathau WHERE GoiThau_ID = ?',
        [GoiThau_ID]
      );
      await pool.query(
        'INSERT INTO goithau_nhathau (GoiThau_ID, NhaThauID, VaiTro) VALUES (?, ?, ?)',
        [GoiThau_ID, NhaThauID, 'Nhà thầu chính']
      );
    }

    // 4. Cập nhật liên kết loại hình
    if (LoaiHinh_ID) {
      await pool.query(
        'DELETE FROM doituongloaihinh WHERE LoaiDoiTuong = ? AND DoiTuong_ID = ?',
        ['goithau', GoiThau_ID]
      );
      await pool.query(
        'INSERT INTO doituongloaihinh (DoiTuong_ID, LoaiDoiTuong, LoaiHinh_ID) VALUES (?, ?, ?)',
        [GoiThau_ID, 'goithau', LoaiHinh_ID]
      );
    }

    // 5. Cập nhật thuộc tính
    if (ThuocTinhValues && typeof ThuocTinhValues === 'object') {
      await pool.query(
        'DELETE FROM giatrithuoctinh WHERE LoaiDoiTuong = ? AND DoiTuong_ID = ?',
        ['goithau', GoiThau_ID]
      );
      for (const [ThuocTinh_ID, GiaTri] of Object.entries(ThuocTinhValues)) {
        await pool.query(
          `INSERT INTO giatrithuoctinh 
          (ThuocTinh_ID, DoiTuong_ID, LoaiDoiTuong, GiaTri)
          VALUES (?, ?, ?, ?)`,
          [ThuocTinh_ID, GoiThau_ID, 'goithau', GiaTri]
        );
      }
    }

    // 6. Xóa tài liệu nếu có TaiLieuXoa
    const taiLieuResults = [];
    if (TaiLieuXoa && Array.isArray(TaiLieuXoa) && TaiLieuXoa.length > 0) {
      for (const taiLieuID of TaiLieuXoa) {
        const [taiLieu] = await pool.query(
          'SELECT DuongDan FROM tailieu WHERE TaiLieuID = ? AND LoaiDoiTuong = ? AND DoiTuongID = ?',
          [taiLieuID, 'GOITHAU', GoiThau_ID]
        );
        if (taiLieu.length > 0) {
          const filePath = path.join(__dirname, taiLieu[0].DuongDan);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          await pool.query(
            'DELETE FROM tailieu WHERE TaiLieuID = ?',
            [taiLieuID]
          );
        }
      }
    }

    // 7. Xử lý file tải lên mới
    if (req.files && req.files.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'GOITHAU', String(GoiThau_ID));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of req.files) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [fileResult] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'GOITHAU',
            GoiThau_ID,
            file.originalname,
            'KHAC',
            `/Uploads/GOITHAU/${GoiThau_ID}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: fileResult.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/GOITHAU/${GoiThau_ID}/${file.filename}`
        });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Cập nhật gói thầu thành công',
      data: {
        GoiThau_ID,
        LoaiHinh_ID,
        ThuocTinhValues,
        taiLieu: taiLieuResults
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');

    // Xóa file đã tải lên nếu có lỗi
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    console.error('Error updating tender package:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật gói thầu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/loaihinh/them-thuoctinh', async (req, res) => {
  try {
    const {
      LoaiHinh_ID,
      TenThuocTinh,
      KieuDuLieu = 'varchar',
      DonVi,
      BatBuoc = 0
    } = req.body;

    // Validate required fields
    if (!LoaiHinh_ID || !TenThuocTinh) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (LoaiHinh_ID, TenThuocTinh)'
      });
    }

    // Check if type exists
    const [loaiHinh] = await pool.query(
      'SELECT * FROM loaihinh WHERE LoaiHinh_ID = ?',
      [LoaiHinh_ID]
    );

    if (loaiHinh.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy loại hình với ID này'
      });
    }

    // Insert new attribute
    const [result] = await pool.query(
      `INSERT INTO thuoctinhloaihinh 
      (LoaiHinh_ID, TenThuocTinh, KieuDuLieu, DonVi, BatBuoc)
      VALUES (?, ?, ?, ?, ?)`,
      [LoaiHinh_ID, TenThuocTinh, KieuDuLieu, DonVi, BatBuoc]
    );

    res.json({
      success: true,
      message: 'Thêm thuộc tính mới thành công',
      data: {
        ThuocTinh_ID: result.insertId,
        LoaiHinh_ID,
        TenThuocTinh,
        KieuDuLieu,
        DonVi,
        BatBuoc
      }
    });

  } catch (error) {
    console.error('Error adding attribute:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi thêm thuộc tính',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/khoiluong-thicong/them-moi', async (req, res) => {
  try {
    const {
      GoiThau_ID,
      NhaThauID,
      TieuDe,
      NoiDung,
      VaiTro = 'Nhà thầu phụ' // Mặc định là Nhà thầu phụ
    } = req.body;

    // Validate required fields
    if (!GoiThau_ID || !NhaThauID || !TieuDe || !NoiDung) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (GoiThau_ID, NhaThauID, TieuDe, NoiDung)'
      });
    }

    // Bắt đầu transaction
    await pool.query('START TRANSACTION');

    // 1. Kiểm tra gói thầu tồn tại
    const [goiThau] = await pool.query(
      'SELECT GoiThau_ID FROM goithau WHERE GoiThau_ID = ?',
      [GoiThau_ID]
    );

    if (goiThau.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói thầu với ID này'
      });
    }

    // 2. Kiểm tra nhà thầu tồn tại
    const [nhaThau] = await pool.query(
      'SELECT NhaThauID FROM nhathau WHERE NhaThauID = ?',
      [NhaThauID]
    );

    if (nhaThau.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà thầu với ID này'
      });
    }

    // 3. Thêm hoặc cập nhật vai trò nhà thầu trong gói thầu
    try {
      await pool.query(
        `INSERT INTO goithau_nhathau (GoiThau_ID, NhaThauID, VaiTro)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE VaiTro = VALUES(VaiTro)`,
        [GoiThau_ID, NhaThauID, VaiTro]
      );
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Lỗi khi thêm nhà thầu vào gói thầu:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật vai trò nhà thầu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // 4. Thêm khối lượng thi công (chỉ với các trường có trong bảng)
    const [result] = await pool.query(
      `INSERT INTO khoiluong_thicong 
      (GoiThau_ID, NhaThauID, TieuDe, NoiDung)
      VALUES (?, ?, ?, ?)`,
      [GoiThau_ID, NhaThauID, TieuDe, NoiDung]
    );

    // Commit transaction nếu mọi thứ thành công
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Thêm khối lượng thi công và cập nhật vai trò nhà thầu thành công',
      data: {
        KhoiLuong_ID: result.insertId,
        GoiThau_ID,
        NhaThauID,
        VaiTro,
        TieuDe,
        NoiDung
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error adding construction volume:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi thêm khối lượng thi công',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/loaihinh', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM loaihinh');

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching loaihinh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách loại hình',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/loaihinh/:id/thuoctinh', async (req, res) => {
  try {
    const loaiHinhId = req.params.id;

    // Kiểm tra loại hình có tồn tại
    const [loaiHinh] = await pool.query('SELECT * FROM loaihinh WHERE LoaiHinh_ID = ?', [loaiHinhId]);
    if (loaiHinh.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy loại hình với ID này'
      });
    }

    // Lấy thuộc tính của loại hình
    const [thuocTinh] = await pool.query(
      'SELECT * FROM thuoctinhloaihinh WHERE LoaiHinh_ID = ?',
      [loaiHinhId]
    );

    res.json({
      success: true,
      data: {
        loaiHinh: loaiHinh[0],
        thuocTinh
      }
    });
  } catch (error) {
    console.error('Error fetching thuoc tinh loai hinh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy thuộc tính loại hình',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/api/tailieu/:loaiDoiTuong/:doiTuongID', async (req, res) => {
  try {
    const { loaiDoiTuong, doiTuongID } = req.params;
    const { user } = 1
    
    // Validate loại đối tượng
    const validTypes = ['DUAN', 'GOITHAU', 'HANGMUC', 'KEHOACH', 'TIENDO', 'VUONGMAC'];
    if (!validTypes.includes(loaiDoiTuong.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Loại đối tượng không hợp lệ'
      });
    }

    // Xử lý upload file
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err instanceof multer.MulterError 
            ? 'File quá lớn (tối đa 100MB)' 
            : 'Lỗi khi upload file'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file để upload'
        });
      }

      const {
        tenTaiLieu = req.file.originalname,
        loaiTaiLieu,
        moTa = '',
        public = false
      } = req.body;

      // Tính dung lượng file (MB)
      const fileSizeMB = req.file.size / (1024 * 1024);

      // Lưu thông tin vào database
      const [result] = await pool.query(
        `INSERT INTO tailieu (
          LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
          DuongDan, DungLuong, NguoiUpload, MoTa, Public
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          loaiDoiTuong.toUpperCase(),
          doiTuongID,
          tenTaiLieu,
          loaiTaiLieu,
          `/uploads/${loaiDoiTuong}/${doiTuongID}/${req.file.filename}`,
          fileSizeMB,
          user.userId,
          moTa,
          public
        ]
      );

      res.json({
        success: true,
        message: 'Upload tài liệu thành công',
        data: {
          taiLieuID: result.insertId,
          tenTaiLieu,
          duongDan: `/uploads/${loaiDoiTuong}/${doiTuongID}/${req.file.filename}`,
          dungLuong: fileSizeMB.toFixed(2) + ' MB'
        }
      });
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi upload tài liệu'
    });
  }
});
app.get('/api/tailieu/:loaiDoiTuong/:doiTuongID', async (req, res) => {
  try {
    const { loaiDoiTuong, doiTuongID } = req.params;
    const { user } = 1

    // Kiểm tra quyền truy cập (tùy thuộc vào logic ứng dụng của bạn)
    // ...

    const [documents] = await pool.query(
      `SELECT * FROM tailieu 
       WHERE LoaiDoiTuong = ? AND DoiTuongID = ?
       ORDER BY NgayUpload DESC`,
      [loaiDoiTuong.toUpperCase(), doiTuongID]
    );

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách tài liệu'
    });
  }
});
app.delete('/api/tailieu/:taiLieuID', async (req, res) => {
  try {
    const { taiLieuID } = req.params;
    const { user } = req;

    // Lấy thông tin tài liệu trước khi xóa
    const [document] = await pool.query(
      `SELECT * FROM tailieu WHERE TaiLieuID = ?`,
      [taiLieuID]
    );

    if (!document.length) {
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tồn tại'
      });
    }

    // Kiểm tra quyền xóa (ví dụ: chỉ người upload hoặc admin mới được xóa)
    if (document[0].NguoiUpload !== user.userId && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tài liệu này'
      });
    }

    // Xóa file vật lý
    const filePath = path.join(__dirname, document[0].DuongDan);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Xóa record trong database
    await pool.query(
      `DELETE FROM tailieu WHERE TaiLieuID = ?`,
      [taiLieuID]
    );

    res.json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xóa tài liệu'
    });
  }
});
app.post('/hangmuc/tao-moi', createUploadMiddleware('HANGMUC'), async (req, res) => {
  try {
    const {
      GoiThauID,
      TenHangMuc,
      LoaiHangMuc,
      TieuDeChiTiet,
      MayMocThietBi,
      NhanLucThiCong,
      ThoiGianHoanThanh,
      GhiChu
    } = req.body;

    // Validate required fields
    if (!GoiThauID || !TenHangMuc) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (GoiThauID, TenHangMuc)'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // Insert main info
    const [result] = await pool.query(
      `INSERT INTO hangmuc (
        GoiThauID, TenHangMuc, LoaiHangMuc, TieuDeChiTiet,
        MayMocThietBi, NhanLucThiCong, ThoiGianHoanThanh, GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        GoiThauID,
        TenHangMuc,
        LoaiHangMuc || null,
        TieuDeChiTiet || null,
        MayMocThietBi || null,
        NhanLucThiCong || null,
        ThoiGianHoanThanh || null,
        GhiChu || null
      ]
    );

    const HangMucID = result.insertId;

    // Handle file uploads
    const taiLieuResults = [];
    if (req.files && req.files.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'HANGMUC', String(HangMucID));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of req.files) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [fileResult] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'HANGMUC',
            HangMucID,
            file.originalname,
            'KHAC',
            `/Uploads/HANGMUC/${HangMucID}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: fileResult.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/HANGMUC/${HangMucID}/${file.filename}`
        });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Thêm hạng mục thành công',
      data: {
        HangMucID,
        taiLieu: taiLieuResults
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    console.error('Error creating hang muc:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi thêm hạng mục',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.post('/kehoach/tao-moi', createUploadMiddleware('KEHOACH'), async (req, res) => {
  try {
    const {
      HangMucID,
      NhaThauID,
      TenCongTac,
      KhoiLuongKeHoach,
      DonViTinh,
      NgayBatDau,
      NgayKetThuc,
      GhiChu
    } = req.body;

    // Validate required fields
    if (!HangMucID || !NhaThauID || !TenCongTac || !KhoiLuongKeHoach) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (HangMucID, NhaThauID, TenCongTac, KhoiLuongKeHoach)'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Lấy GoiThauID từ HangMucID
    const [hangMucRows] = await pool.query(
      'SELECT GoiThauID FROM hangmuc WHERE HangMucID = ?',
      [HangMucID]
    );

    if (hangMucRows.length === 0) {
      throw new Error('Không tìm thấy hạng mục tương ứng');
    }
    const GoiThauID = hangMucRows[0].GoiThauID;

    // 2. Kiểm tra xem nhà thầu đã tồn tại trong gói thầu chưa
    const [existingRows] = await pool.query(
      'SELECT * FROM goithau_nhathau WHERE GoiThau_ID = ? AND NhaThauID = ?',
      [GoiThauID, NhaThauID]
    );

    // 3. Nếu chưa tồn tại thì thêm vào bảng goithau_nhathau với vai trò "Nhà thầu phụ"
    if (existingRows.length === 0) {
      await pool.query(
        'INSERT INTO goithau_nhathau (GoiThau_ID, NhaThauID, VaiTro) VALUES (?, ?, ?)',
        [GoiThauID, NhaThauID, 'Nhà thầu phụ']
      );
    }

    // 4. Insert main info vào bảng quanlykehoach
    const [result] = await pool.query(
      `INSERT INTO quanlykehoach (
        HangMucID, NhaThauID, TenCongTac, KhoiLuongKeHoach,
        DonViTinh, NgayBatDau, NgayKetThuc, GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        HangMucID,
        NhaThauID,
        TenCongTac,
        KhoiLuongKeHoach,
        DonViTinh || null,
        NgayBatDau || null,
        NgayKetThuc || null,
        GhiChu || null
      ]
    );

    const KeHoachID = result.insertId;

    // 5. Handle file uploads
    const taiLieuResults = [];
    if (req.files && req.files.length > 0) {
      const newFolder = path.join(__dirname, 'Uploads', 'KEHOACH', String(KeHoachID));
      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder, { recursive: true });
      }

      for (const file of req.files) {
        const newPath = path.join(newFolder, file.filename);
        fs.renameSync(file.path, newPath);

        const [fileResult] = await pool.query(
          `INSERT INTO tailieu (
            LoaiDoiTuong, DoiTuongID, TenTaiLieu, LoaiTaiLieu,
            DuongDan, NguoiUpload, MoTa
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'KEHOACH',
            KeHoachID,
            file.originalname,
            'KHAC',
            `/Uploads/KEHOACH/${KeHoachID}/${file.filename}`,
            req.user?.userId || null,
            ''
          ]
        );

        taiLieuResults.push({
          taiLieuID: fileResult.insertId,
          tenTaiLieu: file.originalname,
          duongDan: `/Uploads/KEHOACH/${KeHoachID}/${file.filename}`
        });
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Thêm kế hoạch thành công',
      data: {
        KeHoachID,
        taiLieu: taiLieuResults,
        addedAsSubcontractor: existingRows.length === 0 // Thông báo nếu nhà thầu được thêm mới
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    console.error('Error creating ke hoach:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi thêm kế hoạch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.delete('/kehoach/:id', async (req, res) => {
  const keHoachId = req.params.id;
  
  try {
    // Kiểm tra kế hoạch tồn tại
    const [keHoachResults] = await pool.query(
      'SELECT * FROM quanlykehoach WHERE KeHoachID = ?', 
      [keHoachId]
    );
    
    if (keHoachResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kế hoạch'
      });
    }

    // Bắt đầu transaction
    await pool.query('START TRANSACTION');

    // 1. Xóa tất cả tiến độ liên quan
    await pool.query(
      'DELETE FROM tiendothuchien WHERE KeHoachID = ?',
      [keHoachId]
    );

    // 2. Xóa tất cả khó khăn vướng mắc liên quan
    await pool.query(
      'DELETE FROM vuongmac WHERE KeHoachID = ?',
      [keHoachId]
    );

    // 3. Lấy danh sách tài liệu đính kèm để xóa file vật lý
    const [taiLieuResults] = await pool.query(
      'SELECT * FROM tailieu WHERE LoaiDoiTuong = "KEHOACH" AND DoiTuongID = ?',
      [keHoachId]
    );

    // 4. Xóa các tài liệu từ database
    await pool.query(
      'DELETE FROM tailieu WHERE LoaiDoiTuong = "KEHOACH" AND DoiTuongID = ?',
      [keHoachId]
    );

    // 5. Xóa kế hoạch chính
    await pool.query(
      'DELETE FROM quanlykehoach WHERE KeHoachID = ?',
      [keHoachId]
    );

    // Commit transaction
    await pool.query('COMMIT');

    // Xóa các file vật lý sau khi commit thành công
    if (taiLieuResults.length > 0) {
      const uploadPath = path.join(__dirname, 'Uploads', 'KEHOACH', keHoachId);
      
      try {
        if (fs.existsSync(uploadPath)) {
          fs.rmSync(uploadPath, { recursive: true, force: true });
        }
      } catch (err) {
        console.error('Lỗi khi xóa thư mục tài liệu:', err);
        // Không throw error vì đã xóa thành công trong database
      }
    }

    res.json({
      success: true,
      message: 'Đã xóa kế hoạch và tất cả dữ liệu liên quan'
    });

  } catch (error) {
    // Rollback nếu có lỗi
    await pool.query('ROLLBACK');
    
    console.error('Lỗi khi xóa kế hoạch:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xóa kế hoạch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.delete('/duan/:id', async (req, res) => {
  try {
    const duAnId = req.params.id;
    
    // Kiểm tra dự án tồn tại
    const [results] = await pool.query('SELECT * FROM duan WHERE DuAnID = ?', [duAnId]);
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dự án không tồn tại' 
      });
    }

    // Xóa các file đính kèm liên quan trước (nếu cần)
    const uploadPath = path.join(__dirname, 'Uploads', 'DUAN', duAnId);
    if (fs.existsSync(uploadPath)) {
      fs.rmSync(uploadPath, { recursive: true, force: true });
    }

    // Xóa dự án từ database
    await pool.query('DELETE FROM duan WHERE DuAnID = ?', [duAnId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa dự án và tất cả dữ liệu liên quan' 
    });
  } catch (error) {
    console.error('Lỗi khi xóa dự án:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xóa dự án',
      error: error.message 
    });
  }
});
app.delete('/goithau/:id', async (req, res) => {
  try {
      const goiThauId = req.params.id;
      const result = await GoiThau.destroy({
          where: { GoiThau_ID: goiThauId }
      });

      if (result === 0) {
          return res.status(404).json({ success: false, message: 'Gói thầu không tồn tại' });
      }

      res.json({ 
          success: true, 
          message: 'Đã xóa gói thầu và tất cả dữ liệu liên quan' 
      });
  } catch (error) {
      console.error('Lỗi khi xóa gói thầu:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Lỗi server khi xóa gói thầu' 
      });
  }
});
app.delete('/hangmuc/:id', async (req, res) => {
  try {
    const hangMucId = req.params.id;
    
    // Kiểm tra hạng mục tồn tại
    const [results] = await pool.query('SELECT * FROM hangmuc WHERE HangMucID = ?', [hangMucId]);
    if (results.length === 0) {
      return res.status(404).json({ 
        su2ccess: false, 
        message: 'Hạng mục không tồn tại' 
      });
    }

    // Xóa các kế hoạch liên quan trước (nếu cần cascade)
    await pool.query('DELETE FROM quanlykehoach WHERE HangMucID = ?', [hangMucId]);

    // Xóa các file đính kèm liên quan (nếu có)
    const uploadPath = path.join(__dirname, 'Uploads', 'HANGMUC', hangMucId);
    if (fs.existsSync(uploadPath)) {
      fs.rmSync(uploadPath, { recursive: true, force: true });
    }

    // Xóa hạng mục từ database
    await pool.query('DELETE FROM hangmuc WHERE HangMucID = ?', [hangMucId]);

    res.json({ 
      success: true, 
      message: 'Đã xóa hạng mục và tất cả kế hoạch liên quan' 
    });
  } catch (error) {
    console.error('Lỗi khi xóa hạng mục:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xóa hạng mục',
      error: error.message 
    });
  }
});
app.post('/vuongmac/tao-moi', async (req, res) => {
  try {
    const {
      KeHoachID,
      LoaiVuongMac,
      MoTaChiTiet,
      NgayPhatSinh,
      NgayKetThuc,
      MucDo,
      BienPhapXuLy
    } = req.body;

    // Validate required fields
    if (!KeHoachID || !LoaiVuongMac || !MoTaChiTiet || !NgayPhatSinh) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (KeHoachID, LoaiVuongMac, MoTaChiTiet, NgayPhatSinh)'
      });
    }

    // Validate enum values
    const validLoaiVuongMac = ['GPMB', 'ThietBi', 'NhanLuc', 'VatTu', 'ThoiTiet', 'Khac'];
    if (!validLoaiVuongMac.includes(LoaiVuongMac)) {
      return res.status(400).json({
        success: false,
        message: 'LoaiVuongMac không hợp lệ'
      });
    }

    // Validate MucDo if provided
    if (MucDo && !['Nho', 'TrungBinh', 'NghiemTrong'].includes(MucDo)) {
      return res.status(400).json({
        success: false,
        message: 'MucDo không hợp lệ'
      });
    }

    // Kiểm tra kế hoạch tồn tại
    const [keHoach] = await pool.query(
      'SELECT 1 FROM quanlykehoach WHERE KeHoachID = ? LIMIT 1',
      [KeHoachID]
    );
    
    if (keHoach.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kế hoạch'
      });
    }

    // Thêm vướng mắc mới
    const [result] = await pool.query(
      `INSERT INTO vuongmac (
        KeHoachID, LoaiVuongMac, MoTaChiTiet, NgayPhatSinh,
        NgayKetThuc, MucDo, BienPhapXuLy
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        KeHoachID,
        LoaiVuongMac,
        MoTaChiTiet,
        NgayPhatSinh,
        NgayKetThuc || null,
        MucDo || 'Nho',
        BienPhapXuLy || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo vướng mắc thành công',
      data: {
        VuongMacID: result.insertId
      }
    });

  } catch (error) {
    console.error('Lỗi khi tạo vướng mắc:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tạo vướng mắc',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.put('/vuongmac/cap-nhat/:id', async (req, res) => {
  try {
    const vuongMacId = req.params.id;
    const {
      LoaiVuongMac,
      MoTaChiTiet,
      NgayPhatSinh,
      NgayKetThuc,
      MucDo,
      BienPhapXuLy,
      NguoiCapNhatID
    } = req.body;

    // Validate required fields
    if (!vuongMacId || !NguoiCapNhatID) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (ID vướng mắc hoặc người cập nhật)'
      });
    }

    // Kiểm tra vướng mắc tồn tại
    const [existing] = await pool.query(
      'SELECT * FROM vuongmac WHERE VuongMacID = ? LIMIT 1',
      [vuongMacId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vướng mắc'
      });
    }

    // Cập nhật vướng mắc
    const [result] = await pool.query(
      `UPDATE vuongmac SET
        LoaiVuongMac = COALESCE(?, LoaiVuongMac),
        MoTaChiTiet = COALESCE(?, MoTaChiTiet),
        NgayPhatSinh = COALESCE(?, NgayPhatSinh),
        NgayKetThuc = ?,
        MucDo = COALESCE(?, MucDo),
        BienPhapXuLy = COALESCE(?, BienPhapXuLy),
        NguoiCapNhatID = ?,
        NgayCapNhat = NOW()
      WHERE VuongMacID = ?`,
      [
        LoaiVuongMac,
        MoTaChiTiet,
        NgayPhatSinh,
        NgayKetThuc || null,
        MucDo,
        BienPhapXuLy,
        NguoiCapNhatID,
        vuongMacId
      ]
    );

    // Ghi log lịch sử cập nhật
    if (result.affectedRows > 0) {
      const logMessage = BienPhapXuLy && BienPhapXuLy.trim() !== '' 
        ? 'Cập nhật thông tin vướng mắc kèm biện pháp xử lý' 
        : 'Cập nhật thông tin vướng mắc';
      
      await pool.query(
        `INSERT INTO vuongmac_lichsu (
          VuongMacID, HanhDong, NoiDungThayDoi, NguoiThucHienID
        ) VALUES (?, ?, ?, ?)`,
        [
          vuongMacId,
          'Cập nhật',
          logMessage,
          NguoiCapNhatID
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật vướng mắc thành công',
      data: {
        affectedRows: result.affectedRows,
        hasBienPhap: !!BienPhapXuLy
      }
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật vướng mắc:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật vướng mắc',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.delete('/vuongmac/:id', async (req, res) => {
  const vuongMacId = req.params.id;

  try {
    // Kiểm tra vướng mắc tồn tại
    const [vuongMac] = await pool.query(
      'SELECT * FROM vuongmac WHERE VuongMacID = ?',
      [vuongMacId]
    );

    if (vuongMac.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vướng mắc'
      });
    }

    // Xóa vướng mắc
    await pool.query(
      'DELETE FROM vuongmac WHERE VuongMacID = ?',
      [vuongMacId]
    );

    res.json({
      success: true,
      message: 'Đã xóa vướng mắc thành công'
    });

  } catch (error) {
    console.error('Lỗi khi xóa vướng mắc:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi xóa vướng mắc',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/hangmuc/:hangMucId/kehoach', async (req, res) => {
  try {
    const hangMucId = req.params.hangMucId;

    // 1. Kiểm tra hạng mục tồn tại
    const [hangMucCheck] = await pool.query(
      'SELECT HangMucID FROM hangmuc WHERE HangMucID = ?', 
      [hangMucId]
    );

    if (hangMucCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hạng mục'
      });
    }

    // 2. Lấy danh sách kế hoạch
    const [keHoachList] = await pool.query(`
      SELECT 
        k.KeHoachID,
        k.TenCongTac,
        k.KhoiLuongKeHoach,
        k.DonViTinh,
        k.NgayBatDau,
        k.NgayKetThuc,
        k.GhiChu,
        nt.TenNhaThau,
        COUNT(t.KeHoachID) AS SoTienTrinh,
        SUM(t.KhoiLuongThucHien) AS TongKhoiLuongThucHien
      FROM quanlykehoach k
      LEFT JOIN nhathau nt ON k.NhaThauID = nt.NhaThauID
      LEFT JOIN tiendothuchien t ON k.KeHoachID = t.KeHoachID
      WHERE k.HangMucID = ?
      GROUP BY k.KeHoachID
      ORDER BY k.NgayBatDau ASC
    `, [hangMucId]);

    // 3. Lấy danh sách tài liệu đính kèm cho mỗi kế hoạch
    for (const keHoach of keHoachList) {
      const [taiLieu] = await pool.query(
        'SELECT * FROM tailieu WHERE LoaiDoiTuong = "KEHOACH" AND DoiTuongID = ?',
        [keHoach.KeHoachID]
      );
      keHoach.TaiLieu = taiLieu;
    }

    res.json({
      success: true,
      data: keHoachList
    });

  } catch (error) {
    console.error('Lỗi khi lấy danh sách kế hoạch:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách kế hoạch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


app.use((err, req, res, next) => {
  logger.error('Request Error:', {
    method: req.method,
    path: req.path,
    error: {
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    }
  });

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// 9. Graceful Shutdown
function gracefulShutdown() {
  logger.info('Starting graceful shutdown...');
  
  // Đóng server HTTP trước
  server.close(async (err) => {
    if (err) {
      logger.error('HTTP server close error:', err);
      process.exit(1);
    }

    logger.info('HTTP server closed');
    
    // Đóng pool kết nối MySQL
    try {
      await pool.end();
      logger.info('MySQL pool closed');
      process.exit(0);
    } catch (dbErr) {
      logger.error('MySQL pool close error:', dbErr);
      process.exit(1);
    }
  });

  // Force shutdown sau 30s nếu chưa hoàn thành
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// 10. Xử lý tín hiệu shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    promise: promise,
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: reason.stack
    } : reason
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack
  });
  
  // Chỉ thoát nếu lỗi nghiêm trọng
  if (err.code === 'ECONNREFUSED' || err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});

// 11. Khởi động server
const server = app.listen(port, async () => {
  logger.info(`Server started on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Kiểm tra kết nối database khi khởi động
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    logger.warn('Server started without database connection');
  }
});

// 12. Export để sử dụng trong các module khác
module.exports = {
  app,
  pool,
  logger,
  createUploadMiddleware
};