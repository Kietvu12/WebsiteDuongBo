const express = require('express');
const router = express.Router();
const duAnController = require('../controllers/DuAnController');

// Lấy tất cả dự án
router.get('/', duAnController.getAllDuAn);

// Lấy thông tin chi tiết 1 dự án
router.get('/:id', duAnController.getDuAnById);

// Lấy các dự án con của 1 dự án
router.get('/:id/children', duAnController.getChildrenDuAn);

module.exports = router;