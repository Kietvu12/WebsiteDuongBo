
const getHomePage = (req, res) => {
  res.send('Hello World!')
}

/**
 * description: lấy danh sách dự án
 * @param {*} req :ID_du_an,   
 * @param {*} res:
 * author: 
 */

const getABC = (req, res) => {
    res.send('Hello abc')
}
const getABC1 = (req, res) =>{
  console.log(req.query);
  res.render('sample');
}
const postABC1 = (req, res) =>{
 console.log('Received body:', req.body); // debug

  if (!req.body) {
    return res.status(400).json({ error: 'Missing body in request' });
  }

  const { customerName, product, quantity } = req.body;

  res.json({
    message: 'Dữ liệu nhận thành công!',
    order: { customerName, product, quantity }
  });
}
module.exports = {
    getHomePage, 
    getABC,
    getABC1,
    postABC1
}