const express = require('express');
const router = express.Router();
const nhathauController = require('../controllers/nhathau.controller');

// Middleware xác thực (nếu cần)
// const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho nhà thầu
// GET /api/nhathau - Lấy danh sách nhà thầu với thống kê
router.get('/', nhathauController.getDanhSachNhaThau);

// GET /api/nhathau/:nhaThauId - Lấy thông tin chi tiết nhà thầu
router.get('/:nhaThauId', nhathauController.getNhaThauDetail);

// PUT /api/nhathau/:nhaThauId - Cập nhật thông tin nhà thầu
router.put('/:nhaThauId', nhathauController.updateNhaThau);

// DELETE /api/nhathau/:nhaThauId - Xóa nhà thầu
router.delete('/:nhaThauId', nhathauController.deleteNhaThau);

module.exports = router; 