const db = require('../models');
const QuanLy_KeHoach = db.QuanLy_KeHoach;

class QuanLy_KeHoachController {
  // Thêm kế hoạch mới
  static async create(req, res) {
    try {
      const data = await QuanLy_KeHoach.create(req.body);
      res.status(201).json({ message: 'Thêm kế hoạch thành công', data });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm kế hoạch', error });
    }
  }

  // Lấy tất cả kế hoạch
  static async getAll(req, res) {
    try {
      const data = await QuanLy_KeHoach.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách kế hoạch', error });
    }
  }

  // Cập nhật kế hoạch theo ID
  static async update(req, res) {
    try {
      const { KeHoachID } = req.body;
      const [updated] = await QuanLy_KeHoach.update(req.body, {
        where: { KeHoachID }
      });

      if (updated) {
        res.json({ message: 'Cập nhật kế hoạch thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy kế hoạch để cập nhật' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật kế hoạch', error });
    }
  }

  // Xóa kế hoạch theo ID
  static async delete(req, res) {
    try {
      const { KeHoachID } = req.body;
      const deleted = await QuanLy_KeHoach.destroy({
        where: { KeHoachID }
      });

      if (deleted) {
        res.json({ message: 'Xóa kế hoạch thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy kế hoạch để xóa' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa kế hoạch', error });
    }
  }
}

module.exports = QuanLy_KeHoachController;
