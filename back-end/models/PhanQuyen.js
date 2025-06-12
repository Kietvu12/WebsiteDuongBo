module.exports = (sequelize, DataTypes) => {
    const PhanQuyen = sequelize.define('PhanQuyen', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_quyen: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      mo_ta: {
        type: DataTypes.TEXT
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
      tableName: 'phan_quyen',
      timestamps: false
    });
  
    return PhanQuyen;
  };