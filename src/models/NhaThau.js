const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NhaThau extends Model {
    static associate(models) {
      // Associations sẽ khai báo tại đây nếu cần
      NhaThau.hasMany(models.GoiThau_NhaThau, { foreignKey: 'NhaThauID' });
      NhaThau.hasMany(models.KhoiLuong_ThiCong, { foreignKey: 'NhaThauID' });
    }
  }

  NhaThau.init({
    NhaThauID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TenNhaThau: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Loai: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    MaSoThue: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    DiaChiTruSo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    SoDienThoai: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    NguoiDaiDien: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ChucVuNguoiDaiDien: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    GiayPhepKinhDoanh: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    NgayCap: {
      type: DataTypes.DATE,
      allowNull: true
    },
    NoiCap: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    GhiChu: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NhaThau',
    tableName: 'NhaThau',
    timestamps: false
  });

  return NhaThau;
};
