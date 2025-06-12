module.exports = (sequelize, DataTypes) => {
    const LoaiDuAn = sequelize.define('LoaiDuAn', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'id của biến động'
      },
      ten_bien_dong: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên biến động của dự án hoặc gói thầu'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả của biến động'
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
      tableName: 'loai_du_an',
      timestamps: false
    });
  
    return LoaiDuAn;
  };