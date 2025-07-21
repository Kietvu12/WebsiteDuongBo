const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const phanquyen = sequelize.define('phanquyen', {
  PhanQuyenID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenQuyen: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  MoTaQuyen: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'phanquyen',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

// Define associations
phanquyen.associate = (models) => {
  phanquyen.hasMany(models.taikhoan, { foreignKey: 'PhanQuyenID', as: 'TaiKhoans' });
};

module.exports = phanquyen;