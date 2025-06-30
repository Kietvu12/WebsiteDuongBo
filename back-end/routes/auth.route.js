const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { 
  validateUpdateProfile,
  validateChangePassword
} = require('../middlewares/validation.middleware');
// Đăng nhập
router.post('/login', AuthController.login);

// Lấy thông tin profile (yêu cầu xác thực)
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', 
  authenticate, 
  validateUpdateProfile,
  AuthController.updateProfile
);
router.put('/change-password', 
  authenticate, 
  validateChangePassword,
  AuthController.changePassword
);

module.exports = router;