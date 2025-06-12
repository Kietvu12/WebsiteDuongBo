module.exports = (sequelize, DataTypes) => {
    const HangMuc = sequelize.define('HangMuc', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của thuộc tính hạng mục'
      },
      id_goi_thau: {
        type: DataTypes.INTEGER,
        comment: 'ID của dự án liên kết với bảng goi_thau'
      },
      ten_hang_muc: {
        type: DataTypes.STRING(255),
        comment: 'Tên của hạng mục'
      },
      id_hang_muc_phan_loai: {
        type: DataTypes.INTEGER,
        comment: 'ID của loại hạng mục'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả chi tiết của hạng mục'
      },
      may_moc_thiet_bi: {
        type: DataTypes.TEXT
      },
      nhan_luc_thi_cong: {
        type: DataTypes.TEXT
      },
      ngay_bat_dau: {
        type: DataTypes.DATE
      },
      ngay_hoan_thanh: {
        type: DataTypes.DATE
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
      tableName: 'hang_muc',
      timestamps: false
    });
  
    HangMuc.associate = function(models) {
      HangMuc.belongsTo(models.GoiThau, { foreignKey: 'id_goi_thau', as: 'goi_thau' });
      HangMuc.belongsTo(models.HangMucPhanLoai, { foreignKey: 'id_hang_muc_phan_loai', as: 'phan_loai' });
      HangMuc.hasMany(models.KeHoach, { foreignKey: 'id_hang_muc', as: 'ke_hoach' });
    };
  
    return HangMuc;
  };