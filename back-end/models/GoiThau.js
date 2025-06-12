module.exports = (sequelize, DataTypes) => {
    const GoiThau = sequelize.define('GoiThau', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của gói thầu'
      },
      ten_goi_thau: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên của gói thầu'
      },
      id_du_an: {
        type: DataTypes.INTEGER,
        comment: 'ID của dự án liên kết với bảng du_an'
      },
      gia_tri_hop_dong_ty_dong: {
        type: DataTypes.DECIMAL(15, 6),
        comment: 'Giá trị của hợp đồng tính theo tỷ đồng'
      },
      gia_tri_hop_dong_mo_ta: {
        type: DataTypes.DECIMAL(15, 6),
        comment: 'Mô tả giá trị hợp đồng'
      },
      diem_bat_dau_km: {
        type: DataTypes.DECIMAL(12, 3),
        comment: 'Điểm bắt đầu tính theo km'
      },
      diem_ket_thuc_km: {
        type: DataTypes.DECIMAL(12, 3),
        comment: 'Điểm kết thúc tính theo km'
      },
      file_toa_do: {
        type: DataTypes.STRING(255),
        comment: 'file lưu trữ thông tin tọa độ đường đi'
      },
      ngay_khoi_cong: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      ngay_hoan_thanh: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      id_trang_thai: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_nha_thau: {
        type: DataTypes.INTEGER,
        allowNull: false
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
      tableName: 'goi_thau',
      timestamps: false
    });
  
    GoiThau.associate = function(models) {
      GoiThau.belongsTo(models.DuAn, { foreignKey: 'id_du_an', as: 'du_an' });
      GoiThau.belongsTo(models.DuAnTrangThai, { foreignKey: 'id_trang_thai', as: 'trang_thai' });
      GoiThau.belongsTo(models.NhaThau, { foreignKey: 'id_nha_thau', as: 'nha_thau' });
      GoiThau.hasMany(models.GoiThauThongTin, { foreignKey: 'id_goi_thau', as: 'thong_tin' });
      GoiThau.hasMany(models.HangMuc, { foreignKey: 'id_goi_thau', as: 'hang_muc' });
      GoiThau.hasMany(models.GoiThauKhoiLuongThiCong, { foreignKey: 'id_goi_thau', as: 'khoi_luong_thi_cong' });
    };
  
    return GoiThau;
  };