const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const goithau_nhathau = sequelize.define('goithau_nhathau', {
  GoiThau_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'goithau',
      key: 'GoiThau_ID'
    }
  },
  NhaThauID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'nhathau',
      key: 'NhaThauID'
    }
  },
  VaiTro: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Liên danh'
  }
}, {
  tableName: 'goithau_nhathau',
  timestamps: false
});

module.exports = goithau_nhathau; 