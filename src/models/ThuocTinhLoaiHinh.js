const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ThuocTinhLoaiHinh extends Model {
    static associate(models) {
      ThuocTinhLoaiHinh.belongsTo(models.LoaiHinh, {
        foreignKey: 'LoaiHinh_ID',
        as: 'LoaiHinh'
      });

      ThuocTinhLoaiHinh.hasMany(models.GiaTriThuocTinh, {
        foreignKey: 'ThuocTinh_ID',
        as: 'GiaTriThuocTinhs'
      });
    }
  }

  ThuocTinhLoaiHinh.init({
    ThuocTinh_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    LoaiHinh_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TenThuocTinh: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    KieuDuLieu: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'varchar'
    },
    DonVi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    BatBuoc: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ThuocTinhLoaiHinh',
    tableName: 'ThuocTinhLoaiHinh',
    timestamps: false,
    indexes: [
      {
        name: 'IDX_LoaiHinh_ID',
        fields: ['LoaiHinh_ID']
      }
    ]
  });

  return ThuocTinhLoaiHinh;
};
