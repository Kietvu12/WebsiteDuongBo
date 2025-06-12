module.exports = (sequelize, DataTypes) => {
    const DuAn = sequelize.define('DuAn', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID của dự án'
      },
      ten_du_an: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên của dự án'
      },
      id_nha_thau: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tên của chủ đầu tư dự án'
      },
      ngay_khoi_cong: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày khởi công dự án'
      },
      trang_thai_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID trạng thái dự án, liên kết với bảng du_an_trang_thai'
      },
      nguon_von: {
        type: DataTypes.DECIMAL(15, 6),
        allowNull: false,
        comment: 'Nguồn vốn, tính theo tỷ đồng'
      },
      ngan_sach: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên ngân sách'
      },
      tong_chieu_dai: {
        type: DataTypes.FLOAT(10, 3),
        allowNull: false,
        comment: 'Chiều dài tính theo km'
      },
      ngay_hoan_thanh_du_kien: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày hoàn thành dự kiến'
      },
      ngay_hoan_thanh_thuc_te: {
        type: DataTypes.DATEONLY,
        comment: 'Ngày hoàn thành thực tế'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả dự án'
      },
      ParentID: {
        type: DataTypes.INTEGER,
        comment: 'ID dự án cha, NULL nếu không có'
      },
      ngay_tao: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ngay_cap_nhat: {
        type: DataTypes.DATE,
        allowNull: false
      },
      id_tinh_thanh: {
        type: DataTypes.INTEGER,
        comment: 'Tỉnh/thành phố nơi thực hiện dự án'
      }
    }, {
      tableName: 'du_an',
      timestamps: false,
      comment: 'Bảng lưu trữ thông tin các dự án'
    });
  
    DuAn.associate = function(models) {
      DuAn.belongsTo(models.DuAnTrangThai, { foreignKey: 'trang_thai_id', as: 'trang_thai' });
      DuAn.belongsTo(models.NhaThau, { foreignKey: 'id_nha_thau', as: 'nha_thau' });
      DuAn.belongsTo(models.TinhThanh, { foreignKey: 'id_tinh_thanh', as: 'tinh_thanh' });
      DuAn.belongsTo(models.DuAn, { foreignKey: 'ParentID', as: 'parent' });
      DuAn.hasMany(models.DuAn, { foreignKey: 'ParentID', as: 'children' });
      DuAn.hasMany(models.DuAnThongTin, { foreignKey: 'id_du_an', as: 'thong_tin' });
      DuAn.hasMany(models.GoiThau, { foreignKey: 'id_du_an', as: 'goi_thau' });
    };
  
    return DuAn;
  };