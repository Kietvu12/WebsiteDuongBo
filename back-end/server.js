const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Kết nối với MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
<<<<<<< Updated upstream
  database: 'dadb',
=======
  database: 'da_db',
>>>>>>> Stashed changes
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

app.use(cors());
app.use(express.json());
app.get('/duAnTongList', async (req, res) => {
  try {
    const [duAnTongList] = await db.query(
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
      const [duAnThanhPhan] = await db.query(
        'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC', 
        [duAnId]
      );

      // Get all project IDs (main + sub-projects)
      const allProjectIds = [duAnId, ...duAnThanhPhan.map(d => d.DuAnID)];

      // 1. Count contracts for the main project (including sub-projects)
      const [goiThauCount] = await db.query(
        'SELECT COUNT(*) as count FROM goithau WHERE DuAn_ID IN (?)',
        [allProjectIds]
      );

      // 2. Get all contractors for the main project (including sub-projects)
      const [contractors] = await db.query(`
        SELECT DISTINCT n.* 
        FROM nhathau n
        JOIN goithau_nhathau gn ON n.NhaThauID = gn.NhaThauID
        JOIN goithau g ON gn.GoiThau_ID = g.GoiThau_ID
        WHERE g.DuAn_ID IN (?)
      `, [allProjectIds]);

      // 3. Tính toán khối lượng kế hoạch và thực hiện tổng thể (PHẦN BỔ SUNG)
      let tongKhoiLuongKeHoach = 0;
      let tongKhoiLuongThucHien = 0;
      let phanTramHoanThanhTong = 0;
      let phanTramChamTienDoTong = 0;

      const [allGoiThau] = await db.query(
        `SELECT GoiThau_ID FROM goithau WHERE DuAn_ID IN (?)`,
        [allProjectIds]
      );

      if (allGoiThau.length > 0) {
        const goiThauIds = allGoiThau.map(gt => gt.GoiThau_ID);
        
        // Tính tổng khối lượng kế hoạch
        const [tongKeHoach] = await db.query(
          `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
           FROM quanlykehoach kh
           JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
           WHERE hm.GoiThauID IN (?)`,
          [goiThauIds]
        );
        tongKhoiLuongKeHoach = tongKeHoach[0].tongKeHoach || 0;

        // Tính tổng khối lượng thực hiện
        const [tongThucHien] = await db.query(
          `SELECT SUM(td.KhoiLuongThucHien) as tongThucHien
           FROM tiendothuchien td
           JOIN quanlykehoach kh ON td.KeHoachID = kh.KeHoachID
           JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
           WHERE hm.GoiThauID IN (?)`,
          [goiThauIds]
        );
        tongKhoiLuongThucHien = tongThucHien[0].tongThucHien || 0;

        // Tính phần trăm hoàn thành và chậm tiến độ
        if (tongKhoiLuongKeHoach > 0) {
          phanTramHoanThanhTong = (tongKhoiLuongThucHien / tongKhoiLuongKeHoach) * 100;
          const phanTramKeHoach = 100; // Giả định kế hoạch là 100%
          phanTramChamTienDoTong = Math.max(phanTramKeHoach - phanTramHoanThanhTong, 0);
        }
      }

      const duAnThanhPhanWithDetails = await Promise.all(duAnThanhPhan.map(async (duAnTP) => {
        const [goiThauList] = await db.query(
          'SELECT * FROM goithau WHERE DuAn_ID = ? ORDER BY GoiThau_ID ASC',
          [duAnTP.DuAnID]
        );

        const goiThauWithDetails = await Promise.all(goiThauList.map(async (goiThau) => {
          const [hangMucList] = await db.query(
            'SELECT * FROM hangmuc WHERE GoiThauID = ? ORDER BY HangMucID ASC',
            [goiThau.GoiThau_ID]
          );

          const hangMucWithTienDo = await Promise.all(hangMucList.map(async (hangMuc) => {
            const [keHoachList] = await db.query(
              'SELECT * FROM quanlykehoach WHERE HangMucID = ? ORDER BY KeHoachID ASC',
              [hangMuc.HangMucID]
            );

            const keHoachWithTienDo = await Promise.all(keHoachList.map(async (keHoach) => {
              const [tienDo] = await db.query(
                `SELECT KhoiLuongThucHien, DonViTinh 
                 FROM tiendothuchien 
                 WHERE KeHoachID = ? 
                 ORDER BY NgayCapNhat DESC 
                 LIMIT 1`,
                [keHoach.KeHoachID]
              );

              const khoiLuongThucHien = tienDo.length > 0 ? tienDo[0].KhoiLuongThucHien : 0;
              const donViTinh = tienDo.length > 0 ? tienDo[0].DonViTinh : keHoach.DonViTinh;
              const phanTramHoanThanh = keHoach.KhoiLuongKeHoach > 0 
                ? (khoiLuongThucHien / keHoach.KhoiLuongKeHoach) * 100 
                : 0;

              return {
                keHoachId: keHoach.KeHoachID,
                tenCongTac: keHoach.TenCongTac,
                khoiLuongKeHoach: keHoach.KhoiLuongKeHoach,
                khoiLuongThucHien: khoiLuongThucHien,
                donViTinh: donViTinh,
                phanTramHoanThanh: phanTramHoanThanh.toFixed(2),
                ngayBatDau: keHoach.NgayBatDau,
                ngayKetThuc: keHoach.NgayKetThuc
              };
            }));

            const tienDoHangMuc = keHoachWithTienDo.reduce((acc, curr) => {
              return acc + parseFloat(curr.phanTramHoanThanh);
            }, 0) / keHoachWithTienDo.length || 0;

            return {
              ...hangMuc,
              tienDo: {
                phanTramHoanThanh: tienDoHangMuc.toFixed(2),
                chiTiet: keHoachWithTienDo
              }
            };
          }));

          return {
            ...goiThau,
            hangMuc: hangMucWithTienDo
          };
        }));

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
          coordinates,
          goiThau: goiThauWithDetails
        };
      }));

      // Calculate overall progress (GIỮ NGUYÊN CÁCH TÍNH CŨ)
      let totalProgress = 0;
      let count = 0;
      
      for (const duAnTP of duAnThanhPhanWithDetails) {
        for (const goiThau of duAnTP.goiThau) {
          for (const hangMuc of goiThau.hangMuc) {
            totalProgress += parseFloat(hangMuc.tienDo.phanTramHoanThanh);
            count++;
          }
        }
      }

      const tienDoTrungBinh = count > 0 ? (totalProgress / count).toFixed(2) : "0.00";

      return {
        ...duAnTong,
        soLuongDuAnThanhPhan: duAnThanhPhan.length,
        soLuongGoiThau: goiThauCount[0].count,
        danhSachNhaThau: contractors,
        soLuongHangMuc: count,
        tienDoTrungBinh,
        // BỔ SUNG THÊM CÁC TRƯỜNG MỚI
        tongKhoiLuongKeHoach,
        tongKhoiLuongThucHien,
        phanTramHoanThanh: phanTramHoanThanhTong.toFixed(2),
        phanTramChamTienDo: phanTramChamTienDoTong.toFixed(2),
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
app.get('/duAnTong', async (req, res) => {
  try {
    const [duAnTongList] = await db.query(
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
      const [duAnThanhPhan] = await db.query(
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
        const [goiThauList] = await db.query(
          'SELECT * FROM goithau WHERE DuAn_ID = ? ORDER BY GoiThau_ID ASC',
          [duAnTP.DuAnID]
        );

        // Cập nhật tổng số gói thầu
        soLuongGoiThau += goiThauList.length;

        // Process each contract package
        const goiThauWithDetails = await Promise.all(goiThauList.map(async (goiThau) => {
          // Get all work items for this contract package
          const [hangMucList] = await db.query(
            'SELECT * FROM hangmuc WHERE GoiThauID = ? ORDER BY HangMucID ASC',
            [goiThau.GoiThau_ID]
          );

          // Process each work item
          const hangMucWithDetails = await Promise.all(hangMucList.map(async (hangMuc) => {
            // Get all plans for this work item
            const [keHoachList] = await db.query(
              'SELECT * FROM quanlykehoach WHERE HangMucID = ? ORDER BY KeHoachID ASC',
              [hangMuc.HangMucID]
            );

            // Process each plan
            const keHoachWithDetails = await Promise.all(keHoachList.map(async (keHoach) => {
              // Get all progress records for this plan
              const [tienDoList] = await db.query(
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
        soLuongDuAnThanhPhan: duAnThanhPhan.length, // Thêm số lượng dự án thành phần
        soLuongGoiThau: soLuongGoiThau, // Thêm số lượng gói thầu
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
app.get('/duAnThanhPhan/:duAnId', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;
    const [duAnTong] = await db.query(
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
    const [duAnThanhPhan] = await db.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Tính toán khối lượng kế hoạch và thực hiện tổng thể
    let tongKhoiLuongKeHoach = 0;
    let tongKhoiLuongThucHien = 0;

    // Lấy tất cả gói thầu thuộc dự án tổng
    const [allGoiThau] = await db.query(
      `SELECT gt.GoiThau_ID 
       FROM goithau gt
       JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE d.DuAnID = ? OR d.ParentID = ?`,
      [duAnId, duAnId]
    );

    if (allGoiThau.length > 0) {
      const goiThauIds = allGoiThau.map(gt => gt.GoiThau_ID);
      
      // Tính tổng khối lượng kế hoạch của toàn bộ dự án tổng
      const [tongKeHoach] = await db.query(
        `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
         FROM quanlykehoach kh
         JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
         WHERE hm.GoiThauID IN (?)`,
        [goiThauIds]
      );
      tongKhoiLuongKeHoach = tongKeHoach[0].tongKeHoach || 0;

      // Tính tổng khối lượng thực hiện của toàn bộ dự án tổng
      const [tongThucHien] = await db.query(
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
        const [goiThauTP] = await db.query(
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
          const [keHoachTP] = await db.query(
            `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
             FROM quanlykehoach kh
             JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
             WHERE hm.GoiThauID IN (?)`,
            [goiThauIds]
          );
          khoiLuongKeHoachTP = keHoachTP[0].tongKeHoach || 0;

          // Tính tổng khối lượng thực hiện của dự án thành phần
          const [thucHienTP] = await db.query(
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
          const [hangMuc] = await db.query(
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
    const [duAn] = await db.query(
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
    const [goiThau] = await db.query(
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

    // 1. Lấy thông tin cơ bản của gói thầu
    const [goiThau] = await db.query(
      `SELECT gt.*, nt.*, d.TenDuAn, d.DuAnID, d.ChuDauTu
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE gt.GoiThau_ID = ?`,
      [goiThauId]
    );

    if (goiThau.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói thầu với ID này' });
    }

    // 2. Lấy danh sách nhà thầu liên quan
    const [nhaThauLienQuan] = await db.query(
      `SELECT nt.*, gtn.VaiTro
       FROM goithau_nhathau gtn
       JOIN nhathau nt ON gtn.NhaThauID = nt.NhaThauID
       WHERE gtn.GoiThau_ID = ? AND gtn.VaiTro = 'Nhà thầu chính'`,
      [goiThauId]
    );

    // 3. Lấy dữ liệu khối lượng thi công
    const [khoiLuongThiCong] = await db.query(
      `SELECT klt.*, nt.TenNhaThau
       FROM khoiluong_thicong klt
       JOIN nhathau nt ON klt.NhaThauID = nt.NhaThauID
       WHERE klt.GoiThau_ID = ?
       ORDER BY klt.KhoiLuong_ID DESC`,
      [goiThauId]
    );

    // 4. Tính tổng khối lượng kế hoạch của toàn bộ gói thầu
    const [tongKhoiLuongResult] = await db.query(
      `SELECT SUM(q.KhoiLuongKeHoach) AS TongKhoiLuong
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       WHERE hm.GoiThauID = ?`,
      [goiThauId]
    );
    
    const tongKhoiLuong = tongKhoiLuongResult[0].TongKhoiLuong || 1; // Tránh chia cho 0

    // 5. Tính tổng khối lượng kế hoạch theo từng nhà thầu
    const [khoiLuongTheoNhaThau] = await db.query(
      `SELECT 
        q.NhaThauID,
        nt.TenNhaThau,
        SUM(q.KhoiLuongKeHoach) AS TongKhoiLuongNhaThau
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       JOIN nhathau nt ON q.NhaThauID = nt.NhaThauID
       WHERE hm.GoiThauID = ?
       GROUP BY q.NhaThauID, nt.TenNhaThau`,
      [goiThauId]
    );

    // 6. Tính tổng khối lượng thực hiện theo từng nhà thầu
    const [khoiLuongThucHienTheoNhaThau] = await db.query(
      `SELECT 
        q.NhaThauID,
        SUM(COALESCE(t.KhoiLuongThucHien, 0)) AS TongKhoiLuongThucHien
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       LEFT JOIN tiendothuchien t ON q.KeHoachID = t.KeHoachID
       WHERE hm.GoiThauID = ?
       GROUP BY q.NhaThauID`,
      [goiThauId]
    );

    // 7. Tính toán phần trăm
    const calculatePercentage = (value, total) => {
      const percent = (value / total) * 100;
      return Math.min(Math.max(Math.round(percent), 0), 100); // Đảm bảo 0-100%
    };

    // Tính % kế hoạch (tổng KL kế hoạch của nhà thầu / tổng KL kế hoạch gói thầu)
    const phanTramKeHoach = calculatePercentage(
      khoiLuongTheoNhaThau.reduce((sum, item) => sum + item.TongKhoiLuongNhaThau, 0),
      tongKhoiLuong
    );

    // Tính % hoàn thành (tổng KL thực hiện / tổng KL kế hoạch)
    const tongKhoiLuongThucHien = khoiLuongThucHienTheoNhaThau.reduce((sum, item) => sum + item.TongKhoiLuongThucHien, 0);
    const phanTramHoanThanh = calculatePercentage(tongKhoiLuongThucHien, tongKhoiLuong);

    // % đang làm = 100% - % hoàn thành
    const phanTramDangLam = 100 - phanTramHoanThanh;

    const phanTram = {
      keHoach: phanTramKeHoach,
      dangLam: phanTramDangLam,
      hoanThanh: phanTramHoanThanh,
      tamDung: 0 // Mặc định 0% như yêu cầu
    };

    // 8. Lấy chi tiết tiến độ thi công
    const [tienDoThiCong] = await db.query(
      `SELECT 
        q.*, 
        hm.TenHangMuc,
        nt.TenNhaThau,
        COALESCE(SUM(t.KhoiLuongThucHien), 0) AS KhoiLuongThucHien,
        CASE 
          WHEN COALESCE(SUM(t.KhoiLuongThucHien), 0) >= q.KhoiLuongKeHoach THEN 'Đã hoàn thành'
          WHEN CURDATE() > q.NgayKetThuc THEN CONCAT('Quá hạn ', DATEDIFF(CURDATE(), q.NgayKetThuc), ' ngày')
          ELSE CONCAT('Còn ', DATEDIFF(q.NgayKetThuc, CURDATE()), ' ngày')
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

    // 9. Lấy thông tin vướng mắc
    const [vuongMac] = await db.query(
      `SELECT vm.*, q.TenCongTac, hm.TenHangMuc
       FROM vuongmac vm
       JOIN quanlykehoach q ON vm.KeHoachID = q.KeHoachID
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       WHERE hm.GoiThauID = ? AND vm.NgayKetThuc IS NULL
       ORDER BY vm.MucDo DESC, vm.NgayPhatSinh DESC`,
      [goiThauId]
    );

    // 10. Đánh giá rủi ro
    const overdueItems = tienDoThiCong.filter(item => item.TrangThai.includes('Quá hạn'));
    const criticalItems = tienDoThiCong.filter(item => item.TrangThai.includes('Còn') && item.NgayKetThuc <= new Date(new Date().setDate(new Date().getDate() + 1)));
    
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
          khoiLuongTheoNhaThau, // Thêm thông tin khối lượng theo nhà thầu
          khoiLuongThucHienTheoNhaThau // Thêm thông tin khối lượng thực hiện theo nhà thầu
        },
        vuongMac,
        tongQuan: {
          tongHangMuc: goiThau[0].SoHangMuc || 0,
          tongCongTac: tienDoThiCong.length,
          congTacHoanThanh: tienDoThiCong.filter(item => item.TrangThai === 'Đã hoàn thành').length,
          congTacQuaHan: overdueItems.length,
          tongKhoiLuongThiCong: khoiLuongThiCong.length,
          tongKhoiLuongKeHoach: tongKhoiLuong,
          tongKhoiLuongThucHien: tongKhoiLuongThucHien
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
app.get('/goiThauXayDung/chiTiet/:goiThauId', async (req, res) => {
  try {
    const goiThauId = req.params.goiThauId;

    // 1. Get basic contract package info
    const [goiThau] = await db.query(
      `SELECT gt.*, nt.*, d.TenDuAn, d.DuAnID, d.ChuDauTu
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE gt.GoiThau_ID = ?`,
      [goiThauId]
    );

    if (goiThau.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói thầu với ID này' });
    }

    // 2. Get related contractors
    const [nhaThauLienQuan] = await db.query(
      `SELECT nt.*, gtn.VaiTro
       FROM goithau_nhathau gtn
       JOIN nhathau nt ON gtn.NhaThauID = nt.NhaThauID
       WHERE gtn.GoiThau_ID = ? AND gtn.VaiTro = 'Nhà thầu chính'`,
      [goiThauId]
    );

    // 3. Get construction quantity data
    const [khoiLuongThiCong] = await db.query(
      `SELECT klt.*, nt.TenNhaThau
       FROM khoiluong_thicong klt
       JOIN nhathau nt ON klt.NhaThauID = nt.NhaThauID
       WHERE klt.GoiThau_ID = ?
       ORDER BY klt.KhoiLuong_ID DESC`,
      [goiThauId]
    );

    // 4. Get total planned quantity for the package
    const [tongKhoiLuongResult] = await db.query(
      `SELECT SUM(q.KhoiLuongKeHoach) AS TongKhoiLuong
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       WHERE hm.GoiThauID = ?`,
      [goiThauId]
    );
    
    const tongKhoiLuong = tongKhoiLuongResult[0].TongKhoiLuong || 0;

    // 5. Get planned quantity by contractor
    const [khoiLuongTheoNhaThau] = await db.query(
      `SELECT 
        q.NhaThauID,
        nt.TenNhaThau,
        SUM(q.KhoiLuongKeHoach) AS TongKhoiLuongNhaThau
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       JOIN nhathau nt ON q.NhaThauID = nt.NhaThauID
       WHERE hm.GoiThauID = ?
       GROUP BY q.NhaThauID, nt.TenNhaThau`,
      [goiThauId]
    );

    // 6. Get actual quantity by contractor
    const [khoiLuongThucHienTheoNhaThau] = await db.query(
      `SELECT 
        q.NhaThauID,
        SUM(COALESCE(t.KhoiLuongThucHien, 0)) AS TongKhoiLuongThucHien
       FROM quanlykehoach q
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       LEFT JOIN tiendothuchien t ON q.KeHoachID = t.KeHoachID
       WHERE hm.GoiThauID = ?
       GROUP BY q.NhaThauID`,
      [goiThauId]
    );

    // 7. Get construction progress details
    const [tienDoThiCong] = await db.query(
      `SELECT 
        q.*, 
        hm.TenHangMuc,
        nt.TenNhaThau,
        COALESCE(SUM(t.KhoiLuongThucHien), 0) AS KhoiLuongThucHien,
        CASE 
          WHEN COALESCE(SUM(t.KhoiLuongThucHien), 0) >= q.KhoiLuongKeHoach THEN 'Đã hoàn thành'
          WHEN CURDATE() > q.NgayKetThuc THEN CONCAT('Quá hạn ', DATEDIFF(CURDATE(), q.NgayKetThuc), ' ngày')
          ELSE CONCAT('Còn ', DATEDIFF(q.NgayKetThuc, CURDATE()), ' ngày')
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

    // 8. Get issues/obstacles
    const [vuongMac] = await db.query(
      `SELECT vm.*, q.TenCongTac, hm.TenHangMuc
       FROM vuongmac vm
       JOIN quanlykehoach q ON vm.KeHoachID = q.KeHoachID
       JOIN hangmuc hm ON q.HangMucID = hm.HangMucID
       WHERE hm.GoiThauID = ? AND vm.NgayKetThuc IS NULL
       ORDER BY vm.MucDo DESC, vm.NgayPhatSinh DESC`,
      [goiThauId]
    );

    // 9. Risk assessment
    const overdueItems = tienDoThiCong.filter(item => item.TrangThai.includes('Quá hạn'));
    const criticalItems = tienDoThiCong.filter(item => item.TrangThai.includes('Còn') && item.NgayKetThuc <= new Date(new Date().setDate(new Date().getDate() + 1)));
    
    let danhGiaRuiRo = 'Ổn định';
    let riskScore = overdueItems.length * 2 + criticalItems.length;
    if (riskScore > 5) danhGiaRuiRo = 'Rủi ro cao';
    else if (riskScore > 2) danhGiaRuiRo = 'Có rủi ro';

    // Calculate total actual quantity
    const tongKhoiLuongThucHien = khoiLuongThucHienTheoNhaThau.reduce((sum, item) => sum + item.TongKhoiLuongThucHien, 0);

    res.json({
      success: true,
      data: {
        thongTinChung: {
          ...goiThau[0],
          nhaThau: nhaThauLienQuan,
          danhGiaRuiRo,
          riskScore,
          khoiLuongThiCong
        },
        tienDo: {
          chiTiet: tienDoThiCong,
          danhGiaRuiRo,
          riskScore,
          khoiLuongTheoNhaThau,
          khoiLuongThucHienTheoNhaThau
        },
        vuongMac,
        tongQuan: {
          tongHangMuc: goiThau[0].SoHangMuc || 0,
          tongCongTac: tienDoThiCong.length,
          congTacHoanThanh: tienDoThiCong.filter(item => item.TrangThai === 'Đã hoàn thành').length,
          congTacQuaHan: overdueItems.length,
          tongKhoiLuongThiCong: khoiLuongThiCong.length,
          tongKhoiLuongKeHoach: tongKhoiLuong,
          tongKhoiLuongThucHien: tongKhoiLuongThucHien
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
    const [duAnThanhPhan] = await db.query(
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
    const [goiThauTP] = await db.query(
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
        const [hangMucList] = await db.query(
          `SELECT * FROM hangmuc 
           WHERE GoiThauID = ?
           ORDER BY HangMucID ASC`,
          [goiThau.GoiThau_ID]
        );

        // Get detailed information for each work item
        const hangMucWithDetails = await Promise.all(
          hangMucList.map(async (hangMuc) => {
            // Get plans of the work item
            const [keHoachList] = await db.query(
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
                const [tienDoList] = await db.query(
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

// Helper function to get contractor information
async function getNhaThauInfo(nhaThauId) {
  const [nhaThau] = await db.query(
    'SELECT * FROM nhathau WHERE NhaThauID = ?',
    [nhaThauId]
  );
  return nhaThau.length > 0 ? nhaThau[0] : null;
};
app.get('/duAn/:duAnId/detail', async (req, res) => {
  try {
    const duAnId = req.params.duAnId;

    // 1. Kiểm tra dự án tổng có tồn tại không
    const [duAnTong] = await db.query(
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
    const [duAnThanhPhan] = await db.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Lấy thông tin chi tiết cho từng dự án thành phần
    const duAnThanhPhanWithDetails = await Promise.all(
      duAnThanhPhan.map(async (duAnTP) => {
        // Lấy các gói thầu thuộc dự án thành phần này
        const [goiThauList] = await db.query(
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
            const [loaiHangMucList] = await db.query(
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
                const [hangMucList] = await db.query(
                  `SELECT * FROM hangmuc 
                   WHERE GoiThauID = ? AND LoaiHangMuc = ?
                   ORDER BY HangMucID ASC`,
                  [goiThau.GoiThau_ID, loaiHangMuc.LoaiHangMuc]
                );

                // Lấy thông tin kế hoạch và gộp luôn khối lượng thực thi
                const hangMucWithKeHoach = await Promise.all(
                  hangMucList.map(async (hangMuc) => {
                    // Lấy kế hoạch và thông tin thực thi
                    const [keHoachWithTienDo] = await db.query(
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
app.get('/hangMuc/:duAnThanhPhanId/detail', async (req, res) => {
  try {
    const duAnThanhPhanId = req.params.duAnThanhPhanId;

    // 1. Kiểm tra dự án thành phần có tồn tại không
    const [duAnThanhPhan] = await db.query(
      'SELECT * FROM duan WHERE DuAnID = ? AND ParentID IS NOT NULL',
      [duAnThanhPhanId]
    );

    if (duAnThanhPhan.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án THÀNH PHẦN với ID này'
      });
    }

    // 2. Lấy thông tin dự án tổng (cha của dự án thành phần)
    const [duAnTong] = await db.query(
      'SELECT * FROM duan WHERE DuAnID = ?',
      [duAnThanhPhan[0].ParentID]
    );

    // 3. Lấy các gói thầu thuộc dự án thành phần này
    const [goiThauList] = await db.query(
      `SELECT gt.*, nt.TenNhaThau, nt.MaSoThue 
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       WHERE gt.DuAn_ID = ?
       ORDER BY gt.GoiThau_ID ASC`,
      [duAnThanhPhanId]
    );

    // 4. Lấy thông tin chi tiết các gói thầu (đã bỏ cấp Loại Hạng Mục)
    const goiThauWithHangMuc = await Promise.all(
      goiThauList.map(async (goiThau) => {
        // Lấy tất cả hạng mục của gói thầu (không phân loại)
        const [hangMucList] = await db.query(
          `SELECT * FROM hangmuc 
           WHERE GoiThauID = ?
           ORDER BY HangMucID ASC`,
          [goiThau.GoiThau_ID]
        );

        // Lấy thông tin kế hoạch và khối lượng thực thi cho từng hạng mục
        const hangMucWithKeHoach = await Promise.all(
          hangMucList.map(async (hangMuc) => {
            const [keHoachWithTienDo] = await db.query(
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
              loaiHangMuc: hangMuc.LoaiHangMuc, // Vẫn giữ thông tin này nhưng không nhóm theo nó
              tieuDeChiTiet: hangMuc.TieuDeChiTiet,
              mayMocThietBi: hangMuc.MayMocThietBi,
              nhanLucThiCong: hangMuc.NhanLucThiCong,
              thoiGianHoanThanh: hangMuc.ThoiGianHoanThanh,
              ghiChu: hangMuc.GhiChu,
              danhSachKeHoach: formattedKeHoach,
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
          danhSachHangMuc: hangMucWithKeHoach, // Trực tiếp danh sách hạng mục, không qua loại hạng mục
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoachGoiThau,
          tongKhoiLuongThucHien: tongKhoiLuongThucHienGoiThau,
          phanTramHoanThanh: tongKhoiLuongKeHoachGoiThau > 0 
            ? Math.min(100, (tongKhoiLuongThucHienGoiThau / tongKhoiLuongKeHoachGoiThau * 100)).toFixed(2)
            : "0.00"
        };
      })
    );

    // 5. Tính tổng cho dự án thành phần
    const tongKhoiLuongKeHoach = goiThauWithHangMuc.reduce(
      (sum, gt) => sum + (gt.tongKhoiLuongKeHoach || 0), 0
    );
    const tongKhoiLuongThucHien = goiThauWithHangMuc.reduce(
      (sum, gt) => sum + (gt.tongKhoiLuongThucHien || 0), 0
    );

    res.json({
      success: true,
      data: {
        duAnTong: duAnTong.length > 0 ? {
          duAnId: duAnTong[0].DuAnID,
          tenDuAn: duAnTong[0].TenDuAn
        } : null,
        duAnThanhPhan: {
          duAnId: duAnThanhPhan[0].DuAnID,
          tenDuAn: duAnThanhPhan[0].TenDuAn,
          ngayBatDau: duAnThanhPhan[0].NgayBatDau,
          ngayKetThuc: duAnThanhPhan[0].NgayKetThuc,
          danhSachGoiThau: goiThauWithHangMuc,
          tongKhoiLuongKeHoach,
          tongKhoiLuongThucHien,
          phanTramHoanThanh: tongKhoiLuongKeHoach > 0 
            ? Math.min(100, (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100)).toFixed(2)
            : "0.00"
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
app.post('/kehoach/them-tiendo/:keHoachId', async (req, res) => {
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

    // 1. Kiểm tra kế hoạch có tồn tại không
    const [keHoach] = await db.query(
      'SELECT * FROM quanlykehoach WHERE KeHoachID = ?',
      [keHoachId]
    );

    if (keHoach.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy kế hoạch với ID này'
      });
    }

    // 2. Kiểm tra dữ liệu đầu vào
    if (!khoiLuongThucHien || isNaN(khoiLuongThucHien)) {
      return res.status(400).json({
        success: false,
        message: 'Khối lượng thực hiện không hợp lệ'
      });
    }

    // 3. Bắt đầu transaction
    await db.query('START TRANSACTION');

    // 4. Thêm bản ghi tiến độ mới
    const [tienDoResult] = await db.query(
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

    // 5. Nếu có vướng mắc thì thêm vào bảng vuongmac
    let vuongMacId = null;
    if (moTaVuongMac && loaiVuongMac) {
      const [vuongMacResult] = await db.query(
        `INSERT INTO vuongmac 
         (KeHoachID, LoaiVuongMac, MoTaChiTiet, NgayPhatSinh, MucDo)
         VALUES (?, ?, ?, ?, ?)`,
        [
          keHoachId,
          loaiVuongMac,
          moTaVuongMac,
          ngayCapNhat,
          'Nho' // Mặc định mức độ nhỏ
        ]
      );
      vuongMacId = vuongMacResult.insertId;
    }

    // 6. Commit transaction
    await db.query('COMMIT');

    // 7. Lấy lại thông tin đầy đủ
    const [tienDoMoi] = await db.query(
      'SELECT * FROM tiendothuchien WHERE TienDoID = ?',
      [tienDoResult.insertId]
    );

    res.json({
      success: true,
      message: 'Thêm tiến độ và vướng mắc thành công',
      data: {
        tienDo: tienDoMoi[0],
        vuongMac: vuongMacId ? { 
          VuongMacID: vuongMacId,
          LoaiVuongMac: loaiVuongMac,
          MoTaChiTiet: moTaVuongMac
        } : null
      }
    });

  } catch (error) {
    // Rollback nếu có lỗi
    await db.query('ROLLBACK');
    console.error('Database error:', error);
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
    const [results] = await db.query('SELECT * FROM nhathau ORDER BY TenNhaThau ASC');
    
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
      const [keHoach] = await db.query(`
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
      const [tienDoList] = await db.query(`
          SELECT * FROM tiendothuchien 
          WHERE KeHoachID = ?
          ORDER BY NgayCapNhat DESC
      `, [keHoachId]);

      // 3. Tính tổng khối lượng đã thực hiện
      const [tongKhoiLuong] = await db.query(`
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

    // 1. Kiểm tra dự án tổng có tồn tại không
    const [duAnTong] = await db.query(
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
    const [duAnThanhPhan] = await db.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Lấy thông tin chi tiết cho từng dự án thành phần
    const duAnThanhPhanWithDetails = await Promise.all(
      duAnThanhPhan.map(async (duAnTP) => {
        // Lấy các gói thầu thuộc dự án thành phần này
        const [goiThauList] = await db.query(
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
            const [loaiHangMucList] = await db.query(
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
                const [hangMucList] = await db.query(
                  `SELECT * FROM hangmuc 
                   WHERE GoiThauID = ? AND LoaiHangMuc = ?
                   ORDER BY HangMucID ASC`,
                  [goiThau.GoiThau_ID, loaiHangMuc.LoaiHangMuc]
                );

                // Lấy thông tin vướng mắc
                const hangMucWithVuongMac = await Promise.all(
                  hangMucList.map(async (hangMuc) => {
                    // Lấy danh sách vướng mắc và thông tin kế hoạch liên quan
                    const [vuongMacList] = await db.query(
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

                    // Đếm số vướng mắc theo trạng thái
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

                // Tính tổng cho loại hạng mục
                const tongVuongMacLoai = hangMucWithVuongMac.reduce(
                  (sum, hm) => sum + (hm.tongVuongMac || 0), 0
                );
                const tongDaPheDuyetLoai = hangMucWithVuongMac.reduce(
                  (sum, hm) => sum + (hm.soVuongMacDaPheDuyet || 0), 0
                );
                const tongChuaPheDuyetLoai = hangMucWithVuongMac.reduce(
                  (sum, hm) => sum + (hm.soVuongMacChuaPheDuyet || 0), 0
                );

                return {
                  loaiHangMuc: loaiHangMuc.LoaiHangMuc,
                  danhSachHangMuc: hangMucWithVuongMac,
                  tongVuongMac: tongVuongMacLoai,
                  tongDaPheDuyet: tongDaPheDuyetLoai,
                  tongChuaPheDuyet: tongChuaPheDuyetLoai
                };
              })
            );

            // Tính tổng cho gói thầu
            const tongVuongMacGoiThau = loaiHangMucWithDetails.reduce(
              (sum, loai) => sum + (loai.tongVuongMac || 0), 0
            );
            const tongDaPheDuyetGoiThau = loaiHangMucWithDetails.reduce(
              (sum, loai) => sum + (loai.tongDaPheDuyet || 0), 0
            );
            const tongChuaPheDuyetGoiThau = loaiHangMucWithDetails.reduce(
              (sum, loai) => sum + (loai.tongChuaPheDuyet || 0), 0
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
              tongVuongMac: tongVuongMacGoiThau,
              tongDaPheDuyet: tongDaPheDuyetGoiThau,
              tongChuaPheDuyet: tongChuaPheDuyetGoiThau
            };
          })
        );

        // Tính tổng cho dự án thành phần
        const tongVuongMacDuAn = goiThauWithCategories.reduce(
          (sum, gt) => sum + (gt.tongVuongMac || 0), 0
        );
        const tongDaPheDuyetDuAn = goiThauWithCategories.reduce(
          (sum, gt) => sum + (gt.tongDaPheDuyet || 0), 0
        );
        const tongChuaPheDuyetDuAn = goiThauWithCategories.reduce(
          (sum, gt) => sum + (gt.tongChuaPheDuyet || 0), 0
        );

        return {
          duAnId: duAnTP.DuAnID,
          tenDuAn: duAnTP.TenDuAn,
          ngayBatDau: duAnTP.NgayBatDau,
          ngayKetThuc: duAnTP.NgayKetThuc,
          danhSachGoiThau: goiThauWithCategories,
          tongVuongMac: tongVuongMacDuAn,
          tongDaPheDuyet: tongDaPheDuyetDuAn,
          tongChuaPheDuyet: tongChuaPheDuyetDuAn
        };
      })
    );

    // Tính tổng cho toàn bộ dự án tổng
    const tongVuongMacTong = duAnThanhPhanWithDetails.reduce(
      (sum, da) => sum + (da.tongVuongMac || 0), 0
    );
    const tongDaPheDuyetTong = duAnThanhPhanWithDetails.reduce(
      (sum, da) => sum + (da.tongDaPheDuyet || 0), 0
    );
    const tongChuaPheDuyetTong = duAnThanhPhanWithDetails.reduce(
      (sum, da) => sum + (da.tongChuaPheDuyet || 0), 0
    );

    res.json({
      success: true,
      data: {
        duAnTong: {
          duAnId: duAnTong[0].DuAnID,
          tenDuAn: duAnTong[0].TenDuAn,
          ngayBatDau: duAnTong[0].NgayBatDau,
          ngayKetThuc: duAnTong[0].NgayKetThuc,
          tongVuongMac: tongVuongMacTong,
          tongDaPheDuyet: tongDaPheDuyetTong,
          tongChuaPheDuyet: tongChuaPheDuyetTong
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
app.get('/hangMuc/:duAnThanhPhanId/vuongMac', async (req, res) => {
  try {
    const duAnThanhPhanId = req.params.duAnThanhPhanId;

    // 1. Check if the sub-project exists
    const [duAnThanhPhan] = await db.query(
      'SELECT * FROM duan WHERE DuAnID = ? AND ParentID IS NOT NULL',
      [duAnThanhPhanId]
    );

    if (duAnThanhPhan.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án THÀNH PHẦN với ID này'
      });
    }

    // 2. Get main project info
    const [duAnTong] = await db.query(
      'SELECT * FROM duan WHERE DuAnID = ?',
      [duAnThanhPhan[0].ParentID]
    );

    // 3. Get all packages for this sub-project
    const [goiThauList] = await db.query(
      `SELECT gt.*, nt.TenNhaThau, nt.MaSoThue 
       FROM goithau gt
       LEFT JOIN nhathau nt ON gt.NhaThauID = nt.NhaThauID
       WHERE gt.DuAn_ID = ?
       ORDER BY gt.GoiThau_ID ASC`,
      [duAnThanhPhanId]
    );

    // 4. Get detailed package info (simplified structure)
    const goiThauWithHangMuc = await Promise.all(
      goiThauList.map(async (goiThau) => {
        // Get all items for this package (without category grouping)
        const [hangMucList] = await db.query(
          `SELECT * FROM hangmuc 
           WHERE GoiThauID = ?
           ORDER BY HangMucID ASC`,
          [goiThau.GoiThau_ID]
        );

        // Get obstacle details for each item
        const hangMucWithVuongMac = await Promise.all(
          hangMucList.map(async (hangMuc) => {
            const [vuongMacList] = await db.query(
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

            // Format obstacle data
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

            // Count obstacles by status
            const tongVuongMac = formattedVuongMac.length;
            const soVuongMacDaPheDuyet = formattedVuongMac.filter(
              vm => vm.trangThai === 'Đã phê duyệt'
            ).length;
            const soVuongMacChuaPheDuyet = tongVuongMac - soVuongMacDaPheDuyet;

            return {
              hangMucId: hangMuc.HangMucID,
              tenHangMuc: hangMuc.TenHangMuc,
              loaiHangMuc: hangMuc.LoaiHangMuc, // Still keep this field but don't group by it
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

        // Calculate totals for the package
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
          danhSachHangMuc: hangMucWithVuongMac, // Direct list of items, no category grouping
          tongVuongMac: tongVuongMacGoiThau,
          tongDaPheDuyet: tongDaPheDuyetGoiThau,
          tongChuaPheDuyet: tongChuaPheDuyetGoiThau
        };
      })
    );

    // 5. Calculate totals for the sub-project
    const tongVuongMac = goiThauWithHangMuc.reduce(
      (sum, gt) => sum + (gt.tongVuongMac || 0), 0
    );
    const tongDaPheDuyet = goiThauWithHangMuc.reduce(
      (sum, gt) => sum + (gt.tongDaPheDuyet || 0), 0
    );
    const tongChuaPheDuyet = goiThauWithHangMuc.reduce(
      (sum, gt) => sum + (gt.tongChuaPheDuyet || 0), 0
    );

    res.json({
      success: true,
      data: {
        duAnTong: duAnTong.length > 0 ? {
          duAnId: duAnTong[0].DuAnID,
          tenDuAn: duAnTong[0].TenDuAn
        } : null,
        duAnThanhPhan: {
          duAnId: duAnThanhPhan[0].DuAnID,
          tenDuAn: duAnThanhPhan[0].TenDuAn,
          ngayBatDau: duAnThanhPhan[0].NgayBatDau,
          ngayKetThuc: duAnThanhPhan[0].NgayKetThuc,
          danhSachGoiThau: goiThauWithHangMuc,
          tongVuongMac,
          tongDaPheDuyet,
          tongChuaPheDuyet
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
app.get('/duAntp/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Truy vấn chi tiết dự án thành phần (có ParentID không null)
    const [rows] = await db.query(
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
    const [duAnTong] = await db.query(
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
    const [duAnThanhPhan] = await db.query(
      'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
      [duAnId]
    );

    // 3. Tính toán khối lượng kế hoạch và thực hiện tổng thể
    let tongKhoiLuongKeHoach = 0;
    let tongKhoiLuongThucHien = 0;

    // Lấy tất cả gói thầu thuộc dự án tổng
    const [allGoiThau] = await db.query(
      `SELECT gt.GoiThau_ID 
       FROM goithau gt
       JOIN duan d ON gt.DuAn_ID = d.DuAnID
       WHERE d.DuAnID = ? OR d.ParentID = ?`,
      [duAnId, duAnId]
    );

    if (allGoiThau.length > 0) {
      const goiThauIds = allGoiThau.map(gt => gt.GoiThau_ID);

      // Tính tổng khối lượng kế hoạch của toàn bộ dự án tổng
      const [tongKeHoach] = await db.query(
        `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
         FROM quanlykehoach kh
         JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
         WHERE hm.GoiThauID IN (?)`,
        [goiThauIds]
      );
      tongKhoiLuongKeHoach = tongKeHoach[0].tongKeHoach || 0;

      // Tính tổng khối lượng thực hiện của toàn bộ dự án tổng
      const [tongThucHien] = await db.query(
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
        const [goiThauTP] = await db.query(
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
          const [keHoachTP] = await db.query(
            `SELECT SUM(kh.KhoiLuongKeHoach) as tongKeHoach
             FROM quanlykehoach kh
             JOIN hangmuc hm ON kh.HangMucID = hm.HangMucID
             WHERE hm.GoiThauID IN (?)`,
            [goiThauIds]
          );
          khoiLuongKeHoachTP = keHoachTP[0].tongKeHoach || 0;

          // Tính tổng khối lượng thực hiện của dự án thành phần
          const [thucHienTP] = await db.query(
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
          const [hangMuc] = await db.query(
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
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống'
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy trên port ${port}`);
});