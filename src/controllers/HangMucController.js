const db = require('../models');
const HangMuc = db.HangMuc;

class HangMucController {
  /**
   * @route POST /hangmuc
   * @desc Tạo mới hạng mục
   */
  static async create(req, res) {
    try {
      const data = await HangMuc.create(req.body);
      res.status(201).json({ message: 'Tạo hạng mục thành công', data });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo hạng mục', error: error.message });
    }
  }

  /**
   * @route GET /hangmuc
   * @desc Lấy danh sách tất cả hạng mục
   */
  static async getAll(req, res) {
    try {
      const list = await HangMuc.findAll();
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
    }
  }

  /**
   * @route PUT /hangmuc/:id
   * @desc Cập nhật hạng mục theo ID
   */
  static async update(req, res) {
    try {
      const id = req.params.id;
      const [rowsUpdated] = await HangMuc.update(req.body, {
        where: { HangMucID: id }
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Không tìm thấy hạng mục để cập nhật' });
      }

      res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
    }
  }

  /**
   * @route DELETE /hangmuc/:id
   * @desc Xoá hạng mục theo ID
   */
  static async delete(req, res) {
    try {
      const id = req.params.id;
      const rowsDeleted = await HangMuc.destroy({
        where: { HangMucID: id }
      });

      if (rowsDeleted === 0) {
        return res.status(404).json({ message: 'Không tìm thấy hạng mục để xoá' });
      }

      res.json({ message: 'Xoá thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xoá', error: error.message });
    }
  }
}

module.exports = HangMucController;
