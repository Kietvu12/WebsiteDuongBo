const db = require('../models');
const Goithau_nhathau = db.Goithau_nhathau;

class Goithau_nhathauController {
  /**
   * @route POST /goithau_nhathau
   * @desc Tạo mới bản ghi gói thầu – nhà thầu
   */
  static async create(req, res) {
    try {
      const data = await Goithau_nhathau.create(req.body);
      res.status(201).json({ message: 'Tạo thành công', data });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo', error: error.message });
    }
  }

  /**
   * @route GET /goithau_nhathau
   * @desc Lấy toàn bộ danh sách
   */
  static async getAll(req, res) {
    try {
      const list = await Goithau_nhathau.findAll();
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy dữ liệu', error: error.message });
    }
  }

  /**
   * @route PUT /goithau_nhathau/:goithau_id/:nhathau_id
   * @desc Cập nhật vai trò trong quan hệ gói thầu – nhà thầu
   */
  static async update(req, res) {
    const { goithau_id, nhathau_id } = req.params;
    try {
      const [updatedRows] = await Goithau_nhathau.update(req.body, {
        where: {
          GoiThau_ID: goithau_id,
          NhaThauID: nhathau_id
        }
      });

      if (updatedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi để cập nhật' });
      }

      res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
    }
  }

  /**
   * @route DELETE /goithau_nhathau/:goithau_id/:nhathau_id
   * @desc Xoá bản ghi quan hệ
   */
  static async delete(req, res) {
    const { goithau_id, nhathau_id } = req.params;
    try {
      const deletedRows = await Goithau_nhathau.destroy({
        where: {
          GoiThau_ID: goithau_id,
          NhaThauID: nhathau_id
        }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi để xoá' });
      }

      res.json({ message: 'Xoá thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xoá', error: error.message });
    }
  }
}

module.exports = Goithau_nhathauController;
