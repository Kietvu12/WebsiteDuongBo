module.exports = (sequelize, DataTypes) => {
    const TaiLieu = sequelize.define('TaiLieu', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_tai_lieu: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên tài liệu'
      },
      id_loai_tai_lieu: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Loại tài liệu'
      },
      duong_dan: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Đường dẫn lưu trữ'
      },
      dung_luong: {
        type: DataTypes.STRING(20),
        comment: 'Dung lượng file'
      },
      duoi_file: {
        type: DataTypes.STRING(10),
        comment: 'Đuôi file (pdf, docx...)'
      },
      id_doi_tuong_lien_ket: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Loại đối tượng liên kết'
      },
      id_doi_tuong: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của đối tượng liên kết'
      },
      nguoi_tao: {
        type: DataTypes.INTEGER,
        comment: 'Người tải lên'
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
      tableName: 'tai_lieu',
      timestamps: false,
      comment: 'Bảng quản lý tài liệu hệ thống'
    });
  
    TaiLieu.associate = function(models) {
      TaiLieu.belongsTo(models.LoaiTaiLieu, { foreignKey: 'id_loai_tai_lieu', as: 'loai_tai_lieu' });
      TaiLieu.belongsTo(models.DoiTuongLienKet, { foreignKey: 'id_doi_tuong_lien_ket', as: 'doi_tuong_lien_ket' });
    };
  
    return TaiLieu;
  };