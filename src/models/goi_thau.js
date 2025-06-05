const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class GoiThau extends Model {
        // Nếu cần định nghĩa quan hệ, thêm vào đây
        static associate(models) {
            GoiThau.belongsTo(models.DuAn, { foreignKey: 'DuAn_ID' });
            GoiThau.belongsTo(models.NhaThau, { foreignKey: 'NhaThauID' });
        }
    }

    GoiThau.init({
        GoiThau_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        TenGoiThau: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        DuAn_ID: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        GiaTriHĐ: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Km_BatDau: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        Km_KetThuc: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        ToaDo_BatDau_X: {
            type: DataTypes.DECIMAL(10, 6),
            allowNull: true
        },
        ToaDo_BatDau_Y: {
            type: DataTypes.DECIMAL(10, 6),
            allowNull: true
        },
        ToaDo_KetThuc_X: {
            type: DataTypes.DECIMAL(10, 6),
            allowNull: true
        },
        ToaDo_KetThuc_Y: {
            type: DataTypes.DECIMAL(10, 6),
            allowNull: true
        },
        NgayKhoiCong: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        NgayHoanThanh: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        TrangThai: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        NhaThauID: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'GoiThau',
        tableName: 'GoiThau',
        timestamps: false   
    });

    return GoiThau;
};
