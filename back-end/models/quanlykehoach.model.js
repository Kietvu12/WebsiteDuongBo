const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const quanlykehoach = sequelize.define('quanlykehoach', {
  KeHoachID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  HangMucID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hangmuc',
      key: 'HangMucID'
    }
  },
  NhaThauID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'nhathau',
      key: 'NhaThauID'
    }
  },
  TenCongTac: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  KhoiLuongKeHoach: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  DonViTinh: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  NgayBatDau: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  NgayKetThuc: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'quanlykehoach',
  timestamps: false
});

module.exports = quanlykehoach; 