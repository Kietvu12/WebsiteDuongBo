module.exports = (sequelize, DataTypes) => {
    const DuAnTrangThai = sequelize.define('DuAnTrangThai', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_trang_thai: {
        type: DataTypes.STRING(100),
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
      }
    }, {
      tableName: 'du_an_trang_thai',
      timestamps: false
    });
  
    return DuAnTrangThai;
  };