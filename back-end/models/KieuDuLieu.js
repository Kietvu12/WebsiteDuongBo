module.exports = (sequelize, DataTypes) => {
    const KieuDuLieu = sequelize.define('KieuDuLieu', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của kiểu dữ liệu'
      },
      ten_kieu_du_lieu: {
        type: DataTypes.STRING(255),
        comment: 'Tên kiểu dữ liệu'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả kiểu dữ liệu'
      },
      ngay_tao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      ngay_cap_nhat: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'kieu_du_lieu',
      timestamps: false
    });
  
    return KieuDuLieu;
  };