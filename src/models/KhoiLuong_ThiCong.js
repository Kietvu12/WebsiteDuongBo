'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class KhoiLuong_ThiCong extends Model {
    static associate(models) {
      // FK_KhoiLuong_GoiThau → GoiThau_ID tham chiếu bảng GoiThau
      KhoiLuong_ThiCong.belongsTo(models.GoiThau, {
        foreignKey: 'GoiThau_ID',
        as: 'goithau',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // FK_KhoiLuong_NhaThau → NhaThauID tham chiếu bảng NhaThau
      KhoiLuong_ThiCong.belongsTo(models.NhaThau, {
        foreignKey: 'NhaThauID',
        as: 'nhathau',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  KhoiLuong_ThiCong.init({
    KhoiLuong_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GoiThau_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    NhaThauID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TieuDe: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    NoiDung: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'KhoiLuong_ThiCong',
    tableName: 'KhoiLuong_ThiCong',
    timestamps: false,
    indexes: [
      {
        name: 'FK_KhoiLuong_GoiThau',
        fields: ['GoiThau_ID']
      },
      {
        name: 'FK_KhoiLuong_NhaThau',
        fields: ['NhaThauID']
      }
    ]
  });

  return KhoiLuong_ThiCong;
};
