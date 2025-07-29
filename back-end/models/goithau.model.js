const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const goithau = sequelize.define('goithau', {
  GoiThau_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenGoiThau: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  DuAn_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'duan',
      key: 'DuAnID'
    }
  },
  GiaTriHĐ: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Km_BatDau: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Km_KetThuc: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ToaDo_BatDau_X: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  ToaDo_BatDau_Y: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  ToaDo_KetThuc_X: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  ToaDo_KetThuc_Y: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  NgayKhoiCong: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  NgayHoanThanh: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  NhaThauID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'nhathau',
      key: 'NhaThauID'
    }
  },
  PhanTramHoanThanh: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  PhanTramDangLam: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  PhanTramChamTienDo: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  PhanTramKeHoach: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  ThoiGianCapNhatGanNhat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  PathData: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'goithau',
  timestamps: false
});

module.exports = goithau; 