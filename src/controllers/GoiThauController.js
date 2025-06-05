const db = require('../models');
const GoiThau = db.GoiThau;

class GoiThauController {
    /**
     * Tạo mới gói thầu
     * @route POST /goithau
     */
    static async create(req, res) {
        try {
            const newGoiThau = await GoiThau.create(req.body);
            res.status(201).json({
                message: 'Tạo gói thầu thành công',
                data: newGoiThau
            });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tạo gói thầu', error: error.message });
        }
    }

    /**
     * Lấy danh sách tất cả gói thầu
     * @route GET /goithau
     */
    static async getAll(req, res) {
        try {
            const danhSach = await GoiThau.findAll();
            res.json(danhSach);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
        }
    }

    /**
     * Cập nhật gói thầu theo ID
     * @route PUT /goithau/:id
     */
    static async update(req, res) {
        try {
            const id = req.params.id;
            const [rowsUpdated] = await GoiThau.update(req.body, {
                where: { GoiThau_ID: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Không tìm thấy gói thầu để cập nhật' });
            }

            res.json({ message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
        }
    }

    /**
     * Xoá gói thầu theo ID
     * @route DELETE /goithau/:id
     */
    static async delete(req, res) {
        try {
            const id = req.params.id;
            const rowsDeleted = await GoiThau.destroy({
                where: { GoiThau_ID: id }
            });

            if (rowsDeleted === 0) {
                return res.status(404).json({ message: 'Không tìm thấy gói thầu để xoá' });
            }

            res.json({ message: 'Xoá thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xoá', error: error.message });
        }
    }
}

module.exports = GoiThauController;
