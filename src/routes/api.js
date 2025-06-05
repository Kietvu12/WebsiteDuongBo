const express = require('express')
const{getHomePage, getABC, getABC1, postABC1} = require('../controllers/homeController')
const{postLogin, checkJWTController} = require('../controllers/jwtController')
const {checkJWT} = require('../middleware/checkJWT')
const {authUser, getPhanQuyen} = require('../middleware/basicAuth')
const router = express.Router();
const DuAnController = require('../controllers/duAnController');
router.get('/', getHomePage)
const GoiThauController = require('../controllers/GoiThauController');
const HangMucController = require('../controllers/HangMucController');
const Goithau_nhathauController = require('../controllers/goiThau_nhathauController'); 
const khoiluong_thicongController = require('../controllers/KhoiLuong_ThiCongController');
const nhaThauController = require('../controllers/NhaThauController');
const KeHoachController = require('../controllers/QuanLy_KeHoachController');
const TienDoController = require('../controllers/TienDo_ThucHienController');
const VuongMacController = require('../controllers/VuongMacController');
const DoiTuongController = require('../controllers/DoiTuongLoaiHinhController');
const LoaiHinhController = require('../controllers/LoaiHinhController');
const ThuocTinhLoaiHinhController = require('../controllers/ThuocTinhLoaiHinhController');
const ThuocTinhGiaTriController = require('../controllers/Thuoc_Tinh_Gia_TriController')

////////////////////Xử lý đăng nhập ////////////////
router.post('/auth/login', postLogin)
router.post('/auth/logout', postLogin)
router.post('/checkJWT', checkJWTController)
router.post('/getPhanQuyen', checkJWT, authUser, getPhanQuyen)

////////////////////Dự án ////////////////
router.post('/du_an/add', DuAnController.create);
router.get('/du_an/index', DuAnController.getAll);
router.post('/du_an/update', DuAnController.update);
router.post('/du_an/delete', DuAnController.delete);



// ////////////////////Gói thầu ////////////////
router.post('/goithau/add', GoiThauController.create);
router.get('/goithau/index', GoiThauController.getAll);
router.post('/goithau/update', GoiThauController.update);
router.post('/goithau/delete', GoiThauController.delete);


// ////////////////////Hạng mục ////////////////

router.post('/hangmuc/add', HangMucController.create);
router.get('/hangmuc/index', HangMucController.getAll);
router.post('/hangmuc/update', HangMucController.update);
router.post('/hangmuc/delete', HangMucController.delete);

////////////////////Gói thầu_nhà thầu ////////////////
router.post('/goithau_nhathau/add', Goithau_nhathauController.create);
router.get('/goithau_nhathau/index', Goithau_nhathauController.getAll);
router.post('/goithau_nhathau/update', Goithau_nhathauController.update);
router.post('/goithau_nhathau/delete', Goithau_nhathauController.delete);

//////////////////// Khối lương thi công////////////////
router.post('/khoiluong_thicong/add', khoiluong_thicongController.create);
router.get('/khoiluong_thicong/index', khoiluong_thicongController.getAll);
router.post('/khoiluong_thicong/update', khoiluong_thicongController.update);
router.post('/khoiluong_thicong/delete', khoiluong_thicongController.delete);


//////////////////// nhà thầu////////////////
router.post('/nhathau/add', nhaThauController.create);
router.get('/nhathau/index', nhaThauController.getAll);
router.post('/nhathau/update', nhaThauController.update);
router.post('/nhathau/delete', nhaThauController.delete);


//////////////////// Quản lý kế hoạch////////////////
router.post('/kehoach/add', KeHoachController.create);
router.get('/kehoach/index', KeHoachController.getAll);
router.post('/kehoach/update', KeHoachController.update);
router.post('/kehoach/delete', KeHoachController.delete);


//////////////////// Tiến độ thực hiện////////////////
router.post('/tiendo/add', TienDoController.create);
router.get('/tiendo/index', TienDoController.getAll);
router.post('/tiendo/update', TienDoController.update);
router.post('/tiendo/delete', TienDoController.delete);


//////////////////// Vướng mắc////////////////
router.post('/vuongmac/add', VuongMacController.create);
router.get('/vuongmac/index', VuongMacController.getAll);
router.post('/vuongmac/update', VuongMacController.update);
router.post('/vuongmac/delete', VuongMacController.delete);

//////////////////// Đối tượng loại hình////////////////
router.post('/doi_tuong/add', DoiTuongController.create);
router.get('/doi_tuong/index', DoiTuongController.getAll);
router.post('/doi_tuong/update', DoiTuongController.update);
router.post('/doi_tuong/delete', DoiTuongController.delete);

//////////////////// Loại hình////////////////
router.post('/loai_hinh/add', LoaiHinhController.create);
router.get('/loai_hinh/index', LoaiHinhController.getAll);
router.post('/loai_hinh/update', LoaiHinhController.update);
router.post('/loai_hinh/delete', LoaiHinhController.delete);

//////////////////// Thuộc tính loại hình////////////////
router.post('/thuoc_tinh_loai_hinh/add', ThuocTinhLoaiHinhController.create);
router.get('/thuoc_tinh_loai_hinh/index', ThuocTinhLoaiHinhController.getAll);
router.post('/thuoc_tinh_loai_hinh/update', ThuocTinhLoaiHinhController.update);
router.post('/thuoc_tinh_loai_hinh/delete', ThuocTinhLoaiHinhController.delete);

//////////////////// Thuộc tính giá trị////////////////
router.get('/thuoc_tinh_gia_tri/full/:loaiDoiTuong/:doiTuongId', ThuocTinhGiaTriController.getFullInfo);

module.exports = router;

