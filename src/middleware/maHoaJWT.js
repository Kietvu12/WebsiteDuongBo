const crypto = require('crypto')
const {base64url} = require('./helper')

const time_exp = 3600000;  // thoi gian het han
const jwtSecret = process.env.jwtSecret;

function maHoaLogin(TenDangNhap,PhanQuyenID ){
    

    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    const payload = {
        "user": TenDangNhap, //ten_dn
        "phanquyen": PhanQuyenID,
        "exp" : Date.now() + time_exp
    };
    // Ma hoa base64 header and payload
    const encoderHeader = base64url(JSON.stringify(header));
    const encoderPayload = base64url(JSON.stringify(payload))

    //Tao tokenData <header>.<payload>
    const tokenData = `${encoderHeader}.${encoderPayload}`;

    //Tao chu ki
    const hmac = crypto.createHmac("sha256", jwtSecret);
    const signature = hmac.update(tokenData).digest("base64url");

    return `${tokenData}.${signature}`;
}

function maHoaTokenHeaderload(encoderHeader, encoderPayload){

    // Ma hoa base64 header and payload

    //Tao tokenData <header>.<payload>
    const tokenData = `${encoderHeader}.${encoderPayload}`;

    //Tao chu ki
    const hmac = crypto.createHmac("sha256", jwtSecret);
    const signature = hmac.update(tokenData).digest("base64url");

    return `${tokenData}.${signature}`;
}
module.exports = {
    maHoaLogin, 
    maHoaTokenHeaderload
}