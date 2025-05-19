const express = require('express');
const router = express.Router();
const duanThanhPhanController = require('../controllers/DuAnThanhPhanController');

// Lấy thông tin dự án thành phần theo ID
router.get('/:id', duanThanhPhanController.getDuAnThanhPhanById);

// Tạo mới dự án thành phần
router.post('/', duanThanhPhanController.createDuAnThanhPhan);

// Cập nhật dự án thành phần
router.put('/:id', duanThanhPhanController.updateDuAnThanhPhan);

// Xóa dự án thành phần
router.delete('/:id', duanThanhPhanController.deleteDuAnThanhPhan);

// Lấy danh sách gói thầu thuộc dự án thành phần
router.get('/:id/goi-thau', duanThanhPhanController.getGoiThauByDuAnThanhPhan);

// Tính toán và cập nhật thông tin tổng hợp cho dự án thành phần
router.post('/:id/tinh-toan', duanThanhPhanController.calculateDuAnThanhPhan);

// Lấy thông tin chi tiết dự án thành phần bao gồm các gói thầu
router.get('/:id/chi-tiet', duanThanhPhanController.getDuAnThanhPhanDetail);

module.exports = router;