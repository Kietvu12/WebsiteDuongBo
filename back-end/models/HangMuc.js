const mongoose = require('mongoose');

const HangMucSchema = new mongoose.Schema({
  TenHangMuc: { type: String, required: true },
  LoaiHangMuc: String,
  TieuDeChiTiet: String,
  TuKm: String,
  DenKm: String,
  TinhTrang: String,
  ThoiGianHoanThanh: Date,
  GoiThauID: { type: mongoose.Schema.Types.ObjectId, ref: 'GoiThau', required: true },
  GhiChu: String
});

module.exports = mongoose.model('HangMuc', HangMucSchema);
