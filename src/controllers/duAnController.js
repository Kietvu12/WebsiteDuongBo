const db = require('../models');
const DuAn = db.DuAn;

class DuAnController {
  /**
   * @route POST /du_an/add
   * @desc Tạo mới dự án
   */
  static async create(req, res) {
    try {
      const duAn = await DuAn.create(req.body);
      res.status(201).json({ message: 'Tạo dự án thành công', data: duAn });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo dự án', error: error.message });
    }
  }

  /**
   * @route GET /du_an/index
   * @desc Lấy danh sách tất cả dự án
   */
  static async getAll(req, res) {
    try {
      const name = req.get("TenDuAn");
      
      const danhSach = await DuAn.findAll();
      res.json(danhSach);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách dự án', error: error.message });
    }
  }

  /**
   * @route POST /du_an/update
   * @desc Cập nhật dự án
   * Body cần có DuAnID
   */
  static async update(req, res) {
    const { DuAnID, ...updateData } = req.body;
    try {
      const [rowsUpdated] = await DuAn.update(updateData, {
        where: { DuAnID }
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Không tìm thấy dự án để cập nhật' });
      }

      res.json({ message: 'Cập nhật dự án thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật dự án', error: error.message });
    }
  }

  /**
   * @route POST /du_an/delete
   * @desc Xoá dự án
   * Body cần có DuAnID
   */
  static async delete(req, res) {
    const { DuAnID } = req.body;
    try {
      const rowsDeleted = await DuAn.destroy({
        where: { DuAnID }
      });

      if (rowsDeleted === 0) {
        return res.status(404).json({ message: 'Không tìm thấy dự án để xoá' });
      }

      res.json({ message: 'Xoá dự án thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xoá dự án', error: error.message });
    }
  }
}

module.exports = DuAnController;
