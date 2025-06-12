module.exports = (sequelize, DataTypes) => {
    const TinhThanh = sequelize.define('TinhThanh', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_tinh_thanh: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      nguoi_tao: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ngay_tao: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ngay_cap_nhat: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'tinh_thanh',
      timestamps: false
    });
  
    return TinhThanh;
  };