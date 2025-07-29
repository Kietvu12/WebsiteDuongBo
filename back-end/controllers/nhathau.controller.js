const { Op } = require('sequelize');
const models = require('../models');

// API 1: Lấy thông tin chi tiết nhà thầu với thống kê và chi tiết đầy đủ
const getNhaThauDetail = async (req, res) => {
  try {
    const { nhaThauId } = req.params;
    
    // Lấy thông tin cơ bản của nhà thầu
    const nhaThau = await models.nhathau.findByPk(nhaThauId);
    if (!nhaThau) {
      return res.status(404).json({ message: 'Không tìm thấy nhà thầu' });
    }

    // Lấy thông tin gói thầu tham gia với tất cả thông tin liên quan
    const goiThauInfo = await models.sequelize.query(`
      SELECT 
        gt.GoiThau_ID,
        gt.TenGoiThau,
        gt.GiaTriHĐ,
        gt.Km_BatDau,
        gt.Km_KetThuc,
        gt.ToaDo_BatDau_X,
        gt.ToaDo_BatDau_Y,
        gt.ToaDo_KetThuc_X,
        gt.ToaDo_KetThuc_Y,
        gt.NgayKhoiCong,
        gt.NgayHoanThanh,
        gt.TrangThai,
        gt.PhanTramHoanThanh,
        gt.PhanTramDangLam,
        gt.PhanTramChamTienDo,
        gt.PhanTramKeHoach,
        gt.ThoiGianCapNhatGanNhat,
        gt.PathData,
        d.DuAnID,
        d.TenDuAn,
        d.TinhThanh,
        d.ChuDauTu,
        d.NgayKhoiCong as NgayKhoiCongDuAn,
        d.TrangThai as TrangThaiDuAn,
        d.NguonVon,
        d.TongChieuDai,
        d.KeHoachHoanThanh,
        d.MoTaChung as MoTaDuAn,
        d.ParentID,
        d.PhanTramHoanThanh as PhanTramHoanThanhDuAn,
        d.PhanTramChamTienDo as PhanTramChamTienDoDuAn,
        d.PhanTramKeHoach as PhanTramKeHoachDuAn,
        d.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatDuAn,
        gtn.VaiTro,
        CASE 
          WHEN gt.NgayHoanThanh IS NOT NULL AND gt.PhanTramHoanThanh >= 100 THEN 'Hoàn thành'
          WHEN gt.NgayHoanThanh IS NOT NULL AND gt.PhanTramHoanThanh < 100 THEN 'Chậm tiến độ'
          WHEN gt.NgayHoanThanh IS NULL AND gt.PhanTramHoanThanh > 0 THEN 'Đang thực hiện'
          ELSE 'Chưa bắt đầu'
        END as TrangThaiTienDo,
        -- Thống kê hạng mục trong gói thầu
        (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID) as SoHangMuc,
        (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID AND hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh <= CURDATE()) as SoHangMucHoanThanh,
        (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID AND hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh > CURDATE()) as SoHangMucDangLam,
        (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID AND hm.ThoiGianHoanThanh IS NULL) as SoHangMucChuaBatDau,
        -- Thống kê kế hoạch trong gói thầu
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
         WHERE hm.GoiThauID = gt.GoiThau_ID) as SoKeHoach,
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
         WHERE hm.GoiThauID = gt.GoiThau_ID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
               (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) >= qkh.KhoiLuongKeHoach) as SoKeHoachHoanThanh,
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
         WHERE hm.GoiThauID = gt.GoiThau_ID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
               (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) > 0) as SoKeHoachDangLam,
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
         WHERE hm.GoiThauID = gt.GoiThau_ID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
               (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) < qkh.KhoiLuongKeHoach) as SoKeHoachChamTienDo
      FROM goithau gt
      LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
      LEFT JOIN goithau_nhathau gtn ON gt.GoiThau_ID = gtn.GoiThau_ID
      WHERE gtn.NhaThauID = :nhaThauId
      ORDER BY gt.ThoiGianCapNhatGanNhat DESC
    `, {
      replacements: { nhaThauId },
      type: models.sequelize.QueryTypes.SELECT
    });

    // Lấy thông tin hạng mục thi công với tất cả thông tin liên quan
    const hangMucInfo = await models.sequelize.query(`
      SELECT 
        hm.HangMucID,
        hm.TenHangMuc,
        hm.LoaiHangMuc,
        hm.TieuDeChiTiet,
        hm.MayMocThietBi,
        hm.NhanLucThiCong,
        hm.ThoiGianHoanThanh,
        hm.GhiChu,
        gt.GoiThau_ID,
        gt.TenGoiThau,
        gt.GiaTriHĐ,
        gt.Km_BatDau,
        gt.Km_KetThuc,
        gt.ToaDo_BatDau_X,
        gt.ToaDo_BatDau_Y,
        gt.ToaDo_KetThuc_X,
        gt.ToaDo_KetThuc_Y,
        gt.NgayKhoiCong,
        gt.NgayHoanThanh,
        gt.TrangThai as TrangThaiGoiThau,
        gt.PhanTramHoanThanh as PhanTramHoanThanhGoiThau,
        gt.PhanTramDangLam as PhanTramDangLamGoiThau,
        gt.PhanTramChamTienDo as PhanTramChamTienDoGoiThau,
        gt.PhanTramKeHoach as PhanTramKeHoachGoiThau,
        gt.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatGoiThau,
        gt.PathData,
        d.DuAnID,
        d.TenDuAn,
        d.TinhThanh,
        d.ChuDauTu,
        d.NgayKhoiCong as NgayKhoiCongDuAn,
        d.TrangThai as TrangThaiDuAn,
        d.NguonVon,
        d.TongChieuDai,
        d.KeHoachHoanThanh,
        d.MoTaChung as MoTaDuAn,
        d.ParentID,
        d.PhanTramHoanThanh as PhanTramHoanThanhDuAn,
        d.PhanTramChamTienDo as PhanTramChamTienDoDuAn,
        d.PhanTramKeHoach as PhanTramKeHoachDuAn,
        d.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatDuAn,
        CASE 
          WHEN hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh <= CURDATE() THEN 'Hoàn thành'
          WHEN hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh > CURDATE() THEN 'Đang thực hiện'
          ELSE 'Chưa bắt đầu'
        END as TrangThaiHangMuc,
        -- Thống kê kế hoạch trong hạng mục
        (SELECT COUNT(*) FROM quanlykehoach qkh WHERE qkh.HangMucID = hm.HangMucID) as SoKeHoach,
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         WHERE qkh.HangMucID = hm.HangMucID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
               (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) >= qkh.KhoiLuongKeHoach) as SoKeHoachHoanThanh,
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         WHERE qkh.HangMucID = hm.HangMucID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
               (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) > 0) as SoKeHoachDangLam,
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         WHERE qkh.HangMucID = hm.HangMucID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
               (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) < qkh.KhoiLuongKeHoach) as SoKeHoachChamTienDo,
        -- Thống kê tiến độ thực hiện
        (SELECT COUNT(*) FROM quanlykehoach qkh 
         INNER JOIN tiendothuchien tdth ON qkh.KeHoachID = tdth.KeHoachID 
         WHERE qkh.HangMucID = hm.HangMucID) as SoLanCapNhatTienDo,
        (SELECT MAX(tdth.NgayCapNhat) FROM quanlykehoach qkh 
         INNER JOIN tiendothuchien tdth ON qkh.KeHoachID = tdth.KeHoachID 
         WHERE qkh.HangMucID = hm.HangMucID) as NgayCapNhatGanNhatTienDo
      FROM hangmuc hm
      LEFT JOIN goithau gt ON hm.GoiThauID = gt.GoiThau_ID
      LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
      LEFT JOIN goithau_nhathau gtn ON gt.GoiThau_ID = gtn.GoiThau_ID
      WHERE gtn.NhaThauID = :nhaThauId
      ORDER BY hm.ThoiGianHoanThanh ASC
    `, {
      replacements: { nhaThauId },
      type: models.sequelize.QueryTypes.SELECT
    });

    // Lấy thông tin kế hoạch và tiến độ thực hiện với tất cả thông tin liên quan
    const keHoachInfo = await models.sequelize.query(`
      SELECT 
        qkh.KeHoachID,
        qkh.TenCongTac,
        qkh.KhoiLuongKeHoach,
        qkh.DonViTinh,
        qkh.NgayBatDau,
        qkh.NgayKetThuc,
        qkh.GhiChu,
        hm.HangMucID,
        hm.TenHangMuc,
        hm.LoaiHangMuc,
        hm.TieuDeChiTiet,
        hm.MayMocThietBi,
        hm.NhanLucThiCong,
        hm.ThoiGianHoanThanh,
        hm.GhiChu as GhiChuHangMuc,
        gt.GoiThau_ID,
        gt.TenGoiThau,
        gt.GiaTriHĐ,
        gt.Km_BatDau,
        gt.Km_KetThuc,
        gt.ToaDo_BatDau_X,
        gt.ToaDo_BatDau_Y,
        gt.ToaDo_KetThuc_X,
        gt.ToaDo_KetThuc_Y,
        gt.NgayKhoiCong,
        gt.NgayHoanThanh,
        gt.TrangThai as TrangThaiGoiThau,
        gt.PhanTramHoanThanh as PhanTramHoanThanhGoiThau,
        gt.PhanTramDangLam as PhanTramDangLamGoiThau,
        gt.PhanTramChamTienDo as PhanTramChamTienDoGoiThau,
        gt.PhanTramKeHoach as PhanTramKeHoachGoiThau,
        gt.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatGoiThau,
        gt.PathData,
        d.DuAnID,
        d.TenDuAn,
        d.TinhThanh,
        d.ChuDauTu,
        d.NgayKhoiCong as NgayKhoiCongDuAn,
        d.TrangThai as TrangThaiDuAn,
        d.NguonVon,
        d.TongChieuDai,
        d.KeHoachHoanThanh,
        d.MoTaChung as MoTaDuAn,
        d.ParentID,
        d.PhanTramHoanThanh as PhanTramHoanThanhDuAn,
        d.PhanTramChamTienDo as PhanTramChamTienDoDuAn,
        d.PhanTramKeHoach as PhanTramKeHoachDuAn,
        d.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatDuAn,
        COALESCE(SUM(tdth.KhoiLuongThucHien), 0) as KhoiLuongThucHien,
        COUNT(tdth.TienDoID) as SoLanCapNhatTienDo,
        MAX(tdth.NgayCapNhat) as NgayCapNhatGanNhat,
        MIN(tdth.NgayCapNhat) as NgayCapNhatDauTien,
        AVG(tdth.KhoiLuongThucHien) as KhoiLuongTrungBinhMoiLan,
        CASE 
          WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
               COALESCE(SUM(tdth.KhoiLuongThucHien), 0) < qkh.KhoiLuongKeHoach THEN 'Chậm tiến độ'
          WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
               COALESCE(SUM(tdth.KhoiLuongThucHien), 0) > 0 THEN 'Đang thực hiện'
          WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
               COALESCE(SUM(tdth.KhoiLuongThucHien), 0) >= qkh.KhoiLuongKeHoach THEN 'Hoàn thành'
          ELSE 'Chưa bắt đầu'
        END as TrangThaiKeHoach,
        ROUND((COALESCE(SUM(tdth.KhoiLuongThucHien), 0) / qkh.KhoiLuongKeHoach) * 100, 2) as PhanTramHoanThanh,
        -- Thống kê chi tiết tiến độ
        (SELECT COUNT(*) FROM tiendothuchien tdth2 WHERE tdth2.KeHoachID = qkh.KeHoachID AND tdth2.KhoiLuongThucHien > 0) as SoLanCapNhatCoKhoiLuong,
        (SELECT COUNT(*) FROM tiendothuchien tdth2 WHERE tdth2.KeHoachID = qkh.KeHoachID AND tdth2.MoTaVuongMac IS NOT NULL AND tdth2.MoTaVuongMac != '') as SoLanCoVuongMac,
        (SELECT GROUP_CONCAT(DISTINCT tdth2.MoTaVuongMac SEPARATOR '; ') 
         FROM tiendothuchien tdth2 
         WHERE tdth2.KeHoachID = qkh.KeHoachID AND tdth2.MoTaVuongMac IS NOT NULL AND tdth2.MoTaVuongMac != '') as DanhSachVuongMac
      FROM quanlykehoach qkh
      LEFT JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID
      LEFT JOIN goithau gt ON hm.GoiThauID = gt.GoiThau_ID
      LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
      LEFT JOIN tiendothuchien tdth ON qkh.KeHoachID = tdth.KeHoachID
      WHERE qkh.NhaThauID = :nhaThauId
      GROUP BY qkh.KeHoachID, qkh.TenCongTac, qkh.KhoiLuongKeHoach, qkh.DonViTinh, 
               qkh.NgayBatDau, qkh.NgayKetThuc, qkh.GhiChu, hm.HangMucID, hm.TenHangMuc, 
               hm.LoaiHangMuc, hm.TieuDeChiTiet, hm.MayMocThietBi, hm.NhanLucThiCong, 
               hm.ThoiGianHoanThanh, hm.GhiChu, gt.GoiThau_ID, gt.TenGoiThau, 
               gt.GiaTriHĐ, gt.Km_BatDau, gt.Km_KetThuc, gt.ToaDo_BatDau_X, gt.ToaDo_BatDau_Y,
               gt.ToaDo_KetThuc_X, gt.ToaDo_KetThuc_Y, gt.NgayKhoiCong, gt.NgayHoanThanh, 
               gt.TrangThai, gt.PhanTramHoanThanh, gt.PhanTramDangLam, gt.PhanTramChamTienDo,
               gt.PhanTramKeHoach, gt.ThoiGianCapNhatGanNhat, gt.PathData, d.DuAnID, 
               d.TenDuAn, d.TinhThanh, d.ChuDauTu, d.NgayKhoiCong, d.TrangThai, d.NguonVon,
               d.TongChieuDai, d.KeHoachHoanThanh, d.MoTaChung, d.ParentID, 
               d.PhanTramHoanThanh, d.PhanTramChamTienDo, d.PhanTramKeHoach, d.ThoiGianCapNhatGanNhat
      ORDER BY qkh.NgayKetThuc ASC
    `, {
      replacements: { nhaThauId },
      type: models.sequelize.QueryTypes.SELECT
    });

    // Thống kê chi tiết theo trạng thái và vai trò
    const thongKe = {
      // Thống kê gói thầu
      goiThau: {
        tongSo: goiThauInfo.length,
        theoVaiTro: {
          chinh: goiThauInfo.filter(gt => gt.VaiTro === 'Nhà thầu chính').length,
          phu: goiThauInfo.filter(gt => gt.VaiTro === 'Nhà thầu phụ').length,
          lienDanh: goiThauInfo.filter(gt => gt.VaiTro === 'Liên danh').length
        },
        theoTrangThai: {
          hoanThanh: goiThauInfo.filter(gt => gt.TrangThaiTienDo === 'Hoàn thành').length,
          dangLam: goiThauInfo.filter(gt => gt.TrangThaiTienDo === 'Đang thực hiện').length,
          chamTienDo: goiThauInfo.filter(gt => gt.TrangThaiTienDo === 'Chậm tiến độ').length,
          chuaBatDau: goiThauInfo.filter(gt => gt.TrangThaiTienDo === 'Chưa bắt đầu').length
        }
      },
      // Thống kê hạng mục
      hangMuc: {
        tongSo: hangMucInfo.length,
        theoTrangThai: {
          hoanThanh: hangMucInfo.filter(hm => hm.TrangThaiHangMuc === 'Hoàn thành').length,
          dangLam: hangMucInfo.filter(hm => hm.TrangThaiHangMuc === 'Đang thực hiện').length,
          chuaBatDau: hangMucInfo.filter(hm => hm.TrangThaiHangMuc === 'Chưa bắt đầu').length
        }
      },
      // Thống kê kế hoạch
      keHoach: {
        tongSo: keHoachInfo.length,
        theoTrangThai: {
          hoanThanh: keHoachInfo.filter(kh => kh.TrangThaiKeHoach === 'Hoàn thành').length,
          dangLam: keHoachInfo.filter(kh => kh.TrangThaiKeHoach === 'Đang thực hiện').length,
          chamTienDo: keHoachInfo.filter(kh => kh.TrangThaiKeHoach === 'Chậm tiến độ').length,
          chuaBatDau: keHoachInfo.filter(kh => kh.TrangThaiKeHoach === 'Chưa bắt đầu').length
        }
      }
    };

    const result = {
      thongTinNhaThau: nhaThau,
      thongKe: thongKe,
      chiTiet: {
        goiThau: goiThauInfo,
        hangMuc: hangMucInfo,
        keHoach: keHoachInfo
      }
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhà thầu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin nhà thầu',
      error: error.message
    });
  }
};

