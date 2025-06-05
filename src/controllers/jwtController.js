const db = require('../models');
const TaiKhoan = db.TaiKhoan;

const { maHoaLogin, maHoaTokenHeaderload } = require('../middleware/maHoaJWT');
const { Json } = require('sequelize/lib/utils');

const postLogin = async (req, res) =>{
    const { user, pass } = req.body;
    try {
        // 1. Tìm người dùng theo TenDangNhap
        const account = await TaiKhoan.findOne({
            where: {
                TenDangNhap: user,
                TrangThai: true
            }});

        if (!account) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc bị khóa' });
        }

        // 2. So sánh mật khẩu (ở đây là mật khẩu thô, bạn nên dùng bcrypt)
        if (account.MatKhau !== pass) {
            return res.status(401).json({ message: 'Sai mật khẩu' });
        }

        const token = maHoaLogin(account.TenDangNhap, account.PhanQuyenID);
        return res.status(200).json({
            message:"Success",
            token: token,
        });
    }
    catch (error) {
        res.status(500).json({ 
            message: 'Lỗi server' ,
            error : error
        });
    }
}
const checkJWTController = async (req, res, next) =>{
    const { token } = req.body;
    if(!token){
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    try {
        const[encoderHeader, encoderPayload, signature]  =token.split('.'); 
        if(token !== maHoaTokenHeaderload(encoderHeader, encoderPayload)){
            return res.status(401).json({
                message: "Mã Token không đúng",
                access: false,
            });
        }
        const payload = JSON.parse(atob(encoderPayload));
        const user = await TaiKhoan.findOne({ where: { TenDangNhap: payload.user } });
        if(!user){
            return res.status(401).json({
                message: "Không có User này",
                access: false,
            });
        }
        if(payload.exp < Date.now()){
            return res.status(401).json({
                message: "Token hết hạn",
                access: false,
            });
        }
        return res.json({
                    access: true
                });
        
    }
    catch (error) {
        res.status(500).json({ 
            message: 'Lỗi server' ,
            error : error
        });
    }
}

module.exports = {
    postLogin,
    checkJWTController,
}