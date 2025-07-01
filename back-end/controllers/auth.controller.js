const AuthService = require('../services/auth.service');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email và mật khẩu' });
      }

      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.user_id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  static async updateProfile(req, res) {
  try {
    const userId = req.user.user_id;
    const updateData = req.body;
    
    const updatedUser = await AuthService.updateProfile(userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

static async changePassword(req, res) {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đủ thông tin' });
    }
    
    await AuthService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
}


module.exports = AuthController;