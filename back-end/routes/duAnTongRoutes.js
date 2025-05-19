const express = require('express');
const router = express.Router();
const duanTongController = require('../controllers/DuAnTongController');

// Lấy tất cả dự án tổng
router.get('/', duanTongController.getAllDuAnTong);

// Lấy thông tin dự án tổng theo ID
router.get('/:id', duanTongController.getDuAnTongById);

// Tạo mới dự án tổng
router.post('/', duanTongController.createDuAnTong);

// Cập nhật dự án tổng
router.put('/:id', duanTongController.updateDuAnTong);

// Xóa dự án tổng
router.delete('/:id', duanTongController.deleteDuAnTong);

// Lấy danh sách dự án thành phần của dự án tổng
router.get('/:id/duan-thanh-phan', duanTongController.getDuAnThanhPhanByDuAnTong);

module.exports = router;