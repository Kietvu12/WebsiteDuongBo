const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DuAn extends Model {
    static associate(models) {
      // Quan hệ cha – con (self reference)
      DuAn.belongsTo(models.DuAn, { as: 'Parent', foreignKey: 'ParentID' });
      DuAn.hasMany(models.DuAn, { as: 'Children', foreignKey: 'ParentID' });
    }
  }

  DuAn.init({
    DuAnID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenDuAn: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    TinhThanh: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ChuDauTu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    NgayKhoiCong: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    NguonVon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    TongChieuDai: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    KeHoachHoanThanh: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    MoTaChung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ParentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'DuAn',
    tableName: 'DuAn',
    timestamps: false,
    indexes: [
      {
        name: 'FK_DuAn_Parent',
        fields: ['ParentID'],
      }
    ]
  });

  return DuAn;
};
