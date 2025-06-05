const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DoiTuongLoaiHinh extends Model {
    static associate(models) {
      DoiTuongLoaiHinh.belongsTo(models.LoaiHinh, {
        foreignKey: 'LoaiHinh_ID',
        as: 'LoaiHinh'
      });
    }
  }

  DoiTuongLoaiHinh.init({
    DoiTuong_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    LoaiDoiTuong: {
      type: DataTypes.ENUM('duan', 'goithau'),
      allowNull: false,
      primaryKey: true
    },
    LoaiHinh_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DoiTuongLoaiHinh',
    tableName: 'DoiTuongLoaiHinh',
    timestamps: false,
    indexes: [
      {
        name: 'IDX_LoaiHinh_ID',
        fields: ['LoaiHinh_ID']
      }
    ]
  });

  return DoiTuongLoaiHinh;
};
