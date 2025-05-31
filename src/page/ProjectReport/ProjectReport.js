import React, { useEffect, useRef, useState } from 'react';
import { saveAs } from "file-saver";
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaListOl, FaIndent, FaOutdent } from 'react-icons/fa';
import htmlDocx from 'html-docx-js/dist/html-docx';
function ProjectReport() {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState('left');
  const [fontSize, setFontSize] = useState('16px');
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    updateToolbarState();
  };

  // Update toolbar state based on selection
  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const parentElement = selection.getRangeAt(0).startContainer.parentElement;
      const textAlign = window.getComputedStyle(parentElement).textAlign;
      setAlignment(textAlign || 'left');
    }
  };

  // Handle paste event to clean formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };
  const exportToWord = (e) => {
    e.preventDefault();
    
    // Lấy nội dung HTML từ div contentEditable
    const htmlContent = editorRef.current.innerHTML;
    
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial; max-width: 56rem; margin: 0 auto; padding: 2.5rem; }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
    
    const blob = htmlDocx.asBlob(html, {
      orientation: 'portrait',
      margins: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
    });
    saveAs(blob, "baocao.docx");
  };
  return (
     <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 p-2 border-b flex flex-wrap items-center gap-1 sm:gap-2">
    {/* Font Style */}
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        className={`p-1 sm:p-2 rounded ${isBold ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
        onClick={() => formatText('bold')}
        title="Bold"
      >
        <FaBold className="text-sm sm:text-base" />
      </button>
      <button
        className={`p-1 sm:p-2 rounded ${isItalic ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
        onClick={() => formatText('italic')}
        title="Italic"
      >
        <FaItalic className="text-sm sm:text-base" />
      </button>
      <button
        className={`p-1 sm:p-2 rounded ${isUnderline ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
        onClick={() => formatText('underline')}
        title="Underline"
      >
        <FaUnderline className="text-sm sm:text-base" />
      </button>
    </div>

    {/* Alignment */}
    <div className="h-6 border-l border-gray-300 mx-1"></div>
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        className={`p-1 sm:p-2 rounded ${alignment === 'left' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
        onClick={() => formatText('justifyLeft')}
        title="Align Left"
      >
        <FaAlignLeft className="text-sm sm:text-base" />
      </button>
      <button
        className={`p-1 sm:p-2 rounded ${alignment === 'center' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
        onClick={() => formatText('justifyCenter')}
        title="Align Center"
      >
        <FaAlignCenter className="text-sm sm:text-base" />
      </button>
      <button
        className={`p-1 sm:p-2 rounded ${alignment === 'right' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
        onClick={() => formatText('justifyRight')}
        title="Align Right"
      >
        <FaAlignRight className="text-sm sm:text-base" />
      </button>
    </div>

    {/* Lists */}
    <div className="h-6 border-l border-gray-300 mx-1"></div>
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        className="p-1 sm:p-2 rounded hover:bg-gray-200"
        onClick={() => formatText('insertUnorderedList')}
        title="Bullet List"
      >
        <FaListUl className="text-sm sm:text-base" />
      </button>
      <button
        className="p-1 sm:p-2 rounded hover:bg-gray-200"
        onClick={() => formatText('insertOrderedList')}
        title="Numbered List"
      >
        <FaListOl className="text-sm sm:text-base" />
      </button>
    </div>

    {/* Indentation */}
    <div className="h-6 border-l border-gray-300 mx-1"></div>
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        className="p-1 sm:p-2 rounded hover:bg-gray-200"
        onClick={() => formatText('indent')}
        title="Indent"
      >
        <FaIndent className="text-sm sm:text-base" />
      </button>
      <button
        className="p-1 sm:p-2 rounded hover:bg-gray-200"
        onClick={() => formatText('outdent')}
        title="Outdent"
      >
        <FaOutdent className="text-sm sm:text-base" />
      </button>
    </div>

    {/* Font Size */}
    <div className="h-6 border-l border-gray-300 mx-1"></div>
    <select
      className="p-1 rounded border border-gray-300 text-sm sm:text-base"
      value={fontSize}
      onChange={(e) => {
        setFontSize(e.target.value);
        formatText('fontSize', e.target.value);
      }}
    >
      <option value="1">Small</option>
      <option value="3">Normal</option>
      <option value="5">Large</option>
      <option value="7">Extra Large</option>
    </select>
  </div>


      {/* Editor */}
      <div
    className="p-4 sm:p-6 min-h-[300px] sm:min-h-[500px] outline-none"
    contentEditable
    suppressContentEditableWarning
    ref={editorRef}
    onInput={updateToolbarState}
    onPaste={handlePaste}
    onMouseUp={updateToolbarState}
    onKeyUp={updateToolbarState}
    spellCheck="false"
  >

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">BÁO CÁO</h1>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Tình hình triển khai Dự án thành phần đoạn Vũng Ăng - Bùng thuộc Dự án XDCT đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025
        </h2>
        <p className="italic text-sm">
          (Kèm theo Báo cáo số .../BC-BQLD46 ngày /04/2025 của Ban QLDA 6)
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">1. Thông tin chung dự án</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Tên dự án:</span> Dự án thành phần đoạn Vũng Ăng - Bùng thuộc Dự án xây dựng công trình đường bộ cao tốc Bắc - Nam phía Đông giai đoạn 2021 - 2025.
          </li>
          <li>
            <span className="font-medium">Tổng chiều dài tuyến:</span> 55,34km; chiều dài qua địa bàn tỉnh Hà Tĩnh khoảng 12,9km (huyện Kỳ Anh và TX. Kỳ Anh); chiều dài qua địa bàn tỉnh Quảng Bình khoảng 42,44km (huyện Quảng Trạch, TX. Ba Đồn và huyện Bố Trạch).
          </li>
          <li>
            <span className="font-medium">Tổng mức đầu tư:</span> 12.548 tỷ đồng.
          </li>
          <li>
            <span className="font-medium">Chủ đầu tư:</span> Ban Quản lý dự án 6.
          </li>
          <li>
            <span className="font-medium">Ngày khởi công:</span> 01/01/2023; hoàn thành vào tháng 30/6/2025 (kế hoạch theo hợp đồng: tháng 10 và 12/2025).
          </li>
          <li>
            <span className="font-medium">Một số khối lượng thi công chính:</span>
            <ul className="list-[+] pl-6 space-y-1 mt-1">
              <li>
                <span className="font-medium">Phần đường</span> (xử lý nền đất yếu: 5,821km; tổng khối lượng đào: 13,48 triệu m³; tổng khối lượng đấp: 6,95 triệu m³; cống các loại: 406 cái; hầm chui dân sinh: 37 cái; gia cố mái ta luy 24,3km; đường gom 35,59km);
              </li>
              <li>
                <span className="font-medium">Nút giao liên thông:</span> 02 nút là: Nút giao với đường Tiên - Châu - Văn Hóa (lý trình khoảng Km597+900) và nút giao với QL12A (lý trình khoảng Km605+80);
              </li>
              <li>
                <span className="font-medium">Phần cầu:</span> Gồm 33 cầu/tổng cộng dài 9.061,2m, trong đó: 28 cầu trên tuyến chính/tổng cộng dài 8.645,1m; 05 cầu vượt trực thông/tổng cộng dài 416,1m.
              </li>
              <li>
                <span className="font-medium">Phần hầm trên tuyến chính:</span> 01 hầm Đèo Bụt/1.556m (chiều dài nhánh phải là 840m, chiều dài nhánh trái là 716m).
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">2. Công tác GPMB và hạ tầng kỹ thuật</h3>
        {/*  */}
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2.1. Công tác GPMB và bàn giao mặt bằng thi công</h3>
        <p className="mb-4">
          Các địa phương đã bàn giao mặt bằng cho các nhà thầu thi công được 55,34Km/55,34Km đạt 100%, cụ thể:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">TT</th>
                <th className="border border-gray-300 px-4 py-2">Địa phương</th>
                <th className="border border-gray-300 px-4 py-2">Chiều dài tuyến (km)</th>
                <th className="border border-gray-300 px-4 py-2">Đã bàn giao cho đơn vị thi công (km)</th>
                <th className="border border-gray-300 px-4 py-2">Đạt tỷ lệ %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">I</td>
                <td className="border border-gray-300 px-4 py-2 font-medium">Tỉnh Hà Tĩnh</td>
                <td className="border border-gray-300 px-4 py-2">12,9</td>
                <td className="border border-gray-300 px-4 py-2">12,9</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">H. Kỳ Anh</td>
                <td className="border border-gray-300 px-4 py-2">9,03</td>
                <td className="border border-gray-300 px-4 py-2">9,03</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">TX. Kỳ Anh</td>
                <td className="border border-gray-300 px-4 py-2">3,57</td>
                <td className="border border-gray-300 px-4 py-2">3,87</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">II</td>
                <td className="border border-gray-300 px-4 py-2 font-medium">Tỉnh Quảng Bình</td>
                <td className="border border-gray-300 px-4 py-2">42,44</td>
                <td className="border border-gray-300 px-4 py-2">42,43</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">H. Quảng Trạch</td>
                <td className="border border-gray-300 px-4 py-2">24,6</td>
                <td className="border border-gray-300 px-4 py-2">24,6</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">TX. Ba Đồn</td>
                <td className="border border-gray-300 px-4 py-2">9,54</td>
                <td className="border border-gray-300 px-4 py-2">9,54</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">3</td>
                <td className="border border-gray-300 px-4 py-2">H. Bộ Trạch</td>
                <td className="border border-gray-300 px-4 py-2">8,3</td>
                <td className="border border-gray-300 px-4 py-2">8,3</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Cộng</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2">55,34</td>
                <td className="border border-gray-300 px-4 py-2">55,33</td>
                <td className="border border-gray-300 px-4 py-2">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2.2. Xây dựng khu TĐC:</h3>
        <p>
          Các địa phương đã hoàn thành 15/15 Khu tái định cư, với diện tích 22,91ha cho 229 hộ dân.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2.3. Di dời hạ tầng kỹ thuật, công cộng:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Thị xã Kỳ Anh:</span> đã hoàn thành di dời 02/02 đường nước, 02/02 đường điện trung thế, 02/02 đường điện hạ thế và 02/02 đường điện 500kV
          </li>
          <li>
            <span className="font-medium">Huyện Quảng Trạch:</span> đã hoàn thành di dời 01/01 vị trí đường dây 110kV, 03/05 vị trí đường dây 500kV, 10/10 đường dây trung thế và 10/10 đường hạ thế. Hiện đang hoàn thiện thủ tục để cải tạo 02 đường dây 500kV.
          </li>
          <li>
            <span className="font-medium">Thị xã Ba Đồn:</span> đã di dời được 2/3 vị trí đường dây trung thế và 2/4 đường dây hạ thế, hiện nhà thầu đang tiếp tục đẩy nhanh di dời các vị trí còn lại.
          </li>
          <li>
            <span className="font-medium">Huyện Bộ Trạch:</span> đã hoàn thành di dời 4/4 vị trí đường dây trung thế.
          </li>
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">3. Công tác tổ chức thi công</h3>
        <h4 className="font-medium mb-2">a) Công tác lập tiến độ thi công; lập, phê duyệt thiết kế bản vẽ thi công; xây dựng nhà điều hành, phòng thi nghiệm</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Lập tiến độ thi công:</span> Đã phê duyệt tiến độ thi công tổng thể, chi tiết;
          </li>
          <li>
            <span className="font-medium">Công tác lập TKBVTC:</span> Nhà thầu đã có đủ BVTC phạm vi đã và đang triển khai tại hiện trường.
          </li>
        </ul>
      </div>
      <div className="mb-6">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Xây dựng văn phòng nhà điều hành, phòng thí nghiệm:</span> Các gói thầu đã xây dựng văn phòng Ban điều hành gói thầu. Đã huy động 8/8 phòng thí nghiệm;
          </li>
        </ul>
      </div>
      <div className="mb-6">
        <h4 className="font-medium mb-2">b) Tình hình thi công</h4>
        <p className="mb-4">Dự án được chia làm 02 gói thầu xây lắp, gồm:</p>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 font-medium">TT</th>
                <th className="border border-gray-300 px-4 py-2 font-medium">Tên Gói thầu</th>
                <th className="border border-gray-300 px-4 py-2 font-medium">Nhà thầu</th>
                <th className="border border-gray-300 px-4 py-2 font-medium">TVCS</th>
                <th className="border border-gray-300 px-4 py-2 font-medium">Hạng mục chính</th>
                <th className="border border-gray-300 px-4 py-2 font-medium">Giá trị HĐ (tỷ đồng)</th>
                <th className="border border-gray-300 px-4 py-2 font-medium">Thời gian thực hiện Hợp đồng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                <td className="border border-gray-300 px-4 py-2">
                  XL01: Thi công xây dựng đoạn Km508+200 - Km600+700 (bao gồm khảo sát, TKEVTC)
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Liên danh Công ty TNHH Tập đoàn Sơn Hải - Tổng công ty CP Xuất nhập khẩu và xây dựng Việt Nam - Công ty CP 484 - Công ty CP Xây lắp 368 - Công ty CP 479 Hòa Bình
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Liên danh Công ty CP Tư vấn xây dựng A22 và Công ty CP Tư vấn công ty nghề, thiết bị và kiểm định xây dựng-Comitco
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <ul className="list-[+] pl-4 space-y-1">
                    <li>Cầu: 15 cầu/3.464,9m;</li>
                    <li>Cống: 272 cái;</li>
                    <li>Hầm: 01 cái/ nhánh phải 840m, nhánh trái 716m;</li>
                    <li>Hầm chui: 19 cái;</li>
                    <li>Xử lý đất yếu: 191m;</li>
                    <li>Đào: 5,5 triệu m3;</li>
                    <li>Đắp: 2,7 triệu m3;</li>
                    <li>Móng, mặt đường: 0,62 triệu m2;</li>
                    <li>Đường gom: 26,58km.</li>
                  </ul>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">4.766<br />(bao gồm dự phòng)</td>
                <td className="border border-gray-300 px-4 py-2 text-center">Trung kỳ 22/02/2023 đến ngày 08/12/2025 (1.020 ngày)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                <td className="border border-gray-300 px-4 py-2">
                  XL02: Thi công xây dựng đoạn Km600+700 - Km624+228,79 (bao gồm khảo sát, TKEVTC)
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Liên danh Công ty Cổ phần Đầu tư và xây dựng giao thông Phương Thành - Công ty Cổ phần Lizen
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  Liên danh Tổng công ty TVTK GTVT-CTC P (TEDI) và Công ty CP TVTK GTVT 4
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <ul className="list-[+] pl-4 space-y-1">
                    <li>Cầu: 18 cầu/5.596m;</li>
                    <li>Cống: 134 cái;</li>
                    <li>Hầm: Không có;</li>
                    <li>Hầm chui: 18 cái;</li>
                    <li>Xử lý đất yếu: 5.630,25m;</li>
                    <li>Đào: 7,98 triệu m3;</li>
                    <li>Đắp: 4,25 triệu m3;</li>
                    <li>Móng, mặt đường: 1,04 triệu m2;</li>
                    <li>Đường gom: 9,01km.</li>
                  </ul>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">5.098<br />(bao gồm dự phòng)</td>
                <td className="border border-gray-300 px-4 py-2 text-center">Trung kỳ 01/01/2023 đến ngày 17/10/2025 (1.020 ngày)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-medium mb-2">c) Tình hình huy động trên công trường</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Hạng mục thi công:</span> Tổng cộng 40 múi thi công, 568 máy móc thiết bị, 1150 nhân lực.
          </li>
          <li>
            <span className="font-medium">Nền đường tuyến chính</span> (số múi thi công: 22; số máy móc, thiết bị: 306; nhân lực: 629);
          </li>
          <li>
            <span className="font-medium">Cầu</span> (số múi thi công: 16; số máy móc, thiết bị: 200; nhân lực: 421);
          </li>
        </ul>
      </div>
      <div className="mb-6">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Hầm Đèo Bụt</span> (số mũi thi công: 02; số máy móc, thiết bị: 52; nhân lực: 100).
          </li>
        </ul>

        <p className="mt-2 mb-4">
          <span className="font-medium">Đánh giá huy động (máy móc, thiết bị, nhân sự) so với kế hoạch được chấp thuận:</span> Cơ bản đáp ứng.
        </p>

        <h4 className="font-medium mb-2">d) Khối lượng thi công một số hạng mục chính dự án đã hoàn thành</h4>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <span className="font-medium">Đào nền đường KTH đồ bãi thải:</span> 1.162.560/1.301.168 m3, đạt 89,35%. Đào nền đường và vận chuyển ra bãi trừ 5.744.503/5.935.613 m3, đạt 96,78% (khối lượng đào hiện tại chủ yếu là đất cấp III, IV và đá cấp IV đào bằng máy, đá nổ mìn sau khi đã tận dụng để đắp nền đường).
          </li>
          <li>
            <span className="font-medium">Đắp nền:</span>
            <ul className="list-[+] pl-6 mt-1 space-y-1">
              <li>K90 đường gom, đường công vụ, đường ngang: 381.729/469.941 m3, đạt 81,23%</li>
              <li>K95: 5.281.883/5.250.921 m3, đạt 100,60%</li>
              <li>K98: 211.401/216.838 m3, đạt 97,48%</li>
            </ul>
          </li>
          <li>
            <span className="font-medium">Vật liệu mặt đường:</span>
            <ul className="list-[+] pl-6 mt-1 space-y-1">
              <li>Cấp phối đá dăm loại 1, loại 2: 270.106/322.588m3 (41,13/46,45 km), đạt 83,73%</li>
              <li>Cấp phối đá dăm gia cố xi măng: 109.227/123.268 m3 (40,4/46,45 km), đạt 88,61%</li>
              <li>Hỗn hợp BTN rỗng C25 dày 10cm: 660.747/759.343 m2 (40,36/46,45 km), đạt 87,02%</li>
              <li>BTN chặt 19 dày 6cm: 570.978/796.670m2 (35,01/46,45 km): đạt 71,67%</li>
              <li>BTN chặt 16 dày 6cm: 580.431/801.571m2, đạt (38,85/54,43km) đạt 72,41%</li>
            </ul>
          </li>
          <li>
            <span className="font-medium">Công trình thoát nước và hầm:</span>
            <ul className="list-[+] pl-6 mt-1 space-y-1">
              <li>Cống thoát nước các loại: 384/406 cống đang tiến hành thi công, đạt 94,58%</li>
              <li>Hầm chui dân sinh: 36/36 đang thi công đạt 100%</li>
              <li>Công trình cầu: 33/33 đang thi công cơ bản hoàn thành</li>
              <li>Hầm Đèo Bụt: đào hầm 1.544/1556m (trong đó: nhánh trái hầm: 704/716m, nhánh phải: 840/840 m) đạt 99,23%</li>
            </ul>
          </li>
        </ul>

        <h4 className="font-medium mt-4 mb-2">e) Đánh giá tiến độ thi công</h4>
        <p className="mb-4">
          Lũy kế sản lượng: <span className="font-bold">7.691,8/8.625,9</span> tỷ đồng, đạt <span className="font-bold">89,2%</span> giá trị xây lắp chậm hơn <span className="font-bold">-4,1%</span> so với tiến độ dự án, cụ thể:
        </p>
      </div>
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 font-medium text-center" rowSpan="2">Gói thầu</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="3">Tổng hoàn thành</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="3">Kế hoạch</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="2">Nhanh / Chậm</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Giá trị XL</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Tỷ VND</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">% XL</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Tỷ VND</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">% XL</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Tỷ VND</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">(+/-) %</th>
              </tr>
            </thead>
            <tbody>
              {/* XL01 */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">Gói XL01</td>
                <td className="border border-gray-300 px-3 py-2 text-right">4.206,6</td>
                <td className="border border-gray-300 px-3 py-2 text-right">3.776,8</td>
                <td className="border border-gray-300 px-3 py-2 text-right">89,8%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">3.965,7</td>
                <td className="border border-gray-300 px-3 py-2 text-right">94,3%</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-188,8</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-4,5%</td>
              </tr>
              {/* Sub-contractors for XL01 */}
              <tr>
                <td className="border border-gray-300 px-3 py-2 pl-6 font-medium">1. Nhà thầu Sơn Hải</td>
                <td className="border border-gray-300 px-3 py-2 text-right">1.371,7</td>
                <td className="border border-gray-300 px-3 py-2 text-right">1.168,7</td>
                <td className="border border-gray-300 px-3 py-2 text-right">85,2%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">1.227,3</td>
                <td className="border border-gray-300 px-3 py-2 text-right">89,5%</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-58,6</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-4,3%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 pl-6 font-medium">2. Nhà thầu Vinaconex</td>
                <td className="border border-gray-300 px-3 py-2 text-right">1.262,0</td>
                <td className="border border-gray-300 px-3 py-2 text-right">1.157,6</td>
                <td className="border border-gray-300 px-3 py-2 text-right">91,7%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">1.208,0</td>
                <td className="border border-gray-300 px-3 py-2 text-right">95,8%</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-51,4</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-4,1%</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 pl-10">2.1 Cty Vinaconex (thân chính)</td>
                <td className="border border-gray-300 px-3 py-2 text-right">914,3</td>
                <td className="border border-gray-300 px-3 py-2 text-right">825,1</td>
                <td className="border border-gray-300 px-3 py-2 text-right">90,2%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">864,3</td>
                <td className="border border-gray-300 px-3 py-2 text-right">94,5%</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-39,2</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-4,3%</td>
              </tr>
              {/* More rows for XL01... */}

              {/* XL02 */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">Gói XL02</td>
                <td className="border border-gray-300 px-3 py-2 text-right">4.419,3</td>
                <td className="border border-gray-300 px-3 py-2 text-right">3.915,0</td>
                <td className="border border-gray-300 px-3 py-2 text-right">88,6%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">4.082,7</td>
                <td className="border border-gray-300 px-3 py-2 text-right">97,4%</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-167,7</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-3,8%</td>
              </tr>
              {/* Sub-contractors for XL02... */}

              {/* Total */}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-2">Tổng cộng</td>
                <td className="border border-gray-300 px-3 py-2 text-right">8.625,9</td>
                <td className="border border-gray-300 px-3 py-2 text-right">7.691,3</td>
                <td className="border border-gray-300 px-3 py-2 text-right">89,2%</td>
                <td className="border border-gray-300 px-3 py-2 text-right">8.048,4</td>
                <td className="border border-gray-300 px-3 py-2 text-right">93,3%</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-356,6</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-4,1%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 mb-6">
          <h4 className="font-medium mb-2">Lý do chậm tiến độ của một số nhà thầu:</h4>
          <p className="text-justify">
            Trong thời gian qua, trên địa bàn tỉnh Hà Tĩnh và tỉnh Quảng Bình thời tiết có mưa nhiều ảnh hưởng đến tiến độ thi công, những ngày thời tiết thuận lợi các Nhà thầu đã huy động nhân lực, thiết bị để thi công 03 ca tuy nhiên vẫn chưa bù lại được tiến độ.
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">4) Công tác giải ngân:</h4>
          <p>
            Vốn đã giải ngân năm 2022: <span className="font-bold">436,27/436,28 tỷ đồng</span>, đạt <span className="font-bold">100%</span> (GPMB: 267,62/267,63 tỷ đồng, Xây lắp, thiết bị: 66,55/66,55 tỷ đồng, TV+QLDA+khác: 102,1/102,1 tỷ đồng).
          </p>
        </div>
      </div>
      <div className="mb-6">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Vốn đã giải ngân năm 2023:</span> 3.731,379/3.731,379 tỷ đồng, đạt 100%
            (GPMB: 501,097/501,097 tỷ đồng, Xây lắp, thiết bị: 3.079,890/3.079,890 tỷ đồng, TV+QLDA+khác: 108,200/108,200 tỷ đồng).
          </li>
          <li>
            <span className="font-medium">Kế hoạch giải ngân năm 2024:</span> 3.999,016/3.999,016 tỷ đồng, đạt 100%
            (GPMB: 504,112/504,112 tỷ đồng, Xây lắp, thiết bị: 3.460,963/3.460,963 tỷ đồng, TV+QLDA+khác: 33,941/33,941 tỷ đồng).
          </li>
          <li>
            <span className="font-medium">Kế hoạch giải ngân năm 2025:</span> 314,188/3.531,122 tỷ đồng, đạt 8,90%
            (GPMB: 33,3/115,9 tỷ đồng, Xây lắp, thiết bị: 273,811/3.400,222 tỷ đồng, TV+QLDA+khác: 7,077/15,0 tỷ đồng).
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">5) Mỏ VLXD, bãi đổ thải</h3>

        <h4 className="font-medium mb-2">- Về bãi đổ thải:</h4>
        <p className="mb-4">
          Nhu cầu đổ thải của Dự án là khoảng 8,3 triệu m3. Tỉnh Hà Tĩnh đã chấp thuận 04 vị trí đổ thải đáp ứng nhu cầu Dự án là khoảng 2,5 triệu m3.
          Tỉnh Quảng Bình đã chấp thuận 12 vị trí đổ thải đáp ứng nhu cầu Dự án là khoảng 5,9 triệu m3. Như vậy, bãi đổ thải cơ bản đáp ứng nhu cầu Dự án.
        </p>

        <h4 className="font-medium mb-2">- Về mỏ VLXD:</h4>
        <ul className="list-[+] pl-6 space-y-2">
          <li>
            <span className="font-medium">Vật liệu đá:</span> các mỏ đá có chất lượng, công suất đảm bảo nhu cầu của Dự án.
          </li>
          <li>
            <span className="font-medium">Vật liệu cát:</span> Nhu cầu của dự án khoảng 750.000 m3, sử dụng cát từ 10 mỏ có tổng công suất khai thác 107.000 m3/năm,
            01 mỏ cát được cấp phép có công suất khai thác 250.000m3/năm đáp ứng nhu cầu Dự án.
          </li>
          <li>
            <span className="font-medium">Vật liệu đất:</span> Nhu cầu dự án khoảng 8.900.000 m3. Dự án điều phối nội bộ, cơ bản đáp ứng nhu cầu (còn dư khoảng 8.320.000 m3).
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">6. Tình hình thực hiện cụ thể từng gói thầu</h3>

        <h4 className="font-medium mb-2">6.1. Gói thầu xây lắp XL01</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Hạng mục thi công:</span> Tổng cộng 40 múi thi công, 477 máy móc thiết bị, 999 nhân lực.
          </li>
          <li>
            <span className="font-medium">Nền đường tuyến chính</span> (số múi thi công: 22; số máy móc, thiết bị: 256; nhân lực: 599);
          </li>

        </ul>
      </div>
      <div className="mb-6">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Cầu</span> (số mũi thi công: 16; số máy móc, thiết bị: 169; nhân lực: 368);
          </li>
          <li>
            <span className="font-medium">Hầm Đèo Bụt</span> (số mũi thi công: 02; số máy móc, thiết bị: 52; nhân lực: 100).
          </li>
        </ul>

        <p className="mt-2 mb-4 font-medium">
          Đánh giá huy động so với kế hoạch được chấp thuận: Cơ bản đáp ứng.
        </p>

        <h4 className="font-medium mb-2">- Khối lượng thi công một số hạng mục chính:</h4>

        <div className="ml-4">
          <h5 className="font-medium mt-3 mb-1">+ Phần đường:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>
              Đào nền đường: 5.655.761/5.741.828 m3, đạt 98,50%. Trong đó:
              <ul className="list-[•] pl-6 mt-1 space-y-1">
                <li>Đào vận chuyển bãi thải: 465.002/495.258m3, đạt 93,89%</li>
                <li>Đào, vận chuyển bãi trừ: 2.123.288/2.126.311 m3, đạt 99,86%</li>
              </ul>
            </li>
            <li>
              Đắp nền đường: 2.647.430/2.980.073 m3, đạt 88,84%, trong đó các hạng mục chính:
              <ul className="list-[•] pl-6 mt-1 space-y-1">
                <li>nền đường K90: 290.237/310.624 m3, đạt 93,44%</li>
                <li>nền đường K95: 2.319.114/2.329.834 m3, đạt 99,54%</li>
                <li>nền đường K98: 126.401/128.870 m3, đạt 98,08%</li>
                <li>VL dạng hạt: 201.706/210.744 m3, đạt 95,71%</li>
              </ul>
            </li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Vật liệu mặt đường:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Cấp phối đá dăm loại 1, loại 2: 184.609/213.620 m3, đạt 86,42%</li>
            <li>Cấp phối đá dăm gia cố xi măng: 74.884/74.577 m3, đạt 100,41%</li>
            <li>Hỗn hợp BTN rỗng C25 dày 10cm: 455.601/457.433 m2 đạt 99,60%</li>
            <li>BTN chặt 19 dày 6cm: 363.994/478.444m2, đạt 76,08%</li>
            <li>BTN chặt 16 dày 6cm: 365.808/479.656 m2, đạt 76,26%</li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ ATGT:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Lan can tôn lượn sóng loại 2 sóng: 41.523/52.249md, đạt 79,47%</li>
            <li>Lan can tôn lượn sóng loại 3 sóng: 10.283/14.700 md, đạt 69,95%</li>
            <li>Hàng rào bảo vệ loại 1: 22.475/28.520 md, đạt 78,80%</li>
            <li>Hàng rào bảo vệ loại 2 (hàng rào lưới thép gai): 37.628/38.875 md, đạt 96,79%</li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Phần cống, HCDS:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>đã và đang thi công: 272/272 cống</li>
            <li>Hầm chui dân sinh đã hoàn thành 19/19 HCDS</li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Phần cầu:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Đã và đang thi công 15/15 cầu trong đó:
              <ul className="list-[•] pl-6 mt-1 space-y-1">
                <li>Cọc khoan nhồi: 669/669 cọc, đạt 100%</li>
                <li>Sản xuất dầm Super T: 445/457 dầm, đạt 97,37%</li>
                <li>Hoàn thành sản xuất dầm I: 55/55 dầm</li>
                <li>Dầm bản lắp ghép 24m: 68/68</li>
                <li>Dầm bản rỗng: 105/105 phiên đạt 100%</li>
              </ul>
            </li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Hầm Đèo Bụt:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Gia cố mái: 8.228/15.483m2 đạt 53,1%, Đào hầm:</li>
          </ul>
        </div>

      </div>
      <div className="mb-6">
        <ul className="list-[+] pl-6 space-y-1">
          <li>
            Đào hầm: 1.544/1.556m (trong đó: 
            <ul className="list-[•] pl-6 mt-1 space-y-1">
              <li>nhánh trái hầm: 704/716m</li>
              <li>nhánh phải: 840/840 m) đạt 99,0%</li>
            </ul>
          </li>
          <li>Đào đất, đá cửa hầm: 521.448/577.504m3 đạt 90,29%</li>
          <li>Nẹp đá, neo dẫn trước: 53.924/56.833 bộ đạt 94,88%</li>
          <li>Cọc khoan nhồi tường chân cửa Nam: 28/117 cọc, đạt 23,9%</li>
          <li>BT dầm mũ, dầm neo, dầm chân 30MPa: 320/1.803 m3 đạt 17,75%</li>
          <li>Bê tông phun: 66.096/65.940m2 đạt 100%</li>
          <li>Lưới thép: 94.432/94.623m2 đạt 99,80%</li>
          <li>Khung chống đỡ bằng thép: 2.242/2.277 dàn đạt 98,44%</li>
        </ul>

        <h5 className="font-medium mt-4 mb-2">+ Kế hoạch thực hiện một số hạng mục còn lại:</h5>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">STT</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Hạng mục</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Đơn vị</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Khối lượng còn lại</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Kế hoạch hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {/* Section I */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="5">I. Tuyến chính</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2">Bê tông nhựa chặt 16 dày 6cm</td>
                <td className="border border-gray-300 px-3 py-2 text-center">km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">6,059</td>
                <td className="border border-gray-300 px-3 py-2 text-center">30/04/2025</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">2</td>
                <td className="border border-gray-300 px-3 py-2">Bê tông nhựa chặt 19 dày 6cm</td>
                <td className="border border-gray-300 px-3 py-2 text-center">km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">5,396</td>
                <td className="border border-gray-300 px-3 py-2 text-center">30/04/2025</td>
              </tr>
              {/* More rows for Section I... */}

              {/* Section II */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="5">II. Tuyến nhánh nút giao</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2">Bê tông nhựa chặt 16 dày 6cm</td>
                <td className="border border-gray-300 px-3 py-2 text-center">km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">2,540</td>
                <td className="border border-gray-300 px-3 py-2 text-center">28/04/2025</td>
              </tr>
              {/* More rows for Section II... */}

              {/* Section III */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="5">III. Hệ thống an toàn giao thông</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2">Lắp đặt dải phân cách giữa</td>
                <td className="border border-gray-300 px-3 py-2 text-center">km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">7,470</td>
                <td className="border border-gray-300 px-3 py-2 text-center">30/05/2025</td>
              </tr>
              {/* More rows for Section III... */}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="font-medium">- Công tác giải ngân:</p>
          <p>Giá trị khối lượng hoàn thành: 3.776,8 tỷ đồng; Lũy kế giá trị thực hiện đã giải ngân đến nay: 3.389,855 tỷ đồng.</p>
        </div>

        <h4 className="font-medium mt-6 mb-2">6.2. Gói thầu xây lắp XL02</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Hạng mục thi công:</span> Tổng cộng 10 mũi thi công, 203 máy móc thiết bị, 527 nhân lực.
          </li>
        </ul>
      </div>
      <div className="mb-6">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-medium">Nền đường tuyến chính, hầm chui dân sinh, cống các loại</span> (số mũi thi công: 5; số máy móc, thiết bị: 122; nhân lực: 340);
          </li>
          <li>
            <span className="font-medium">Cầu</span> (số mũi thi công: 5; số máy móc, thiết bị: 81; nhân lực: 187);
          </li>
        </ul>

        <p className="mt-2 mb-4 font-medium">
          Đánh giá huy động so với kế hoạch được chấp thuận: Cơ bản đáp ứng.
        </p>

        <h4 className="font-medium mb-2">- Khối lượng thi công một số hạng mục chính:</h4>
        
        <div className="ml-4">
          <h5 className="font-medium mt-3 mb-1">+ Phần đường:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>
              Đào nền đường: 8.285.452/8.285.452m3, đạt 100% trong đó:
              <ul className="list-[•] pl-6 mt-1 space-y-1">
                <li>Đào và vận chuyển ra bãi thải: 697.558/805.910 m3, đạt 86,56%</li>
                <li>Đào, vận chuyển bãi trừ: 3.621.215/3.809.302, đạt 95,06%</li>
              </ul>
            </li>
            <li>
              Đắp nền đường: 3.450.409/3.486.239 m3, đạt 98,97% trong đó các hạng mục chính:
              <ul className="list-[•] pl-6 mt-1 space-y-1">
                <li>nền đường K90: 91.492/153.938 m3, đạt 59,43%</li>
                <li>nền đường K95: 2.962.769/2.921.087 m3, đạt 101,43%</li>
                <li>nền đường K98: 85.000/87.968m3, đạt 96,63%</li>
                <li>Đắp vật liệu dạng hạt thoát nước K98 tuyến chính: 188.553/138.843 m3, đạt 135,8%</li>
                <li>Trụ đất gia cố xi măng D800: 606.382/481.834 md, đạt 125,8%</li>
              </ul>
            </li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Vật liệu mặt đường:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Cấp phối đá dăm loại 1: 85.497/108.968m3, đạt 78,46%</li>
            <li>Cấp phối đá dăm gia cố xi măng: 34.343/48.691 m3, đạt 70,53%</li>
            <li>Hỗn hợp BTN rỗng C25 dày 10cm: 205.146/301.910 m2, đạt 67,95%</li>
            <li>BTN chặt 19 dày 6cm: 206.984/318.226m2, đạt 65,04%</li>
            <li>BTN chặt 16 dày 6cm: 214.623/321.915 m2, đạt 66,67%</li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ ATGT:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Lan can tôn lượn sóng: 13.540/34.939md, đạt 38,75%</li>
            <li>Hàng rào bảo vệ: 13.897/38.307md, đạt 36,28%</li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Phần cống, HCDS:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Hoàn thành 112/134 cống các loại đạt 83,58% (Cống trên tuyến chính cơ bản hoàn thành)</li>
            <li>Hầm chui dân sinh đã/đang thi công: 17/17 cái, đạt 100%</li>
          </ul>

          <h5 className="font-medium mt-3 mb-1">+ Phần cầu:</h5>
          <ul className="list-[+] pl-6 space-y-1">
            <li>Đang thi công 18/18 cầu, trong đó:
              <ul className="list-[•] pl-6 mt-1 space-y-1">
                <li>Cọc khoan nhồi (CKN): 1.865/1.865 CKN</li>
                <li>Công tác sản xuất dầm đạt 100%</li>
              </ul>
            </li>
          </ul>

          <h5 className="font-medium mt-4 mb-2">+ Kế hoạch thực hiện một số hạng mục còn lại:</h5>
        </div>
      </div>
      <div className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">STT</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Hạng mục</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Đơn vị</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Khối lượng</th>
                <th className="border border-gray-300 px-3 py-2 font-medium text-center">Kế hoạch hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {/* Section I */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="5">I. Tuyến chính</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2">Bê tông nhựa chặt 16 dày 6cm</td>
                <td className="border border-gray-300 px-3 py-2 text-center">Km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">6,91</td>
                <td className="border border-gray-300 px-3 py-2 text-center">10/06/2025</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">2</td>
                <td className="border border-gray-300 px-3 py-2">Bê tông nhựa chặt 19 dày 6cm</td>
                <td className="border border-gray-300 px-3 py-2 text-center">Km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">4,78</td>
                <td className="border border-gray-300 px-3 py-2 text-center">09/06/2025</td>
              </tr>
              {/* More rows for Section I... */}

              {/* Section II */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="5">II. Tuyến nhánh nút giao</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2">Bê tông nhựa chặt 16 dày 6cm</td>
                <td className="border border-gray-300 px-3 py-2 text-center">Km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">3,08</td>
                <td className="border border-gray-300 px-3 py-2 text-center">15/05/2025</td>
              </tr>
              {/* More rows for Section II... */}

              {/* Section III */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium text-center" colSpan="5">III. Hệ thống ATGT</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2">Dải phân cách giữa</td>
                <td className="border border-gray-300 px-3 py-2 text-center">km</td>
                <td className="border border-gray-300 px-3 py-2 text-right">13,52</td>
                <td className="border border-gray-300 px-3 py-2 text-center">15/06/2025</td>
              </tr>
              {/* More rows for Section III... */}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="font-medium">- Công tác giải ngân:</p>
          <p>Giá trị khối lượng hoàn thành: 3.915,0 tỷ đồng; Lũy kế giá trị đã giải ngân đến nay: 3.491,355 tỷ đồng.</p>
        </div>

        <h4 className="text-lg font-semibold mt-6 mb-2">7. Đánh giá công tác quản lý chất lượng, tiến độ, an toàn lao động, an toàn giao thông, vệ sinh môi trường cho từng gói thầu và cả dự án</h4>
        <p className="mb-4">(nhà thầu nào chậm, lý do, giải pháp khắc phục): Đáp ứng yêu cầu.</p>

        <h4 className="text-lg font-semibold mt-6 mb-2">8. Khó khăn, vướng mắc và kiến nghị:</h4>
        <p className="mb-4">
          Kính đề nghị Bộ Xây dựng, UBND tỉnh Quảng Bình chỉ đạo các cấp các ngành cùng các địa phương quan tâm giải quyết các tồn tại vướng mắc để bàn giao mặt bằng trong tháng 4/2025 cụ thể:
        </p>

        <h5 className="font-medium mt-3 mb-1">- Huyện Quảng Trạch:</h5>
        <ul className="list-disc pl-6 space-y-2">
          <li>Còn vướng 22 hộ, ảnh hưởng thi công hàng rào bảo vệ, đường gom và đường vuốt nối hầm chui.</li>
          <li>Vướng 02 đường dây điện 500kV tại đường dẫn đầu cầu vượt ngang số 1 km583+00.</li>
        </ul>
      </div>
      <div className="mb-6">
        <h5 className="font-medium mt-3 mb-1">- Thị xã Ba Đồn:</h5>
        <ul className="list-disc pl-6 space-y-2">
          <li>Km608+600-Km609+160 còn vướng 03 hộ, ảnh hưởng thi công hàng rào bảo vệ.</li>
          <li>
            Km609+500-Km609+600; Km609+900-Km610+00 xã Quảng Hoà chưa hoàn thành công tác GPMB 
            cho 26 hộ phạm vi bổ sung mở rộng bệ phân áp.
          </li>
        </ul>

        <div className="mt-6">
          <p className="mb-4">Ban QLDA 6 xin trân trọng cảm ơn.</p>

        </div>
        <div className="mt-6">
        <div className="mr-10 pt-4 mt-6 mw-64 mx-auto">
            <p className="font-bold uppercase">BAN QUẢN LÝ DỰ ÁN 6</p>
          </div>
        </div>
      </div>
    </div>
</div>
  )
}

export default ProjectReport;
