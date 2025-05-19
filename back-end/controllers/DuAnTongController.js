const DuAnTong = require('../models/DuAnTong');
const DuAnThanhPhan = require('../models/DuAnThanhPhan');

exports.getAllDuAnTong = async (req, res) => {
  try {
    const duAnTongList = await DuAnTong.getAll();
    res.json(duAnTongList);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dự án tổng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getDuAnTongById = async (req, res) => {
  try {
    const duAnTong = await DuAnTong.getById(req.params.id);
    if (!duAnTong) {
      return res.status(404).json({ error: 'Dự án tổng không tồn tại' });
    }
    res.json(duAnTong);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin dự án tổng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createDuAnTong = async (req, res) => {
  try {
    const newProjectId = await DuAnTong.create(req.body);
    res.status(201).json({ id: newProjectId, message: 'Dự án tổng đã được tạo thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo dự án tổng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.updateDuAnTong = async (req, res) => {
  try {
    const affectedRows = await DuAnTong.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Dự án tổng không tồn tại' });
    }
    res.json({ message: 'Dự án tổng đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật dự án tổng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.deleteDuAnTong = async (req, res) => {
  try {
    const affectedRows = await DuAnTong.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Dự án tổng không tồn tại' });
    }
    res.json({ message: 'Dự án tổng đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa dự án tổng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getDuAnThanhPhanByDuAnTong = async (req, res) => {
  try {
    const duAnThanhPhanList = await DuAnThanhPhan.getByDuAnTongId(req.params.id);
    res.json(duAnThanhPhanList);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dự án thành phần:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};