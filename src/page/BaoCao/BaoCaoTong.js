import React, { useEffect, useRef, useState } from 'react';
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaListUl, FaListOl, FaUndo, FaRedo, FaMinus, FaPlus,
  FaDownload, FaIndent, FaOutdent, FaEraser
} from 'react-icons/fa';
import { AiFillHighlight } from 'react-icons/ai';
import { BsFillBrushFill } from 'react-icons/bs';

export default function BaoCaoTong() {
  const editorRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  useEffect(() => {
    const template = `
          <div style="font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: none;">
              <tr>
                <td style="width: 50%; text-align: center; vertical-align: top;">
                  <p style="font-weight: bold; margin-bottom: 0;">BỘ XÂY DỰNG</p>
                  <p style="font-weight: bold; margin-bottom: 0;">CỤC KINH TẾ - QUẢN LÝ ĐẦU TƯ</p>
                  <p style="font-weight: bold;">XÂY DỰNG</p>
                </td>
                <td style="width: 50%; text-align: center; vertical-align: top;">
                  <p style="font-weight: bold; margin-bottom: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p style="font-weight: bold; margin-bottom: 0;">Độc lập - Tự do - Hạnh phúc</p>
                  <p style="font-style: italic;">Hà Nội, ngày 23 tháng 4 năm 2025</p>
                </td>
              </tr>
            </table>

            <div style="border-top: 1px solid black; margin-bottom: 20px;"></div>

            <p style="text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 10px;">BÁO CÁO TÓM TẮT</p>
            <p style="text-align: center; font-weight: bold; margin-bottom: 20px;">Tình hình thực hiện các dự án giao thông trọng điểm của Bộ Xây dựng</p>

            <p style="font-weight: bold; margin-bottom: 5px;">Kính gửi:</p>
            <ul style="list-style-type: disc; padding-left: 40px; margin-bottom: 15px;">
              <li>Bộ trưởng Bộ Xây dựng;</li>
              <li>Các đồng chí Thứ trưởng.</li>
            </ul>

            <p style="margin-bottom: 15px; text-align: justify;">
              Thực hiện phân công của Lãnh đạo Bộ Xây dựng, Cục Kinh tế - Quản lý đầu tư xây dựng tổng hợp báo cáo tình hình thực hiện các dự án giao thông trọng điểm của Bộ Xây dựng do Cục KT - QLĐTXD theo dõi như sau: Tổng số 53 dự án/68 dự án thành phần (DATP) trong đó Bộ Xây dựng triển khai là 51 dự án/63 DATP (thì công 38 dự án/Sở DATP; chuẩn bị đầu tư, chuẩn bị khởi công 13 dự án/13 DATP); ACV triển khai thì công 02 dự án/05 DATP.
            </p>

            <p style="font-weight: bold; margin-bottom: 10px;">I. Về công tác chuẩn bị đầu tư, khởi công và hoàn thành các dự án</p>
            
            <p style="margin-bottom: 10px;">
              - Trong năm 2025 dự kiến khởi công 20 dự án, đến nay đã khởi công 06/20 dự án<sup>1</sup> còn 14 dự án chưa khởi công, bao gồm:
            </p>
            
            <div style="padding-left: 20px; margin-bottom: 15px;">
              <p style="margin-bottom: 10px;">
                + 06/14 dự án<sup>2</sup> dự kiến sử dụng nguồn tăng thu NSTW năm 2024 chưa phê duyệt chủ trương đầu tư, công tác lập, phê duyệt chủ trương đầu tư đang được các chủ đầu tư nỗ lực triển khai.
              </p>
              
              <p style="margin-bottom: 10px;">
                + 05/14 dự án<sup>3</sup> đã phê duyệt dự án, đang hoàn chỉnh các thủ tục đầu tư để khởi công, trong đó 02 dự án tiến độ chậm, gồm: (1) Dự án mở rộng đoạn La Sơn - Hòa Liên của Ban HCM chấm khoảng 02 tháng do công tác lập hồ sơ TKKT chậm; (2) Dự án đường cao tốc Dầu Giây - Tân Phú (PPP)/Ban Thắng Long chậm khoảng 03 tháng so với kế hoạch điều chỉnh<sup>4</sup> do công tác lập Báo cáo NCKT, lựa chọn nhà đầu tư chậm.
              </p>
              
              <p>
                + 03/14 dự án<sup>5</sup> đang hoàn chỉnh các thủ tục để phê duyệt dự án, trong đó: dự án mở rộng cao tốc Bắc - Nam phía Đông đoạn Cam Lộ - La Sơn (Ban HCM)
              </p>
            </div>

            <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
              <p style="margin-bottom: 5px;"><sup>1</sup> (1) Cần đường sắt Châu Lý truyền đường sắt Kíp - Hạ Long, (2) Nâng cấp, mở rộng một số cần, hầm trên quốc lộ i Các đài xưởng Giung, Chuẩn, Quận Hàu và hầm trên Ngang) (Ban Dưỡng sắt); (3) Mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cao Bộ - Mai đoạn (Bộ XD Ninh Bình); (4) Tuyến sắt cao tốc Nội Bài - Lao Cai với cao tốc Tuyến Quang - Phú Thọ (Số XD Phú Thọ); (5) Tuyến Cho Mới - Bắc Kan (Ban 2); (6) QL-độ đoạn TP. Vinh - TT Nam Đam (Ban B5).</p>
              
              <p style="margin-bottom: 5px;"><sup>2</sup> Gồm: (1) điều trị hoàn thiện hầm Thầy Vũ, Ban 6; (2) điều trị hoàn thiện hầm Cù Mông, Ban 85; (3) hoàn thiện hầm Núl Vung, Ban 85; (4) nâng cấp tuyến Nội Bài - Bắc Ninh thành đường cao tốc, Ban Thắng Long; (5) nâng cấp tuyến đường bộ nối PCT Hà Nội - Hải Phòng và ĐCT Cầu Giá - Ninh Bình thành đường cao tốc, Ban 6; (6) Xây dựng đường bộ cao tốc Quy Nhơn - Phátia, Ban 2.</p>
              
              <p style="margin-bottom: 5px;"><sup>3</sup> (1) Dự án chi bạo dân yếu cả chu kết nối trên các quốc lộ (Giai đoạn II) sử dụng vốn vay EDF [^4] của Chính phủ Hàn Quốc (Ban 2); (2) Dự án mở rộng cao tốc Bắc - Nam phía Đông đoạn La Sơn - Hòa Liên (Ban HCM); (3) Xây dựng cần Ninh Cường vượt sông Ninh Cơ trên Quốc lộ 37B (ODA) (Ban Thắng Long); (4) Dự án đường cao tốc Mỹ An-Cao Lãnh giải đoạn 1 (Ban Mỹ Thuận); (5) Dự án đường cao tốc Dầu Giây - Tân Phú (PPP) (Ban Thắng Long).</p>
              
              <p style="margin-bottom: 5px;"><sup>4</sup> Không CP thông so với kế hoạch hữu đầu.</p>
              
              <p><sup>5</sup> Gồm: (1) Đường sắt Lao Cai - Hà Nội - Hải Phòng, Ban Đường sắt; (2) mở rộng cao tốc TP Hồ Chí Minh - Trung Lương - Mỹ Thuận, Ban 7; (3) mở rộng cao tốc Bắc - Nam phía Đông đoạn Cam Lô - La Sơn, Ban HCM.</p>
            </div>
          
          <br />

          <p style="margin-bottom: 15px; text-align: justify;">
            chậm khoảng 02 tháng do Chủ đầu tư xây dựng tiến độ chưa sát với thực tế, lựa chọn nhà thầu tư vấn chậm.
          </p>

          <p style="margin-bottom: 15px; text-align: justify;">
            - Trong năm 2025 dự kiến hoàn thành 42 dự án; đến nay đã hoàn thành 02/42 dự án<sup>6</sup>: 40/42 dự án chưa hoàn thành, trong đó 01 dự án không hoàn thành theo kế hoạch, 06 dự án tiềm ẩn nguy cơ không hoàn thành theo kế hoạch.
          </p>

          <p style="font-weight: bold; margin-bottom: 10px;">II. Tình hình triển khai các dự án</p>

          <p style="font-weight: bold; margin-bottom: 10px;">1. Các dự án đường bộ:</p>
          <p style="margin-bottom: 10px;">Tổng số 35 dự án/47 DATP.</p>

          <p style="font-weight: bold; margin-bottom: 10px;">1.1 Dự án đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2017 - 2020</p>
          <ul style="list-style-type: disc; padding-left: 40px; margin-bottom: 15px;">
            <li>Gồm 11 dự án thành phần (DATP), đã đưa vào khai thác 654/654 km.</li>
            <li>Về đầu tư hệ thống giao thông thông minh (ITS), thu phí, kiểm tra tải trọng xe (KTTTX) tại 05 DATP đầu tư công<sup>8</sup>:
              <ul style="list-style-type: circle; padding-left: 20px;">
                <li>Các gói thầu xây lắp: 05/05 DATP đã khởi công, dự kiến hoàn thành cuối tháng 9/2025.</li>
                <li>Các gói thầu thiết bị: 05/05 DATP đã mở thầu, dự kiến hoàn thành lựa chọn nhà thầu trong tháng 4/2025<sup>10</sup>, chậm khoảng từ 07 ngày đến 14 ngày so với chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025, nguyên nhân chậm tiến độ do thời gian đánh giá hồ sơ dự thầu phải kéo dài để làm rõ một số mội dung của hồ sơ dự thầu. Theo kế hoạch, các gói thầu này hoàn thành vào cuối tháng 10/2025.</li>
                <li>Gói thầu cung cấp phần mềm dùng chung<sup>11</sup>: Ban Thăng Long đã mở thầu ngày 21/4/2025, dự kiến hoàn thành lựa chọn nhà thầu ngày 15/5/2025, chậm 35 ngày so với chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025.</li>
              </ul>
            </li>
          </ul>

          <p style="font-weight: bold; margin-bottom: 10px;">1.2. Dự án đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025</p>
          <ul style="list-style-type: disc; padding-left: 40px; margin-bottom: 15px;">
            <li>Mặt bằng đến nay đã bàn giao đạt 100%, tính Quảng Bình chưa di dời xong đường điện cao thế<sup>12</sup>:</li>
            <li>Đối với 02 DATP đoạn từ thành phố Cần Thơ đến Ca Mau:
              <ul style="list-style-type: circle; padding-left: 20px;">
                <li>Nhu cầu vật liệu để hoàn thành công tác đắp gia tải trong tháng 04/2025, còn thiếu khoảng 0,15 triệu m3 (0,12 triệu m3 cứ và 0,03 triệu m3 đá).</li>
                <li>Nhu cầu vật liệu đá: Tổng nhu cầu vật liệu đá các loại khoảng 2,3 triệu m3, tính An Giang đã hoàn thành thủ tục cấp bổ sung trừ lượng mô đã Antraco, trong đó ưu tiên cho dự án khoảng 1,0 triệu m3, dự kiến khai thác cuối tháng 4/2025.</li>
              </ul>
            </li>
            <li>Sản lượng thực hiện các dự án hiện được khoảng 72.099 tỷ đồng đạt 75,7% giá trị hợp đồng. Trong đó, một số DATP triển khai đáp ứng tiến độ yêu cầu và có sản lượng thực hiện cao đạt trên 80% hợp đồng gồm: Bãi Vot - Hàm Nghi, Hàm Nghi - Vũng Áng, Vũng Áng - Bùng, Bùng - Van Ninh, Van Ninh - Cam Lô, Vân</li>
          </ul>

          <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
            <p style="margin-bottom: 5px;"><sup>6</sup>(1) Dự án chỉ tạo cầu yếu và kết phí tiện các quốc tế; (2) Nhà Ga T3 - Cảng HKQT Tân Sơn Nhất.</p>
            <p style="margin-bottom: 5px;"><sup>7</sup> Dự án chỉ tạo, nâng cấp QLG tuyển tránh TP. Hòa Bình, tính Hòa Bình (Ban 6) chậm khoảng 03 tháng do vướng mặc trong công tác GPMB.</p>
            <p style="margin-bottom: 5px;"><sup>8</sup> : (1, 2) Dự án đường Bộ Cái Minh đoạn Cho Chu - ngã Ba Trung Sơn, đoạn Rạch Sơi - Bến Nhất, Gò Quao - Vĩnh Thuận (Ban HCb4); (3) Dự án QLG đoạn Vĩnh Yên - Việt Trí, tinh Vĩnh Phúc (Ban Đường thủy); (4) Dự án QL 149, TP. Đà Nẵng (Số XĐ TP Đà Nẵng); (5) Dự án QL 28B, tính Bình Thuận và tính Lâm Đồng (Cục ĐBVN); (6) Dự án QL 46 đoạn TP.Vĩnh - TT.Nam Định (Ban Sợ).</p>
            <p style="margin-bottom: 5px;"><sup>9</sup> (1) Mai Sơn - Quốc tế 45 (Ban Thắng Long); (2) Quốc tế 45 - Nghỉ Sơn (Ban 2); (3) Nghỉ Sơn - Diễn Châu (Ban 6); (4) Vĩnh Hảo - Phan Thiết (Ban 7); (5) Phan Thiết - Dân Giây (Ban Thắng Long).</p>
            <p style="margin-bottom: 5px;"><sup>10</sup> DATP Mai Sơn - QL45 và DATP Phan Thiết - Dân Giây ngày 24/4/2025; DATP QL45 - Nghỉ Sơn ngày 18/4/2025; DATP Nghỉ Sơn - Diễn Châu ngày 17/4/2025; DATP Vĩnh Hảo - Phan Thiết ngày 21/4/2025.</p>
            <p style="margin-bottom: 5px;"><sup>11</sup> Triển khai tại 01 gói thầu riêng thuộc DATP Phan Thiết - Dân Giây.</p>
            <p><sup>12</sup> Quảng Bình còn 02/25 vị trí.</p>
          </div>

          <br />

          <p style="margin-bottom: 15px; text-align: justify;">
            Phong - Nha Trang (trong đó đoạn Hàm Nghi - Vũng Áng đạt 92,2%, Văn Phong - Nha Trang đạt 92,8% giá trị hợp đồng). Một số DATP có nguy cơ chậm như DATP đoạn Quảng Ngãi - Hoài Nhơn đạt 60,4%, Hoài Nhơn - Quy Nhơn đạt 70,0%, Cần Thơ - Hậu Giang đạt 68,8%, Hậu Giang - Cà Mau đạt 61,7%. Ngoài nguyên nhân do chậm bàn giao mặt bằng<sup>13</sup>, công suất khai thác các mô VLXD chưa đáp ứng, tại một số DATP một số nhà thầu triển khai thi công chưa quyết liệt, chưa đáp ứng yêu cầu<sup>14</sup>. Đề nghị các Chủ đầu tư yêu cầu các nhà thầu có các giải pháp nhằm tăng cường các mũi thi công, thiết bị nhân lực, tăng ca, tăng kíp dây nhanh tiến độ thi công bù tiến độ đã bị chậm, kiên quyết điều chuyển khối lượng thi công của các nhà thầu yếu sang cho các nhà thầu khác nếu không đáp ứng tiến độ yêu cầu.
          </p>

          <p style="font-weight: bold; margin-bottom: 10px;">- Về đầu tư hệ thống TFS, thu phí và KTTTX:</p>
          
          <ul style="list-style-type: disc; padding-left: 40px; margin-bottom: 15px;">
            <li>Công tác lựa chọn Tư vấn thiết kế (TVTK) và Tư vấn thẩm tra (TVTT): 10/12 DATP đã ký hợp đồng. 02 DATP<sup>15</sup> do Ban Thắng Long làm chủ đầu tư đã phê duyệt kết quả lựa chọn nhà thầu vào ngày 22/4/2025, dự kiến ký hợp đồng cuối tháng 4/2025 (chậm 20 ngày so với chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025).</li>
            
            <li>Công tác lập hồ sơ thiết kế và dự toán bước thiết kế triển khai sau TKCS:
              <ul style="list-style-type: circle; padding-left: 20px;">
                <li>06 DATP<sup>16</sup> dự kiến hoàn thành trong tháng 5/2025 (đúng theo chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025)</li>
                <li>04 DATP dự kiến đầu tháng 6/2025<sup>17</sup> (chậm 08 ngày đến 14 ngày so với chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025)</li>
                <li>02 DATP còn lại dự kiến hoàn thành cuối tháng 6/2025<sup>18</sup> (chậm 22 ngày so với chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025)</li>
              </ul>
            </li>
            
            <li>Về việc đầu tư hệ thống Back-End và Hệ thống quản lý cơ sở dữ liệu thanh toán điện tử giao thông đường bộ: Bộ đã đồng ý chủ trương bổ sung đầu tư vào DATP Văn Phong - Nha Trang (do Ban 7 làm chủ đầu tư) với yêu cầu trình Bộ trong tháng 03/2025<sup>19</sup>. Hiện Ban 7 đang tổ chức thực hiện đồng thời các nội dung công việc:
              <ul style="list-style-type: circle; padding-left: 20px;">
                <li><strong>(i)</strong> lập TKCS và chi phí đầu tư hệ thống Back-End</li>
                <li><strong>(ii)</strong> điều chỉnh kế hoạch lựa chọn Tư vấn song song với việc lập TKCS và chi phí đầu tư Hệ thống quản lý cơ sở dữ liệu thanh toán điện tử giao thông đường bộ</li>
                <li><strong>(iii)</strong> hoàn thiện thủ tục bổ sung các hệ thống trên vào DATP Văn Phong - Nha Trang</li>
              </ul>
              Đây là hạng mục thuộc "đường gắng" tiến độ, theo dự kiến, Ban QLDA 7 sẽ báo cáo Bộ trước ngày 25/4/2025 (chậm khoảng 02 tháng so với chỉ đạo của Bộ trưởng tại Thông báo số 51/TB-BXD ngày 04/4/2025).
            </li>
          </ul>

          <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
            <p style="margin-bottom: 5px;"><sup>13</sup> DATP đoạn Hoài Nhơn - Quy Nhơn: Nhà thầu Tổng công ty Xây dựng Trường Sơn mới nhận được mặt bằng để tiếp cận thi công từ ngày 30/11/2024 (chậm 8 tháng so với kế hoạch) do vướng điều chỉnh chủ trương CMPSD Rừng.</p>
            <p style="margin-bottom: 5px;"><sup>14</sup> Các nhà thầu phụ Đồng Khánh, Phú Hữu Vinh, A Châu, Udbacao, Bằng Dương - Tây An, thuộc DATP đoạn Quảng Ngãi - Hoài Nhơn. Nhà thầu Trường Thuật thuộc DATP đoạn Hoài Nhơn - Quy Nhơn.</p>
            <p style="margin-bottom: 5px;"><sup>15</sup> Bãi Vọt - Hàm Nghi và Hàm Nghi - Vũng Áng phải gia hạn thời gian mở thầu do không có nhà thầu Tư vấn tham gia.</p>
            <p style="margin-bottom: 5px;"><sup>16</sup> Vạn Ninh - Cam Lộ, Quảng Ngãi - Hoài Nhơn, Hoài Nhơn - Quy Nhơn, Quy Nhơn - Chí Thạnh, Chí Thạnh - Văn Phong, Văn Phong - Nha Trang dự kiến hoàn thành phê duyệt hồ sơ thiết kế và dự toán trong tháng 5/2025.</p>
            <p style="margin-bottom: 5px;"><sup>17</sup> Vũng Áng - Bùng, Bùng - Vạn Ninh, Cần Thơ - Hậu Giang, Hậu Giang - Cà Mau dự kiến hoàn thành phê duyệt hồ sơ thiết kế và dự toán vào đầu tháng 6/2025.</p>
            <p style="margin-bottom: 5px;"><sup>18</sup> Bãi Vọt - Hàm Nghi, Hàm Nghi - Vũng Áng.</p>
            <p><sup>19</sup> Các Thông báo số 393/TB-BGTVT ngày 31/12/2024 và số 23/TB-BXD ngày 14/3/2025; Văn bản số 293/BXD-CKTQLXD ngày 13/3/2025.</p>
          </div>

          <br />

            <p style="margin-bottom: 15px; text-align: justify;">
            51/TB-BXD ngày 04/4/2025<sup>20</sup>) để xin ý kiến các cơ quan chức năng của Bộ về phương án thiết kế và các thủ tục cần thiết làm cơ sở triển khai thực hiện
          </p>

          <h3 style="font-weight: bold; margin-bottom: 10px;">1.3. Dự án đường Hồ Chí Minh</h3>

          <p style="margin-bottom: 10px; font-style: italic;">
            (1) Dự án đường Hồ Chí Minh đoạn Chợ Chu - ngã Ba Trung Sơn (Ban Hồ Chí Minh, hoàn thành năm 2025, TMĐT 1.665 tỷ đồng):
          </p>
          <p style="margin-bottom: 10px; text-align: justify;">
            mặt bằng bàn giao đạt khoảng 68,32% (tính Thái Nguyên 12/12,24km đạt 98%; tính Tuyên Quang 7,8/16,74km đạt 46,6%); sản lượng đạt khoảng 19,0% chậm khoảng 2,42% so với kế hoạch do công tác GPMB chậm<sup>21</sup> tiềm ẩn nguy cơ không hoàn thành dự án theo kế hoạch. Bộ đã có Công điện gửi UBND tỉnh Tuyên Quang<sup>22</sup>, hợp với huyện ủy, UBND huyện Yên Sơn, tỉnh Tuyên Quang đề nghị đẩy nhanh tiến độ GPMB của Dự án nhưng đến nay vẫn chưa có tiến triển. Yêu cầu Ban HCM phối hợp chặt chẽ với hội đồng GPMB Q2 tỉnh Thái Nguyên và Tuyên Quang đẩy nhanh công tác GPMB, chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.
          </p>

          <p style="margin-bottom: 10px; font-style: italic;">
            (2) Dự án đường Hồ Chí Minh đoạn Boch Sôi - Bến Nhất, Gò Quao - Vĩnh Thuận (Ban HCM, hoàn thành năm 2025, TMĐT 3.904 tỷ đồng):
          </p>
          <p style="margin-bottom: 10px; text-align: justify;">
            tỉnh Kiên Giang đã bàn giao đạt khoảng 93,91%; tỉnh Bạc Liêu bàn giao đạt 100%. Sản lượng đạt khoảng 31,68%, chậm khoảng 5,2% tiềm ẩn nguy cơ không hoàn thành theo kế hoạch do mặt bằng bàn giao chậm, thiếu nguồn vật liệu đắp nền và các nhà thầu chưa tập trung thi công phân cầu (tại các vị trí cầu không vướng mặt bằng), chưa quyết liệt, khắc phục khó khăn, tim giải pháp thi công; huy động thiết bị, nhân lực chưa kịp thời. Ngày 28/3/2025, đoàn công tác do Thứ trưởng Phạm Minh Hà chủ trì đã kiểm tra hiện trường, hợp kiểm điểm tình hình thực hiện Dự án và đã chỉ đạo Chủ đầu tư và các đơn vị liên quan một số nội dung để đảm bảo hoàn thành dự án đúng kế hoạch<sup>23</sup>. Yêu cầu Ban HCM phối hợp chặt chẽ với địa phương đẩy nhanh tiến độ GPMB; chỉ đạo nhà thầu tăng cường huy động thiết bị, nhân lực, trung thi công đáp ứng tiến độ yêu cầu.
          </p>

          <p style="font-weight: bold; margin-bottom: 10px;">1.4. Các dự án đường bộ khu vực miền Bắc từ Ninh Bình trở ra:</p>
          <p style="margin-bottom: 10px;">Tổng số 09 dự án/09 DATP.</p>

          <h3 style="font-weight: bold; margin-bottom: 10px;">1.4.1. Các dự án đang hoàn chỉnh thủ tục về đầu tư, chuẩn bị khởi công:</h3>
          <p style="margin-bottom: 10px;">Tổng số 01 dự án/01 DATP.</p>

          <p style="margin-bottom: 10px; font-style: italic;">
            (1) Dự án đầu tư xây dựng cầu Ninh Cường vượt sông Ninh Cơ trên quốc lộ 37B (qua tỉnh Nam Định, vốn vay ODA của Hàn Quốc):
          </p>
          <p style="margin-bottom: 10px; text-align: justify;">
            chiều dài tuyến 1,65Km, trong đó cầu Ninh Cường dài 892,2m; quy mô B = 12,0m; tổng mức đầu từ 581,2 tỷ đồng. Bộ Xây dựng đã phê duyệt dự án đầu tư tại Quyết định số 747/QĐ-BGTVT ngày 18/6/2024. Ban Thăng Long (Chủ đầu tư) triển khai các thủ tục để lựa chọn nhà thầu TVTK, dự kiến khởi công quý III/2025.
          </p>

          <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
            <p style="margin-bottom: 5px;"><sup>20</sup> Theo Kết luận của Bộ trưởng và Thông báo số 51/TB-BXD ngày 04/4/2025, công tác phê duyệt thiết kế, lựa chọn nhà thầu và khởi công xây dựng yêu cầu thực hiện trường tháng 5/2025.</p>
            <p style="margin-bottom: 5px;"><sup>21</sup> Do công tác GPMB của tỉnh Tuyên Quang chậm và Tư vấn thiết kế (Công ty CP TVTK Cầu đường), Tư vấn giám sát khảo sát, khảo sát sai đường Lựa khoảng 14 đoạn của gói thầu XL2 qua Tuyên Quang (trong bảo hàng 2,2km) đến đến phát điện chuẩn thiết kế, thu hồi và chuyển đổi được tích cực thực trúng (CĐMBS/DR) bộ sung khoảng 27hạ, làm tăng thêm khối lượng đào nền khoảng 2,1 triệu m3 (dùng 80% khối lượng). Hiện nay, Ban HCM đã phê duyệt hồ sơ GPMB bộ sung và đang làm việc với địa phương sử công tác diện chính quy hoạch, kế hoạch sử dụng đất, CĐMDS/DR (thời gian CĐMDS/DR để thực hiện các bước trước khoảng 06 tháng đến 1,0 năm, thời điểm này sẽ khó khăn hơn do việc sẽ phù hợp thu, bộ cập huyện).</p>
            <p style="margin-bottom: 5px;"><sup>22</sup> Công điện 53/CB-BGTVT ngày 02/12/2024.</p>
            <p><sup>23</sup> Thông báo kết luận số 46/TB-BXD ngày 02/4/2025 của Bộ Xây dựng.</p>
          </div>

          <br />

          <p style="font-weight: bold; margin-bottom: 10px;">1.4.2. Các dự án đang triển khai thi công:</p>
            <p style="margin-bottom: 10px;">Tổng số 08 dự án/08 DATP</p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (1) Dự án tuyến tránh TP Cao Bằng, tỉnh Cao Bằng (Sở XD Cao Bằng, hoàn thành năm 2025, TMDT 371,843 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              mặt bằng bàn giao đạt 87% (còn khoảng 03 đoạn xói đỗ dài khoảng 1,0km), sản lượng đạt khoảng 40% cơ bản đáp ứng kế hoạch điều chỉnh. Bộ XD đã có Công điện<sup>24</sup> gửi UBND tỉnh Cao Bằng, Sở XD Cao Bằng đề nghị giải quyết dứt điểm vướng mắc về mặt bằng, đẩy nhanh tiến độ thi công. Yêu cầu Chủ đầu tư: (1) Chủ động phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các vướng mắc để bàn giao phần mặt bằng còn lại trong tháng 5/2025; (2) Chỉ đạo TVGS, nhà thầu thi công lập tiến độ thi công chi tiết đối với các khối lượng còn lại trên cơ sở mặt bằng được bàn giao thực tế, tăng cường máy móc, thiết bị, tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (2) Dự án QL,6 tuyến tránh TP Hòa Bình, tỉnh Hòa Bình (Ban 6, hoàn thành năm 2025, TMDT 517 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              mặt bằng bàn giao đạt khoảng 96% (còn khoảng 08 đoạn xói đỗ dài khoảng 370m), sản lượng đạt 89,84% cơ bản đáp ứng kế hoạch điều chỉnh. Yêu cầu Ban 6: (i) Chủ động làm việc, tích cực phối hợp với địa phương hoàn thành dứt điểm công tác GPMB, bàn giao mặt bằng còn lại cho đơn vị thi công; (ii) Chỉ đạo TVGS, nhà thầu thi công lập tiến độ thi công chi tiết đối với các khối lượng còn lại trên cơ sở mặt bằng được bàn giao thực tế, tăng cường máy móc, thiết bị, tập trung thi công hoàn thành những đoạn đã bàn giao mặt bằng, kiểm soát chặt chẽ chất lượng, tiến độ trong quá trình thực hiện Dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (3) Dự án kết nối giao thông các tỉnh miền núi phía Bắc (vốn ADB; Ban 2, hoàn thành tháng 6/2026, TMDT 6.018 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              mặt bằng bàn giao đạt khoảng 95%, sản lượng đạt<sup>25</sup> khoảng 63,42% cơ bản đáp ứng so với kế hoạch điều chỉnh<sup>26</sup>. Bộ đã có văn bản<sup>27</sup> gửi địa phương phối hợp giải quyết dứt điểm những vướng mắc còn lại trong công tác GPMB. Yêu cầu Ban 2 tập trung, quyết liệt giải quyết dứt điểm một số nội dung sau: (i) Phối hợp chặt chẽ với địa phương, đặc biệt đối với tỉnh Yên Bái để giải quyết dứt điểm về mặt bằng, sớm bàn giao mặt bằng tại gói thầu XL11 cho nhà thầu triển khai thi công<sup>28</sup>; (ii) Khẩn trương phối hợp với Vụ KH-TC hoàn thiện các thủ tục để sớm bố trí vốn còn lại cho công tác GPMB của dự án; (iii) Tổ chức kiểm tra, rà soát tiến độ thi công đối với từng gói thầu, yêu cầu các nhà thầu khẩn trương bố trí đầy đủ nhân lực, máy móc, thiết bị, vật tư, vật liệu để tổ chức thi công, sớm hoàn thành các đoạn tuyến đã bàn giao mặt bằng; kịp thời giải quyết các thủ tục nghiệm thu, thanh toán để kịp thời giải ngân khối lượng đã thi công; (iv) Chỉ đạo các nhà thầu huy động đầy đủ nhân lực, thiết bị, vật tư, có giải pháp hữu hiệu đẩy nhanh tiến độ thi công sau khi được bàn giao mặt bằng các đoạn còn lại.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (4) Dự án đầu tư xây dựng cầu Phong Châu mới - Quốc lộ 32C, tỉnh Phú Thọ theo Lệnh xây dựng công trình khẩn cấp (Ban Thắng Long, hoàn thành tháng 12/2025, TMDT 635,39 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              đã bàn giao mặt bằng 100%, thi công tháo dỡ cầu cũ đạt khoảng 95% khối lượng; thi công cọc khoan nhồi được 100%; thi công hoàn 
            </p>

            <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
              <p style="margin-bottom: 5px;"><sup>24</sup> Công điện số 02-BGTVT-CQJ.XD ngày 02/01/2025.</p>
              <p style="margin-bottom: 5px;"><sup>25</sup> Sản lượng đạt khoảng 78% đối với những đoạn đã bàn giao mặt bằng.</p>
              <p style="margin-bottom: 5px;"><sup>26</sup> Bộ phê duyệt kéo dài thời gian thực hiện Dự án tại Quyết định số 190/QĐ-BGTVT ngày 18/02/2025.</p>
              <p style="margin-bottom: 5px;"><sup>27</sup> Văn bản số 100/UBXD-KTQLXD ngày 25/3/2025, 1655/BXD-KTQLXD ngày 08/4/2025, 1661/BXD-KTQLXD ngày 08/4/2025 của Bộ XD.</p>
              <p><sup>28</sup> Địa phương cam kết bàn giao toàn bộ mặt bằng còn lại trong tháng 4/2025.</p>
            </div>

            <br />

            <p style="margin-bottom: 10px; text-align: justify;">
              thành trụ T1 và T2; hoàn thành đổ bê tông thân trụ T3; hoàn thành đổ bê tông thân trụ T5, đang lắp đặt gối cầu và hệ khung đà giáo thi công đốt K0; hoàn thành thi công lắp đặt 09 dầm I33 của nhịp (T1 - T2); sản lượng đạt khoảng 25,27% giá trị hợp đồng, đáp ứng tiến độ yêu cầu.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (5) Dự án QL.4B đoạn Km18 - Km80, tỉnh Long Sơn (Sở XD Long Sơn, hoàn thành năm 2025, TMĐT 2.296 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              mặt bằng bàn giao đạt 99,72% (còn 02 hộ chưa bàn giao mặt bằng), mặt bằng bàn giao còn vướng công trình HTKT; sản lượng đạt khoảng 39% cơ bản đáp ứng yêu cầu. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với các đơn vị liên quan, giải quyết dứt điểm công tác GPMB, di dời HTKT để bàn giao phần mặt bằng còn lại cho nhà thầu thi công; chỉ đạo TVGS, nhà thầu thi công huy động đầy đủ máy móc, thiết bị, nhân lực, vật lực thi công "3 ca, 4 kíp" đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (6) Dự án cải tạo, mở rộng QL.2 đoạn Vĩnh Yên - Việt Trì, tỉnh Vĩnh Phúc (Ban Đường thủy, hoàn thành năm 2025, TMĐT 1.258,18 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              Dự án khởi công ngày 09/12/2024, hiện các nhà thầu đang triển khai xây dựng văn phòng nhà điều hành, công tác huy động máy móc, thiết bị để tổ chức thi công cầu Thương Lạp (Km46+723); tiềm ẩn nguy cơ không hoàn thành theo kế hoạch.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (7) Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cao Bổ - Mai Sơn (Sở XD Ninh Bình, hoàn thành năm 2027, TMĐT 1.875,616 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              Dự án khởi công ngày 07/3/2025, gồm 01 gói thầu xây lắp, sản lượng đạt khoảng 3,8% đáp ứng yêu cầu.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (8) Dự án đầu tư tuyến nối cao tốc Nội Bài - Lào Cai với cao tốc Tuyên Quang - Phú Thọ (Sở XD Phú Thọ, hoàn thành năm 2025, TMĐT 692,565 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              Dự án khởi công ngày 28/02/2025, đã GPMB phần mặt đường mở rộng phía trái tuyến trong giai đoạn 1 đường Hồ Chí Minh, đang triển khai kiểm kê, bồi thường GPMB phần bổ sung; nhà thầu đang triển khai công tác huy động lán trại, máy móc, thiết bị để tổ chức thi công phá dỡ kết cấu, thi công mặt bằng bãi đúc dầm,...; thi công đào đất không thích hợp; thi công hàm chui; thi công đúc dầm super T; sản lượng đạt khoảng 2,36% đáp ứng tiến độ yêu cầu.
            </p>

            <p style="font-weight: bold; margin-bottom: 10px;">1.5. Các dự án đường bộ khu vực miền Trung từ Thanh Hóa đến Bình Thuận và khu vực Tây Nguyên:</p>
            <p style="margin-bottom: 10px;">Tổng số 14 dự án/14 DATP</p>

            <h3 style="font-weight: bold; margin-bottom: 10px;">1.5.1. Các dự án đang hoàn chỉnh thủ tục về đầu tư, chuẩn bị khởi công:</h3>
            <p style="margin-bottom: 10px;">Tổng số 02 dự án/02 DATP.</p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (1) Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn Cam Lô - La Sơn (Ban HCM, TMĐT 6.488 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              Thủ tướng Chính phủ phê duyệt chủ trương đầu tư tại Quyết định số 1244/QĐ-TTg ngày 23/10/2024; Chủ đầu tư đang hoàn chỉnh thủ tục về đầu tư, trình thẩm định, phê duyệt dự án đầu tư, dự kiến tháng 3/2025.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (2) Dự án mở rộng đường bộ cao tốc Bắc - Nam phía Đông đoạn La Sơn - Hòa Liên (Ban HCM, TMĐT 3.010 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              Bộ đã phê duyệt dự án đầu tư tại Quyết định số 1492/QĐ-BGTVT ngày 06/12/2024; Chủ đầu tư có tờ trình số 814/TTr-BQLDADHCM ngày 31/3/2025 trình Cục KT-QLĐTXD thẩm định TK triển khai sau TKCS; hiện Chủ đầu tư đang chỉ đạo các đơn vị tư vấn hoàn thiện hồ sơ.
            </p>

            <p style="font-weight: bold; margin-bottom: 10px;">1.5.2. Các dự án đang triển khai thi công:</p>
            <p style="margin-bottom: 10px;">Tổng số 12 dự án/12 DATP.</p>

            <br />

            <p style="margin-bottom: 10px; font-style: italic;">
                *(1) Dự án đường cao tốc đoạn Hòa Liên - Tùy Loan (Ban HCM, hoàn thành tháng 12/2025, TMĐT 2.113 tỷ đồng)*
            </p>
            <ul style="list-style-type: disc; padding-left: 40px; margin-bottom: 10px;">
                <li>Công tác GPMB, di dời HTKT: bàn giao 100% tuyến chính; đường gom, đường ngang đã tiếp cận thi công được khoảng 98,5%, còn 0,3km chưa thể tiếp cận thi công<sup>1</sup>.</li>
                <li>Tình hình thi công: sản lượng đạt khoảng 52,7% cơ bản đáp ứng kế hoạch, tuy nhiên thủ tục nâng công suất mỏ Trường Bản chậm, địa phương dự kiến hoàn thành trong tháng 4/2025<sup>2</sup>. Yêu cầu Ban HCM phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các khó khăn vướng mắc, bàn giao nốt phần mặt bằng còn lại trong tháng 4/2025; phối hợp chặt chẽ, cụ thể với địa phương để hoàn thiện thủ tục nâng công suất mỏ đá theo chỉ đạo của Thủ tướng Chính phủ<sup>3</sup>, đồng thời yêu cầu các nhà thầu chủ động nguồn vật liệu, tập trung thi công đẩy nhanh tiến độ dự án.</li>
            </ul>

            <p style="margin-bottom: 10px; font-style: italic;">
                *(2) Dự án QL.T đoạn Km0-Km36 và xử lý sụt trượt do bão lũ đoạn Khe Thơi - Năm Cấu, tỉnh Nghệ An (Cục ĐBVN, hoàn thành 12/2025, TMĐT 1.300 tỷ đồng):*
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
                mặt bằng bàn giao đạt khoảng 97,8%, sản lượng đạt khoảng 84,95%, chậm 10,15% so với kế hoạch do vướng mắc về mặt bằng. Yêu cầu Cục ĐBVN phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các khó khăn vướng mắc, bàn giao nốt phần mặt bằng còn lại trong tháng 4/2025; chỉ đạo nhà thầu tập trung thi công bù lại tiến độ bị chậm, đáp ứng tiến độ yêu cầu.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
                *(3) Dự án QL.SG đoạn từ Thiên Cầm - QL.1 và đoạn từ QL.8 - đường HCM (Sở XD Hà Tĩnh, hoàn thành tháng 10/2025, TMĐT 1.076 tỷ đồng):*
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
                mặt bằng bàn giao đạt khoảng 97%, sản lượng đạt khoảng 38% cơ bản đáp ứng kế hoạch. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các khó khăn vướng mắc, bàn giao nốt phần mặt bằng còn lại trong tháng 4/2025; chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
                *(4) Dự án đường tránh phía Đông TP Đông Hà, tỉnh Quảng Trị (Sở XD Quảng Trị, hoàn thành năm 2025, TMĐT 400 tỷ đồng):*
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
                mặt bằng bàn giao đạt khoảng 97%, sản lượng đạt khoảng 52% cơ bản đáp ứng kế hoạch điều chỉnh. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các khó khăn vướng mắc, bàn giao nốt phần mặt bằng còn lại trong tháng 4/2025; chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
                *(5) DATP 1 đoạn tránh TX Ba Đồn thuộc Dự án QL.124 (Sở XD Quảng Bình, hoàn thành năm 2025, TMĐT 477,18 tỷ đồng):*
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
                mặt bằng bàn giao đạt khoảng 96%, sản lượng đạt khoảng 62%, cơ bản đáp ứng kế hoạch. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các khó khăn vướng mắc, bàn giao nốt phần mặt bằng còn lại trong tháng 4/2025; chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
                *(6) Dự án QL.14B, TP Đà Nẵng (Sở XD TP Đà Nẵng, hoàn thành tháng 6/2025, TMĐT 788 tỷ đồng):*
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
                mặt bằng đã bàn giao đạt khoảng 65,3%; sản lượng đạt khoảng 27,83% chậm khoảng 46,98%, tiềm ẩn nguy cơ không hoàn thành theo kế hoạch do mặt bằng bàn giao "xói đổ", chưa di dời xong HTKT và chưa bố trí
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: none;">
                <tr>
                    <td style="width: 50%;"></td>
                    <td style="width: 50%;"></td>
                </tr>
            </table>

            <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
                <p style="margin-bottom: 5px;"><sup>29</sup> Địa phương dự kiến hoàn thành trong tháng 4/2025.</p>
                <p style="margin-bottom: 5px;"><sup>30</sup> Sở Nông nghiệp và Môi trường Đà Nẵng đã hoàn thành thủ tục thẩm định và trình UBND TP Đà Nẵng ngày 21/4/2025.</p>
                <p><sup>31</sup> Thông báo số 168/TB-VPCP ngày 09/4/2025.</p>
            </div>

            <br />

            <p style="margin-bottom: 10px; text-align: justify";>
              xong TĐC cho các hộ dân phải di dời, nhà thầu thi công chậm; Bộ Xây dựng đã có các văn đề nghị UBND TP. Đà nẵng chỉ đạo các đơn vị đẩy nhanh tiến độ GPMB, thực hiện dự án. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với các đơn vị liên quan đẩy nhanh công tác GPMB, di dời HTKT để bàn giao mặt bằng cho đơn vị thi công; chỉ đạo nhà thầu thi công tranh thủ thời tiết thuận lợi, tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (7) Dự án QL.14E đoạn Km15+270 - Km89+700, tỉnh Quảng Nam (Cục ĐBVN, hoàn thành tháng 12/2025, TMĐT 1.848 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              mặt bằng bàn giao đạt khoảng 93%; sản lượng đạt khoảng 45,58%, chậm 10,5% so với kế hoạch điều chỉnh chính<sup>29</sup>. Nguyên nhân do công tác GPMB của huyện Thăng Bình, huyện Hiệp Đức triển khai chậm ảnh hưởng đến tiến độ triển khai thi công, một số vị trí đã bàn giao bị xen kẹp, "xôi đổ", chưa hoàn thành di dời HTKT; một số nhà thầu<sup>30</sup> huy động chưa đầy đủ máy móc, thiết bị, nhân lực như cam kết, không đáp ứng tiến độ so với kế hoạch đã đề ra; thời tiết khu vực dự án thời gian qua xuất hiện mưa nhiều ảnh hưởng đến tiến độ thi công. Yêu cầu Cục ĐBVN phối hợp với địa phương giải quyết dứt điểm các tồn tại trong công tác GPMB; chỉ đạo nhà thầu thi công tập trung huy động nguồn lực tài chính, nhân lực, tranh thủ thời tiết thuận lợi, tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (8) Dự án QL.28B, tỉnh Bình Thuận và tỉnh Lâm Đồng (Cục ĐBVN, hoàn thành tháng 12/2025, TMĐT 1.435 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              mặt bằng bàn giao đạt khoảng 40,9%, sản lượng đạt khoảng 23,14%, chậm khoảng 7,88% tiềm ẩn nguy cơ không hoàn thành theo kế hoạch do công tác GPMB chậm, một số vị trí đã bàn giao bị xen kẹp, "xôi đổ", chưa hoàn thành di dời HTKT; địa phận tỉnh Bình Thuận chưa hoàn thành công tác CMBSDR<sup>31</sup> ảnh hưởng đến công tác điều phối đất để đắp nền của Dự án; công tác bố trí nhân lực, máy móc, thiết bị của một số nhà thầu (Công ty Trung Trung Bộ, Cầu đường Anh Tuấn) chưa đáp ứng yêu cầu. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với địa phương để đẩy nhanh công tác bàn giao mặt bằng trước 30/4/2025; chỉ đạo nhà thầu huy động đầy đủ máy móc, thiết bị, tập trung thi công đẩy nhanh tiến độ dự án.
            </p>

            <p style="margin-bottom: 10px; font-style: italic;">
              (9) Dự án nâng cấp đoạn tuyến qua đèo Mimosa và một số công trình trên QL.20, tỉnh Lâm Đồng (Ban 85, hoàn thành tháng 12/2025, TMĐT 441 tỷ đồng):
            </p>
            <p style="margin-bottom: 10px; text-align: justify;">
              về mặt bằng, hiện còn vướng mắc cục bộ tại đường đầu cầu Đại Ninh (mố M2), Đại Nga (mố M2), sản lượng đạt khoảng 90,6% cơ bản đáp ứng yêu cầu. Yêu cầu Ban 85 phối hợp chặt chẽ với địa phương, giải quyết dứt điểm phần mặt bằng còn lại, chỉ đạo nhà thầu huy động tăng cường nhân lực, thiết bị, vật tư, vật liệu, tranh thủ thời tiết thuận lợi đẩy nhanh tiến độ thi công.
            </p>

            <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
              <p style="margin-bottom: 5px"><sup>32</sup>
                Các văn bản: số 12108/BGTVT-QLĐTXD ngày 08/11/2024, số 1242/BND-KTQLXD ngày 31/3/2025.
              </p>

              <p style="margin-bottom: 5px"><sup>33</sup>
                Trong đó: Gói thầu XD01 đạt 37,16% giá trị hợp đồng, chậm 12,22% so với kế hoạch; Gói thầu XD02 đạt 41,52% giá trị hợp đồng, chậm 11,95% so với kế hoạch; Gói thầu XD03 đạt 58,32% giá trị hợp đồng, chậm 7,08% so với kế hoạch.
              </p>

              <p style="margin-bottom: 5px"><sup>34</sup>
                Công ty CP tập đoàn Đông Dương (gói XD01, XD02); Công ty 439, Đông Thuận Hà (Gói XD01); Công ty CP ĐTXD thường trú Tân Hoàng Long, Thuận An, Tây An, 134 Việt Nam (Gói XD02); Công ty Hoàng Lộc, Đại Hồng Phúc, Thuận Phú, Hoàng Long (Gói XD03).
              </p>

              
              <p><sup>35</sup> Công tác thu hồi đất rừng để bàn giao cho dự án còn nhiều thủ tục, mất nhiều thời gian thực hiện: UBND tỉnh Bình Thuận đã ban hành Quyết định chuyển mục đích sử dụng rừng sang mục đích khác. Hiện nay địa phương đang tổ chức kiểm đếm, định giá rừng để thực hiện công tác bồi thường. Địa phận tỉnh Lâm Đồng đã hoàn thành và bàn giao cho nhà thầu thi công. Theo chỉ đạo của Cục ĐBVN, địa phương đã có cam kết dự kiến công tác bàn giao mặt bằng hoàn thành trong trước 30/4/2025 chậm so với kế hoạch quý I/2025.</p>
            </div>

            <br />

            <p style="margin-bottom: 10px; text-align: justify;">
      thủ điều kiện thời tiết thuận lợi, tập trung triển khai thi công đẩy nhanh tiến độ Dự án. Đối với Gói thầu số 19 (gói thầu bổ sung): Ban QLDA 85 đang thực hiện thẩm định, phê duyệt TKBVTC, dự toán theo quy định
    </p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (10) Dự án tuyến tránh phía Đông TP Buôn Ma Thuột (Ban QLDA tỉnh Đắk Lắk, hoàn thành năm 2025, TMĐT 1.841 tỷ đồng):
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      mặt bằng bàn giao đạt khoảng 99,3%; sản lượng đạt khoảng 73,8% chậm khoảng 16,2% so với kế hoạch điều chỉnh, do công tác GPMB chậm, một số vị trí đã bàn giao bị xen kẹp, "xót đổ", chưa hoàn thành di dời HTKT; một số nhà thầu chưa chủ động trong việc triển khai thi công<sup>32</sup>. Yêu cầu Ban QLDA tỉnh Đắk Lắk: (1) Tiếp tục phối hợp chặt chẽ với các địa phương tháo gỡ khó khăn, giải quyết dứt điểm các tồn tại, vướng mắc để sớm bàn giao phần mặt bằng còn lại; (2) Chỉ đạo nhà thầu tập trung huy động mọi nguồn lực để triển khai thi công đáp ứng tiến độ yêu cầu.
    </p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (11) Dự án nâng cấp, mở rộng một số cầu, hầm trên quốc lộ 1 (các cầu Xương Giang, Gianh, Quán Hàu và hầm Đèo Ngang) (Ban Đường sắt, TMĐT 1.999,85 tỷ đồng):
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      Dự án đã khởi công tháng 01/2025, hoàn thành công tác bàn giao cọc mốc GPMB cho địa phương; sản lượng thi công đạt khoảng 12,5%, cơ bản đáp ứng kế hoạch. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với địa phương, giải quyết các khó khăn vướng mắc, đẩy nhanh tiến độ bàn giao mặt bằng; chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.
    </p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (12) Dự án QL 46 đoạn TP.Vinh - TT.Nam Đàn (Ban 85, TMĐT 500 tỷ đồng):
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      Dự án đã khởi công vào ngày 15/3/2025, mặt bằng bàn giao đạt 41,15%; sản lượng đạt khoảng 0,24%, chậm so với kế hoạch do vướng mắc về mặt bằng. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với địa phương, giải quyết các khó khăn vướng mắc, đẩy nhanh tiến độ bàn giao mặt bằng; chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.
    </p>

    <p style="font-weight: bold; margin-bottom: 10px;">1.6. Các dự án khu vực miền Nam từ Bình Phước đến Cà Mau:</p>
    <p style="margin-bottom: 10px;">Tổng số 10 dự án/10 DATP.</p>

    <h3 style="font-weight: bold; margin-bottom: 10px;">1.6.1. Các dự án đang hoàn chỉnh thủ tục về đầu tư, chuẩn bị khởi công:</h3>
    <p style="margin-bottom: 10px;">Tổng số 03 dự án/03 DATP.</p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (1) Điều chỉnh Dự án cao tốc Mỹ Thuận - Cần Thơ GĐ1:
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      việc bổ sung nút giao với đường Võ Văn Kiệt, đường gom, Trung tâm quản lý điều hành giao thông và thiết bị ITS đã được Thủ tướng Chính phủ phê duyệt điều chỉnh chủ trương đầu tư dự án<sup>33</sup>; Bộ Xây dựng đã phê duyệt điều chỉnh dự án<sup>34</sup>, dự kiến hoàn tất thủ tục phê duyệt TKKT và khởi công trong quý II/2025.
    </p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (2) Dự án cải tạo cầu yếu và cầu kết nối trên các quốc lộ (Giai đoạn II):
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      đã thẩm định cơ quan chuyên môn về xây dựng hồ sơ TKKT, dự toán 01/03 gói thầu; Ban 2 (Chủ đầu tư) đang thực hiện khảo sát, lập TKKT, dự toán 02/03 gói thầu xây lắp còn lại; dự kiến khởi công trong Quý II/2025.
    </p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (3) Dự án 03 tuyến Quốc lộ (53, 62, Nam Sông Hậu) tại đồng bằng sông Cửu Long (Cục ĐBVN làm Chủ đầu tư):
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      Đang trình Thủ tướng Chính phủ phê duyệt Chủ trương đầu tư.
    </p>

    <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
      <p style="margin-bottom: 5px;"><sup>36</sup> Công ty TNHH xây dựng và thương mại Sài Gòn, đã được điều chuyển bớt một phần khối lượng sang Công ty TNHH An Nhiên.</p>
      <p style="margin-bottom: 5px;"><sup>37</sup> Quyết định số 113/QĐ-TTg ngày 09/10/2024 của Thủ tướng Chính phủ.</p>
      <p><sup>38</sup> Quyết định số 356/QĐ-BXD ngày 04/4/2025.</p>
    </div>

    <br />

    <p style="font-weight: bold; margin-bottom: 10px;">1.6.2. Các dự án đang triển khai thi công: Tổng số 07 dự án/07 DATP.</p>

    <p><em>(1) DATP 1 thuộc Dự án Tân Vạn - Nhơn Trạch giai đoạn 1 (vốn EDCF, Ban Mỹ Thuận, hoàn thành tháng 9/2025, TMĐT 6.955,65 tỷ đồng):</em> đã hoàn thành GPMB; sản lượng đạt 94,1%, chậm khoảng 1,0% so với tiến độ yêu cầu; trong đó gói thầu CW1 (cầu Nhơn Trạch) đạt 98% khối lượng, dự kiến thông xe kỹ thuật vào dịp 30/4/2025, gói thầu CW2 (phần đường) đạt 88,5% khối lượng, dự kiến hoàn thành vào tháng 6/2025. Công tác chuẩn bị đầu tư bổ sung đơn nguyên cầu Nhơn Trạch 2 đang được triển khai thực hiện. Ban Mỹ Thuận chỉ đạo nhà thầu gói thầu CW2 tập trung thi công để hoàn thành toàn bộ dự án vào tháng 6/2025 theo đúng kế hoạch.</p>

    <p><em>(2) Dự án cầu Đại Ngãi trên QL.60, tỉnh Trà Vinh và Sóc Trăng (Ban 85; hoàn thành 2027, TMĐT 8.015 tỷ đồng):</em> đã bàn giao xong mặt bằng; sản lượng thi công đạt khoảng 22,53%, chậm 3,25% so với kế hoạch chủ yếu do phần tuyến của gói thầu số 11-XL (thi công cầu Đại Ngãi 2, tuyến và các công trình trên tuyến) gặp khó khăn về nguồn vật liệu cát đắp nền đường<sup>1</sup> và tiến độ triển khai gói thầu 15-XL (thi công cầu dây văng Đại Ngãi 1 và đường đầu hai đầu cầu) còn chậm. Gói thầu 15-XL đã khởi công từ ngày 12/01/2025, bắt đầu triển khai thi công hạng mục cọc khoan nhồi, dự kiến hoàn thành vào tháng 6/2028 (thời gian thi công khoảng 42 tháng). Yêu cầu Ban 85 tiếp tục làm việc về các mỏ cát đang khai thác, chuẩn bị khai thác thương mại trên địa bàn đã được 02 tỉnh giới thiệu và các nguồn cát đáp ứng yêu cầu khác để ưu tiên cung cấp cho Dự án; khẩn trương triển khai thi công gói thầu 15-XL, đáp ứng tiến độ yêu cầu.</p>

    <p><em>(3) Dự án cầu Rạch Miễu 2 (Ban Mỹ Thuận; hoàn thành tháng 12/2025, TMĐT 5.175 tỷ đồng):</em> đã bàn giao xong mặt bằng chỉ còn vướng một công trình HTKT<sup>2</sup>; sản lượng đạt khoảng 84,38% đáp ứng kế hoạch, đã hoàn thành hợp long cầu chính ngày 19/4/2025. Yêu cầu Ban Mỹ Thuận quyết liệt chỉ đạo các nhà thầu huy động đầy đủ nguồn lực, máy móc, thiết bị, nhân vật lực triển khai thi công; phối hợp chặt chẽ với tỉnh Tiền Giang hoàn thành di dời công trình HTKT còn lại; sớm hoàn thành đoạn tuyến mở rộng ĐT.870 và đoạn tuyến phía bờ Bến Tre từ cầu Mỹ Tho đến cầu Sông Mã; hoàn thành đoạn từ sau cầu Sông Mã đến cuối tuyến trong Quý II/2025, phấn đấu hoàn thành toàn bộ dự án trong dịp 02/9/2025 (rút ngắn 04 tháng so với kế hoạch).</p>

    <p><em>(4) Dự án QL.30 đoạn Cao Lãnh - Hồng Ngự, tỉnh Đồng Tháp, giai đoạn 3 (Sở XD Đồng Tháp, hoàn thành tháng 9/2025, TMĐT 912 tỷ đồng):</em> đã bàn giao xong mặt bằng đối với tuyến chính, đang thực hiện GPMB phân khu giao bổ sung<sup>3</sup>; sản lượng đạt khoảng 80,1% cơ bản đáp ứng yêu cầu; Dự án cần huy động 30.000m³ cát để hoàn thành công tác đắp nền đường và 35.000m3 cấp phối đá dăm, 10.000m3 đá bê tông nhựa để thi công kết cấu mặt đường, các nhà thầu đang tích cực triển khai thi công.</p>

    <div style="font-size: 11pt; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
        <p><em><sup>39</sup> Tổng nhu cầu vật liệu cát đắp cần Dự án khoảng 1,01 triệu m3; trong đó gói thầu 11-XL cần 0,84 triệu m3 và gói thầu 15-XL cần 0,71 triệu m3. Đến nay đã tập kết về công trường được khoảng 0,74 triệu m3, còn lại 0,27 triệu m3 (trong đó mới xác định nguồn được 0,21 triệu m3 cho gói thầu 11-XL và 0,15 triệu m3 chưa xác định nguồn cho gói thầu 15-XL). Tiến độ cung cấp cát cho gói thầu 11-XL chưa đáp ứng yêu cầu do phải tìm kiếm mở vật liệu mới cho cát đắp K98.</em></p>
        <p><emp><sup>40</sup> Gói XL01: Đoạn mở rộng ĐT820 thuộc địa phận tỉnh Tiền Giang còn vướng 01 cột điện cao thế 110kV. Dự kiến hoàn thành trong tháng 4/2025.</em></p>
        <p><emp><sup>41</sup> 05 hộ dân lấn chiếm phạm vi đã giải phóng mặt bằng (không ảnh hưởng đến thi công) và 02 vị trí nút giao có bổ sung phạm vi giải phóng mặt bằng.</em></p>
    </div>

    <br />

    <p style="margin-bottom: 10px; text-align: justify;">
      sử dụng nguồn thương mại. Yêu cầu Chủ đầu tư phối hợp chặt chẽ với sở, ngành, các cấp chính quyền địa phương giải quyết dứt điểm các vướng mắc để bàn giao toàn bộ mặt bằng cho dự án trong tháng 4/2025; chỉ đạo nhà thầu chủ động huy động nguồn vật liệu cát đắp, tăng cường công tác tập kết cấp phối đá dăm, đá cho bê tông nhựa để thi công móng đường, đáp ứng tiến độ yêu cầu.
    </p>

    <p style="margin-bottom: 10px; font-style: italic;">
      (5). DATP 2 thuộc cao tốc Biên Hòa - Vũng Tàu (Ban 85, hoàn thành tháng 12/2025, TMĐT 6.852 tỷ đồng)
    </p>

    <ul style="list-style-type: disc; padding-left: 40px; margin-bottom: 15px;">
      <li>Công tác GPMB: mặt bằng bàn giao đạt khoảng 98,55%; tuy nhiên công tác di dời HTKT còn chậm<sup>35</sup>. Chi phí GPMB các DATP đều tăng so với sơ bộ TMĐT được duyệt<sup>36</sup> dẫn đến phải điều chỉnh chủ trương đầu tư, điều chỉnh dự án. Hiện nay, Bộ XD đã tổ chức thẩm định nội bộ và đã trình cấp có thẩm quyền theo quy định.</li>
      
      <li>Mỏ vật liệu:
        <ul style="list-style-type: circle; padding-left: 20px;">
          <li>Vật liệu đất đắp: Nhu cầu cần 3,2 triệu m3; UBND tỉnh Đồng Nai đã cấp phép khai thác các mỏ đất đủ nhu cầu đất<sup>37</sup> cho dự án.</li>
          <li>Về vật liệu đá: UBND tỉnh Đồng Nai đã phân bổ khối lượng đá về cho dự án<sup>38</sup>, các nhà thầu đã chủ động tập kết đá về công trường.</li>
        </ul>
      </li>
      
      <li>Tình hình thi công: sản lượng đạt khoảng 42%, chậm khoảng 3,27% so với kế hoạch, nguyên nhân chủ yếu do chậm GPMB và thiếu vật liệu đất đắp. Yêu cầu Ban 85 phối hợp chặt chẽ với địa phương, giải quyết dứt điểm các khó khăn vướng mắc, đẩy nhanh tiến độ GPMB; chỉ đạo các nhà thầu chủ động nguồn vật liệu, tập trung thi công 3 ca, 4 kíp<sup>39</sup> đảm bảo tiến độ yêu cầu.</li>
    </ul>

    <p style="margin-bottom: 10px; font-style: italic;">
      (6) Dự án cao tốc Bến Lức - Long Thành (VEC, hoàn thành tháng 9/2025, TMĐT 29.587 tỷ đồng):
    </p>
    <p style="margin-bottom: 10px; text-align: justify;">
      sản lượng chung toàn dự án đạt khoảng 90,98% chậm khoảng 5,38% so với kế hoạch; còn 07 gói thầu<sup>40</sup> đang thi công; 01 gói thầu xây lắp đấu thầu lại (gói thầu J3-1) mới hoàn thành công tác lựa chọn nhà thầu<sup>41</sup>. Đã đưa vào khai thác tạm 02 đoạn tuyến thuộc Dự án với tổng chiều dài 10,4km<sup>42</sup> trước Tết Nguyên đán Ất Tỵ và thông xe kỹ thuật đoạn tuyến phía Tây dài 18,4km ngày 19/4/2025. Công tác GPMB bổ sung cho gói thầu nút giao QL.51 thực hiện còn chậm, việc xử lý các chi phí phát sinh do dừng chờ, khiếu kiện của các nhà thầu còn nhiều vướng mắc. Yêu cầu VEC chỉ đạo nhà thầu gói thầu J3-1 khẩn trương triển khai thi công; phối hợp các bên liên quan trong việc xác định các chi phí phát sinh do dừng chờ, giải quyết các khiếu kiện của nhà thầu, bảo đảm hợp lý,
    </p>

    <div style="font-size: 11pt; margin-top: 30px; border-top: 1px solid black; padding-top: 10px; font-style: italic;">
      <p style="margin-bottom: 5px;"><sup>42</sup> Chưa di dời 01 vị trí đường điện cao thế 500KV, 06 vị trí 220KV, 07 vị trí 110KV.</p>
      <p style="margin-bottom: 5px;"><sup>43</sup> Theo Tờ trình số 392/QTT-BQL/BSB ngày 24/12/2024 của Ban 85, chi phí GPMB dự kiến thực khoảng 3.126 tỷ đồng so với chi phí GPMB trong TMĐT đã được Quốc hội thông qua tại Nghị quyết số 59/2022/QH15 (DATP1: tăng 108 tỷ đồng, DATP2: tăng 546 tỷ đồng, DATP3: tăng 2.688 tỷ đồng).</p>
      <p style="margin-bottom: 5px;"><sup>44</sup> Đã cấp phép mỏ Phước Bình (khai thác từ cao độ +42m được 1 triệu m3); UBND tỉnh Đồng Nai đã cấp tiếp giấy phép số 33/GP-UBND ngày 14/3/2023 khai thác mỏ đất Từ Long (Sao - Cẩm Mỹ (0,165 triệu m3); số 34/GP-UBND ngày 19/2/2023 khai thác mỏ đất Bản Cầm (0,75 triệu m3); số 35/GP-UBND ngày 20/3/2023 khai thác mỏ đất Phước Bình từ cao độ +42m xuống +35m (1,1 triệu m3).</p>
      <p style="margin-bottom: 5px;"><sup>45</sup> Văn bản số 2206/UBND-KTN ngày 07/3/2025</p>
      <p style="margin-bottom: 5px;"><sup>46/sup> A2.2.4, T1, A6.2, A6.3, A6.5, A8 và XL-NG51.</p>
      <p style="margin-bottom: 5px;"><sup>47</sup> Các gói thầu xây lắp A1, A2.3, A4, A6, J3 chậm so với hợp đồng, phải đấu thầu lại, trong đó các gói A1-1 (còn lại của A1), A2-4 (còn lại của A2.2 và A4); A6.1, A6.2, A6.3, A6.4, A6-5 (còn lại và bổ sung của A6) đã hoàn thành LCNT; riêng gói GG J3-1 (thi công phần còn lại của gói thầu J3) phải hủy thông báo mời thầu.</p>
      <p><sup>48</sup> đoạn tuyến từ nút giao với đường cao tốc Thành phố Hồ Chí Minh - Trung Lương đến nút giao Quốc lộ 1A (Km04+600 ÷ Km3+420) và đoạn tuyến từ nút giao Phước An đến nút giao Quốc lộ 51 (Km504300 ÷ Km57+700).</p>
    </div>

    <br />

    <p>hợp lệ, phù hợp với quy định của pháp luật; đôn đốc các nhà thầu chủ động tìm kiếm nguồn vật liệu cho dự án; huy động mọi nguồn lực, tăng ca kíp đẩy nhanh tiến độ thi công để hoàn thành đúng tiến độ, tiếp tục đưa vào khai thác một số đoạn tuyến trong năm 2025.</p>

    <p><em>(7) Dự án nâng cao tầm không các cầu đường bộ, đường sắt cắt qua tuyến ĐTNĐ quốc gia - giai đoạn 1 (Khu vực phía Nam) (Ban Đường thủy, hoàn thành 12/2025, TMĐT 2.155 tỷ đồng):</em> mặt bằng bàn giao đạt 70% (nhà thầu đã tiếp cận toàn bộ để thi công); sản lượng thi công đạt 34%, chậm 2,2% so với kế hoạch do mặt bằng bàn giao chậm. Yêu cầu Ban Đường thủy phối hợp chặt chẽ với địa phương để đẩy nhanh tiến độ GPMB, đôn đốc các nhà thầu tập trung thi công bù lại tiến độ bị chậm.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">2. Các dự án đường sắt: Tổng số 12 dự án.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">2.1. Các dự án đang hoàn chỉnh thủ tục về đầu tư, chuẩn bị khởi công: Tổng số 03 dự án</p>

    <p><em>(1) Dự án đường sắt tốc độ cao trục Bắc - Nam:</em> (1) Ban QLDA Đường sắt đang lập lại tiến độ Dự án đảm bảo khởi công trong tháng 12 năm 2026 theo chỉ đạo của Thủ tướng Chính phủ để trình Chính phủ ban hành Nghị quyết triển khai thực hiện Nghị quyết số 172/2024/QH15 và đang tổ chức lựa chọn đơn vị tư vấn thực hiện dự án. (2) Đang nghiên cứu tham mưu cho Chính phủ ban hành Nghị định quy định chi tiết một số điều và biện pháp thi hành các Nghị quyết của Quốc hội về thiết kế kỹ thuật tổng thể (thiết kế FEED), cơ chế đặc thù, đặc biệt thực hiện các dự án đường sắt.</p>

    <p><em>(2) Dự án "Cải tạo khu gian Hòa Duyệt - Thanh Luyện, tuyến đường sắt Hà Nội - TP. Hồ Chí Minh":</em> TVTK đang tiến hành khảo sát, lập hồ sơ TKKT, dự toán; hỗ trợ đấu thầu xây lắp; giám sát thi công xây dựng; đáp ứng tiến độ yêu cầu.</p>

    <p><em>(3) Dự án tuyến đường sắt Lào Cai - Hà Nội - Hải Phòng:</em> (1) Cục KT-QLĐTXD đã phối hợp với Ban Đường sắt tiếp thu, tham mưu Bộ Xây dựng văn bản giải trình ý kiến của các Bộ, ngành, địa phương, báo cáo Thủ tướng Chính phủ dự thảo Nghị quyết của Chính phủ triển khai thực hiện Nghị quyết số 187/2025/QH15; hiện đang tiếp tục lấy ý kiến của các thành viên Chính phủ; (2) Vụ Hợp tác quốc tế, Kế hoạch - Tài chính, Ban Đường sắt đang chuẩn bị nội dung và phối hợp với đơn vị của Trung Quốc để sớm phê duyệt khoản viện trợ không hoàn lại, lựa chọn tư vấn khảo sát, lập Báo cáo NCKT.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">2.2. Các dự án đang triển khai thi công: Tổng số 09 dự án.</p>

    <p style="font-weight: bold; margin-bottom: 5px;">a) Các dự án đường sắt giai đoạn 2016-2020</p>

    <p><em>(1) Dự án cải tạo, nâng cấp các công trình thiết yếu đoạn Hà Nội - Vĩnh, tuyến đường sắt Hà Nội - TP.Hồ Chí Minh (Ban Đường sắt, hoàn thành tháng 12/2025, TMĐT 1.399 tỷ đồng):</em> đã hoàn thành GPMB 13/14 địa phương, chỉ còn lại phạm vi ga Chợ Tía chưa được bàn giao<sup>1</sup>; đã hoàn thành thi công 04/07 gói thầu xây lắp, sản lượng thi công 03 gói còn lại như sau: gói XL01 đạt 97%, gói XL06 đạt 79,7%, gói XL07 đạt 53,39%; đáp ứng kế hoạch điều chỉnh.</p>

    <p><em>(2) Dự án gia cố các hầm yếu kết hợp mở mới các ga và cải tạo KTTT đoạn Vĩnh - Nha Trang, tuyến đường sắt Hà Nội - TP. Hồ Chí Minh (Ban 85, hoàn thành</em></p>

    <div style="font-size: 11pt; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
        <p><em><sup>49</sup> Đến nay địa phương đã thông báo thời gian chi trả lần 3 (từ 13-23/3/2025), nếu không nhận sẽ lập phương án cưỡng chế.</em></p>
    </div>

    <br />

    <p><em>năm 2025, TMĐT 1.799,93 tỷ):</em> đã hoàn thành công tác GPMB, tuy nhiên bị chồng lấn với Dự án đường ven biển nối cảng Liên Chiểu của TP Đà Nẵng (hiện có 07 trụ điện chưa di dời và 80m bị chồng lấn); Dự án còn 02 gói thầu đang thi công, sản lượng gói XL8 đạt 98,76%, gói XL11A đạt 92% cơ bản đáp ứng tiến độ điều chỉnh. Yêu cầu Ban 85 phối hợp chặt chẽ với chủ đầu tư Dự án GPMB, địa phương để sớm giải quyết dứt điểm các vướng mắc liên quan đến công tác GPMB, chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ Dự án và giải ngân vốn theo kế hoạch.</p>

    <p style="font-weight: bold; margin-bottom: 5px;">b) Các dự án đường sắt giai đoạn 2021-2025</p>

    <p><em>(1) Dự án cải tạo, nâng cấp đoạn Hà Nội - Tĩnh, tuyến đường sắt Hà Nội - TP Hồ Chí Minh (HN/T2) (Hoàn thành tháng 12/2025, TMĐT 811 tỷ đồng):</em> GPMB đạt 88,3%, chậm so với kế hoạch do chưa hoàn thành các thủ tục liên quan, chưa thống nhất phương án hỗ trợ GPMB. Sản lượng đạt khoảng 74,38%, chậm khoảng 0,44% do công tác GPMB chậm. Yêu cầu Ban Đường sắt phối hợp chặt chẽ với chủ đầu tư Dự án GPMB, địa phương để đẩy nhanh công tác GPMB, chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.</p>

    <p><em>(2) Dự án cải tạo, nâng cấp đoạn Tĩnh - Nha Trang, tuyến đường sắt Hà Nội - TP Hồ Chí Minh (TV/T2) (hoàn thành tháng 12/2025, TMĐT 1.189,9 tỷ đồng):</em> GPMB đạt khoảng 66,42%; sản lượng đạt khoảng 83,54%, chậm khoảng 3,79% do công tác GPMB chậm. Yêu cầu Ban Đường sắt phối hợp chặt chẽ với chủ đầu tư Dự án GPMB, địa phương để đẩy nhanh công tác GPMB, chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.</p>

    <p><em>(3) Dự án cải tạo, nâng cấp đoạn Nha Trang - Sài Gòn, tuyến đường sắt Hà Nội - TP Hồ Chí Minh (NTSG2) (hoàn thành tháng 12/2025, TMĐT 1.098,9 tỷ):</em> Dự án không có GPMB; sản lượng thi công đạt 91,51%, đáp ứng yêu cầu.</p>

    <p><em>(4) Dự án Cải tạo các ga trên các tuyến đường sắt phía Bắc (Hoàn thành năm 2025, TMĐT 470,1 tỷ):</em> Dự án đã thi công cơ bản hoàn thành, ngoại trừ hạng mục đường bộ dẫn vào ga Đồng Đăng do công tác GPMB tại huyện Cao Lộc tỉnh Lạng Sơn liên quan đến phạm vi thi công ga Đồng Đăng chưa hoàn thành. Yêu cầu Ban Đường sắt phối hợp chặt chẽ với tỉnh Lạng Sơn, giải quyết dứt điểm các khó khăn, vướng mắc bàn giao phần mặt bằng còn lại để hoàn thành đường dẫn vào ga Đồng Đăng, sớm đưa vào khai thác đồng bộ toàn Dự án, phát huy hiệu quả đầu tư.</p>

    <p><em>(5) Dự án cầu đường sắt Đuống (Hoàn thành tháng 12/2025, TMĐT 1.887 tỷ đồng):</em> mặt bằng mới bàn giao đạt khoảng 7,0%; sản lượng đạt khoảng 39,4%, cơ bản đáp ứng tiến độ; tuy nhiên công tác GPMB chậm kéo dài, ảnh hưởng đến tiến độ chung của Dự án. Yêu cầu Ban Đường sắt phối hợp chặt chẽ với chủ đầu tư Dự án GPMB, địa phương để sớm giải quyết dứt điểm các vướng mắc liên quan đến công tác GPMB, đẩy nhanh tiến độ thi công Dự án và giải ngân vốn theo kế hoạch.</p>

    <p style="font-weight: bold; margin-bottom: 5px;">c) Các dự án đường sắt sử dụng nguồn vốn khác</p>

    <p><em>(1) Dự án đường sắt đào Khe Nát (vốn EDCF, Ban Đường sắt, hoàn thành tháng 12/2025, TMĐT 2.010 tỷ đồng):</em> mặt bằng bàn giao đạt khoảng 90,96%; sản lượng đạt 54,98%, cơ bản đáp ứng kế hoạch. Yêu cầu Ban Đường sắt phối hợp chặt chẽ với địa phương đẩy nhanh tiến độ bàn giao phần mặt bằng còn lại, hoàn thành trong tháng 4/2025; quyết liệt chỉ đạo nhà thầu tăng cường huy động máy móc, thiết bị, nhân lực, vật lực, tập trung thi công "3 ca, 4 kíp" để đẩy nhanh tiến độ thi công dự án.</p>

    <p><em>(2) Dự án cầu đường sắt Cấm Lý Km24+134 tuyến đường sắt Kép-Hạ Long (Ban Đường sắt, cơ bản hoàn thành năm 2025, TMĐT 796,571 tỷ đồng):</em> Dự án khởi công ngày 22/01/2025, mặt bằng bàn giao đạt 43%, sản lượng thi công đạt 2,37%, cơ bản đáp ứng tiến độ. Yêu cầu Ban Đường sắt phối hợp chặt chẽ với chủ đầu tư tiểu Dự án GPMB, địa phương để đẩy nhanh công tác GPMB, chỉ đạo nhà thầu tập trung thi công đẩy nhanh tiến độ dự án.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">3. Các dự án đường thủy nội địa: Tổng số 01 dự án.</p>

    <p><em>(1) Dự án phát triển các hành lang đường thủy và logistics khu vực phía Nam:</em> Bộ đã phê duyệt dự án đầu tư tại Quyết định số 1386/QĐ-BGTVT ngày 30/10/2023, Ban QLDA Đường thủy (Chủ đầu tư) đang hoàn chỉnh các thủ tục về đầu tư, lựa chọn nhà thầu, dự kiến khởi công năm 2026.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">4. Các dự án hàng hải: Tổng số 03 dự án.</p>

    <p><em>(1) Cải tạo, nâng cấp luồng Quy Nhơn cho tàu 50.000DWT (Ban Hàng hải, hoạch hoàn thành 12/2025, TMĐT 421,41 tỷ đồng):</em> Dự án bắt đầu triển khai thi công từ 20/3/2025, sản lượng thi công đạt khoảng 16,66% đảm bảo tiến độ.</p>

    <p><em>(2) Dự án ĐTXD công trình nở rộng Vũng quay tàu đoạn Lạch Huyện và mở rộng kênh Hà Nam thuộc luồng hàng hải Hải Phòng:</em> Dự án đã được Bộ XD phê duyệt chủ trương tại Quyết định số 1471/QĐ-BGTVT ngày 29/11/2024. Hiện nay Bộ XD đang thực hiện báo cáo cấp có thẩm quyền bố trí vốn để triển khai các bước tiếp theo.</p>

    <p><em>(3) Dự án ĐTXD công trình Nâng cấp tuyến luồng Cái Mép - Thị Vải từ phao số "0" vào khu bến cảng công ten nơ Cái Mép (Ban Hàng hải, kế hoạch hoàn thành 12/2025, TMĐT 1.426 tỷ đồng):</em> đã thi công hoàn thành, đưa vào sử dụng 44,6Km đoạn luồng từ phao số "0" đến bến cảng khởi động Phước An. Bộ XD đã phê duyệt điều chỉnh dự án tại Quyết định số 1551/QĐ-BGTVT ngày 16/12/2024, bổ sung một số hạng mục<sup>1</sup>. Ban Hàng hải đang lựa chọn nhà thầu xây lắp hạng mục bổ sung, dự kiến khởi công tháng 6/2025, hoàn thành gói thầu tháng 12/2025.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">5. Các dự án hàng không</p>

    <p>Tổng số 02 dự án do ACV làm Chủ đầu tư</p>

    <p><em>- Đầu tư xây dựng Công HKQT Long Thành - Giai đoạn 1:</em></p>
    
    <p>(1) DATP1 (trụ sở các cơ quan quản lý): Đến thời điểm hiện tại, cơ bản các trụ sở cơ quan QLNN đang triển khai thi công; riêng trụ sở các cơ quan Kiểm dịch động/thực vật (Bộ NN và MT) đang tổ chức lập hồ sơ thiết kế BYTC, dự kiến sẽ hoàn thành việc lựa chọn nhà thầu và khởi công xây dựng trong tháng 5/2025 và hoàn thành trước 31/12/2025.</p>

    <p>(2) DATP2 (công trình phục vụ quản lý bay): Đài kiểm soát không lưu hiện đang thi công phần mở rộng tháp từ tầng 15 trở lên, dự kiến hoàn thành toàn bộ trước 30/9/2025. Các gói thầu thiết bị dự kiến sẽ hoàn thành toàn bộ trong khoảng thời gian từ tháng 6/2025 đến tháng 12/2025.</p>

    <p>(3) DATP3 (xây dựng các công trình thiết yếu): gói thầu nhà ga hành khách</p>

    <div style="font-size: 11pt; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
        <p><em><sup>50</sup> Nâng cấp đoạn luồng từ cảng Phước An đến cảng Vopak Phước Thái cho tàu trọng tải 30.000DWT đầy tải và đoạn luồng từ khu vực phao "GR" vào tới khu vực Thắng Liêm thuộc tuyến luồng Sài Gòn - Vũng Tàu cho tàu 50.000DWT đầy tải.</em></p>
    </div>

    <br />

    <p>đã hoàn thành toàn bộ phần bê tông cốt thép, đã hoàn thành công tác nâng hệ giàn thép mái trung tâm và nỗ lực hoàn thiện công tác lớp mái, kết cấu bao che mặt dựng theo đúng kế hoạch; các gói thầu khác và hạng mục đường cất hạ cánh, đường lăn, 02 tuyến giao thông kết nối đang được nỗ lực triển khai để cơ bản hoàn thành trước ngày 31/12/2025. Dự án đang báo cáo cấp có thẩm quyền để sớm khởi công đường cất hạ cánh số 3, đáp ứng tiến độ.</p>

    <p>(4) DATP4 (xây dựng các công trình phục vụ khác): đã lựa chọn 06/06 Nhà đầu tư cho các công trình ưu tiên đầu tư, đang xây dựng kế hoạch hoàn thành đồng bộ cùng Dự án trước 31/12/2025.</p>

    <p><em>- Xây dựng nhà ga hành khách T3 - Cảng HKQT Tân Sơn Nhất:</em> Ngày 18/4/2025, Hội đồng kiểm tra nhà nước đã ban hành thông báo kết quả kiểm tra công tác nghiệm thu hoàn thành của Chủ đầu tư đối với công trình; ngày 19/4/2025, Nhà ga T3 - Cảng HKQT Tân Sơn Nhất đã chính thức được khánh thành và đưa vào sử dụng.</p>

    <p style="margin-top: 30px;">Cục Kinh tế - Quản lý đầu tư xây dựng kính báo cáo và xin ý kiến chỉ đạo./.</p>

    <p style="text-align: right; font-weight: bold; margin-top: 50px;">CỤC KINH TẾ - QUẢN LÝ ĐẦU TƯ XÂY DỰNG</p>
  </div>
        
        
    `;
    editorRef.current.innerHTML = template;
    saveState();

    const handleKey = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    saveState();
  };

  const saveState = () => {
    undoStack.current.push(editorRef.current.innerHTML);
    if (undoStack.current.length > 100) undoStack.current.shift();
  };

  const undo = () => {
    if (undoStack.current.length > 1) {
      const current = undoStack.current.pop();
      redoStack.current.push(current);
      const prev = undoStack.current[undoStack.current.length - 1];
      editorRef.current.innerHTML = prev;
    }
  };

  const redo = () => {
    if (redoStack.current.length > 0) {
      const next = redoStack.current.pop();
      undoStack.current.push(next);
      editorRef.current.innerHTML = next;
    }
  };

  const handleInput = () => {
    saveState();
  };

  const handleDownload = () => {
    const content = editorRef.current.innerHTML;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Báo cáo</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
          table, p, ul, li { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob([htmlTemplate], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'bao_cao.doc';
  a.click();

  URL.revokeObjectURL(url);
  };

  const Button = ({ onClick, children }) => (
    <button
      className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-xl"
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="sticky top-0 z-10 bg-white px-5 py-3 shadow flex flex-wrap justify-center gap-4">
        {/* Nhóm 1: Văn bản */}
        <div className="flex gap-2">
          <Button onClick={() => execCmd('bold')}><FaBold /></Button>
          <Button onClick={() => execCmd('italic')}><FaItalic /></Button>
          <Button onClick={() => execCmd('underline')}><FaUnderline /></Button>
          <Button onClick={() => execCmd('strikeThrough')}><FaStrikethrough /></Button>
          <Button onClick={() => execCmd('removeFormat')}><FaEraser /></Button>
        </div>

        {/* Nhóm 2: Căn lề */}
        <div className="flex gap-2">
          <Button onClick={() => execCmd('justifyLeft')}><FaAlignLeft /></Button>
          <Button onClick={() => execCmd('justifyCenter')}><FaAlignCenter /></Button>
          <Button onClick={() => execCmd('justifyRight')}><FaAlignRight /></Button>
          <Button onClick={() => execCmd('justifyFull')}><FaAlignJustify /></Button>
        </div>

        {/* Nhóm 3: Danh sách */}
        <div className="flex gap-2">
          <Button onClick={() => execCmd('insertUnorderedList')}><FaListUl /></Button>
          <Button onClick={() => execCmd('insertOrderedList')}><FaListOl /></Button>
          <Button onClick={() => execCmd('indent')}><FaIndent /></Button>
          <Button onClick={() => execCmd('outdent')}><FaOutdent /></Button>
        </div>

        {/* Nhóm 4: Undo/Redo */}
        <div className="flex gap-2">
          <Button onClick={undo}><FaUndo /></Button>
          <Button onClick={redo}><FaRedo /></Button>
        </div>

        {/* Nhóm 5: Kích cỡ */}
        <div className="flex gap-2">
          <Button onClick={() => execCmd('fontSize', 3)}><FaMinus /></Button>
          <Button onClick={() => execCmd('fontSize', 5)}><FaPlus /></Button>
        </div>

        {/* Nhóm 6: Màu sắc */}
        <div className="flex gap-2">
          <Button onClick={() => execCmd('hiliteColor', 'yellow')}><AiFillHighlight /></Button>
          <Button onClick={() => execCmd('foreColor', 'red')}><BsFillBrushFill className="text-red-500" /></Button>
        </div>

        {/* Nhóm 7: Tải về */}
        <div className="flex gap-2">
          <Button onClick={handleDownload}><FaDownload /></Button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        spellCheck="false"
        className="w-[794px] min-h-[1123px] mx-auto bg-white p-16 shadow border border-gray-300 font-serif text-base leading-relaxed my-8"
      />
    </div>
  );
}