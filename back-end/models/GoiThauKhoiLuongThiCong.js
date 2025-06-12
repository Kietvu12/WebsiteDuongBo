module.exports = (sequelize, DataTypes) => {
  const GoiThauKhoiLuongThiCong = sequelize.define('GoiThauKhoiLuongThiCong', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_goi_thau: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_nha_thau: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tieu_de: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ngay_tao: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ngay_cap_nhap: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'goi_thau_khoi_luong_thi_cong',
    timestamps: false
  });

  GoiThauKhoiLuongThiCong.associate = function(models) {
    GoiThauKhoiLuongThiCong.belongsTo(models.GoiThau, { foreignKey: 'id_goi_thau', as: 'goi_thau' });
    GoiThauKhoiLuongThiCong.belongsTo(models.NhaThau, { foreignKey: 'id_nha_thau', as: 'nha_thau' });
  };

  return GoiThauKhoiLuongThiCong;
};