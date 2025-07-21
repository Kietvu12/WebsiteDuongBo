const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const taikhoan = sequelize.define('taikhoan', {
  NguoiDungID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenDangNhap: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  MatKhau: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  HoTen: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  SoDienThoai: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  ChucVu: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: true,
    defaultValue: 'user'
  },
  DonViCongTac: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  PhanQuyenID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'phanquyen',
      key: 'PhanQuyenID'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  TrangThai: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  NhaThauID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'nhathau',
      key: 'NhaThauID'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'taikhoan',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

// Define associations
taikhoan.associate = (models) => {
  taikhoan.belongsTo(models.nhathau, { foreignKey: 'NhaThauID', as: 'NhaThau' });
  taikhoan.belongsTo(models.phanquyen, { foreignKey: 'PhanQuyenID', as: 'PhanQuyen' });
};

module.exports = taikhoan;