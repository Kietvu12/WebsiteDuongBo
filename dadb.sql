-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: dadb
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `doituongloaihinh`
--

DROP TABLE IF EXISTS `doituongloaihinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doituongloaihinh` (
  `DoiTuong_ID` int NOT NULL,
  `LoaiDoiTuong` enum('duan','goithau') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `LoaiHinh_ID` int NOT NULL,
  PRIMARY KEY (`DoiTuong_ID`,`LoaiDoiTuong`),
  KEY `LoaiHinh_ID` (`LoaiHinh_ID`),
  CONSTRAINT `doituongloaihinh_ibfk_1` FOREIGN KEY (`LoaiHinh_ID`) REFERENCES `loaihinh` (`LoaiHinh_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doituongloaihinh`
--

LOCK TABLES `doituongloaihinh` WRITE;
/*!40000 ALTER TABLE `doituongloaihinh` DISABLE KEYS */;
INSERT INTO `doituongloaihinh` VALUES (0,'duan',1),(3,'goithau',1),(12,'goithau',1),(13,'goithau',1),(14,'goithau',1),(15,'goithau',1),(46,'goithau',1),(101,'duan',1),(105,'duan',1),(106,'duan',1),(107,'duan',1),(108,'duan',1),(109,'duan',1),(111,'duan',1),(113,'duan',1),(114,'duan',1),(115,'duan',1),(116,'duan',1),(117,'duan',1),(118,'duan',1),(119,'duan',1),(120,'duan',1),(122,'duan',1),(123,'duan',1),(124,'duan',1),(125,'duan',1),(126,'duan',1),(127,'duan',1),(132,'duan',1),(138,'duan',1),(4,'goithau',2),(19,'goithau',2),(21,'goithau',2),(29,'duan',2),(121,'duan',2),(128,'duan',2),(129,'duan',2),(130,'duan',2),(131,'duan',2),(189,'duan',4),(233,'duan',4),(16,'goithau',5),(17,'goithau',5),(18,'goithau',5),(20,'goithau',5),(22,'goithau',5),(23,'goithau',5),(24,'goithau',5),(25,'goithau',5),(26,'goithau',5),(27,'goithau',5),(28,'goithau',5),(29,'goithau',5),(30,'goithau',5),(31,'goithau',5),(32,'goithau',5),(33,'goithau',5),(34,'goithau',5),(35,'goithau',5),(36,'goithau',5),(39,'goithau',5),(40,'goithau',5),(41,'goithau',5),(42,'goithau',5),(43,'goithau',5),(44,'goithau',5),(69,'goithau',5),(70,'goithau',5),(139,'duan',5),(140,'duan',5),(141,'duan',5),(142,'duan',5),(143,'duan',5),(144,'duan',5),(145,'duan',5),(146,'duan',5),(147,'duan',5),(148,'duan',5),(149,'duan',5),(150,'duan',5),(151,'duan',5),(152,'duan',5),(153,'duan',5),(154,'duan',5),(155,'duan',5),(156,'duan',5),(157,'duan',5),(158,'duan',5),(159,'duan',5),(160,'duan',5),(161,'duan',5),(162,'duan',5),(163,'duan',5),(164,'duan',5),(165,'duan',5),(166,'duan',5),(167,'duan',5),(168,'duan',5),(169,'duan',5),(170,'duan',5),(171,'duan',5),(172,'duan',5),(173,'duan',5),(174,'duan',5),(175,'duan',5),(176,'duan',5),(177,'duan',5),(178,'duan',5),(179,'duan',5),(180,'duan',5),(181,'duan',5),(182,'duan',5),(183,'duan',5),(184,'duan',5),(185,'duan',5),(186,'duan',5),(187,'duan',5),(188,'duan',5),(190,'duan',5),(191,'duan',5),(192,'duan',5),(193,'duan',5),(194,'duan',5),(195,'duan',5),(196,'duan',5),(197,'duan',5),(198,'duan',5),(199,'duan',5),(200,'duan',5),(201,'duan',5),(202,'duan',5),(203,'duan',5),(204,'duan',5),(205,'duan',5),(206,'duan',5),(207,'duan',5),(208,'duan',5),(209,'duan',5),(210,'duan',5),(211,'duan',5),(212,'duan',5),(213,'duan',5),(214,'duan',5),(215,'duan',5),(216,'duan',5),(217,'duan',5),(218,'duan',5),(219,'duan',5),(220,'duan',5),(221,'duan',5),(222,'duan',5),(223,'duan',5),(224,'duan',5),(225,'duan',5),(226,'duan',5),(227,'duan',5),(228,'duan',5),(229,'duan',5),(230,'duan',5),(231,'duan',5),(232,'duan',5),(234,'duan',5),(235,'duan',5),(236,'duan',5),(237,'duan',5),(238,'duan',5);
/*!40000 ALTER TABLE `doituongloaihinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `duan`
--

DROP TABLE IF EXISTS `duan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `duan` (
  `DuAnID` int NOT NULL AUTO_INCREMENT,
  `TenDuAn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TinhThanh` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ChuDauTu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NgayKhoiCong` date DEFAULT NULL,
  `TrangThai` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NguonVon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TongChieuDai` float DEFAULT NULL,
  `KeHoachHoanThanh` date DEFAULT NULL,
  `MoTaChung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ParentID` int DEFAULT NULL COMMENT 'NULL nếu là dự án tổng, nếu là dự án thành phần thì tham chiếu đến dự án tổng',
  `PhanTramHoanThanh` decimal(5,2) DEFAULT '0.00' COMMENT 'Phần trăm hoàn thành dự án',
  `PhanTramChamTienDo` decimal(5,2) DEFAULT '0.00' COMMENT 'Phần trăm chậm tiến độ so với kế hoạch',
  `PhanTramKeHoach` decimal(5,2) DEFAULT '0.00' COMMENT 'Phần trăm kế hoạch đã đặt ra',
  `ThoiGianCapNhatGanNhat` datetime DEFAULT NULL,
  PRIMARY KEY (`DuAnID`),
  KEY `FK_DuAn_Parent` (`ParentID`),
  CONSTRAINT `FK_DuAn_Parent` FOREIGN KEY (`ParentID`) REFERENCES `duan` (`DuAnID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=239 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `duan`
--

LOCK TABLES `duan` WRITE;
/*!40000 ALTER TABLE `duan` DISABLE KEYS */;
INSERT INTO `duan` VALUES (192,'Dự án XDCT đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025','Tỉnh Hà Tĩnh','11','2021-01-01','Đang thi công','Ngân sách',721.2,'2025-12-31',NULL,NULL,95.03,4.97,100.00,'2025-08-11 03:12:59'),(194,'Dự án đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2017 - 2020','Tỉnh Hà Giang','6','2017-12-21','Đang thi công','Ngân sách',654,'2025-09-11',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(195,'Dự án đường Hồ Chí Minh','Tỉnh Cao Bằng','6','2023-06-25','Đang chuẩn bị','Ngân sách',1234,'2025-10-22',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(196,'Dự án đường Hồ Chí Minh đoạn Chợ Chu - ngã Ba Trung Sơn ','Tỉnh Thái Nguyên','6','2023-12-07','Đang chuẩn bị','Ngân sách',600,'2025-08-13',NULL,195,0.00,0.00,100.00,'2025-08-11 03:12:59'),(197,'Dự án đường Hồ Chí Minh đoạn Rạch Sỏi - Bến Nhất, Gò Quao - Vĩnh Thuận','Tỉnh Kiên Giang','6','2023-08-26','Hoàn thành','Ngân sách',634,'2025-06-15',NULL,195,0.00,0.00,100.00,'2025-08-11 03:12:59'),(198,'Dự án đầu tư xây dựng cầu Ninh Cường vượt sông Ninh Cơ trên quốc lộ 37B ','Tỉnh Nam Định','4','2025-07-02','Đang chuẩn bị','nuoc_ngoai',1.65,'2027-08-12',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(199,'Dự án tuyến tránh TP Cao Bằng, tỉnh Cao Bằng','Tỉnh Cao Bằng','3','2024-05-07','Hoàn thành','Ngân sách',126,'2025-06-15',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(200,'Dự án QL.6 tuyến tránh TP Hòa Bình, tỉnh Hòa Bình','Tỉnh Hoà Bình','25','2024-01-12','Hoàn thành','Ngân sách',172,'2025-06-18',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(201,'Dự án kết nối giao thông các tỉnh miền núi phía Bắc ','Tỉnh Hà Giang','23','2025-01-09','Đang thi công','hop_tac',162,'2026-06-20',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(202,'Dự án đầu tư xây dựng cầu Phong Châu mới - Quốc lộ 32C, tỉnh Phú Thọ theo Lệnh xây dựng công trình khẩn cấp','Tỉnh Phú Thọ','27','2024-03-15','Đang thi công','Ngân sách',162,'2025-12-24',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(203,'Dự án QL.4B đoạn Km18 - Km80, tỉnh Lạng Sơn ','Tỉnh Lạng Sơn','5','2023-01-01','Hoàn thành','Ngân sách',127,'2025-06-22',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(204,'Dự án cải tạo, mở rộng QL.2 đoạn Vĩnh Yên - Việt Trì, tỉnh Vĩnh Phúc ','Tỉnh Vĩnh Phúc',NULL,'2024-05-10','Hoàn thành','Ngân sách',182,'2025-06-18',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(205,'Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cao Bồ - Mai Sơn ','Tỉnh Ninh Bình','24','2025-06-02','Đang thi công','Ngân sách',142,'2027-11-21',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(206,'Dự án đầu tư tuyến nối cao tốc Nội Bài - Lào Cai với cao tốc Tuyên Quang - Phú Thọ ','Thành phố Hà Nội','26','2025-02-28','Đang thi công','Ngân sách',365,'2025-12-31',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(207,'Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cam Lộ - La Sơn','Tỉnh Quảng Trị','8','2025-03-21','Đang thi công','Ngân sách',252,'2027-11-09',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(208,'Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn La Sơn - Hòa Liên ',NULL,NULL,'2025-03-31','Đang thi công','Ngân sách',182,'2027-07-07',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(209,'Dự án đường cao tốc đoạn Hòa Liên - Túy Loan ','Thành phố Đà Nẵng','12','2024-07-17','Đang thi công','Ngân sách',261,'2025-12-11',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(210,'Dự án QL.7 đoạn Km0-Km36 và xử lý sụt trượt do bão lũ đoạn Khe Thơi - Nậm Cắn, tỉnh Nghệ An ','Tỉnh Nghệ An','2','2024-05-09','Đang thi công','Ngân sách',125,'2025-12-12',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(211,'Dự án QL.8C đoạn từ Thiên Cầm - QL.1 và đoạn từ QL.8 - đường HCM ','Tỉnh Hà Tĩnh','10','2024-07-09','Đang thi công','Ngân sách',142,'2025-10-10',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(212,'Dự án đường tránh phía Đông TP Đông Hà, tỉnh Quảng Trị','Tỉnh Quảng Trị','12','2024-02-14','Đang thi công','Ngân sách',111,'2025-11-22',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(214,'Dự án QL.14B, TP Đà Nẵng ','Thành phố Đà Nẵng','22','2024-05-15','Đang chuẩn bị','Ngân sách',162,'2025-06-15',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(215,'Dự án QL.14E đoạn Km15+270 - Km89+700, tỉnh Quảng Nam','Tỉnh Quảng Nam','17','2024-02-16','Đang thi công','Ngân sách',123,'2025-12-27',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(216,'Dự án QL.28B, tỉnh Bình Thuận và tỉnh Lâm Đồng ','Tỉnh Lâm Đồng','27','2024-07-19','Đang thi công','Ngân sách',152,'2025-12-17',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(217,'Dự án nâng cấp đoạn tuyến qua đèo Mimosa và một số công trình trên QL.20, tỉnh Lâm Đồng','Tỉnh Lâm Đồng','24','2024-03-14','Đang thi công','Ngân sách',166,'2025-12-19',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(218,'Dự án tuyến tránh phía Đông TP Buôn Ma Thuột ','Tỉnh Đắk Lắk','12','2024-04-09','Hoàn thành','Ngân sách',122,'2025-06-07',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(219,'Dự án nâng cấp, mở rộng một số cầu, hầm trên quốc lộ 1 (các cầu Xương Giang, Gianh, Quán Hàu và hầm Đèo Ngang) ','Tỉnh Hà Tĩnh','19','2025-01-08','Đang thi công','Ngân sách',152,'2027-04-14',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(220,'Dự án QL.46 đoạn TP.Vinh - TT.Nam Đàn ','Tỉnh Nghệ An','8','2025-03-15','Đang thi công','Ngân sách',154,'2027-02-10',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(221,'Dự án Tân Vạn - Nhơn Trạch giai đoạn 1 ','Tỉnh Đồng Nai','8','2023-10-06','Đang thi công','nuoc_ngoai',152,'2025-09-19',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(222,'DATP 1 thuộc Dự án Tân Vạn - Nhơn Trạch giai đoạn 1 ','Tỉnh Đồng Nai','8','2023-10-13','Đang thi công','nuoc_ngoai',55.34,'2025-09-03',NULL,221,0.00,0.00,100.00,'2025-08-11 03:12:59'),(223,'Dự án cầu Đại Ngãi trên QL.60, tỉnh Trà Vinh và Sóc Trăng ','Tỉnh Trà Vinh','23','2025-04-01','Đang thi công','Ngân sách',143,'2027-07-23',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(224,'Dự án cầu Rạch Miễu 2 ','Tỉnh Tiền Giang','10','2024-02-14','Đang thi công','Ngân sách',152,'2025-12-11',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(225,'Dự án QL.30 đoạn Cao Lãnh - Hồng Ngự, tỉnh Đồng Tháp, giai đoạn 3 ','Tỉnh Đồng Tháp','5','2024-06-21','Đang thi công','Ngân sách',162,'2025-09-20',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(227,'Dự án cao tốc Bến Lức - Long Thành ','Tỉnh Long An','24','2024-02-16','Đang thi công','Ngân sách',251,'2025-09-05',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(228,'Dự án nâng cao tĩnh không các cầu đường bộ, đường sắt cắt qua tuyến ĐTNĐ quốc gia - giai đoạn 1  (Khu vực phía Nam) ','Thành phố Hồ Chí Minh','24','2024-01-10','Đang thi công','Ngân sách',162,'2025-12-19',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(229,'Dự án QL.12A ','Tỉnh Quảng Bình','24','2023-12-15','Hoàn thành','Ngân sách',152,'2025-06-12',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(230,'DATP 1 đoạn tránh TX Ba Đồn ','Tỉnh Quảng Bình','4','2023-12-14','Hoàn thành','Ngân sách',111,'2025-06-06',NULL,229,0.00,0.00,100.00,'2025-08-11 03:12:59'),(231,'Dự án cao tốc Biên Hòa - Vũng Tàu ','Tỉnh Bà Rịa - Vũng Tàu','25','2024-03-15','Đang thi công','Ngân sách',155,'2025-12-20',NULL,NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(232,'DATP 2 thuộc cao tốc Biên Hòa - Vũng Tàu ','Tỉnh Bà Rịa - Vũng Tàu','5','2024-06-05','Đang thi công','Ngân sách',162,'2025-12-18',NULL,231,0.00,0.00,100.00,'2025-08-11 03:12:59'),(233,'111','Thành phố Hà Nội - Thành phố Huế','4','2025-06-13','Hoàn thành','Tự nguyện',111,'2025-06-20','11111',NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(234,'Dự án thành phần đoạn Vũng Áng - Bùng thuộc Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025','Hà Tĩnh, Quảng Bình','Ban Quản lý dự án 6','2023-01-01','dang_chuan_bi','ngan_sach',55.34,'2025-06-30','Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025, tổng chiều dài 55,34 km, đi qua tỉnh Hà Tĩnh và Quảng Bình, tổng mức đầu tư 12.548 tỷ đồng, khởi công ngày 01/01/2023, dự kiến hoàn thành ngày 30/06/2025.',NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(235,'Dự án thành phần đoạn Vũng Áng - Bùng thuộc Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025','Hà Tĩnh, Quảng Bình','Ban Quản lý dự án 6','2023-01-01','dang_chuan_bi','ngan_sach',55.34,'2025-06-30','Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025, đoạn Vũng Áng - Bùng, tổng chiều dài 55,34 km, đi qua tỉnh Hà Tĩnh và Quảng Bình, tổng mức đầu tư 12.548 tỷ đồng, khởi công ngày 01/01/2023, dự kiến hoàn thành ngày 30/06/2025.',NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(236,'Dự án thành phần đoạn Vũng Áng - Bùng thuộc Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025','Hà Tĩnh, Quảng Bình','11','2023-01-01','Đang chuẩn bị','Ngân sách',55.34,'2025-06-30','Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông với tổng chiều dài 55,34 km, đi qua các tỉnh Hà Tĩnh và Quảng Bình. Tổng mức đầu tư 12.548 tỷ đồng. Các hạng mục thi công gồm phần đường, nút giao liên thông, phần cầu và phần hầm trên tuyến chính.',NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(237,'Dự án thành phần đoạn Vũng Áng - Bùng thuộc Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025','Hà Tĩnh, Quảng Bình','4','2023-01-01','Đang chuẩn bị','Ngân sách',55.34,'2025-06-30','Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025, đoạn Vũng Áng - Bùng, tổng chiều dài 55,34 km qua địa bàn tỉnh Hà Tĩnh và Quảng Bình, với tổng mức đầu tư 12.548 tỷ đồng.',NULL,0.00,0.00,100.00,'2025-08-11 03:12:59'),(238,'Dự án thành phần đoạn Vũng Áng - Bùng thuộc Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025','Hà Tĩnh, Quảng Bình','6','2023-01-01','Đang chuẩn bị','Ngân sách',55.34,'2025-06-30','Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025, đoạn Vũng Áng - Bùng, tổng chiều dài 55,34 km, đi qua tỉnh Hà Tĩnh và Quảng Bình, tổng mức đầu tư 12.548 tỷ đồng, khởi công ngày 01/01/2023, kế hoạch hoàn thành ngày 30/06/2025.',192,95.03,4.97,100.00,'2025-08-11 03:12:59');
/*!40000 ALTER TABLE `duan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giatrithuoctinh`
--

DROP TABLE IF EXISTS `giatrithuoctinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giatrithuoctinh` (
  `GiaTri_ID` int NOT NULL AUTO_INCREMENT,
  `ThuocTinh_ID` int NOT NULL,
  `DoiTuong_ID` int NOT NULL,
  `LoaiDoiTuong` enum('duan','goithau') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `GiaTri` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`GiaTri_ID`),
  KEY `ThuocTinh_ID` (`ThuocTinh_ID`),
  KEY `DoiTuong_Loai` (`DoiTuong_ID`,`LoaiDoiTuong`),
  CONSTRAINT `giatrithuoctinh_ibfk_1` FOREIGN KEY (`ThuocTinh_ID`) REFERENCES `thuoctinhloaihinh` (`ThuocTinh_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giatrithuoctinh`
--

LOCK TABLES `giatrithuoctinh` WRITE;
/*!40000 ALTER TABLE `giatrithuoctinh` DISABLE KEYS */;
INSERT INTO `giatrithuoctinh` VALUES (1,1,0,'duan','Mũi khoan kim cương'),(2,2,0,'duan','15.5'),(3,3,0,'duan','30'),(4,4,29,'duan','1200'),(5,5,29,'duan','5'),(6,6,29,'duan','Bê tông cốt thép'),(7,1,3,'goithau','Mũi khoan thép'),(8,2,3,'goithau','10.2'),(9,3,3,'goithau','25'),(10,4,4,'goithau','800'),(11,5,4,'goithau','3'),(12,6,4,'goithau','Gạch và bê tông'),(13,7,0,'duan','5000000'),(14,8,0,'duan','5000000'),(15,9,0,'duan','1000000000'),(16,1,101,'duan','1111'),(17,2,101,'duan','111'),(18,3,101,'duan','111'),(19,7,101,'duan','111'),(23,1,105,'duan','121'),(24,2,105,'duan','1212'),(25,3,105,'duan','12122'),(26,1,106,'duan','12'),(27,2,106,'duan','121'),(28,3,106,'duan','121'),(29,1,107,'duan','12'),(30,2,107,'duan','121'),(31,3,107,'duan','121'),(32,1,108,'duan','1111'),(33,2,108,'duan','1111'),(34,3,108,'duan','111'),(35,1,109,'duan','1111'),(36,2,109,'duan','1111'),(37,3,109,'duan','111'),(38,1,110,'duan','111'),(41,1,111,'duan','1111'),(42,2,111,'duan','111'),(43,3,111,'duan','1111'),(47,1,113,'duan','1111'),(48,2,113,'duan','111'),(49,3,113,'duan','1111'),(50,1,114,'duan','1111'),(51,2,114,'duan','111'),(52,3,114,'duan','1111'),(53,1,115,'duan','1111'),(54,2,115,'duan','111'),(55,3,115,'duan','1111'),(56,1,116,'duan','1111'),(57,2,116,'duan','111'),(58,3,116,'duan','1111'),(59,1,118,'duan','111'),(60,2,118,'duan','111'),(61,3,118,'duan','1111'),(62,1,119,'duan','131231'),(63,2,119,'duan','13123'),(64,3,119,'duan','1312313'),(65,1,120,'duan','111'),(66,2,120,'duan','111'),(67,3,120,'duan','1111'),(68,4,121,'duan','1111'),(69,5,121,'duan','1111'),(70,6,121,'duan','1111'),(71,1,122,'duan','113123121'),(72,2,122,'duan','13123213'),(73,3,122,'duan','13123'),(74,1,123,'duan','121'),(75,2,123,'duan','1212'),(76,3,123,'duan','21212'),(77,1,124,'duan','1123'),(78,2,124,'duan','1231312'),(79,3,124,'duan','1312313123'),(80,1,125,'duan','21212'),(81,2,125,'duan','11212'),(82,3,125,'duan','21212'),(83,1,126,'duan','12122'),(84,2,126,'duan','1121'),(85,3,126,'duan','21222'),(86,1,12,'goithau','212'),(87,2,12,'goithau','12121'),(88,3,12,'goithau','212'),(89,1,127,'duan','1122'),(90,2,127,'duan','12121'),(91,3,127,'duan','1212'),(92,4,128,'duan','1112'),(93,5,128,'duan','21211'),(94,6,128,'duan','112121'),(95,4,129,'duan','21212'),(96,5,129,'duan','121212'),(97,6,129,'duan','2122'),(98,4,130,'duan','1111'),(99,5,130,'duan','111'),(100,6,130,'duan','111'),(101,4,131,'duan','122'),(102,5,131,'duan','21211'),(103,6,131,'duan','121212'),(104,1,132,'duan','13112'),(105,2,132,'duan','13123131'),(106,3,132,'duan','132131'),(107,7,132,'duan','31231'),(108,1,138,'duan','2121'),(109,2,138,'duan','1212'),(110,3,138,'duan','121221'),(113,4,140,'duan','12332'),(114,5,140,'duan','12333'),(115,6,140,'duan','313231'),(137,23,189,'duan','1123133'),(140,23,233,'duan','111'),(154,46,237,'duan','55,34'),(155,47,237,'duan','12.548'),(156,48,237,'duan','33'),(157,49,237,'duan','37'),(158,46,238,'duan','55,34'),(159,47,238,'duan','12.548'),(160,48,238,'duan','33'),(161,49,238,'duan','37');
/*!40000 ALTER TABLE `giatrithuoctinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goithau`
--

DROP TABLE IF EXISTS `goithau`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goithau` (
  `GoiThau_ID` int NOT NULL AUTO_INCREMENT,
  `TenGoiThau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DuAn_ID` int DEFAULT NULL,
  `GiaTriHĐ` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Km_BatDau` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Km_KetThuc` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ToaDo_BatDau_X` decimal(10,6) DEFAULT NULL,
  `ToaDo_BatDau_Y` decimal(10,6) DEFAULT NULL,
  `ToaDo_KetThuc_X` decimal(10,6) DEFAULT NULL,
  `ToaDo_KetThuc_Y` decimal(10,6) DEFAULT NULL,
  `NgayKhoiCong` date DEFAULT NULL,
  `NgayHoanThanh` date DEFAULT NULL,
  `TrangThai` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NhaThauID` int DEFAULT NULL,
  `PhanTramHoanThanh` float DEFAULT '0',
  `PhanTramDangLam` float DEFAULT '0',
  `PhanTramChamTienDo` float DEFAULT '0',
  `PhanTramKeHoach` float DEFAULT '0',
  `ThoiGianCapNhatGanNhat` datetime DEFAULT NULL,
  `PathData` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Đường dẫn đến file KML',
  PRIMARY KEY (`GoiThau_ID`),
  KEY `DuAn_ID` (`DuAn_ID`),
  KEY `FK_GoiThau_NhaThau` (`NhaThauID`),
  CONSTRAINT `FK_GoiThau_NhaThau` FOREIGN KEY (`NhaThauID`) REFERENCES `nhathau` (`NhaThauID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `goithau_ibfk_1` FOREIGN KEY (`DuAn_ID`) REFERENCES `duan` (`DuAnID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goithau`
--

LOCK TABLES `goithau` WRITE;
/*!40000 ALTER TABLE `goithau` DISABLE KEYS */;
INSERT INTO `goithau` VALUES (39,'Gói thầu CW1',222,NULL,'300+20','400+20',106.827200,10.911800,106.888600,10.669900,'2023-11-09','2025-09-04','dang_thi_cong',23,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(40,'Gói thầu CW2',222,NULL,'300+20','400+20',106.827200,10.911800,106.888600,10.669900,'2023-11-08','2025-09-12','dang_thi_cong',8,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(41,'Gói thầu số 11-XL ',223,NULL,'300+20','400+20',106.334600,9.951300,105.973900,9.602500,'2025-01-03','2027-08-13','dang_thi_cong',15,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(42,'Gói thầu 15-XL',223,NULL,'','',106.334600,9.951300,105.973900,9.602500,'2025-02-27','2027-07-25','dang_thi_cong',17,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(43,'Gói thầu J3-1',227,NULL,'','',106.493600,10.631600,106.944700,10.778300,'2024-01-10','2025-09-12','dang_thi_cong',17,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(44,'Gói thầu XL11',201,NULL,'','',103.470300,22.386200,103.914400,21.326900,'2025-03-05','2026-06-19','dang_thi_cong',25,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(46,'aaa',194,NULL,'212','212',212.000000,2121.000000,211.000000,212.000000,'2025-07-17','2025-07-23','Hoàn thành',6,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59',NULL),(69,'Gói thầu XL01 (Km568+200 - Km600+700)',238,NULL,'568+200','600+700',105.892380,18.342070,106.716040,17.204520,'2023-02-22','2025-12-08','Đang thi công',21,0.84,94.19,0,4.97,'2025-08-11 03:12:59','/Uploads/GOITHAU/69/1754473910797-18817342.kml'),(70,'Gói thầu XL02 (Km600+700 - Km624+228,79)',238,NULL,'600+700','624+228,79',106.716040,17.204520,107.356670,16.507650,'2023-01-01','2025-10-17','Đang thi công',26,NULL,NULL,NULL,NULL,'2025-08-11 03:12:59','/Uploads/GOITHAU/70/1754474297882-276975335.kml');
/*!40000 ALTER TABLE `goithau` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goithau_nhathau`
--

DROP TABLE IF EXISTS `goithau_nhathau`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goithau_nhathau` (
  `GoiThau_ID` int NOT NULL,
  `NhaThauID` int NOT NULL,
  `VaiTro` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Liên danh',
  `ParentId` int DEFAULT NULL,
  PRIMARY KEY (`GoiThau_ID`,`NhaThauID`),
  KEY `NhaThauID` (`NhaThauID`),
  KEY `idx_parentid` (`ParentId`),
  CONSTRAINT `fk_nhathau_parent` FOREIGN KEY (`ParentId`) REFERENCES `nhathau` (`NhaThauID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `goithau_nhathau_ibfk_1` FOREIGN KEY (`GoiThau_ID`) REFERENCES `goithau` (`GoiThau_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `goithau_nhathau_ibfk_2` FOREIGN KEY (`NhaThauID`) REFERENCES `nhathau` (`NhaThauID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goithau_nhathau`
--

LOCK TABLES `goithau_nhathau` WRITE;
/*!40000 ALTER TABLE `goithau_nhathau` DISABLE KEYS */;
INSERT INTO `goithau_nhathau` VALUES (39,23,'Nhà thầu chính',NULL),(40,8,'Nhà thầu chính',NULL),(41,15,'Nhà thầu chính',NULL),(42,17,'Nhà thầu chính',NULL),(43,17,'Nhà thầu chính',NULL),(44,25,'Nhà thầu chính',NULL),(46,6,'Nhà thầu chính',NULL),(69,3,'Nhà thầu chính',NULL),(69,4,'Nhà thầu phụ',3),(69,21,'Nhà thầu chính',NULL),(69,23,'Nhà thầu chính',NULL),(69,24,'Nhà thầu chính',NULL),(69,25,'Nhà thầu chính',NULL),(70,24,'Nhà thầu phụ',26),(70,26,'Nhà thầu chính',NULL),(70,27,'Nhà thầu chính',NULL);
/*!40000 ALTER TABLE `goithau_nhathau` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hangmuc`
--

DROP TABLE IF EXISTS `hangmuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hangmuc` (
  `GoiThauID` int DEFAULT NULL,
  `HangMucID` int NOT NULL AUTO_INCREMENT,
  `TenHangMuc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LoaiHangMuc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TieuDeChiTiet` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MayMocThietBi` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NhanLucThiCong` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ThoiGianHoanThanh` date DEFAULT NULL,
  `GhiChu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`HangMucID`),
  KEY `GoiThauID` (`GoiThauID`),
  CONSTRAINT `hangmuc_ibfk_1` FOREIGN KEY (`GoiThauID`) REFERENCES `goithau` (`GoiThau_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hangmuc`
--

LOCK TABLES `hangmuc` WRITE;
/*!40000 ALTER TABLE `hangmuc` DISABLE KEYS */;
INSERT INTO `hangmuc` VALUES (69,52,'Phần đường',NULL,NULL,NULL,NULL,NULL,NULL),(69,53,'Cấp phối đá dăm',NULL,NULL,NULL,NULL,NULL,NULL),(69,54,'ATGT',NULL,NULL,NULL,NULL,NULL,NULL),(69,55,'Phần cống, HCDS',NULL,NULL,NULL,NULL,NULL,NULL),(69,56,'Hầm chui dân sinh',NULL,NULL,NULL,NULL,NULL,NULL),(69,57,'Phần cầu',NULL,NULL,NULL,NULL,NULL,NULL),(69,58,'Hầm Đèo Bụt',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `hangmuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khoiluong_thicong`
--

DROP TABLE IF EXISTS `khoiluong_thicong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khoiluong_thicong` (
  `KhoiLuong_ID` int NOT NULL AUTO_INCREMENT,
  `GoiThau_ID` int NOT NULL COMMENT 'Tham chiếu đến bảng goithau',
  `NhaThauID` int NOT NULL COMMENT 'Tham chiếu đến bảng nhathau',
  `TieuDe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `NoiDung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`KhoiLuong_ID`),
  KEY `FK_KhoiLuong_GoiThau` (`GoiThau_ID`),
  KEY `FK_KhoiLuong_NhaThau` (`NhaThauID`),
  CONSTRAINT `FK_KhoiLuong_GoiThau` FOREIGN KEY (`GoiThau_ID`) REFERENCES `goithau` (`GoiThau_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_KhoiLuong_NhaThau` FOREIGN KEY (`NhaThauID`) REFERENCES `nhathau` (`NhaThauID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khoiluong_thicong`
--

LOCK TABLES `khoiluong_thicong` WRITE;
/*!40000 ALTER TABLE `khoiluong_thicong` DISABLE KEYS */;
/*!40000 ALTER TABLE `khoiluong_thicong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loaihinh`
--

DROP TABLE IF EXISTS `loaihinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loaihinh` (
  `LoaiHinh_ID` int NOT NULL AUTO_INCREMENT,
  `TenLoaiHinh` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`LoaiHinh_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loaihinh`
--

LOCK TABLES `loaihinh` WRITE;
/*!40000 ALTER TABLE `loaihinh` DISABLE KEYS */;
INSERT INTO `loaihinh` VALUES (1,'Khoan','Các dự án/gói thầu liên quan đến khoan'),(2,'Xây dựng','Các dự án/gói thầu liên quan đến xây dựng công trình'),(3,'Khách sạn 5 sao','Các khách sạn tiêu chuẩn 5 sao quốc tế'),(4,'Khách sạn 5 sao','Các khách sạn tiêu chuẩn 5 sao quốc tế'),(5,'Đường bộ',NULL);
/*!40000 ALTER TABLE `loaihinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhathau`
--

DROP TABLE IF EXISTS `nhathau`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhathau` (
  `NhaThauID` int NOT NULL AUTO_INCREMENT,
  `TenNhaThau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Loai` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MaSoThue` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DiaChiTruSo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SoDienThoai` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NguoiDaiDien` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ChucVuNguoiDaiDien` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `GiayPhepKinhDoanh` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NgayCap` date DEFAULT NULL,
  `NoiCap` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `GhiChu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`NhaThauID`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhathau`
--

LOCK TABLES `nhathau` WRITE;
/*!40000 ALTER TABLE `nhathau` DISABLE KEYS */;
INSERT INTO `nhathau` VALUES (1,'Liên danh Công ty Cổ phần Đầu tư và xây dựng giao ...','Nhà thầu chính','0101511949','D3 Nơ 15, Khu Đô thị mới Định Công, Phường Định Công',NULL,NULL,'PHẠM VĂN KHÔI','Giám đốc',NULL,NULL,NULL,NULL),(2,'Liên danh Công ty TNHH Tập đoàn Sơn Hải - Tổng côn...','Nhà thầu chính','3100196175','Số 117, Hữu Nghị, Phường Nam Lý, Thành phố Đồng Hới',NULL,NULL,'NGUYỄN THANH HẢI','Giám đốc',NULL,NULL,NULL,NULL),(3,'CÔNG TY CỔ PHẦN VINACONEX','Nhà thầu chính','0303156197','47 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP HCM',NULL,NULL,'PHẠM VĂN NGỌ','Giám đốc',NULL,NULL,NULL,NULL),(4,'CÔNG TY CỔ PHẦN THIẾT BỊ VÀ XÂY LẮP CƠ ĐIỆN VIMECO','Nhà thầu phụ','0108929277','Lotus L2.07 Goldsilk 430 Cầu Am, Phường Vạn Phúc, Quận Hà Đông, Thành phố Hà Nội, Việt Nam',NULL,NULL,'NGUYỄN VĂN HƯNG','Giám đốc',NULL,NULL,NULL,NULL),(5,'Công ty CP tập đoàn Đông Dương','Nhà thầu chính','5702127567','Số nhà 21, Đường Hữu Nghị, Phường Trần Phú, Thành phố Móng Cái, Tỉnh Quảng Ninh',NULL,NULL,'Vũ Văn Long',NULL,NULL,NULL,NULL,NULL),(6,'Công ty 439','Nhà thầu phụ','2901138399','Số 10, đường Phạm Huy, Phường Quán Bàu, Thành phố Vinh, Tỉnh Nghệ An',NULL,NULL,'Nguyễn Văn Hùng',NULL,NULL,NULL,NULL,NULL),(7,'Đồng Thuận Hà','Nhà thầu phụ','0306201095','Số 15, Đường 30/4, Khu Phố 4, Phường 3, Thành phố Tây Ninh, Tỉnh Tây Ninh',NULL,NULL,'Nguyễn Văn Hòa',NULL,NULL,NULL,NULL,NULL),(8,'Công ty CP ĐTXD thương mại Tân Hoàng Long','Nhà thầu phụ','2901138127','Khối 4, Thị trấn Quán Hành, Huyện Nghi Lộc, Tỉnh Nghệ An',NULL,NULL,'Nguyễn Văn Thìn',NULL,NULL,NULL,NULL,NULL),(9,'Công ty Thuận An','Nhà thầu phụ','3700301336','Số 60/48, Quốc lộ 1, Khu Phố Tân Lập, Phường Đông Hòa, Thành phố Dĩ An, Tỉnh Bình Dương',NULL,NULL,'Vòng Lềnh',NULL,NULL,NULL,NULL,NULL),(10,'Công ty Tây An','Nhà thầu phụ','3900904998','Lô A14.10b, Đường D2, Khu công nghiệp Bourbon An Hòa, Phường An Hòa, Thị xã Trảng Bàng, Tỉnh Tây Ninh',NULL,NULL,'Nguyễn Trí Minh',NULL,NULL,NULL,NULL,NULL),(11,'Công ty 134 Việt Nam','Nhà thầu phụ','2900662666','Số 23B, Đường Lê Mao, Phường Lê Mao, Thành phố Vinh, Tỉnh Nghệ An',NULL,NULL,'Nguyễn Thị Liên',NULL,NULL,NULL,NULL,NULL),(12,'Công ty Hoàng Lộc','Nhà thầu phụ','0108524030','176-C4 Khu đô thị Đại Kim - Định Công, Phường Đại Kim, Quận Hoàng Mai, Thành phố Hà Nội',NULL,NULL,'Hoàng Văn Lộc',NULL,NULL,NULL,NULL,NULL),(13,'Công ty Đại Hồng Phúc','Nhà thầu phụ','0106770538','Thôn Nhì, Xã Vân Nội, Huyện Đông Anh, Thành phố Hà Nội',NULL,NULL,'Nguyễn Văn Phúc',NULL,NULL,NULL,NULL,NULL),(14,'Công ty Thuận Phú','Nhà thầu phụ','1200359782','Số 52, Khu phố Tân Phú, Thị trấn Tân Hiệp, Huyện Châu Thành, Tỉnh Tiền Giang',NULL,NULL,'Nguyễn Phương Bình',NULL,NULL,NULL,NULL,NULL),(15,'Công ty Hoàng Long','Nhà thầu phụ','3700646080','467 Cách Mạng Tháng Tám, khu phố 5, Phường Phú Cường, Thành phố Thủ Dầu Một, Tỉnh Bình Dương, Việt Nam',NULL,NULL,'Phạm Thị Kim Lan','Giám đốc',NULL,NULL,NULL,NULL),(16,'Công ty TNHH xây dựng và thương mại Sài Gòn','Nhà thầu chính','6000408311','Số 100 đường Nguyễn Chí Thanh, Phường Tân An, TP.Buôn Ma Thuột, Tỉnh Đắk Lắk, Việt Nam',NULL,NULL,'Nguyễn Thị Thanh','Giám đốc',NULL,NULL,NULL,NULL),(17,'Công ty TNHH An Nguyên','Nhà thầu phụ','0302015718','324/1/2-4 Đường Lý Thường Kiệt, Phường 14, Quận 10, Thành phố Hồ Chí Minh, Việt Nam',NULL,NULL,'Nguyễn Minh','Giám đốc',NULL,NULL,NULL,NULL),(18,'Tổng Công ty Xây dựng Trường Sơn','Nhà thầu chính','0100512273','Km6+500, Đại Lộ Thăng Long, Phường Đại Mỗ, Quận Nam Từ Liêm, Thành phố Hà Nội, Việt Nam',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'Công ty TNHH MTV 17','Nhà thầu phụ','0106094368','KM 12+500 đường Ngọc Hồi, thôn Lưu Phái, Xã Ngũ Hiệp, Huyện Thanh Trì, Thành phố Hà Nội, Việt Nam',NULL,NULL,'Trần Tuấn','Giám đốc',NULL,NULL,NULL,NULL),(20,'Tổng Công ty Xây dựng Công trình Giao thông 5 – CTCP (Cienco 5)','Nhà thầu phụ','0400101919','77 Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, Thành phố Đà Nẵng, Việt Nam',NULL,NULL,'Lê Quang Vinh','Giám đốc',NULL,NULL,NULL,NULL),(21,'Công ty TNHH Tập đoàn Sơn Hải','Nhà thầu chính','3100196175','Số 117, Hữu Nghị, Phường Nam Lý, Thành phố Đồng Hới, Tỉnh Quảng Bình, Việt Nam',NULL,NULL,'Nguyễn Thanh Hải','Giám đốc',NULL,NULL,NULL,NULL),(22,'Tổng công ty CP Xuất nhập khẩu và xây dựng Việt Nam (Vinaconex)','Nhà thầu chính','0100105616','Tòa nhà VINACONEX, 34 Láng Hạ, Phường Láng Hạ, Quận Đống Đa, Thành phố Hà Nội, Việt Nam',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'Công ty CP 484','Nhà thầu phụ','2900383729','Số 152, đường Trường Chinh, Phường Lê Lợi, Thành phố Vinh, Tỉnh Nghệ An, Việt Nam',NULL,NULL,'Trần Quang Hảo','Giám đốc',NULL,NULL,NULL,NULL),(24,'Công ty CP Xây lắp 368','Nhà thầu phụ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'Công ty CP 479 Hòa Bình','Nhà thầu phụ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'Công ty CP Đầu tư và Xây dựng giao thông Phương Thành','Nhà thầu chính',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,'Công ty CP Lizen','Nhà thầu chính',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `nhathau` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phanquyen`
--

DROP TABLE IF EXISTS `phanquyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phanquyen` (
  `PhanQuyenID` int NOT NULL AUTO_INCREMENT,
  `TenQuyen` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MoTaQuyen` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`PhanQuyenID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phanquyen`
--

LOCK TABLES `phanquyen` WRITE;
/*!40000 ALTER TABLE `phanquyen` DISABLE KEYS */;
INSERT INTO `phanquyen` VALUES (1,'Admin hệ thống (Bộ Xây dựng)','- Quản lý tài khoản người dùng, phân quyền theo tỉnh/thành\r\n- Cấu hình các tham số hệ thống (danh mục dự án, loại vật tư, cấu hình tuyến, gói thầu…)\r\n- Xem tổng hợp tiến độ triển khai toàn quốc\r\n- Xem báo cáo, biểu đồ, bản đồ tiến độ\r\n- Đánh giá tình hình thực hiện theo từng Sở, từng dự án\r\n- Truy cập nhanh vào thông tin chi tiết của từng dự án\r\n'),(2,'Cán bộ Sở Xây dựng','- Quản lý, theo dõi các dự án thuộc địa bàn tỉnh mình phụ trách\r\n- Cập nhật tiến độ GPMB, tiến độ thi công\r\n- Nhập dữ liệu hiện trạng, báo cáo khó khăn, vướng mắc\r\n- Xem các báo cáo tổng hợp, bảng tiến độ, bản đồ tiến độ tuyến\r\n- Xuất báo cáo định kỳ theo yêu cầu của Bộ\r\n'),(5,'Ban QLDA / Chủ đầu tư','- Quản lý danh sách dự án thuộc đơn vị mình phụ trách\r\n- Cập nhật dữ liệu tiến độ, GPMB, vật tư, khối lượng thi công\r\n- Ghi nhận khó khăn, vướng mắc trong quá trình thực hiện\r\n- Xem báo cáo tổng hợp tiến độ dự án của đơn vị mình\r\n'),(6,'Ban QLDA / Chủ đầu tư','- Quản lý danh sách dự án thuộc đơn vị mình phụ trách\r\n- Cập nhật dữ liệu tiến độ, GPMB, vật tư, khối lượng thi công\r\n- Ghi nhận khó khăn, vướng mắc trong quá trình thực hiện\r\n- Xem báo cáo tổng hợp tiến độ dự án của đơn vị mình\r\n'),(7,'Chuyên viên kỹ thuật','- Nhập dữ liệu tiến độ cho các gói được phân công\r\n- Nhập dữ liệu vật tư, thông tin GPMB, hồ sơ dự án\r\n'),(8,'Chuyên viên kỹ thuật','- Nhập dữ liệu tiến độ cho các gói được phân công\r\n- Nhập dữ liệu vật tư, thông tin GPMB, hồ sơ dự án\r\n'),(9,'Nhà thầu thi công',NULL);
/*!40000 ALTER TABLE `phanquyen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quanlykehoach`
--

DROP TABLE IF EXISTS `quanlykehoach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quanlykehoach` (
  `KeHoachID` int NOT NULL AUTO_INCREMENT,
  `HangMucID` int NOT NULL,
  `NhaThauID` int NOT NULL,
  `TenCongTac` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `KhoiLuongKeHoach` float NOT NULL,
  `DonViTinh` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NgayBatDau` date DEFAULT NULL,
  `NgayKetThuc` date DEFAULT NULL,
  `GhiChu` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`KeHoachID`),
  KEY `HangMucID` (`HangMucID`),
  KEY `NhaThauID` (`NhaThauID`),
  CONSTRAINT `quanlykehoach_ibfk_1` FOREIGN KEY (`HangMucID`) REFERENCES `hangmuc` (`HangMucID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quanlykehoach_ibfk_2` FOREIGN KEY (`NhaThauID`) REFERENCES `nhathau` (`NhaThauID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quanlykehoach`
--

LOCK TABLES `quanlykehoach` WRITE;
/*!40000 ALTER TABLE `quanlykehoach` DISABLE KEYS */;
INSERT INTO `quanlykehoach` VALUES (71,52,21,'Đào nền đường',5741830,'m3','2023-02-22','2025-12-08',NULL),(72,52,21,'Đào vận chuyển bãi thải',495258,'m3','2023-02-22','2025-12-08',NULL),(73,52,21,'Đào, vận chuyển bãi trữ',2126310,'m3','2023-02-22','2025-12-08',NULL),(74,52,21,'Đắp nền đường',2980070,'m3','2023-02-22','2025-12-08',NULL),(75,52,21,'nền đường K90',310624,'m3','2023-02-22','2025-12-08',NULL),(76,52,21,'nền đường K95',2329830,'m3','2023-02-22','2025-12-08',NULL),(77,52,21,'nền đường K98',128870,'m3','2023-02-22','2025-12-08',NULL),(78,52,21,'VL dạng hạt',210744,'m3','2023-02-22','2025-12-08',NULL),(79,53,21,'Cấp phối đá dăm loại 1, loại 2',213620,'m3','2023-02-22','2025-12-08',NULL),(80,53,21,'Cấp phối đá dăm gia cố xi măng',74577,'m3','2023-02-22','2025-12-08',NULL),(81,53,21,'Hỗn hợp BTN rỗng C25 dày 10cm',457433,'m2','2023-02-22','2025-12-08',NULL),(82,53,21,'BTN chặt 19 dày 6cm',478444,'m2','2023-02-22','2025-12-08',NULL),(83,53,21,'BTN chặt 16 dày 6cm',479656,'m2','2023-02-22','2025-12-08',NULL),(84,54,21,'Lan can tôn lượn sóng loại 2 sóng',52249,'md','2023-02-22','2025-12-08',NULL),(85,54,21,'Lan can tôn lượn sóng loại 3 sóng',14700,'md','2023-02-22','2025-12-08',NULL),(86,54,21,'Hàng rào bảo vệ loại 1',28520,'md','2023-02-22','2025-12-08',NULL),(87,54,21,'Hàng rào bảo vệ loại 2 (hàng rào lưới thép gai)',38875,'md','2023-02-22','2025-12-08',NULL),(88,55,21,'đã và đang thi công',272,'cống','2023-02-22','2025-12-08',NULL),(89,56,21,'đã hoàn thành',19,'HCDS','2023-02-22','2025-12-08',NULL),(90,57,21,'đã và đang thi công',15,'cầu','2023-02-22','2025-12-08',NULL),(91,57,21,'Cọc khoan nhồi',669,'cọc','2023-02-22','2025-12-08',NULL),(92,57,21,'Sản xuất dầm Super T',457,'dầm','2023-02-22','2025-12-08',NULL),(93,57,21,'Hoàn thành sản xuất dầm I',55,'dầm','2023-02-22','2025-12-08',NULL),(94,57,21,'Dầm bản lắp ghép 24m',68,'dầm','2023-02-22','2025-12-08',NULL),(95,57,21,'Dầm bản rỗng',105,'phiến','2023-02-22','2025-12-08',NULL),(96,58,21,'Gia cố mái',15483,'m2','2023-02-22','2025-12-08',NULL),(97,58,21,'Đào hầm',1556,'m','2023-02-22','2025-12-08',NULL),(98,58,21,'nhánh trái hầm',716,'m','2023-02-22','2025-12-08',NULL),(99,58,21,'nhánh phải',840,'m','2023-02-22','2025-12-08',NULL),(100,58,21,'Đào đất, đá cửa hầm',577504,'m3','2023-02-22','2025-12-08',NULL),(101,58,21,'Neo đá, neo dẫn trước',56833,'bộ','2023-02-22','2025-12-08',NULL),(102,58,21,'Cọc khoan nhồi tường chắn cửa Nam',117,'cọc','2023-02-22','2025-12-08',NULL),(103,58,21,'BT dầm mũ, dầm neo, dầm chân 30MPa',1803,'m3','2023-02-22','2025-12-08',NULL),(104,58,21,'Bê tông phun',65940,'m2','2023-02-22','2025-12-08',NULL),(105,58,21,'Lưới thép',94623,'m2','2023-02-22','2025-12-08',NULL),(106,58,21,'Khung chống đỡ bằng thép',2277,'tấn','2023-02-22','2025-12-08',NULL);
/*!40000 ALTER TABLE `quanlykehoach` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taikhoan` (
  `NguoiDungID` int NOT NULL,
  `TenDangNhap` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MatKhau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `HoTen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SoDienThoai` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ChucVu` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DonViCongTac` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PhanQuyenID` int DEFAULT NULL,
  `TrangThai` bit(1) DEFAULT NULL,
  `NhaThauID` int DEFAULT NULL,
  PRIMARY KEY (`NguoiDungID`),
  KEY `PhanQuyenID` (`PhanQuyenID`),
  KEY `fk_taikhoan_nhathau` (`NhaThauID`),
  CONSTRAINT `fk_taikhoan_nhathau` FOREIGN KEY (`NhaThauID`) REFERENCES `nhathau` (`NhaThauID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`PhanQuyenID`) REFERENCES `phanquyen` (`PhanQuyenID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taikhoan`
--

LOCK TABLES `taikhoan` WRITE;
/*!40000 ALTER TABLE `taikhoan` DISABLE KEYS */;
INSERT INTO `taikhoan` VALUES (1,'a','123','Nguyễn Văn A','a@gmail.com','0999','admin','huce',1,NULL,NULL),(6,'Ntbaobt@gmail.com','123456789','Nguyễn Thái Bảo','Ntbaobt@gmail.com','0963035537',NULL,NULL,1,_binary '',NULL),(1001,'nthau_ldcpdixdgt','123456','PHẠM VĂN KHÔI','khoi.pham@lien-danh-cp-dixdgt.com','0912345601','Giám đốc','Liên danh Công ty Cổ phần Đầu tư và xây dựng giao thông',9,_binary '',1),(1002,'nthau_ldsh','123456','NGUYỄN THANH HẢI','hai.nguyen@lien-danh-sh.com','0912345602','Giám đốc','Liên danh Công ty TNHH Tập đoàn Sơn Hải',9,_binary '',2),(1003,'nthau_vinaconex','123456','PHẠM VĂN NGỌ','ngo.pham@vinaconex.com.vn','0912345603','Giám đốc','CÔNG TY CỔ PHẦN VINACONEX',9,_binary '',3),(1004,'nthau_vimeco','123456','NGUYỄN VĂN HƯNG','hung.nguyen@vimeco.com.vn','0912345604','Giám đốc','CÔNG TY CỔ PHẦN THIẾT BỊ VÀ XÂY LẮP CƠ ĐIỆN VIMECO',9,_binary '',4),(1005,'nthau_dongduong','123456','Vũ Văn Long','long.vu@dongduonggroup.com','0912345605','Trưởng phòng Dự án','Công ty CP tập đoàn Đông Dương',9,_binary '',5),(1006,'nthau_cty439','123456','Nguyễn Văn Hùng','hung.nguyen@cty439.vn','0912345606','Phó Giám đốc','Công ty 439',9,_binary '',6),(1007,'nthau_dongthuanha','123456','Nguyễn Văn Hòa','hoa.nguyen@dongthuanha.com','0912345607','Kỹ sư trưởng','Đồng Thuận Hà',9,_binary '',7),(1008,'nthau_tanhoanglong','123456','Nguyễn Văn Thìn','thin.nguyen@tanhoanglong.vn','0912345608','Trưởng ban QHDA','Công ty CP ĐTXD thương mại Tân Hoàng Long',9,_binary '',8),(1009,'nthau_thuanan','123456','Vòng Lềnh','lenh.vong@thuanan.vn','0912345609','Giám đốc Dự án','Công ty Thuận An',9,_binary '',9),(1010,'nthau_tayan','123456','Nguyễn Trí Minh','minh.nguyen@tayan.vn','0912345610','Kỹ sư Thi công','Công ty Tây An',9,_binary '',10),(1011,'nthau_cty134','123456','Nguyễn Thị Liên','lien.nguyen@cty134.vn','0912345611','Phó Giám đốc','Công ty 134 Việt Nam',9,_binary '',11),(1012,'nthau_hoangloc','123456','Hoàng Văn Lộc','loc.hoang@hoangloc.vn','0912345612','Giám đốc Kỹ thuật','Công ty Hoàng Lộc',9,_binary '',12),(1013,'nthau_daihongphuc','123456','Nguyễn Văn Phúc','phuc.nguyen@daihongphuc.vn','0912345613','Trưởng phòng Thi công','Công ty Đại Hồng Phúc',9,_binary '',13),(1014,'nthau_thuanphu','123456','Nguyễn Phương Bình','binh.nguyen@thuanphu.vn','0912345614','Kỹ sư Công trình','Công ty Thuận Phú',9,_binary '',14),(1015,'nthau_hoanglong','123456','Phạm Thị Kim Lan','lan.pham@hoanglong.vn','0912345615','Giám đốc','Công ty Hoàng Long',9,_binary '',15),(1016,'nthau_saigon','123456','Nguyễn Thị Thanh','thanh.nguyen@saigonxd.vn','0912345616','Giám đốc','Công ty TNHH xây dựng và thương mại Sài Gòn',9,_binary '',16),(1017,'nthau_annguyen','123456','Nguyễn Minh','minh.nguyen@annguyen.vn','0912345617','Giám đốc','Công ty TNHH An Nguyên',9,_binary '',17),(1018,'nthau_truongson','123456','Lê Văn Sơn','son.le@truongson.vn','0912345618','Trưởng ban Dự án','Tổng Công ty Xây dựng Trường Sơn',9,_binary '',18),(1019,'nthau_mtv17','123456','Trần Tuấn','tuan.tran@mtv17.vn','0912345619','Giám đốc','Công ty TNHH MTV 17',9,_binary '',19),(1020,'nthau_cienco5','123456','Lê Quang Vinh','vinh.le@cienco5.vn','0912345620','Giám đốc','Tổng Công ty Xây dựng Công trình Giao thông 5',9,_binary '',20),(1021,'nthau_tapdoansonhai','123456','Nguyễn Thanh Hải','hai.nguyen@tapdoansonhai.vn','0912345621','Giám đốc','Công ty TNHH Tập đoàn Sơn Hải',9,_binary '',21),(1022,'nthau_vinaconex','123456','Trần Văn Nam','nam.tran@vinaconex.com.vn','0912345622','Phó Tổng Giám đốc','Tổng công ty CP Xuất nhập khẩu và xây dựng Việt Nam',9,_binary '',22),(1023,'nthau_cp484','123456','Trần Quang Hảo','hao.tran@cp484.vn','0912345623','Giám đốc','Công ty CP 484',9,_binary '',23),(1024,'nthau_xl368','123456','Phạm Đình Chung','chung.pham@xl368.vn','0912345624','Kỹ sư trưởng','Công ty CP Xây lắp 368',9,_binary '',24),(1025,'nthau_cp479','123456','Nguyễn Hồng Quân','quan.nguyen@cp479.vn','0912345625','Giám đốc Dự án','Công ty CP 479 Hòa Bình',9,_binary '',25),(1026,'nthau_phuongthanh','123456','Lê Minh Phương','phuong.le@phuongthanh.vn','0912345626','Trưởng phòng Kỹ thuật','Công ty CP Đầu tư và Xây dựng giao thông Phương Thành',9,_binary '',26),(1027,'nthau_lizen','123456','Vũ Đình Lộc','loc.vu@lizen.vn','0912345627','Giám đốc Thi công','Công ty CP Lizen',9,_binary '',27);
/*!40000 ALTER TABLE `taikhoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tailieu`
--

DROP TABLE IF EXISTS `tailieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tailieu` (
  `TaiLieuID` int NOT NULL AUTO_INCREMENT,
  `LoaiDoiTuong` enum('DUAN','GOITHAU','HANGMUC','KEHOACH','TIENDO','VUONGMAC') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DoiTuongID` int NOT NULL COMMENT 'ID của đối tượng liên kết (DuAnID, GoiThau_ID, HangMucID,...)',
  `TenTaiLieu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `LoaiTaiLieu` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Hồ sơ thiết kế, biên bản nghiệm thu, hợp đồng, báo cáo,...',
  `DuongDan` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Path lưu file trên server hoặc URL',
  `NgayUpload` datetime DEFAULT CURRENT_TIMESTAMP,
  `NguoiUpload` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'UserID hoặc tên người upload',
  `MoTa` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`TaiLieuID`),
  KEY `idx_doituong` (`LoaiDoiTuong`,`DoiTuongID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tailieu`
--

LOCK TABLES `tailieu` WRITE;
/*!40000 ALTER TABLE `tailieu` DISABLE KEYS */;
INSERT INTO `tailieu` VALUES (1,'TIENDO',28,'bt_hamC++.png','KHAC','/Uploads/TIENDO/28/1749784812182-353377424.png','2025-06-13 10:20:12',NULL,''),(2,'TIENDO',30,'494572363_3912901702293573_7940239022436242185_n.png','KHAC','/Uploads/TIENDO/30/1749784994423-838876812.png','2025-06-13 10:23:14',NULL,''),(3,'TIENDO',31,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/TIENDO/31/1749785102166-718441872.docx','2025-06-13 10:25:02',NULL,''),(4,'TIENDO',32,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/TIENDO/32/1749785129955-89475926.docx','2025-06-13 10:25:29',NULL,''),(5,'TIENDO',34,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá».docx','KHAC','/Uploads/TIENDO/34/1749787016078-19693570.docx','2025-06-13 10:56:56',NULL,''),(6,'TIENDO',40,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/TIENDO/40/1749788435422-579003884.xlsx','2025-06-13 11:20:35',NULL,''),(7,'TIENDO',41,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/TIENDO/41/1749789116800-574031171.docx','2025-06-13 11:31:56',NULL,''),(8,'TIENDO',41,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/TIENDO/41/1749789116809-120417933.xlsx','2025-06-13 11:31:56',NULL,''),(9,'TIENDO',41,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/TIENDO/41/1749789116812-70152475.docx','2025-06-13 11:31:56',NULL,''),(10,'TIENDO',42,'áº¢nh.docx','KHAC','/Uploads/TIENDO/42/1749789150259-106910477.docx','2025-06-13 11:32:30',NULL,''),(11,'TIENDO',42,'ÄÃ¡nh giÃ¡ 09.4.25.docx','KHAC','/Uploads/TIENDO/42/1749789150292-289877683.docx','2025-06-13 11:32:30',NULL,''),(12,'DUAN',127,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/DUAN/127/1749790344547-705494929.docx','2025-06-13 11:52:24',NULL,''),(13,'DUAN',127,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/DUAN/127/1749790344553-931292884.xlsx','2025-06-13 11:52:24',NULL,''),(14,'DUAN',127,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/127/1749790344557-755988909.docx','2025-06-13 11:52:24',NULL,''),(15,'HANGMUC',34,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/HANGMUC/34/1749796149598-34108256.docx','2025-06-13 13:29:09',NULL,''),(16,'HANGMUC',34,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/HANGMUC/34/1749796149618-145953260.xlsx','2025-06-13 13:29:09',NULL,''),(17,'HANGMUC',34,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/HANGMUC/34/1749796149623-775521984.docx','2025-06-13 13:29:09',NULL,''),(18,'KEHOACH',19,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/KEHOACH/19/1749797701840-252613144.xlsx','2025-06-13 13:55:01',NULL,''),(19,'KEHOACH',19,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/KEHOACH/19/1749797701842-594885006.docx','2025-06-13 13:55:01',NULL,''),(20,'DUAN',128,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/DUAN/128/1749797979308-140398619.xlsx','2025-06-13 13:59:39',NULL,''),(21,'DUAN',128,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/128/1749797979311-376036270.docx','2025-06-13 13:59:39',NULL,''),(22,'DUAN',129,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/DUAN/129/1749798004117-718065614.docx','2025-06-13 14:00:04',NULL,''),(23,'DUAN',129,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/DUAN/129/1749798004125-902249717.xlsx','2025-06-13 14:00:04',NULL,''),(24,'DUAN',129,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/129/1749798004127-641321058.docx','2025-06-13 14:00:04',NULL,''),(25,'GOITHAU',13,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá».docx','KHAC','/Uploads/GOITHAU/13/1749798177392-60758388.docx','2025-06-13 14:02:57',NULL,''),(26,'HANGMUC',35,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/HANGMUC/35/1749803503942-93615977.docx','2025-06-13 15:31:43',NULL,''),(27,'HANGMUC',35,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/HANGMUC/35/1749803503950-84184772.xlsx','2025-06-13 15:31:43',NULL,''),(28,'HANGMUC',35,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/HANGMUC/35/1749803503955-398536729.docx','2025-06-13 15:31:43',NULL,''),(29,'DUAN',130,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá».docx','KHAC','/Uploads/DUAN/130/1749808427674-4488303.docx','2025-06-13 16:53:47',NULL,''),(30,'DUAN',130,'PhÃ¢n tÃ­ch chá»©c nÄng Web quáº£n lÃ½ ÄÆ°á»ng bá»-ver2.docx','KHAC','/Uploads/DUAN/130/1749808427755-111944919.docx','2025-06-13 16:53:47',NULL,''),(31,'DUAN',130,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/DUAN/130/1749808427766-961376300.xlsx','2025-06-13 16:53:47',NULL,''),(32,'DUAN',130,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/130/1749808427770-380647367.docx','2025-06-13 16:53:47',NULL,''),(33,'DUAN',131,'PL BC BGTVT cao tá»c Äoáº¡n VA - B 27.03.2025 (1).xlsx','KHAC','/Uploads/DUAN/131/1750046735967-334488014.xlsx','2025-06-16 11:05:36',NULL,''),(34,'DUAN',131,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/131/1750046736002-280420866.docx','2025-06-16 11:05:36',NULL,''),(35,'TIENDO',46,'10fce97c822d35736c3c.jpg','KHAC','/Uploads/TIENDO/46/1750313300741-157522871.jpg','2025-06-19 13:08:20',NULL,''),(36,'DUAN',145,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/145/1750664553554-369222041.docx','2025-06-23 07:42:33',NULL,''),(37,'DUAN',178,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/DUAN/178/1750728706282-812790901.docx','2025-06-24 01:31:46',NULL,''),(38,'GOITHAU',25,'PL BC BGTVT cao tá»c Äoáº¡n VA - BÃ¹ng 27.03.2025.docx','KHAC','/Uploads/GOITHAU/25/1750728901980-595596789.docx','2025-06-24 01:35:01',NULL,'');
/*!40000 ALTER TABLE `tailieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thuoctinhloaihinh`
--

DROP TABLE IF EXISTS `thuoctinhloaihinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thuoctinhloaihinh` (
  `ThuocTinh_ID` int NOT NULL AUTO_INCREMENT,
  `LoaiHinh_ID` int NOT NULL,
  `TenThuocTinh` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `KieuDuLieu` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'varchar',
  `DonVi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BatBuoc` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`ThuocTinh_ID`),
  KEY `LoaiHinh_ID` (`LoaiHinh_ID`),
  CONSTRAINT `thuoctinhloaihinh_ibfk_1` FOREIGN KEY (`LoaiHinh_ID`) REFERENCES `loaihinh` (`LoaiHinh_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuoctinhloaihinh`
--

LOCK TABLES `thuoctinhloaihinh` WRITE;
/*!40000 ALTER TABLE `thuoctinhloaihinh` DISABLE KEYS */;
INSERT INTO `thuoctinhloaihinh` VALUES (1,1,'Vật liệu','varchar','cái',1),(2,1,'Độ sâu','decimal','m',1),(3,1,'Độ dày','decimal','cm',1),(4,2,'Diện tích','decimal','m2',1),(5,2,'Số tầng','int',NULL,1),(6,2,'Vật liệu chính','varchar',NULL,1),(7,1,'Giá mũi khoan','decimal','VND',0),(8,1,'Giá mũi khoan_2','decimal','VND',0),(9,1,'Giá Vật liệu','decimal','VND',0),(10,1,'Nhân công','varchar','Người',0),(11,1,'Nhân công','varchar','Người',0),(12,1,'qqweqw','float','qeqweq',0),(13,1,'qqq','varchar','qqq',0),(14,1,'Ngày tháng','date','Người',0),(23,4,'qeweq','number','ewqeq',0),(46,5,'Chiều dài','varchar','Km',0),(47,5,'Mức đầu tư','varchar','Tỷ Đồng',0),(48,5,'Cầu','varchar','Số cầu',0),(49,5,'Hầm chui','varchar','Cái',0);
/*!40000 ALTER TABLE `thuoctinhloaihinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tiendothuchien`
--

DROP TABLE IF EXISTS `tiendothuchien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiendothuchien` (
  `TienDoID` int NOT NULL AUTO_INCREMENT,
  `KeHoachID` int NOT NULL,
  `NgayCapNhat` date NOT NULL,
  `KhoiLuongThucHien` float NOT NULL,
  `DonViTinh` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MoTaVuongMac` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `GhiChu` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`TienDoID`),
  KEY `tiendothuchien_ibfk_1` (`KeHoachID`),
  CONSTRAINT `tiendothuchien_ibfk_1` FOREIGN KEY (`KeHoachID`) REFERENCES `quanlykehoach` (`KeHoachID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tiendothuchien`
--

LOCK TABLES `tiendothuchien` WRITE;
/*!40000 ALTER TABLE `tiendothuchien` DISABLE KEYS */;
INSERT INTO `tiendothuchien` VALUES (108,71,'2025-08-07',5655760,'m3',NULL,NULL),(109,72,'2025-08-07',465002,'m3',NULL,NULL),(110,73,'2025-08-07',2123290,'m3',NULL,NULL),(111,74,'2025-08-07',2647430,'m3',NULL,NULL),(112,75,'2025-08-07',290237,'m3',NULL,NULL),(113,76,'2025-08-07',2319110,'m3',NULL,NULL),(114,77,'2025-08-07',126401,'m3',NULL,NULL),(115,78,'2025-08-07',201706,'m3',NULL,NULL),(116,79,'2025-08-07',184609,'m3',NULL,NULL),(117,80,'2025-08-07',74884,'m3',NULL,NULL),(118,81,'2025-08-07',455601,'m2',NULL,NULL),(119,82,'2025-08-07',363994,'m2',NULL,NULL),(120,83,'2025-08-07',365808,'m2',NULL,NULL),(121,84,'2025-08-07',41523,'md',NULL,NULL),(122,85,'2025-08-07',10283,'md',NULL,NULL),(123,86,'2025-08-07',22475,'md',NULL,NULL),(124,87,'2025-08-07',37628,'md',NULL,NULL),(125,88,'2025-08-07',272,'cống',NULL,NULL),(126,89,'2025-08-07',19,'HCDS',NULL,NULL),(127,90,'2025-08-07',15,'cầu',NULL,NULL),(128,91,'2025-08-07',669,'cọc',NULL,NULL),(129,92,'2025-08-07',445,'dầm',NULL,NULL),(130,93,'2025-08-07',55,'dầm',NULL,NULL),(131,94,'2025-08-07',68,'dầm',NULL,NULL),(132,95,'2025-08-07',105,'phiến',NULL,NULL),(133,96,'2025-08-07',8228,'m2',NULL,NULL),(134,97,'2025-08-07',1544,'m',NULL,NULL),(135,98,'2025-08-07',704,'m',NULL,NULL),(136,99,'2025-08-07',840,'m',NULL,NULL),(137,100,'2025-08-07',521448,'m3',NULL,NULL),(138,101,'2025-08-07',53924,'bộ',NULL,NULL),(139,102,'2025-08-07',28,'cọc',NULL,NULL),(140,103,'2025-08-07',320,'m3',NULL,NULL),(141,104,'2025-08-07',66096,'m2',NULL,NULL),(142,105,'2025-08-07',94432,'m2',NULL,NULL),(143,106,'2025-08-07',2242,'tấn',NULL,NULL),(144,71,'2025-08-07',12,'m3','Không có đủ thiết bị','12'),(145,71,'2025-08-07',121,'m3','312','2313'),(146,71,'2025-08-07',21,'m3','212','1'),(148,71,'2025-08-07',121,'m3','212','212'),(149,71,'2025-08-07',21,'m3','12','21'),(150,71,'2025-08-07',31,'m3','1312','321'),(151,72,'2025-08-07',12,'m3','21','21'),(152,71,'2025-08-07',-326,'m3',NULL,NULL),(153,72,'2025-08-07',-12,'m3',NULL,NULL),(154,73,'2025-08-07',-2,'m3',NULL,NULL),(155,74,'2025-08-07',0,'m3',NULL,NULL),(156,75,'2025-08-07',0,'m3',NULL,NULL),(157,76,'2025-08-07',4,'m3',NULL,NULL),(158,77,'2025-08-07',599,'m3',NULL,NULL),(159,78,'2025-08-07',0,'m3',NULL,NULL);
/*!40000 ALTER TABLE `tiendothuchien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vuongmac`
--

DROP TABLE IF EXISTS `vuongmac`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vuongmac` (
  `VuongMacID` int NOT NULL AUTO_INCREMENT,
  `KeHoachID` int NOT NULL,
  `NguoiBaoCaoID` int DEFAULT NULL,
  `LoaiVuongMac` enum('GPMB','ThietBi','NhanLuc','VatTu','ThoiTiet','Khac') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MoTaChiTiet` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `NgayPhatSinh` date NOT NULL,
  `NgayKetThuc` date DEFAULT NULL,
  `MucDo` enum('Nho','TrungBinh','NghiemTrong') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Nho',
  `BienPhapXuLy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `TrangThaiXuLy` enum('ChuaXuLy','DangXuLy','DaXuLy','DongY','TuChoi') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'ChuaXuLy',
  `NgayCapNhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `NoiDungXuLy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`VuongMacID`),
  KEY `KeHoachID` (`KeHoachID`),
  KEY `fk_vuongmac_nguoibaocao` (`NguoiBaoCaoID`),
  CONSTRAINT `fk_vuongmac_nguoibaocao` FOREIGN KEY (`NguoiBaoCaoID`) REFERENCES `taikhoan` (`NguoiDungID`),
  CONSTRAINT `vuongmac_ibfk_1` FOREIGN KEY (`KeHoachID`) REFERENCES `quanlykehoach` (`KeHoachID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vuongmac`
--

LOCK TABLES `vuongmac` WRITE;
/*!40000 ALTER TABLE `vuongmac` DISABLE KEYS */;
INSERT INTO `vuongmac` VALUES (81,71,1,'GPMB','1312','2025-08-07',NULL,'Nho',NULL,'ChuaXuLy','2025-08-07 16:05:31',NULL),(82,72,1025,'ThietBi','21','2025-08-07',NULL,'Nho',NULL,'ChuaXuLy','2025-08-07 16:36:30',NULL);
/*!40000 ALTER TABLE `vuongmac` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-22 11:15:47
