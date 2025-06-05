const db = require('../models');
const ThuocTinhLoaiHinh = db.ThuocTinhLoaiHinh;

class ThuocTinhLoaiHinhController {
  /**
   * @route POST /thuoc_tinh_loai_hinh/add
   * @desc Tạo mới thuộc tính cho loại hình
   */
  static async create(req, res) {
    try {
      const item = await ThuocTinhLoaiHinh.create(req.body);
      res.status(201).json({ message: 'Tạo thuộc tính loại hình thành công', data: item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo', error: error.message });
    }
  }

  /**
   * @route GET /thuoc_tinh_loai_hinh/index
   * @desc Lấy danh sách tất cả thuộc tính loại hình
   */
  static async getAll(req, res) {
    try {
      const danhSach = await ThuocTinhLoaiHinh.findAll();
      res.json(danhSach);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
    }
  }

  /**
   * @route POST /thuoc_tinh_loai_hinh/update
   * @desc Cập nhật thuộc tính loại hình
   * Body cần có ThuocTinh_ID
   */
  static async update(req, res) {
    const { ThuocTinh_ID, ...updateData } = req.body;
    try {
      const [rowsUpdated] = await ThuocTinhLoaiHinh.update(updateData, {
        where: { ThuocTinh_ID }
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Không tìm thấy để cập nhật' });
      }

      res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
    }
  }

  /**
   * @route POST /thuoc_tinh_loai_hinh/delete
   * @desc Xoá thuộc tính loại hình
   * Body cần có ThuocTinh_ID
   */
  static async delete(req, res) {
    const { ThuocTinh_ID } = req.body;
    try {
      const rowsDeleted = await ThuocTinhLoaiHinh.destroy({
        where: { ThuocTinh_ID }
      });

      if (rowsDeleted === 0) {
        return res.status(404).json({ message: 'Không tìm thấy để xoá' });
      }

      res.json({ message: 'Xoá thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xoá', error: error.message });
    }
  }
}

module.exports = ThuocTinhLoaiHinhController;
