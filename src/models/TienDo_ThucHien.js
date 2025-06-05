const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TienDo_ThucHien extends Model {
    static associate(models) {
      // FK: KeHoachID → QuanLy_KeHoach
        TienDo_ThucHien.belongsTo(models.QuanLy_KeHoach, {
            foreignKey: 'KeHoachID',
            as: 'kehoach',
            onDelete: 'CASCADE',
        });
    }
  }

  TienDo_ThucHien.init({
    TienDoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    KeHoachID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: false
    },
    KhoiLuongThucHien: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    DonViTinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    MoTaVuongMac: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    GhiChu: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TienDo_ThucHien',
    tableName: 'TienDo_ThucHien',
    timestamps: false
  });

  return TienDo_ThucHien;
};
