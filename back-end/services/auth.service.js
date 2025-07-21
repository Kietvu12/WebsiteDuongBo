const bcrypt = require('bcrypt');
const { taikhoan, phanquyen, nhathau } = require('../models');
const { generateToken } = require('../config/jwt');

class AuthService {
  static async login(email, password) {
    // Tìm user bằng email, bao gồm thông tin PhanQuyen và NhaThau
    const user = await taikhoan.findOne({ 
      where: { Email: email },
      include: [
        { model: phanquyen, as: 'PhanQuyen', attributes: ['PhanQuyenID', 'TenQuyen'] },
        { model: nhathau, as: 'NhaThau', attributes: ['NhaThauID', 'TenNhaThau'] }
      ]
    });

    console.log('👉 [LOGIN] User từ DB:', user);

    if (!user) {
      throw new Error('Email không tồn tại');
    }
    
    console.log('Mật khẩu nhập:', password);
    console.log('Mật khẩu từ DB:', user.dataValues.MatKhau);
    
    // Kiểm tra mật khẩu (so sánh plain text)
    if (password !== user.MatKhau) {
      throw new Error('Mật khẩu không đúng');
    }

    // Kiểm tra tài khoản active

    // Tạo token với thông tin role và nhà thầu
    const token = generateToken({
      user_id: user.NguoiDungID,
      email: user.Email,
      ChucVu: user.ChucVu,
      role: {
        id: user.PhanQuyen ? user.PhanQuyen.PhanQuyenID : null,
        name: user.PhanQuyen ? user.PhanQuyen.TenQuyen : null
      },
      nhathau: {
        id: user.NhaThau ? user.NhaThau.NhaThauID : null,
        name: user.NhaThau ? user.NhaThau.TenNhaThau : null
      }
    });

    // Trả về user (loại bỏ MatKhau)
    const userJson = user.toJSON();
    delete userJson.MatKhau;

    return {
      user: userJson,
      token
    };
  }

  static async getProfile(userId) {
    const user = await taikhoan.findByPk(userId, {
      attributes: { exclude: ['MatKhau'] },
      include: [
        { model: phanquyen, as: 'PhanQuyen', attributes: ['PhanQuyenID', 'TenQuyen'] },
        { model: nhathau, as: 'NhaThau', attributes: ['NhaThauID', 'TenNhaThau'] }
      ]
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

    // Kiểm tra mật khẩu hiện tại (so sánh plain text)
    if (currentPassword !== user.MatKhau) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }

    // Lưu mật khẩu mới dưới dạng plain text (không khuyến khích)
    const [affectedRows] = await taikhoan.update(
      { MatKhau: newPassword },
      { where: { NguoiDungID: userId } }
    );
    
    if (affectedRows === 0) {
      throw new Error('Đổi mật khẩu thất bại');
    }
    
    return true;
  }
}

module.exports = AuthService;