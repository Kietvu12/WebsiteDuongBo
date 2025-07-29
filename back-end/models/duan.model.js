const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const duan = sequelize.define('duan', {
  DuAnID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenDuAn: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  TinhThanh: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ChuDauTu: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  NgayKhoiCong: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  NguonVon: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  TongChieuDai: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  KeHoachHoanThanh: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  MoTaChung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ParentID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'duan',
      key: 'DuAnID'
    }
  },
  PhanTramHoanThanh: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  PhanTramChamTienDo: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  PhanTramKeHoach: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  ThoiGianCapNhatGanNhat: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'duan',
  timestamps: false
});

module.exports = duan; 