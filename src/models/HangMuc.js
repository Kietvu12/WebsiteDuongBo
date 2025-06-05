const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class HangMuc extends Model {
    static associate(models) {
      // Mỗi Hạng Mục thuộc về một Gói Thầu
      HangMuc.belongsTo(models.GoiThau, { foreignKey: 'GoiThauID' });
    }
  }

  HangMuc.init({
    HangMucID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GoiThauID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TenHangMuc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    LoaiHangMuc: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    TieuDeChiTiet: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    MayMocThietBi: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    NhanLucThiCong: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    ThoiGianHoanThanh: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    GhiChu: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'HangMuc',
    tableName: 'HangMuc',
    timestamps: false,
    indexes: [
      {
        name: 'idx_GoiThauID',
        fields: ['GoiThauID']
      }
    ]
  });

  return HangMuc;
};
