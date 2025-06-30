const mongoose = require('mongoose');

const QuanLyKeHoachSchema = new mongoose.Schema({
  HangMucID: { type: mongoose.Schema.Types.ObjectId, ref: 'HangMuc', required: true },
  NhaThauID: { type: mongoose.Schema.Types.ObjectId, ref: 'NhaThau', required: true },
  TenCongTac: { type: String, required: true },
  KhoiLuongKeHoach: Number,
  DonViTinh: String,
  NgayBatDau: Date,
  NgayKetThuc: Date,
  GhiChu: String
});

module.exports = mongoose.model('QuanLyKeHoach', QuanLyKeHoachSchema);