// API 2: Lấy danh sách nhà thầu với thống kê và chi tiết đầy đủ
const getDanhSachNhaThau = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', loai = '', tinh = '', includeDetails = 'false' } = req.query;
    const offset = (page - 1) * limit;
    const shouldIncludeDetails = includeDetails === 'true';

    // Xây dựng điều kiện tìm kiếm
    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { TenNhaThau: { [Op.like]: `%${search}%` } },
        { MaSoThue: { [Op.like]: `%${search}%` } },
        { NguoiDaiDien: { [Op.like]: `%${search}%` } }
      ];
    }
    if (loai) {
      whereCondition.Loai = loai;
    }

    // Lấy danh sách nhà thầu với thống kê cơ bản
    const danhSachNhaThau = await models.sequelize.query(`
      SELECT 
        nt.*,
        COUNT(DISTINCT gtn.GoiThau_ID) as TongGoiThau,
        COUNT(DISTINCT CASE WHEN gtn.VaiTro = 'Nhà thầu chính' THEN gtn.GoiThau_ID END) as GoiThauChinh,
        COUNT(DISTINCT CASE WHEN gtn.VaiTro = 'Nhà thầu phụ' THEN gtn.GoiThau_ID END) as GoiThauPhu,
        COUNT(DISTINCT CASE WHEN gtn.VaiTro = 'Liên danh' THEN gtn.GoiThau_ID END) as GoiThauLienDanh,
        COUNT(DISTINCT hm.HangMucID) as TongHangMuc,
        COUNT(DISTINCT qkh.KeHoachID) as TongKeHoach,
        COUNT(DISTINCT CASE WHEN gt.NgayHoanThanh IS NOT NULL AND gt.PhanTramHoanThanh >= 100 THEN gt.GoiThau_ID END) as GoiThauHoanThanh,
        COUNT(DISTINCT CASE WHEN gt.NgayHoanThanh IS NULL AND gt.PhanTramHoanThanh > 0 THEN gt.GoiThau_ID END) as GoiThauDangLam,
        COUNT(DISTINCT CASE WHEN gt.NgayHoanThanh IS NOT NULL AND gt.PhanTramHoanThanh < 100 THEN gt.GoiThau_ID END) as GoiThauChamTienDo,
        COUNT(DISTINCT CASE WHEN gt.NgayHoanThanh IS NULL AND gt.PhanTramHoanThanh = 0 THEN gt.GoiThau_ID END) as GoiThauChuaBatDau,
        COUNT(DISTINCT CASE WHEN hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh <= CURDATE() THEN hm.HangMucID END) as HangMucHoanThanh,
        COUNT(DISTINCT CASE WHEN hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh > CURDATE() THEN hm.HangMucID END) as HangMucDangLam,
        COUNT(DISTINCT CASE WHEN hm.ThoiGianHoanThanh IS NULL THEN hm.HangMucID END) as HangMucChuaBatDau,
        COUNT(DISTINCT CASE WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
             (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) >= qkh.KhoiLuongKeHoach THEN qkh.KeHoachID END) as KeHoachHoanThanh,
        COUNT(DISTINCT CASE WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
             (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) > 0 THEN qkh.KeHoachID END) as KeHoachDangLam,
        COUNT(DISTINCT CASE WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
             (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) < qkh.KhoiLuongKeHoach THEN qkh.KeHoachID END) as KeHoachChamTienDo
      FROM nhathau nt
      LEFT JOIN goithau_nhathau gtn ON nt.NhaThauID = gtn.NhaThauID
      LEFT JOIN goithau gt ON gtn.GoiThau_ID = gt.GoiThau_ID
      LEFT JOIN hangmuc hm ON gt.GoiThau_ID = hm.GoiThauID
      LEFT JOIN quanlykehoach qkh ON nt.NhaThauID = qkh.NhaThauID
      WHERE 1=1
        ${search ? "AND (nt.TenNhaThau LIKE :search OR nt.MaSoThue LIKE :search OR nt.NguoiDaiDien LIKE :search)" : ""}
        ${loai ? "AND nt.Loai = :loai" : ""}
      GROUP BY nt.NhaThauID
      ORDER BY nt.TenNhaThau
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { 
        search: search ? `%${search}%` : null,
        loai: loai || null,
        limit: parseInt(limit),
        offset: parseInt(offset)
      },
      type: models.sequelize.QueryTypes.SELECT
    });

    // Đếm tổng số nhà thầu
    const totalCount = await models.sequelize.query(`
      SELECT COUNT(DISTINCT nt.NhaThauID) as total
      FROM nhathau nt
      WHERE 1=1
        ${search ? "AND (nt.TenNhaThau LIKE :search OR nt.MaSoThue LIKE :search OR nt.NguoiDaiDien LIKE :search)" : ""}
        ${loai ? "AND nt.Loai = :loai" : ""}
    `, {
      replacements: { 
        search: search ? `%${search}%` : null,
        loai: loai || null
      },
      type: models.sequelize.QueryTypes.SELECT
    });

    let chiTietNhaThau = [];
    
    // Nếu yêu cầu chi tiết, lấy thông tin chi tiết cho từng nhà thầu
    if (shouldIncludeDetails) {
      for (const nhaThau of danhSachNhaThau) {
        // Lấy thông tin gói thầu chi tiết với tất cả thông tin liên quan
        const goiThauInfo = await models.sequelize.query(`
          SELECT 
            gt.GoiThau_ID,
            gt.TenGoiThau,
            gt.GiaTriHĐ,
            gt.Km_BatDau,
            gt.Km_KetThuc,
            gt.ToaDo_BatDau_X,
            gt.ToaDo_BatDau_Y,
            gt.ToaDo_KetThuc_X,
            gt.ToaDo_KetThuc_Y,
            gt.NgayKhoiCong,
            gt.NgayHoanThanh,
            gt.TrangThai,
            gt.PhanTramHoanThanh,
            gt.PhanTramDangLam,
            gt.PhanTramChamTienDo,
            gt.PhanTramKeHoach,
            gt.ThoiGianCapNhatGanNhat,
            gt.PathData,
            d.DuAnID,
            d.TenDuAn,
            d.TinhThanh,
            d.ChuDauTu,
            d.NgayKhoiCong as NgayKhoiCongDuAn,
            d.TrangThai as TrangThaiDuAn,
            d.NguonVon,
            d.TongChieuDai,
            d.KeHoachHoanThanh,
            d.MoTaChung as MoTaDuAn,
            d.ParentID,
            d.PhanTramHoanThanh as PhanTramHoanThanhDuAn,
            d.PhanTramChamTienDo as PhanTramChamTienDoDuAn,
            d.PhanTramKeHoach as PhanTramKeHoachDuAn,
            d.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatDuAn,
            gtn.VaiTro,
            CASE 
              WHEN gt.NgayHoanThanh IS NOT NULL AND gt.PhanTramHoanThanh >= 100 THEN 'Hoàn thành'
              WHEN gt.NgayHoanThanh IS NOT NULL AND gt.PhanTramHoanThanh < 100 THEN 'Chậm tiến độ'
              WHEN gt.NgayHoanThanh IS NULL AND gt.PhanTramHoanThanh > 0 THEN 'Đang thực hiện'
              ELSE 'Chưa bắt đầu'
            END as TrangThaiTienDo,
            -- Thống kê hạng mục trong gói thầu
            (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID) as SoHangMuc,
            (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID AND hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh <= CURDATE()) as SoHangMucHoanThanh,
            (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID AND hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh > CURDATE()) as SoHangMucDangLam,
            (SELECT COUNT(*) FROM hangmuc hm WHERE hm.GoiThauID = gt.GoiThau_ID AND hm.ThoiGianHoanThanh IS NULL) as SoHangMucChuaBatDau,
            -- Thống kê kế hoạch trong gói thầu
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
             WHERE hm.GoiThauID = gt.GoiThau_ID) as SoKeHoach,
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
             WHERE hm.GoiThauID = gt.GoiThau_ID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
                   (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) >= qkh.KhoiLuongKeHoach) as SoKeHoachHoanThanh,
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
             WHERE hm.GoiThauID = gt.GoiThau_ID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
                   (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) > 0) as SoKeHoachDangLam,
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             INNER JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID 
             WHERE hm.GoiThauID = gt.GoiThau_ID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
                   (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) < qkh.KhoiLuongKeHoach) as SoKeHoachChamTienDo
          FROM goithau gt
          LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
          LEFT JOIN goithau_nhathau gtn ON gt.GoiThau_ID = gtn.GoiThau_ID
          WHERE gtn.NhaThauID = :nhaThauId
          ORDER BY gt.ThoiGianCapNhatGanNhat DESC
        `, {
          replacements: { nhaThauId: nhaThau.NhaThauID },
          type: models.sequelize.QueryTypes.SELECT
        });

        // Lấy thông tin hạng mục chi tiết với tất cả thông tin liên quan
        const hangMucInfo = await models.sequelize.query(`
          SELECT 
            hm.HangMucID,
            hm.TenHangMuc,
            hm.LoaiHangMuc,
            hm.TieuDeChiTiet,
            hm.MayMocThietBi,
            hm.NhanLucThiCong,
            hm.ThoiGianHoanThanh,
            hm.GhiChu,
            gt.GoiThau_ID,
            gt.TenGoiThau,
            gt.GiaTriHĐ,
            gt.Km_BatDau,
            gt.Km_KetThuc,
            gt.ToaDo_BatDau_X,
            gt.ToaDo_BatDau_Y,
            gt.ToaDo_KetThuc_X,
            gt.ToaDo_KetThuc_Y,
            gt.NgayKhoiCong,
            gt.NgayHoanThanh,
            gt.TrangThai as TrangThaiGoiThau,
            gt.PhanTramHoanThanh as PhanTramHoanThanhGoiThau,
            gt.PhanTramDangLam as PhanTramDangLamGoiThau,
            gt.PhanTramChamTienDo as PhanTramChamTienDoGoiThau,
            gt.PhanTramKeHoach as PhanTramKeHoachGoiThau,
            gt.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatGoiThau,
            gt.PathData,
            d.DuAnID,
            d.TenDuAn,
            d.TinhThanh,
            d.ChuDauTu,
            d.NgayKhoiCong as NgayKhoiCongDuAn,
            d.TrangThai as TrangThaiDuAn,
            d.NguonVon,
            d.TongChieuDai,
            d.KeHoachHoanThanh,
            d.MoTaChung as MoTaDuAn,
            d.ParentID,
            d.PhanTramHoanThanh as PhanTramHoanThanhDuAn,
            d.PhanTramChamTienDo as PhanTramChamTienDoDuAn,
            d.PhanTramKeHoach as PhanTramKeHoachDuAn,
            d.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatDuAn,
            CASE 
              WHEN hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh <= CURDATE() THEN 'Hoàn thành'
              WHEN hm.ThoiGianHoanThanh IS NOT NULL AND hm.ThoiGianHoanThanh > CURDATE() THEN 'Đang thực hiện'
              ELSE 'Chưa bắt đầu'
            END as TrangThaiHangMuc,
            -- Thống kê kế hoạch trong hạng mục
            (SELECT COUNT(*) FROM quanlykehoach qkh WHERE qkh.HangMucID = hm.HangMucID) as SoKeHoach,
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             WHERE qkh.HangMucID = hm.HangMucID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
                   (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) >= qkh.KhoiLuongKeHoach) as SoKeHoachHoanThanh,
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             WHERE qkh.HangMucID = hm.HangMucID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
                   (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) > 0) as SoKeHoachDangLam,
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             WHERE qkh.HangMucID = hm.HangMucID AND qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
                   (SELECT COALESCE(SUM(tdth.KhoiLuongThucHien), 0) FROM tiendothuchien tdth WHERE tdth.KeHoachID = qkh.KeHoachID) < qkh.KhoiLuongKeHoach) as SoKeHoachChamTienDo,
            -- Thống kê tiến độ thực hiện
            (SELECT COUNT(*) FROM quanlykehoach qkh 
             INNER JOIN tiendothuchien tdth ON qkh.KeHoachID = tdth.KeHoachID 
             WHERE qkh.HangMucID = hm.HangMucID) as SoLanCapNhatTienDo,
            (SELECT MAX(tdth.NgayCapNhat) FROM quanlykehoach qkh 
             INNER JOIN tiendothuchien tdth ON qkh.KeHoachID = tdth.KeHoachID 
             WHERE qkh.HangMucID = hm.HangMucID) as NgayCapNhatGanNhatTienDo
          FROM hangmuc hm
          LEFT JOIN goithau gt ON hm.GoiThauID = gt.GoiThau_ID
          LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
          LEFT JOIN goithau_nhathau gtn ON gt.GoiThau_ID = gtn.GoiThau_ID
          WHERE gtn.NhaThauID = :nhaThauId
          ORDER BY hm.ThoiGianHoanThanh ASC
        `, {
          replacements: { nhaThauId: nhaThau.NhaThauID },
          type: models.sequelize.QueryTypes.SELECT
        });

        // Lấy thông tin kế hoạch chi tiết với tất cả thông tin liên quan
        const keHoachInfo = await models.sequelize.query(`
          SELECT 
            qkh.KeHoachID,
            qkh.TenCongTac,
            qkh.KhoiLuongKeHoach,
            qkh.DonViTinh,
            qkh.NgayBatDau,
            qkh.NgayKetThuc,
            qkh.GhiChu,
            hm.HangMucID,
            hm.TenHangMuc,
            hm.LoaiHangMuc,
            hm.TieuDeChiTiet,
            hm.MayMocThietBi,
            hm.NhanLucThiCong,
            hm.ThoiGianHoanThanh,
            hm.GhiChu as GhiChuHangMuc,
            gt.GoiThau_ID,
            gt.TenGoiThau,
            gt.GiaTriHĐ,
            gt.Km_BatDau,
            gt.Km_KetThuc,
            gt.ToaDo_BatDau_X,
            gt.ToaDo_BatDau_Y,
            gt.ToaDo_KetThuc_X,
            gt.ToaDo_KetThuc_Y,
            gt.NgayKhoiCong,
            gt.NgayHoanThanh,
            gt.TrangThai as TrangThaiGoiThau,
            gt.PhanTramHoanThanh as PhanTramHoanThanhGoiThau,
            gt.PhanTramDangLam as PhanTramDangLamGoiThau,
            gt.PhanTramChamTienDo as PhanTramChamTienDoGoiThau,
            gt.PhanTramKeHoach as PhanTramKeHoachGoiThau,
            gt.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatGoiThau,
            gt.PathData,
            d.DuAnID,
            d.TenDuAn,
            d.TinhThanh,
            d.ChuDauTu,
            d.NgayKhoiCong as NgayKhoiCongDuAn,
            d.TrangThai as TrangThaiDuAn,
            d.NguonVon,
            d.TongChieuDai,
            d.KeHoachHoanThanh,
            d.MoTaChung as MoTaDuAn,
            d.ParentID,
            d.PhanTramHoanThanh as PhanTramHoanThanhDuAn,
            d.PhanTramChamTienDo as PhanTramChamTienDoDuAn,
            d.PhanTramKeHoach as PhanTramKeHoachDuAn,
            d.ThoiGianCapNhatGanNhat as ThoiGianCapNhatGanNhatDuAn,
            COALESCE(SUM(tdth.KhoiLuongThucHien), 0) as KhoiLuongThucHien,
            COUNT(tdth.TienDoID) as SoLanCapNhatTienDo,
            MAX(tdth.NgayCapNhat) as NgayCapNhatGanNhat,
            MIN(tdth.NgayCapNhat) as NgayCapNhatDauTien,
            AVG(tdth.KhoiLuongThucHien) as KhoiLuongTrungBinhMoiLan,
            CASE 
              WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
                   COALESCE(SUM(tdth.KhoiLuongThucHien), 0) < qkh.KhoiLuongKeHoach THEN 'Chậm tiến độ'
              WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc >= CURDATE() AND 
                   COALESCE(SUM(tdth.KhoiLuongThucHien), 0) > 0 THEN 'Đang thực hiện'
              WHEN qkh.NgayKetThuc IS NOT NULL AND qkh.NgayKetThuc < CURDATE() AND 
                   COALESCE(SUM(tdth.KhoiLuongThucHien), 0) >= qkh.KhoiLuongKeHoach THEN 'Hoàn thành'
              ELSE 'Chưa bắt đầu'
            END as TrangThaiKeHoach,
            ROUND((COALESCE(SUM(tdth.KhoiLuongThucHien), 0) / qkh.KhoiLuongKeHoach) * 100, 2) as PhanTramHoanThanh,
            -- Thống kê chi tiết tiến độ
            (SELECT COUNT(*) FROM tiendothuchien tdth2 WHERE tdth2.KeHoachID = qkh.KeHoachID AND tdth2.KhoiLuongThucHien > 0) as SoLanCapNhatCoKhoiLuong,
            (SELECT COUNT(*) FROM tiendothuchien tdth2 WHERE tdth2.KeHoachID = qkh.KeHoachID AND tdth2.MoTaVuongMac IS NOT NULL AND tdth2.MoTaVuongMac != '') as SoLanCoVuongMac,
            (SELECT GROUP_CONCAT(DISTINCT tdth2.MoTaVuongMac SEPARATOR '; ') 
             FROM tiendothuchien tdth2 
             WHERE tdth2.KeHoachID = qkh.KeHoachID AND tdth2.MoTaVuongMac IS NOT NULL AND tdth2.MoTaVuongMac != '') as DanhSachVuongMac
          FROM quanlykehoach qkh
          LEFT JOIN hangmuc hm ON qkh.HangMucID = hm.HangMucID
          LEFT JOIN goithau gt ON hm.GoiThauID = gt.GoiThau_ID
          LEFT JOIN duan d ON gt.DuAn_ID = d.DuAnID
          LEFT JOIN tiendothuchien tdth ON qkh.KeHoachID = tdth.KeHoachID
          WHERE qkh.NhaThauID = :nhaThauId
          GROUP BY qkh.KeHoachID, qkh.TenCongTac, qkh.KhoiLuongKeHoach, qkh.DonViTinh, 
                   qkh.NgayBatDau, qkh.NgayKetThuc, qkh.GhiChu, hm.HangMucID, hm.TenHangMuc, 
                   hm.LoaiHangMuc, hm.TieuDeChiTiet, hm.MayMocThietBi, hm.NhanLucThiCong, 
                   hm.ThoiGianHoanThanh, hm.GhiChu, gt.GoiThau_ID, gt.TenGoiThau, 
                   gt.GiaTriHĐ, gt.Km_BatDau, gt.Km_KetThuc, gt.ToaDo_BatDau_X, gt.ToaDo_BatDau_Y,
                   gt.ToaDo_KetThuc_X, gt.ToaDo_KetThuc_Y, gt.NgayKhoiCong, gt.NgayHoanThanh, 
                   gt.TrangThai, gt.PhanTramHoanThanh, gt.PhanTramDangLam, gt.PhanTramChamTienDo,
                   gt.PhanTramKeHoach, gt.ThoiGianCapNhatGanNhat, gt.PathData, d.DuAnID, 
                   d.TenDuAn, d.TinhThanh, d.ChuDauTu, d.NgayKhoiCong, d.TrangThai, d.NguonVon,
                   d.TongChieuDai, d.KeHoachHoanThanh, d.MoTaChung, d.ParentID, 
                   d.PhanTramHoanThanh, d.PhanTramChamTienDo, d.PhanTramKeHoach, d.ThoiGianCapNhatGanNhat
          ORDER BY qkh.NgayKetThuc ASC
        `, {
          replacements: { nhaThauId: nhaThau.NhaThauID },
          type: models.sequelize.QueryTypes.SELECT
        });

        chiTietNhaThau.push({
          nhaThau: nhaThau,
          chiTiet: {
            goiThau: goiThauInfo,
            hangMuc: hangMucInfo,
            keHoach: keHoachInfo
          }
        });
      }
    }

    const response = {
      success: true,
      data: {
        danhSachNhaThau: shouldIncludeDetails ? chiTietNhaThau : danhSachNhaThau,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].total,
          totalPages: Math.ceil(totalCount[0].total / limit)
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhà thầu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách nhà thầu',
      error: error.message
    });
  }
};

// API 3: Cập nhật thông tin nhà thầu
const updateNhaThau = async (req, res) => {
  try {
    const { nhaThauId } = req.params;
    const updateData = req.body;

    // Kiểm tra nhà thầu tồn tại
    const nhaThau = await models.nhathau.findByPk(nhaThauId);
    if (!nhaThau) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy nhà thầu' 
      });
    }

    // Cập nhật thông tin
    await nhaThau.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật thông tin nhà thầu thành công',
      data: nhaThau
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật nhà thầu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật nhà thầu',
      error: error.message
    });
  }
};

// API 4: Xóa nhà thầu
const deleteNhaThau = async (req, res) => {
  try {
    const { nhaThauId } = req.params;

    // Kiểm tra nhà thầu tồn tại
    const nhaThau = await models.nhathau.findByPk(nhaThauId);
    if (!nhaThau) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy nhà thầu' 
      });
    }

    // Bắt đầu transaction
    const transaction = await models.sequelize.transaction();

    try {
      // Xóa các bản ghi liên quan theo thứ tự
      
      // 1. Xóa tiến độ thực hiện liên quan đến kế hoạch của nhà thầu
      await models.sequelize.query(`
        DELETE tdth FROM tiendothuchien tdth
        INNER JOIN quanlykehoach qkh ON tdth.KeHoachID = qkh.KeHoachID
        WHERE qkh.NhaThauID = :nhaThauId
      `, {
        replacements: { nhaThauId },
        transaction
      });

      // 2. Xóa kế hoạch của nhà thầu
      await models.quanlykehoach.destroy({
        where: { NhaThauID: nhaThauId },
        transaction
      });

      // 3. Xóa quan hệ gói thầu - nhà thầu
      await models.goithau_nhathau.destroy({
        where: { NhaThauID: nhaThauId },
        transaction
      });

      // 4. Cập nhật NhaThauID = NULL trong bảng goithau (nếu là nhà thầu chính)
      await models.goithau.update(
        { NhaThauID: null },
        { 
          where: { NhaThauID: nhaThauId },
          transaction 
        }
      );

      // 5. Xóa tài khoản liên quan
      await models.taikhoan.destroy({
        where: { NhaThauID: nhaThauId },
        transaction
      });

      // 6. Xóa nhà thầu
      await nhaThau.destroy({ transaction });

      // Commit transaction
      await transaction.commit();

      res.json({
        success: true,
        message: 'Xóa nhà thầu và tất cả dữ liệu liên quan thành công'
      });

    } catch (error) {
      // Rollback nếu có lỗi
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Lỗi khi xóa nhà thầu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa nhà thầu',
      error: error.message
    });
  }
};

module.exports = {
  getNhaThauDetail,
  getDanhSachNhaThau,
  updateNhaThau,
  deleteNhaThau
}; 