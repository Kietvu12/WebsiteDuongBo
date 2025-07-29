const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const tiendothuchien = sequelize.define('tiendothuchien', {
  TienDoID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  KeHoachID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quanlykehoach',
      key: 'KeHoachID'
    }
  },
  NgayCapNhat: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  KhoiLuongThucHien: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  DonViTinh: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  MoTaVuongMac: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'tiendothuchien',
  timestamps: false
});

module.exports = tiendothuchien; 