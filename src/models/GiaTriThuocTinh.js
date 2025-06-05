const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GiaTriThuocTinh extends Model {
    static associate(models) {
      // Mỗi giá trị thuộc tính thuộc về một thuộc tính loại hình
      GiaTriThuocTinh.belongsTo(models.ThuocTinhLoaiHinh, {
        foreignKey: 'ThuocTinh_ID',
        as: 'thuocTinh'
      });

      // Có thể thiết lập quan hệ ngược nếu cần
      // models.ThuocTinhLoaiHinh.hasMany(GiaTriThuocTinh, { foreignKey: 'ThuocTinh_ID' });
    }
  }

  GiaTriThuocTinh.init({
    GiaTri_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ThuocTinh_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DoiTuong_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    LoaiDoiTuong: {
      type: DataTypes.ENUM('duan', 'goithau'),
      allowNull: false
    },
    GiaTri: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'GiaTriThuocTinh',
    tableName: 'GiaTriThuocTinh',
    timestamps: false,
    indexes: [
      {
        name: 'idx_thuoctinh',
        fields: ['ThuocTinh_ID']
      },
      {
        name: 'idx_doituong',
        fields: ['DoiTuong_ID']
      },
      {
        name: 'idx_loaidoituong',
        fields: ['LoaiDoiTuong']
      }
    ]
  });

  return GiaTriThuocTinh;
};
