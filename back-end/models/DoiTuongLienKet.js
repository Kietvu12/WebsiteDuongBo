module.exports = (sequelize, DataTypes) => {
    const DoiTuongLienKet = sequelize.define('DoiTuongLienKet', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ten_doi_tuong: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Tên đối tượng (du_an, goi_thau, vuong_mac...)'
      },
      ten_bang: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Tên bảng trong database'
      },
      mo_ta: {
        type: DataTypes.TEXT,
        comment: 'Mô tả đối tượng'
      }
    }, {
      tableName: 'doi_tuong_lien_ket',
      timestamps: false,
      comment: 'Danh mục các đối tượng có thể liên kết với tài liệu'
    });
  
    return DoiTuongLienKet;
  };