const db = require('../models');
const NhaThau = db.NhaThau;

class NhaThauController {
  // Tạo mới nhà thầu
  static async create(req, res) {
    try {
      const data = await NhaThau.create(req.body);
      res.status(201).json({ message: 'Thêm nhà thầu thành công', data });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm nhà thầu', error });
    }
  }

  // Lấy danh sách tất cả nhà thầu
  static async getAll(req, res) {
    try {
      const data = await NhaThau.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách', error });
    }
  }

  // Cập nhật thông tin nhà thầu
  static async update(req, res) {
    try {
      const { NhaThauID } = req.body;
      const [updated] = await NhaThau.update(req.body, {
        where: { NhaThauID }
      });

      if (updated) {
        res.json({ message: 'Cập nhật thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy nhà thầu để cập nhật' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật', error });
    }
  }

  // Xoá nhà thầu
  static async delete(req, res) {
    try {
      const { NhaThauID } = req.body;
      const deleted = await NhaThau.destroy({
        where: { NhaThauID }
      });

      if (deleted) {
        res.json({ message: 'Xóa nhà thầu thành công' });
      } else {
        res.status(404).json({ message: 'Không tìm thấy nhà thầu để xóa' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa', error });
    }
  }
}

module.exports = NhaThauController;
