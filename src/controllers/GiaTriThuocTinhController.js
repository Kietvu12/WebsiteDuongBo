const db = require('../models');
const GiaTriThuocTinh = db.GiaTriThuocTinh;

class GiaTriThuocTinhController {
  /**
   * @route POST /gia_tri/add
   * @desc Tạo mới giá trị thuộc tính
   */
  static async create(req, res) {
    try {
      const item = await GiaTriThuocTinh.create(req.body);
      res.status(201).json({ message: 'Tạo thành công', data: item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo', error: error.message });
    }
  }

  /**
   * @route GET /gia_tri/index
   * @desc Lấy danh sách tất cả giá trị thuộc tính
   */
  static async getAll(req, res) {
    try {
      const danhSach = await GiaTriThuocTinh.findAll();
      res.json(danhSach);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
    }
  }

  /**
   * @route POST /gia_tri/update
   * @desc Cập nhật giá trị thuộc tính
   * Body cần có GiaTri_ID
   */
  static async update(req, res) {
    const { GiaTri_ID, ...updateData } = req.body;
    try {
      const [rowsUpdated] = await GiaTriThuocTinh.update(updateData, {
        where: { GiaTri_ID }
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
   * @route POST /gia_tri/delete
   * @desc Xoá giá trị thuộc tính
   * Body cần có GiaTri_ID
   */
  static async delete(req, res) {
    const { GiaTri_ID } = req.body;
    try {
      const rowsDeleted = await GiaTriThuocTinh.destroy({
        where: { GiaTri_ID }
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

module.exports = GiaTriThuocTinhController;
