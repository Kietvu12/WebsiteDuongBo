import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApprovalTable = ({ duAnId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState({
        duAnThanhPhan: {},
        goiThau: {},
        loaiHangMuc: {},
        hangMuc: {}
    });
    console.log(duAnId);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/duAn/${duAnId}/vuongMac`);
                setData(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        if (duAnId) fetchData();
    }, [duAnId]);

    // Hàm toggle mở rộng các cấp độ
    const toggleItem = (type, id) => {
        setExpandedItems(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [id]: !prev[type][id]
            }
        }));
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;
    if (!data) return <div className="p-4">Không có dữ liệu</div>;

    return (
        <div className="w-full overflow-x-auto p-2">
            <table className="table-auto w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã số</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công việc</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vướng mắc</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biện pháp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày phát sinh</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Level 1: Dự án tổng */}
                    <tr className="bg-blue-50 hover:bg-blue-100">
                        <td className="px-4 py-2 whitespace-nowrap">1</td>
                        <td className="px-4 py-2 whitespace-nowrap">DA-{data.duAnTong.duAnId}</td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                            {data.duAnTong.tenDuAn}
                        </td>
                        <td colSpan="5" className="px-4 py-2 whitespace-nowrap">
                            Tổng số vướng mắc: {data.duAnTong.tongVuongMac}
                            (Đã phê duyệt: {data.duAnTong.tongDaPheDuyet} |
                            Chưa phê duyệt: {data.duAnTong.tongChuaPheDuyet})
                        </td>
                    </tr>

                    {/* Level 2: Dự án thành phần */}
                    {data.duAnThanhPhan.map((duAnTP, indexTP) => (
                        <React.Fragment key={`duan-${duAnTP.duAnId}`}>
                            <tr className="bg-green-50 hover:bg-green-100">
                                <td className="px-4 py-2 whitespace-nowrap">{indexTP + 1}</td>
                                <td className="px-4 py-2 whitespace-nowrap">DA-{duAnTP.duAnId}</td>
                                <td className="px-4 py-2 whitespace-nowrap font-medium">
                                    <button
                                        onClick={() => toggleItem('duAnThanhPhan', duAnTP.duAnId)}
                                        className="flex items-center focus:outline-none"
                                    >
                                        <span className={`transform ${expandedItems.duAnThanhPhan[duAnTP.duAnId] ? 'rotate-90' : ''}`}>
                                            ▸
                                        </span>
                                        <span className="ml-1">{duAnTP.tenDuAn}</span>
                                    </button>
                                </td>
                                <td colSpan="5" className="px-4 py-2 whitespace-nowrap">
                                    Vướng mắc: {duAnTP.tongVuongMac}
                                    (Đã phê duyệt: {duAnTP.tongDaPheDuyet} |
                                    Chưa phê duyệt: {duAnTP.tongChuaPheDuyet})
                                </td>
                            </tr>

                            {/* Level 3: Gói thầu - chỉ hiển thị khi expanded */}
                            {expandedItems.duAnThanhPhan[duAnTP.duAnId] && duAnTP.danhSachGoiThau?.map((goiThau, indexGT) => (
                                <React.Fragment key={`goithau-${goiThau.goiThauId}`}>
                                    <tr className="bg-yellow-50 hover:bg-yellow-100">
                                        <td className="px-4 py-2 whitespace-nowrap pl-8">{`${indexTP + 1}.${indexGT + 1}`}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">GT-{goiThau.goiThauId}</td>
                                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                                            <button
                                                onClick={() => toggleItem('goiThau', goiThau.goiThauId)}
                                                className="flex items-center focus:outline-none"
                                            >
                                                <span className={`transform ${expandedItems.goiThau[goiThau.goiThauId] ? 'rotate-90' : ''}`}>
                                                    ▸
                                                </span>
                                                <span className="ml-1">{goiThau.tenGoiThau}</span>
                                            </button>
                                        </td>
                                        <td colSpan="5" className="px-4 py-2 whitespace-nowrap">
                                            Vướng mắc: {goiThau.tongVuongMac}
                                            (Đã phê duyệt: {goiThau.tongDaPheDuyet} |
                                            Chưa phê duyệt: {goiThau.tongChuaPheDuyet})
                                        </td>
                                    </tr>

                                    {/* Level 4: Loại hạng mục - chỉ hiển thị khi expanded */}
                                    {expandedItems.goiThau[goiThau.goiThauId] && goiThau.danhSachLoaiHangMuc?.map((loaiHM, indexLoai) => (
                                        <React.Fragment key={`loaihm-${loaiHM.loaiHangMuc}`}>
                                            <tr className="bg-gray-50 hover:bg-gray-100">
                                                <td className="px-4 py-2 whitespace-nowrap pl-12">{`${indexTP + 1}.${indexGT + 1}.${indexLoai + 1}`}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">LH-{loaiHM.loaiHangMuc}</td>
                                                <td className="px-4 py-2 whitespace-nowrap font-medium">
                                                    <button
                                                        onClick={() => toggleItem('loaiHangMuc', `${goiThau.goiThauId}-${loaiHM.loaiHangMuc}`)}
                                                        className="flex items-center focus:outline-none"
                                                    >
                                                        <span className={`transform ${expandedItems.loaiHangMuc[`${goiThau.goiThauId}-${loaiHM.loaiHangMuc}`] ? 'rotate-90' : ''}`}>
                                                            ▸
                                                        </span>
                                                        <span className="ml-1">{loaiHM.loaiHangMuc}</span>
                                                    </button>
                                                </td>
                                                <td colSpan="5" className="px-4 py-2 whitespace-nowrap">
                                                    Vướng mắc: {loaiHM.tongVuongMac}
                                                    (Đã phê duyệt: {loaiHM.tongDaPheDuyet} |
                                                    Chưa phê duyệt: {loaiHM.tongChuaPheDuyet})
                                                </td>
                                            </tr>

                                            {/* Level 5: Hạng mục - chỉ hiển thị khi expanded */}
                                            {expandedItems.loaiHangMuc[`${goiThau.goiThauId}-${loaiHM.loaiHangMuc}`] && loaiHM.danhSachHangMuc?.map((hangMuc, indexHM) => (
                                                <React.Fragment key={`hangmuc-${hangMuc.hangMucId}`}>
                                                    <tr className="bg-white hover:bg-gray-50">
                                                        <td className="px-4 py-2 whitespace-nowrap pl-16">{`${indexTP + 1}.${indexGT + 1}.${indexLoai + 1}.${indexHM + 1}`}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap">HM-{hangMuc.hangMucId}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                                                            <button
                                                                onClick={() => toggleItem('hangMuc', hangMuc.hangMucId)}
                                                                className="flex items-center focus:outline-none"
                                                            >
                                                                <span className={`transform ${expandedItems.hangMuc[hangMuc.hangMucId] ? 'rotate-90' : ''}`}>
                                                                    ▸
                                                                </span>
                                                                <span className="ml-1">{hangMuc.tenHangMuc}</span>
                                                            </button>
                                                        </td>
                                                        <td colSpan="5" className="px-4 py-2 whitespace-nowrap">
                                                            Vướng mắc: {hangMuc.tongVuongMac}
                                                            (Đã phê duyệt: {hangMuc.soVuongMacDaPheDuyet} |
                                                            Chưa phê duyệt: {hangMuc.soVuongMacChuaPheDuyet})
                                                        </td>
                                                    </tr>

                                                    {/* Level 6: Vướng mắc - chỉ hiển thị khi expanded */}
                                                    {expandedItems.hangMuc[hangMuc.hangMucId] && hangMuc.danhSachVuongMac?.map((vuongMac, indexVM) => (
                                                        <tr key={`vuongmac-${vuongMac.vuongMacId}`} className="bg-white hover:bg-gray-50 border-t">
                                                            <td className="px-4 py-2 whitespace-nowrap pl-20">{`${indexTP + 1}.${indexGT + 1}.${indexLoai + 1}.${indexHM + 1}.${indexVM + 1}`}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">VM-{vuongMac.vuongMacId}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                {vuongMac.tenCongTac} (KH-{vuongMac.keHoachId})
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{vuongMac.moTaChiTiet}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{vuongMac.bienPhapXuLy || 'Chưa có'}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(vuongMac.ngayPhatSinh)}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(vuongMac.ngayKetThuc)}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${vuongMac.trangThai === 'Đã phê duyệt'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {vuongMac.trangThai}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApprovalTable;