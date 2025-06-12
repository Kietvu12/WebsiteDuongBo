module.exports = (sequelize, DataTypes) => {
    const VaiTroGoiThauNhaThau = sequelize.define('VaiTroGoiThauNhaThau', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của gói thầu'
      },
      id_goi_thau: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của gói thầu liên kết với bảng goi_thau'
      },
      id_nha_thau: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của nha liên kết với bảng du_an'
      },
      id_vai_tro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của nha liên kết với bảng vai_tro'
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
      tableName: 'vai_tro_goi_thau_nha_thau',
      timestamps: false
    });
  
    VaiTroGoiThauNhaThau.associate = function(models) {
      VaiTroGoiThauNhaThau.belongsTo(models.GoiThau, { foreignKey: 'id_goi_thau', as: 'goi_thau' });
      VaiTroGoiThauNhaThau.belongsTo(models.NhaThau, { foreignKey: 'id_nha_thau', as: 'nha_thau' });
      VaiTroGoiThauNhaThau.belongsTo(models.VaiTro, { foreignKey: 'id_vai_tro', as: 'vai_tro' });
    };
  
    return VaiTroGoiThauNhaThau;
  };