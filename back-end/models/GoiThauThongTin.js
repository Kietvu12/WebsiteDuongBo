module.exports = (sequelize, DataTypes) => {
    const GoiThauThongTin = sequelize.define('GoiThauThongTin', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của thuộc tính gói thầu'
      },
      id_bien_dong_thuoc_tinh: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Id của biến động thuộc tính'
      },
      id_goi_thau: {
        type: DataTypes.INTEGER,
        comment: 'ID của dự án liên kết với bảng goi_thau'
      },
      gia_tri: {
        type: DataTypes.STRING(100),
        comment: 'Giá trị của hợp đồng tính theo tỷ đồng'
      },
      nguoi_tao: {
        type: DataTypes.INTEGER
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
      tableName: 'goi_thau_thong_tin',
      timestamps: false
    });
  
    GoiThauThongTin.associate = function(models) {
      GoiThauThongTin.belongsTo(models.ThongTinDong, { 
        foreignKey: 'id_bien_dong_thuoc_tinh', 
        as: 'bien_dong_thuoc_tinh' 
      });
      GoiThauThongTin.belongsTo(models.GoiThau, { 
        foreignKey: 'id_goi_thau', 
        as: 'goi_thau' 
      });
    };
  
    return GoiThauThongTin;
  };