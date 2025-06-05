const { auth } = require('@modelcontextprotocol/sdk/client/auth.js');
const db = require('../models');
const TaiKhoan = db.TaiKhoan;

const authUser = async (req, res, next) =>{
    const user = await TaiKhoan.findOne({ where: { TenDangNhap: req.user } });
    if(!user){
        return res.status(401).json({
            message: "Không có User này",
            access: false,
        });
    }
    next();
}
const getPhanQuyen = async(req, res) =>{
    return res.json({
        message: "get Phân quyền thành công",
        phanQuyen : req.payload.phanquyen,
    });
}
module.exports ={
    authUser,
    getPhanQuyen
}