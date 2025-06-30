const mongoose = require('mongoose');

const PhanQuyenSchema = new mongoose.Schema({
  TenQuyen: { type: String, required: true },
  MoTaQuyen: String
});

module.exports = mongoose.model('PhanQuyen', PhanQuyenSchema);
