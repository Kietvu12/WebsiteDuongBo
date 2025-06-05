const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuanLy_KeHoach extends Model {
    static associate(models) {
      // FK: HangMucID → HangMuc
      QuanLy_KeHoach.belongsTo(models.HangMuc, {
        foreignKey: 'HangMucID',
        as: 'hangmuc',
        onDelete: 'CASCADE',
      });

      // FK: NhaThauID → NhaThau
      QuanLy_KeHoach.belongsTo(models.NhaThau, {
        foreignKey: 'NhaThauID',
        as: 'nhathau',
        onDelete: 'CASCADE',
      });

      // FK: KeHoachID ← TienDo_ThucHien
      QuanLy_KeHoach.hasMany(models.TienDo_ThucHien, {
        foreignKey: 'KeHoachID',
        as: 'tiendo',
        onDelete: 'CASCADE',
      });
    }
  }

  QuanLy_KeHoach.init({
    KeHoachID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    HangMucID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    NhaThauID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TenCongTac: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    KhoiLuongKeHoach: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    DonViTinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    NgayBatDau: {
      type: DataTypes.DATE,
      allowNull: true
    },
    NgayKetThuc: {
      type: DataTypes.DATE,
      allowNull: true
    },
    GhiChu: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'QuanLy_KeHoach',
    tableName: 'QuanLy_KeHoach',
    timestamps: false
  });

  return QuanLy_KeHoach;
};
