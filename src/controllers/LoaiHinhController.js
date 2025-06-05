const db = require('../models');
const LoaiHinh = db.LoaiHinh;

class LoaiHinhController {
  /**
   * @route POST /loai_hinh/add
   * @desc Tạo mới loại hình
   */
  static async create(req, res) {
    try {
      const loaiHinh = await LoaiHinh.create(req.body);
      res.status(201).json({ message: 'Tạo loại hình thành công', data: loaiHinh });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo loại hình', error: error.message });
    }
  }

  /**
   * @route GET /loai_hinh/index
   * @desc Lấy danh sách tất cả loại hình
   */
  static async getAll(req, res) {
    try {
      const danhSach = await LoaiHinh.findAll();
      res.json(danhSach);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách loại hình', error: error.message });
    }
  }

  /**
   * @route POST /loai_hinh/update
   * @desc Cập nhật loại hình
   * Body cần có LoaiHinh_ID
   */
  static async update(req, res) {
    const { LoaiHinh_ID, ...updateData } = req.body;
    try {
      const [rowsUpdated] = await LoaiHinh.update(updateData, {
        where: { LoaiHinh_ID }
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Không tìm thấy loại hình để cập nhật' });
      }

      res.json({ message: 'Cập nhật loại hình thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật loại hình', error: error.message });
    }
  }

  /**
   * @route POST /loai_hinh/delete
   * @desc Xoá loại hình
   * Body cần có LoaiHinh_ID
   */
  static async delete(req, res) {
    const { LoaiHinh_ID } = req.body;
    try {
      const rowsDeleted = await LoaiHinh.destroy({
        where: { LoaiHinh_ID }
      });

      if (rowsDeleted === 0) {
        return res.status(404).json({ message: 'Không tìm thấy loại hình để xoá' });
      }

      res.json({ message: 'Xoá loại hình thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xoá loại hình', error: error.message });
    }
  }
}

module.exports = LoaiHinhController;
