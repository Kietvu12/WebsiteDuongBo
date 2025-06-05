const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaiKhoan extends Model {
    static associate(models) {
      // Quan hệ: Tài khoản thuộc về một phân quyền
      TaiKhoan.belongsTo(models.PhanQuyen, {
        foreignKey: 'PhanQuyenID',
        as: 'phanquyen' // Alias để gọi khi include
      });
    }
  }

  TaiKhoan.init({
    NguoiDungID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TenDangNhap: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    MatKhau: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    HoTen: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    SoDienThoai: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ChucVu: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    DonViCongTac: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PhanQuyenID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TrangThai: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TaiKhoan',
    tableName: 'taikhoan',
    timestamps: false
  });

  return TaiKhoan;
};
