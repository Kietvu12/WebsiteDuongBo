const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LoaiHinh extends Model {
    static associate(models) {
      LoaiHinh.hasMany(models.ThuocTinhLoaiHinh, {
        foreignKey: 'LoaiHinh_ID',
        as: 'ThuocTinhs'
      });
    }
  }

  LoaiHinh.init({
    LoaiHinh_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TenLoaiHinh: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    MoTa: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'LoaiHinh',
    tableName: 'LoaiHinh',
    timestamps: false
  });

  return LoaiHinh;
};
