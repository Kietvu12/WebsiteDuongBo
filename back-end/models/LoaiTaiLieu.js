module.exports = (sequelize, DataTypes) => {
    const LoaiTaiLieu = sequelize.define('LoaiTaiLieu', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_loai: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên loại tài liệu (Hồ sơ, Bản vẽ, Hợp đồng...)'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả chi tiết loại tài liệu'
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
      tableName: 'loai_tai_lieu',
      timestamps: false,
      comment: 'Danh mục loại tài liệu'
    });
  
    return LoaiTaiLieu;
  };