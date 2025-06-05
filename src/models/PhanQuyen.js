module.exports = (sequelize, DataTypes) => {
  class PhanQuyen extends sequelize.Sequelize.Model {
    static associate(models) {
      // Một phân quyền có thể được gán cho nhiều tài khoản
      PhanQuyen.hasMany(models.TaiKhoan, {
        foreignKey: 'PhanQuyenID',
        as: 'TaiKhoans'
      });
    }
  }

  PhanQuyen.init({
    PhanQuyenID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TenQuyen: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    MoTaQuyen: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PhanQuyen',
    tableName: 'phanquyen',
    timestamps: false
  });

  return PhanQuyen;
};
