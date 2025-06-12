module.exports = (sequelize, DataTypes) => {
    const NhaThau = sequelize.define('NhaThau', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Id của nhà thầu'
      },
      ten_nha_thau: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Tên nhà thầu'
      },
      ma_so_thue: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Mã số thuế của nhà thầu'
      },
      dia_chi_tru_so: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        comment: 'Địa chỉ trụ sở của nhà thầu'
      },
      so_dien_thoai: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Số điện thoại liên hệ của nhà thầu'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Email liên hệ của nhà thầu'
      },
      ten_nguoi_dai_dien: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên người đại diện của nhà thầu'
      },
      chuc_vu_nguoi_dai_dien: {
        type: DataTypes.STRING(100),
        comment: 'Chức vụ đại diện của nhà thầu'
      },
      giay_phep_hoat_dong: {
        type: DataTypes.STRING(255),
        comment: 'Giấy phép hoạt động'
      },
      ngay_cap: {
        type: DataTypes.DATEONLY,
        comment: 'Ngày cấp giấy phép hoạt động'
      },
      noi_cap: {
        type: DataTypes.STRING(100),
        comment: 'Nơi cấp giấy phép hoạt động'
      },
      ghi_chu: {
        type: DataTypes.TEXT,
        comment: 'Ghi chú'
      },
      nguoi_tao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Người tạo'
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
      tableName: 'nha_thau',
      timestamps: false,
      comment: 'Lưu trữ thông tin về nhà thầu'
    });
  
    return NhaThau;
  };