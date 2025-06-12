module.exports = (sequelize, DataTypes) => {
    const DuAnThongTin = sequelize.define('DuAnThongTin', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Tên Id thuộc tính của dự án'
      },
      id_bien_dong_thuoc_tinh: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Id liên kết với thuộc tính của biến động qua bảng bien_dong_thuoc_tinh'
      },
      id_du_an: {
        type: DataTypes.INTEGER,
        comment: 'ID của dự án liên kết với bảng du_an'
      },
      gia_tri: {
        type: DataTypes.TEXT,
        comment: 'Giá trị của thuộc tính'
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
      tableName: 'du_an_thong_tin',
      timestamps: false
    });
  
    DuAnThongTin.associate = function(models) {
      DuAnThongTin.belongsTo(models.ThongTinDong, { 
        foreignKey: 'id_bien_dong_thuoc_tinh', 
        as: 'bien_dong_thuoc_tinh' 
      });
      DuAnThongTin.belongsTo(models.DuAn, { 
        foreignKey: 'id_du_an', 
        as: 'du_an' 
      });
    };
  
    return DuAnThongTin;
  };