module.exports = (sequelize, DataTypes) => {
    const VaiTro = sequelize.define('VaiTro', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của vai trò nhà thầu với gói thầu'
      },
      ten_vai_tro: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên vai trò (Nhà thầu chính, phụ...)'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả vai trò'
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
      tableName: 'vai_tro',
      timestamps: false
    });
  
    return VaiTro;
  };