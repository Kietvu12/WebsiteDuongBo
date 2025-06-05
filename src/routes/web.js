const express = require('express')
const{getHomePage, getABC, getABC1, postABC1} = require('../controllers/homeController')
const{postLogin, checkJWTController} = require('../controllers/jwtController')
const {checkJWT} = require('../middleware/checkJWT')
const {authUser, getPhanQuyen} = require('../middleware/basicAuth')
const router = express.Router();
const duAnController = require('../controllers/duAnController');
router.get('/', getHomePage)

router.get('/abc', getABC)
router.get('/abc1', getABC1)
router.post('/abc1', postABC1)

router.get('/getduan',duAnController.getAllDuAn)


////////////////////Xử lý đăng nhập ////////////////
router.post('/auth/login', postLogin)
router.post('/auth/logout', postLogin)
router.post('/checkJWT', checkJWTController)
router.post('/getPhanQuyen', checkJWT, authUser, getPhanQuyen)

////////////////////Dự án ////////////////
router.get('/du_an/index', postLogin)
router.post('/du_an/add', postLogin)
router.post('/du_an/update', postLogin)
router.post('/du_an/delete', postLogin)



////////////////////Gói thầu ////////////////
router.get('/du_an/index', postLogin)
router.post('/du_an/add', postLogin)
router.post('/du_an/update', postLogin)
router.post('/du_an/delete', postLogin)

module.exports = router