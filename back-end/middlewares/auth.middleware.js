const { verifyToken } = require('../config/jwt');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('AUTH HEADER:', authHeader); // 👈 dòng này
    console.log('TOKEN:', token); // 👈 dòng này
    
    if (!token) {
      return res.status(401).json({ error: 'Token không được cung cấp' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

module.exports = {
  authenticate
};