const GoiThau = require('../models/GoiThau');

exports.getByDuAnThanhPhanId = async (req, res) => {
  try {
    const goiThauList = await GoiThau.getByDuAnThanhPhanId(req.params.id);
    res.json(goiThauList);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách gói thầu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getGoiThauById = async (req, res) => {
  try {
    const goiThau = await GoiThau.getById(req.params.id);
    if (!goiThau) {
      return res.status(404).json({ error: 'Gói thầu không tồn tại' });
    }
    res.json(goiThau);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin gói thầu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createGoiThau = async (req, res) => {
  try {
    const newGoiThauId = await GoiThau.create(req.body);
    res.status(201).json({ id: newGoiThauId, message: 'Gói thầu đã được tạo thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo gói thầu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.updateGoiThau = async (req, res) => {
  try {
    const affectedRows = await GoiThau.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Gói thầu không tồn tại' });
    }
    res.json({ message: 'Gói thầu đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật gói thầu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.deleteGoiThau = async (req, res) => {
  try {
    const affectedRows = await GoiThau.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Gói thầu không tồn tại' });
    }
    res.json({ message: 'Gói thầu đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa gói thầu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};