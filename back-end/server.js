const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Kết nối với MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'mcp',
  password: '123456',
  database: 'dadb',
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
      const [duAnThanhPhan] = await db.query(
        'SELECT * FROM duan WHERE ParentID = ? ORDER BY DuAnID ASC',
        [duAnId]
      );
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
      }))
      const allGoiThau = await db.query(
        'SELECT * FROM goithau WHERE DuAn_ID IN (?)',
        [[duAnId, ...duAnThanhPhan.map(d => d.DuAnID)]]
      );
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
        soLuongGoiThau: allGoiThau.length,
        soLuongHangMuc: count,
        tienDoTrungBinh,
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
app.get('/duAnThanhPhan/:duAnId/detail', async (req, res) => {
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
        const [goiThauTP] = await db.query(
          `SELECT gt.* 
           FROM goithau gt
           WHERE gt.DuAn_ID = ?
           ORDER BY gt.GoiThau_ID ASC`,
          [duAnTP.DuAnID]
        );

        // Lấy thông tin chi tiết các hạng mục, kế hoạch và tiến độ thực hiện
        const goiThauWithDetails = await Promise.all(
          goiThauTP.map(async (goiThau) => {
            // Lấy các hạng mục của gói thầu
            const [hangMucList] = await db.query(
              `SELECT * FROM hangmuc 
               WHERE GoiThauID = ?
               ORDER BY HangMucID ASC`,
              [goiThau.GoiThau_ID]
            );

            // Lấy thông tin chi tiết từng hạng mục
            const hangMucWithDetails = await Promise.all(
              hangMucList.map(async (hangMuc) => {
                // Lấy kế hoạch của hạng mục
                const [keHoachList] = await db.query(
                  `SELECT * FROM quanlykehoach 
                   WHERE HangMucID = ?
                   ORDER BY KeHoachID ASC`,
                  [hangMuc.HangMucID]
                );

                // Lấy tiến độ thực hiện của từng kế hoạch
                const keHoachWithTienDo = await Promise.all(
                  keHoachList.map(async (keHoach) => {
                    const [tienDoList] = await db.query(
                      `SELECT * FROM tiendothuchien 
                       WHERE KeHoachID = ?
                       ORDER BY NgayCapNhat DESC`,
                      [keHoach.KeHoachID]
                    );

                    // Tính tổng khối lượng thực hiện
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

                // Tính tổng khối lượng kế hoạch và thực hiện của hạng mục
                const tongKhoiLuongKeHoach = keHoachWithTienDo.reduce((sum, item) => sum + item.KhoiLuongKeHoach, 0);
                const tongKhoiLuongThucHien = keHoachWithTienDo.reduce((sum, item) => sum + item.tongKhoiLuongThucHien, 0);

                return {
                  ...hangMuc,
                  keHoach: keHoachWithTienDo,
                  tongKhoiLuongKeHoach: tongKhoiLuongKeHoach,
                  tongKhoiLuongThucHien: tongKhoiLuongThucHien,
                  phanTramHoanThanh: tongKhoiLuongKeHoach > 0
                    ? (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100).toFixed(2)
                    : "0.00"
                };
              })
            );

            // Tính tổng khối lượng kế hoạch và thực hiện của gói thầu
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

        // Tính tổng khối lượng kế hoạch và thực hiện của dự án thành phần
        const tongKhoiLuongKeHoachTP = goiThauWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongKeHoach, 0);
        const tongKhoiLuongThucHienTP = goiThauWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongThucHien, 0);

        return {
          DuAnID: duAnTP.DuAnID,
          TenDuAn: duAnTP.TenDuAn,
          goiThau: goiThauWithDetails,
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoachTP,
          tongKhoiLuongThucHien: tongKhoiLuongThucHienTP,
          phanTramHoanThanh: tongKhoiLuongKeHoachTP > 0
            ? (tongKhoiLuongThucHienTP / tongKhoiLuongKeHoachTP * 100).toFixed(2)
            : "0.00"
        };
      })
    );

    // 4. Tính tổng khối lượng kế hoạch và thực hiện của toàn bộ dự án
    const tongKhoiLuongKeHoach = duAnThanhPhanWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongKeHoach, 0);
    const tongKhoiLuongThucHien = duAnThanhPhanWithDetails.reduce((sum, item) => sum + item.tongKhoiLuongThucHien, 0);

    res.json({
      success: true,
      data: {
        duAnTong: {
          DuAnID: duAnTong[0].DuAnID,
          TenDuAn: duAnTong[0].TenDuAn,
          tongKhoiLuongKeHoach: tongKhoiLuongKeHoach,
          tongKhoiLuongThucHien: tongKhoiLuongThucHien,
          phanTramHoanThanh: tongKhoiLuongKeHoach > 0
            ? (tongKhoiLuongThucHien / tongKhoiLuongKeHoach * 100).toFixed(2)
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
app.put('/kehoach/capnhat-tiendo/:tienDoId', async (req, res) => {
  try {
    const tienDoId = req.params.tienDoId;
    const { khoiLuongThucHien, moTaVuongMac, ghiChu } = req.body;
    const ngayCapNhat = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại

    // 1. Kiểm tra bản ghi tiến độ có tồn tại không
    const [tienDo] = await db.query(
      'SELECT * FROM tiendothuchien WHERE TienDoID = ?',
      [tienDoId]
    );

    if (tienDo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi tiến độ với ID này'
      });
    }

    // 2. Kiểm tra dữ liệu đầu vào
    if (khoiLuongThucHien && isNaN(khoiLuongThucHien)) {
      return res.status(400).json({
        success: false,
        message: 'Khối lượng thực hiện không hợp lệ'
      });
    }

    // 3. Chuẩn bị các trường cần cập nhật (LUÔN bao gồm NgayCapNhat)
    const updateFields = {
      NgayCapNhat: ngayCapNhat // Luôn cập nhật ngày
    };
    const updateValues = [ngayCapNhat];

    if (khoiLuongThucHien !== undefined) {
      updateFields.KhoiLuongThucHien = khoiLuongThucHien;
      updateValues.push(khoiLuongThucHien);
    }

    if (moTaVuongMac !== undefined) {
      updateFields.MoTaVuongMac = moTaVuongMac;
      updateValues.push(moTaVuongMac);
    }

    if (ghiChu !== undefined) {
      updateFields.GhiChu = ghiChu;
      updateValues.push(ghiChu);
    }

    // 4. Tạo câu lệnh SQL động (đã bao gồm NgayCapNhat)
    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    updateValues.push(tienDoId);

    await db.query(
      `UPDATE tiendothuchien SET ${setClause} WHERE TienDoID = ?`,
      updateValues
    );

    // 5. Lấy lại dữ liệu sau khi cập nhật
    const [updatedRecord] = await db.query(
      'SELECT * FROM tiendothuchien WHERE TienDoID = ?',
      [tienDoId]
    );

    res.json({
      success: true,
      message: 'Cập nhật tiến độ thành công',
      data: updatedRecord[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi cập nhật tiến độ',
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