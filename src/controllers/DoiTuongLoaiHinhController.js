const db = require('../models');
const DoiTuongLoaiHinh = db.DoiTuongLoaiHinh;

class DoiTuongLoaiHinhController {
  /**
   * @route POST /doi_tuong_loai_hinh/add
   */
  static async create(req, res) {
    try {
      const record = await DoiTuongLoaiHinh.create(req.body);
      res.status(201).json({ message: 'Gán loại hình cho đối tượng thành công', data: record });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo', error: error.message });
    }
  }

  /**
   * @route GET /doi_tuong_loai_hinh/index
   */
  static async getAll(req, res) {
    try {
      const list = await DoiTuongLoaiHinh.findAll();
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
    }
  }

  /**
   * @route POST /doi_tuong_loai_hinh/update
   * Body cần có DoiTuong_ID và LoaiDoiTuong
   */
  static async update(req, res) {
    const { DoiTuong_ID, LoaiDoiTuong, ...updateData } = req.body;
    try {
      const [updated] = await DoiTuongLoaiHinh.update(updateData, {
        where: { DoiTuong_ID, LoaiDoiTuong }
      });

      if (updated === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi để cập nhật' });
      }

      res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
    }
  }

  /**
   * @route POST /doi_tuong_loai_hinh/delete
   * Body cần có DoiTuong_ID và LoaiDoiTuong
   */
  static async delete(req, res) {
    const { DoiTuong_ID, LoaiDoiTuong } = req.body;
    try {
      const deleted = await DoiTuongLoaiHinh.destroy({
        where: { DoiTuong_ID, LoaiDoiTuong }
      });

      if (deleted === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi để xoá' });
      }

      res.json({ message: 'Xoá thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xoá', error: error.message });
    }
  }
}

module.exports = DoiTuongLoaiHinhController;
