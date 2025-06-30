const validateUpdateProfile = (req, res, next) => {
  const { username, email } = req.body;
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email không hợp lệ' });
  }
  
  if (username && username.length < 3) {
    return res.status(400).json({ error: 'Username phải có ít nhất 3 ký tự' });
  }
  
  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }
  
  next();
};

module.exports = {
  validateUpdateProfile,
  validateChangePassword
};