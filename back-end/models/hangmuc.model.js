const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const hangmuc = sequelize.define('hangmuc', {
  HangMucID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  GoiThauID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'goithau',
      key: 'GoiThau_ID'
    }
  },
  TenHangMuc: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  LoaiHangMuc: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  TieuDeChiTiet: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  MayMocThietBi: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  NhanLucThiCong: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  ThoiGianHoanThanh: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hangmuc',
  timestamps: false
});

module.exports = hangmuc; 