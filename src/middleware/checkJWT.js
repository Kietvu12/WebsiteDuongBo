// const db = require('../models');
// const TaiKhoan = db.TaiKhoan;

const {maHoaTokenHeaderload } = require('../middleware/maHoaJWT');

const checkJWT = async (req, res, next) =>{
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
        if(payload.exp < Date.now()){
            return res.status(401).json({
                message: "Token hết hạn",
                access: false,
            });
        }
        req.user = payload.user;
        req.payload = payload;
        next();
    }
    catch (error) {
        res.status(500).json({ 
            message: 'Lỗi server' ,
            error : error
        });
    }
}

module.exports ={
    checkJWT,
}