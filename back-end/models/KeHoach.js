module.exports = (sequelize, DataTypes) => {
    const KeHoach = sequelize.define('KeHoach', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của kế hoạch'
      },
      ten_ke_hoach: {
        type: DataTypes.STRING(255),
        comment: 'Tên của kế hoạch'
      },
      id_nha_thau: {
        type: DataTypes.INTEGER,
        comment: 'ID của kế hoạch liên kết với bảng nha_thau'
      },
      id_hang_muc: {
        type: DataTypes.INTEGER,
        comment: 'ID của loại hạng mục liên kết với bảng hang_muc'
      },
      khoi_luong_ke_hoach: {
        type: DataTypes.STRING(255),
        comment: 'Khối lượng cả kế hoạch'
      },
      don_vi_tinh: {
        type: DataTypes.STRING(50),
        comment: 'đơn vị của khối lượng'
      },
      ngay_bat_dau: {
        type: DataTypes.DATE
      },
      ngay_hoan_thanh: {
        type: DataTypes.DATE
      },
      mo_ta: {
        type: DataTypes.TEXT
      },
      nguoi_tao: {
        type: DataTypes.INTEGER
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
      tableName: 'ke_hoach',
      timestamps: false,
      comment: 'Bảng lưu trữ thông tin kế hoạch của nhà thầu với hạng mục'
    });
  
    KeHoach.associate = function(models) {
      KeHoach.belongsTo(models.NhaThau, { foreignKey: 'id_nha_thau', as: 'nha_thau' });
      KeHoach.belongsTo(models.HangMuc, { foreignKey: 'id_hang_muc', as: 'hang_muc' });
      KeHoach.hasMany(models.KeHoachTienDo, { foreignKey: 'id_ke_hoach', as: 'tien_do' });
      KeHoach.hasMany(models.KeHoachVuongMac, { foreignKey: 'id_ke_hoach', as: 'vuong_mac' });
    };
  
    return KeHoach;
  };