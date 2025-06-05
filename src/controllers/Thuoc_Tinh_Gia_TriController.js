const db = require('../models');
const { DoiTuongLoaiHinh, LoaiHinh, ThuocTinhLoaiHinh, GiaTriThuocTinh } = db;

class ThuocTinhGiaTriController {
  static async getFullInfo(req, res) {
    const { doiTuongId, loaiDoiTuong } = req.params;
    console.log('Model check:', {
  DoiTuongLoaiHinh,
  LoaiHinh,
  ThuocTinhLoaiHinh,
  GiaTriThuocTinh
});

    try {
      const dtlh = await DoiTuongLoaiHinh.findOne({
        where: {
          DoiTuong_ID: doiTuongId,
          LoaiDoiTuong: loaiDoiTuong
        }
      });

      if (!dtlh) {
        return res.status(404).json({ message: 'Không tìm thấy loại hình của đối tượng' });
      }

      const loaiHinh = await LoaiHinh.findByPk(dtlh.LoaiHinh_ID);

      const attributes = await ThuocTinhLoaiHinh.findAll({
        where: { LoaiHinh_ID: dtlh.LoaiHinh_ID },
        include: [
          {
            model: GiaTriThuocTinh,
            as: 'GiaTriThuocTinhs',
            required: false,
            where: {
              DoiTuong_ID: doiTuongId,
              LoaiDoiTuong: loaiDoiTuong
            }
          }
        ]
      });

      const result = attributes.map(attr => ({
        TenLoaiHinh: loaiHinh.TenLoaiHinh,
        TenThuocTinh: attr.TenThuocTinh,
        DonVi: attr.DonVi,
        GiaTri: attr.GiaTriThuocTinhs[0]?.GiaTri || null
      }));

      res.json(result);

    } catch (error) {
      res.status(500).json({ message: 'Lỗi truy vấn', error: error.message });
    }
  }
}

module.exports = ThuocTinhGiaTriController;
