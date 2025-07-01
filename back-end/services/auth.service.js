const bcrypt = require('bcrypt');
const taikhoan = require('../models/taikhoan.model');
const { generateToken } = require('../config/jwt');

class AuthService {
  static async login(email, password) {
    // Tìm user bằng email
    const user = await taikhoan.findOne({ where: { email } });

    console.log('👉 [LOGIN] User từ DB:', user);

    if (!user) {
      throw new Error('Email không tồn tại');
    }
    console.log(password)
    console.log(user.dataValues.MatKhau);
    
    
    // Kiểm tra mật khẩu
    if (password != user.dataValues.MatKhau){
      throw new Error('Sai');
    }

    // Kiểm tra tài khoản active

    // Tạo token
    const token = generateToken({
      user_id: user.NguoiDungID,
      email: user.Email,
      ChucVu: user.ChucVu
    });

    // Trả về user (loại bỏ password_hash)
    const userJson = user.toJSON();
    delete userJson.password;

    return {
      user: userJson,
      token
    };
  }

  static async getProfile(userId) {
    const user = await taikhoan.findByPk(userId, {
      attributes: { exclude: ['MatKhau'] }
    });
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    return user;
  }
  static async updateProfile(userId, updateData) {
  // Loại bỏ các trường không được phép cập nhật
  const { MatKhau, ChucVu, NguoiDungID, ...allowedUpdates } = updateData;
  
  const [affectedRows] = await taikhoan.update(allowedUpdates, {
    where: { NguoiDungID: userId }
  });
  
  if (affectedRows === 0) {
    throw new Error('Cập nhật thông tin thất bại');
  }
  
  return await this.getProfile(userId);
}

static async changePassword(userId, currentPassword, newPassword) {
  const user = await taikhoan.findByPk(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  // Kiểm tra mật khẩu hiện tại
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Mật khẩu hiện tại không chính xác');
  }

  // Hash mật khẩu mới
  const newHash = await bcrypt.hash(newPassword, 10);
  
  const [affectedRows] = await taikhoan.update(
    { password: newHash },
    { where: { user_id: userId } }
  );
  
  if (affectedRows === 0) {
    throw new Error('Đổi mật khẩu thất bại');
  }
  
  return true;
}
}


module.exports = AuthService;