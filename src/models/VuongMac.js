const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VuongMac extends Model {
    static associate(models) {
      // FK: KeHoachID → QuanLy_KeHoach
      VuongMac.belongsTo(models.QuanLy_KeHoach, {
        foreignKey: 'KeHoachID',
        as: 'kehoach',
        onDelete: 'CASCADE',
      });
    }
  }

  VuongMac.init({
    VuongMacID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    KeHoachID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiVuongMac: {
      type: DataTypes.ENUM('GPMB', 'ThietBi', 'NhanLuc', 'VatTu', 'ThoiTiet'),
      allowNull: false,
    },
    MoTaChiTiet: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    NgayPhatSinh: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    NgayKetThuc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MucDo: {
      type: DataTypes.ENUM('Nho', 'TrungBinh', 'NghiemTrong'),
      allowNull: true,
      defaultValue: 'Nho',
    },
    BienPhapXuLy: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'VuongMac',
    tableName: 'VuongMac',
    timestamps: false,
  });

  return VuongMac;
};
