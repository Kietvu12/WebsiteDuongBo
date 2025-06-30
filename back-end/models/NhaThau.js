const mongoose = require('mongoose');

const NhaThauSchema = new mongoose.Schema({
  TenNhaThau: { type: String, required: true },
  Loai: String,
  MaSoThue: String,
  DiaChiTruSo: String,
  SoDienThoai: String,
  Email: String,
  NguoiDaiDien: String,
  ChucVuNguoiDaiDien: String,
  GiayPhepKinhDoanh: String,
  NgayCap: Date,
  NoiCap: String,
  GhiChu: String
});

module.exports = mongoose.model('NhaThau', NhaThauSchema);
