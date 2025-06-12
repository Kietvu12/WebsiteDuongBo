module.exports = (sequelize, DataTypes) => {
    const ThongTinDong = sequelize.define('ThongTinDong', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Tên Id thuộc tính loại hình'
      },
      id_loai_hinh: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Id liên kết với loại hình'
      },
      ten_bien_dong_thuoc_tinh: {
        type: DataTypes.STRING(255),
        comment: 'Tên của thuộc tính biến động'
      },
      id_kieu_du_lieu: {
        type: DataTypes.INTEGER,
        comment: 'Tên của thuộc tính biến động'
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
      },
      don_vi_do_luong: {
        type: DataTypes.STRING(100),
        comment: 'Tỉnh/thành phố nơi thực hiện dự án'
      }
    }, {
      tableName: 'thong_tin_dong',
      timestamps: false
    });
  
    ThongTinDong.associate = function(models) {
      ThongTinDong.belongsTo(models.LoaiDuAn, { foreignKey: 'id_loai_hinh', as: 'loai_hinh' });
      ThongTinDong.belongsTo(models.KieuDuLieu, { foreignKey: 'id_kieu_du_lieu', as: 'kieu_du_lieu' });
    };
  
    return ThongTinDong;
  };