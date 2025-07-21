const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const nhathau = sequelize.define('nhathau', {
  NhaThauID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenNhaThau: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Loai: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  MaSoThue: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  DiaChiTruSo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  SoDienThoai: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  NguoiDaiDien: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ChucVuNguoiDaiDien: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  GiayPhepKinhDoanh: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  NgayCap: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  NoiCap: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'nhathau',
  timestamps: false
});

// Define associations
nhathau.associate = (models) => {
  nhathau.hasMany(models.taikhoan, { foreignKey: 'NhaThauID', as: 'TaiKhoans' });
};

module.exports = nhathau;