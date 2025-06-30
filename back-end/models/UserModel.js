const mongoose = require('mongoose');

const TaiKhoanSchema = new mongoose.Schema({
  TenDangNhap: { type: String, required: true },
  MatKhau: { type: String, required: true },
  HoTen: String,
  Email: String,
  SoDienThoai: String,
  ChucVu: String,
  DonViCongTac: String,
  PhanQuyenID: { type: mongoose.Schema.Types.ObjectId, ref: 'PhanQuyen' }
});

module.exports = mongoose.model('TaiKhoan', TaiKhoanSchema);
