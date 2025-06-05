const { VuongMac } = require('../models');

class VuongMacController {
  // Tạo mới
  static async create(req, res) {
    try {
      const vuongMac = await VuongMac.create(req.body);
      res.status(201).json(vuongMac);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo vướng mắc', error });
    }
  }

  // Lấy tất cả
  static async getAll(req, res) {
    try {
      const danhSach = await VuongMac.findAll();
      res.status(200).json(danhSach);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách vướng mắc', error });
    }
  }

  // Cập nhật theo ID
  static async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await VuongMac.update(req.body, {
        where: { VuongMacID: id }
      });

      if (updated) {
        const updatedData = await VuongMac.findByPk(id);
        return res.status(200).json(updatedData);
      }

      res.status(404).json({ message: 'Không tìm thấy vướng mắc để cập nhật' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật vướng mắc', error });
    }
  }

  // Xóa theo ID
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await VuongMac.destroy({
        where: { VuongMacID: id }
      });

      if (deleted) {
        return res.status(200).json({ message: 'Xóa vướng mắc thành công' });
      }

      res.status(404).json({ message: 'Không tìm thấy vướng mắc để xóa' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa vướng mắc', error });
    }
  }
}

module.exports = VuongMacController;
