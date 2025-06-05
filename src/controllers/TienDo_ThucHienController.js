const db = require('../models');
const TienDo_ThucHien = db.TienDo_ThucHien;

class TienDo_ThucHienController {
  // Tạo mới một bản ghi tiến độ
  static async create(req, res) {
    try {
      const data = await TienDo_ThucHien.create(req.body);
      res.status(201).json({ message: 'Tạo tiến độ thành công', data });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo tiến độ', error });
    }
  }

  // Lấy toàn bộ tiến độ
  static async getAll(req, res) {
    try {
      const data = await TienDo_ThucHien.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách tiến độ', error });
    }
  }

  // Cập nhật tiến độ theo TienDoID
  static async update(req, res) {
    try {
      const { TienDoID } = req.body;
      const [updated] = await TienDo_ThucHien.update(req.body, {
        where: { TienDoID }
      });

      if (updated) {
        res.json({ message: 'Cập nhật tiến độ thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy tiến độ để cập nhật' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật tiến độ', error });
    }
  }

  // Xóa tiến độ theo TienDoID
  static async delete(req, res) {
    try {
      const { TienDoID } = req.body;
      const deleted = await TienDo_ThucHien.destroy({
        where: { TienDoID }
      });

      if (deleted) {
        res.json({ message: 'Xóa tiến độ thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy tiến độ để xóa' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa tiến độ', error });
    }
  }
}

module.exports = TienDo_ThucHienController;
