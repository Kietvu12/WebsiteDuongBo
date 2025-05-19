const express = require('express');
const router = express.Router();
const goiThauController = require('../controllers/GoiThauController');

// Lấy tất cả gói thầu của dự án thành phần
router.get('/duan-thanh-phan/:id/goi-thau', goiThauController.getByDuAnThanhPhanId);

// Lấy thông tin gói thầu theo ID
router.get('/:id', goiThauController.getGoiThauById);

// Tạo mới gói thầu
router.post('/', goiThauController.createGoiThau);

// Cập nhật gói thầu
router.put('/:id', goiThauController.updateGoiThau);

// Xóa gói thầu
router.delete('/:id', goiThauController.deleteGoiThau);

module.exports = router;