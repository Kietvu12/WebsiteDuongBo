const db = require('../models');
const KhoiLuong_ThiCong = db.KhoiLuong_ThiCong;

class KhoiLuong_ThiCongController {
  // Thêm mới khối lượng thi công
  static async create(req, res) {
    try {
      const data = await KhoiLuong_ThiCong.create(req.body);
      res.status(201).json({ message: 'Thêm thành công', data });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm', error });
    }
  }

  // Lấy danh sách tất cả
  static async getAll(req, res) {
    try {
      const data = await KhoiLuong_ThiCong.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách', error });
    }
  }

  // Cập nhật theo ID
  static async update(req, res) {
    try {
      const { KhoiLuong_ID } = req.body;
      const [updated] = await KhoiLuong_ThiCong.update(req.body, {
        where: { KhoiLuong_ID }
      });
      if (updated) {
        res.json({ message: 'Cập nhật thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy bản ghi để cập nhật' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật', error });
    }
  }

  // Xóa theo ID
  static async delete(req, res) {
    try {
      const { KhoiLuong_ID } = req.body;
      const deleted = await KhoiLuong_ThiCong.destroy({
        where: { KhoiLuong_ID }
      });
      if (deleted) {
        res.json({ message: 'Xóa thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy bản ghi để xóa' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa', error });
    }
  }
}

module.exports = KhoiLuong_ThiCongController;
