const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class goithau_nhathau extends Model {
    static associate(models) {
      // Khai báo quan hệ nếu cần
      // models.GoiThau.belongsToMany(models.NhaThau, { through: goithau_nhathau, foreignKey: 'GoiThau_ID' });
      // models.NhaThau.belongsToMany(models.GoiThau, { through: goithau_nhathau, foreignKey: 'NhaThauID' });
    }
  }

  goithau_nhathau.init({
    GoiThau_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    NhaThauID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    VaiTro: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Liên danh'
    }
  }, {
    sequelize,
    modelName: 'Goithau_nhathau', // <<< Sửa chỗ này (viết hoa chữ cái đầu)
    tableName: 'goithau_nhathau',
    timestamps: false,

    indexes: [
      {
        name: 'idx_nhathau_id',
        fields: ['NhaThauID']
      }
    ]
  });

  return goithau_nhathau;
};
