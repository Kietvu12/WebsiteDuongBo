import React, { useState} from 'react';
import {
  FaRegCalendarAlt,
  FaRegBell
} from "react-icons/fa";
import pin from '../../assets/img/pin.png'
import attachment from '../../assets/img/attachment.png'
import trash from '../../assets/img/file.png'
import planIcon from '../../assets/img/plan-icon.png';
import actualIcon from '../../assets/img/actual-icon.png';
import delayIcon from '../../assets/img/delay-icon.png';

const statuses = [
  { label: "Tổng số dự án", count: 0},
  { label: "Đang triển khai", count: 0},
  { label: "Đã hoàn thành", count: 0},
  { label: "Chậm tiến độ", count: 0},
  { label: "Đã phê duyệt - chờ khởi công", count: 0},
  { label: "Đã phê duyệt - chậm tiến độ", count: 0},
  { label: "Dự kiến khởi công", count: 0}
];

const statuses_1 = [
  { label: "Tất cả", count: 0, color: "text-red-600", box: "bg-red-600" },
  { label: "Đang triển khai", count: 0, color: "text-red-600", box: "bg-blue-600" },
  { label: "Đã hoàn thành", count: 0, color: "text-red-600", box: "bg-green-600" },
  { label: "Chậm tiến độ", count: 0, color: "text-red-600", box: "bg-yellow-500" },
  { label: "Đã phê duyệt - chờ khởi công", count: 0, color: "text-red-600", box: "bg-purple-500" },
  { label: "Đã phê duyệt - chậm tiến độ", count: 0, color: "text-red-600", box: "bg-orange-500" },
  { label: "Dự kiến khởi công", count: 0, color: "text-red-600", box: "bg-gray-500" }
];

const data = [
  {
    id: "114203691133",
    project: "Cao tốc Bắc – Nam phía Đông giai đoạn 1",
    length: "654.0 km",
    status: "Đang triển khai",
    phanTramKeHoach: 85,
    phanTramHoanThanh: 70,
    phanTramTienDo: 65
  },
  {
    id: "114176911725",
    project: "Cao tốc Trung Lương – Mỹ Thuận",
    length: "51.1 km",
    status: "Đang triển khai",
    phanTramKeHoach: 90,
    phanTramHoanThanh: 88,
    phanTramTienDo: 98
  },
  {
    id: "114177939622",
    project: "Cao tốc Mỹ Thuận – Cần Thơ",
    length: "23.6 km",
    status: "Chậm tiến độ",
    phanTramKeHoach: 75,
    phanTramHoanThanh: 60,
    phanTramTienDo: 80
  },
  {
    id: "114127139232",
    project: "Cao tốc Vĩnh Hảo – Phan Thiết",
    length: "100.8 km",
    status: "Đã phê duyệt - chờ khởi công",
    phanTramKeHoach: 60,
    phanTramHoanThanh: 50,
    phanTramTienDo: 83
  },
  {
    id: "114009264494",
    project: "Cao tốc Cam Lâm – Vĩnh Hảo",
    length: "78.5 km",
    status: "Đã phê duyệt - chậm tiến độ",
    phanTramKeHoach: 95,
    phanTramHoanThanh: 92,
    phanTramTienDo: 97
  },
  {
    id: "114088848471",
    project: "Cao tốc Phan Thiết – Dầu Giây",
    length: "99.0 km",
    status: "Dự kiến khởi công",
    phanTramKeHoach: 40,
    phanTramHoanThanh: 30,
    phanTramTienDo: 75
  },
  {
    id: "114088688933",
    project: "Cao tốc Hạ Long – Vân Đồn",
    length: "60.0 km",
    status: "Đã hoàn thành",
    phanTramKeHoach: 100,
    phanTramHoanThanh: 100,
    phanTramTienDo: 100
  },
];

<<<<<<< Updated upstream
    // Lọc theo trạng thái
    if (status !== 'all') {
      result = result.filter(project => project.TrangThai === status);
    }

    // Lọc theo tên dự án
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project =>
        project.TenDuAn && project.TenDuAn.toLowerCase().includes(term)
      );
    }

    // Lọc theo tỉnh thành
    if (selectedProvince) {
      result = result.filter(project => {
        if (!project.TinhThanh) return false;
        const searchProvince = selectedProvince.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const projectProvinces = project.TinhThanh
          .split('–')
          .map(p => p.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        return projectProvinces.some(p => p.includes(searchProvince));
      });
    }

    // Lọc theo nhà thầu (mới thêm)
    if (contractor !== 'all') {
      result = result.filter(project => {
        // Kiểm tra xem dự án có chứa nhà thầu được chọn không
        return project.danhSachNhaThau?.some(
          nhathau => nhathau.NhaThauID.toString() === contractor
        );
      });
    }

    if (completionLevel !== 'all') {
      const minCompletion = parseFloat(completionLevel);
      result = result.filter(project => {
        const completion = parseFloat(project.phanTramHoanThanh || '0');
        console.log(completion);

        return completion >= minCompletion;
      });
    }
    setFilteredProjects(result);
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };
  const updateSearchSuggestions = (term) => {
    if (!term) {
      setSearchSuggestions([]);
      return;
    }

    const termLower = term.toLowerCase();
    const suggestions = projects
      .filter(project =>
        project.TenDuAn && project.TenDuAn.toLowerCase().includes(termLower))
      .map(project => project.TenDuAn)
      .filter((name, index, self) => self.indexOf(name) === index)
      .slice(0, 5);

    setSearchSuggestions(suggestions);
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchSuggestions(value);
    setShowSuggestions(value.length > 0);
  };
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, provincesRes, contractorRes] = await Promise.all([
          axios.get('http://localhost:5000/duAnTong'),
          axios.get('https://provinces.open-api.vn/api/?depth=1'),
          axios.get('http://localhost:5000/nhaThauList')
        ]);

        setProjects(projectsRes.data.data);
        setFilteredProjects(projectsRes.data.data);
        setContractorList(contractorRes.data.data);
        setProvinces(provincesRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let fetchedData = [];
        console.log("selectedDuAnIds:", selectedDuAnIds);
        console.log("selectedDuAnId:", selectedDuAnId);

        // Xử lý nhiều ID 
        if (selectedDuAnIds.length > 0) {
          // Tạo mảng các promises cho các request API
          const promises = selectedDuAnIds.map(id =>
            axios.get(`http://localhost:5000/duAn/${id}`)
          );

          // Chạy tất cả các requests cùng lúc
          const results = await Promise.all(promises);

          // Tổng hợp kết quả
          fetchedData = results.map((res, index) => ({
            ...res.data.data,
            DuAnID: selectedDuAnIds[index]
          }));
        }
        // Xử lý một ID
        else if (selectedDuAnId) {
          const response = await axios.get(`http://localhost:5000/duAn/${selectedDuAnId}`);
          fetchedData = [{
            ...response.data.data,
            DuAnID: selectedDuAnId
          }];

          setSelectedDuAnId(null);
        }
        // Trường hợp không có ID nào, lấy tất cả dự án
        else {
          const response = await axios.get('http://localhost:5000/duAnTong');
          fetchedData = response.data.data;
        }

        console.log("Dữ liệu đã tìm nạp:", fetchedData);
        setProjects(fetchedData);
        setFilteredProjects(fetchedData);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedDuAnIds, selectedDuAnId]);
  useEffect(() => {
    filterProjects();
  }, [fromDate, toDate, status, searchTerm, selectedProvince, contractor, completionLevel, projects]);
  const handleDetail = (DuAnID) => {
    navigate(`/side-project/${DuAnID}`);
    setSelectedProjectId(DuAnID)
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
  };
  const [pinnedProjects, setPinnedProjects] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedProjects');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Hàm xử lý ghim/bỏ ghim
  const handlePinProject = (projectId) => {
    setPinnedProjects(prev => {
      const newPinned = prev.includes(projectId)
        ? prev.filter(id => id !== projectId) 
        : [projectId, ...prev]; 

      // Lưu vào localStorage
      localStorage.setItem('pinnedProjects', JSON.stringify(newPinned));
      return newPinned;
    });
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Đang tiến hành':
        return { backgroundColor: '#f28c5e', color: 'white' };
      case 'Đã hoàn thành':
        return { backgroundColor: '#2ecc71', color: 'black' };
      case 'Chậm tiến độ':
        return { backgroundColor: '#e74c3c', color: 'white' };
      default:
        return { backgroundColor: '#3498db', color: 'white' };
    }
  };

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatus('all');
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setContractor('all')
  };


  const handleExportReport = () => {
    navigate('/bao-cao-tong')
  };

=======
const statusColor = {
  "Đang triển khai": "bg-blue-600",
  "Đã hoàn thành": "bg-green-600",
  "Chậm tiến độ": "bg-yellow-500",
  "Đã phê duyệt - chờ khởi công": "bg-purple-500",
  "Đã phê duyệt - chậm tiến độ": "bg-orange-500",
  "Dự kiến khởi công": "bg-gray-500"
};

const Dashboard = () => {
  const [activeStatus, setActiveStatus] = useState('Tất cả');
  const [selected, setSelected] = useState("total");
  const [startDate, setStartDate] = useState("dd/mm/yyyy");
  const [endDate, setEndDate] = useState("dd/mm/yyyy");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
>>>>>>> Stashed changes
  return (
    <div className="flex flex-col min-h-screen bg-gray-200">

      <header className="bg-white px-6 py-1 shadow-sm flex justify-end items-center space-x-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">Thông báo</span>
          <FaRegBell />
          <span>Rdsic</span>
          <div className="bg-gray-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center">R</div>
        </div>
      </header>

<<<<<<< Updated upstream
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
  <h1 className="md:text-xl text-xs font-semibold text-gray-800">
    <span className="md:hidden text-xs text-blue-700">Trang chủ </span>
    Danh sách dự án đường bộ
  </h1>
  <button
    className="hidden md:inline-block text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
    onClick={handleExportReport}
  >
    Xuất báo cáo
  </button>
</div>
          <div className="md:hidden mb-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-1.5 text-xs bg-gray-100 rounded border border-gray-300"
            >
              {showMobileFilters ? 'Ẩn bộ lọc ▲' : 'Hiện bộ lọc ▼'}
            </button>
=======
      <div className="px-6 pb-2 pt-2">
        <h2 className="text-l mt-6 md:mt-0 font-bold">Danh sách dự án đường bộ</h2>
      </div>

      //Lọc
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0">
        <div className="bg-white rounded-lg p-4 flex flex-col flex-1 min-h-screen">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm dự án"
                className="pl-3 pr-10 py-1 border rounded w-full text-sm"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-2 border border-black border-l-2 rounded-r text-red-700 hover:text-red-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </button>
            </div>
            <div className="inline-flex items-center border border-gray-300 rounded px-3 py-0.5 text-sm text-gray-700 bg-white w-full md:w-auto">
              <FaRegCalendarAlt className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent text-sm w-[120px]"
              />
              <span className="mx-1">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent text-sm w-[120px]"
              />
            </div>
            <select className="px-3 py-1 border rounded w-full md:w-48">
              <option>Tất cả tỉnh</option>
            </select>
            <select className="px-3 py-1 border rounded w-full md:w-48">
              <option>Tất cả trạng thái</option>
            </select>
            <select className="px-3 py-1 border rounded w-full md:w-48">
              <option>Tất cả nhà thầu</option>
            </select>
            <select className="px-3 py-1 border rounded w-full md:w-48">
              <option>Mọi tiến độ</option>
            </select>
          </div>
          <div className="flex gap-2 mb-2 mt-3">
            <button className="bg-green-700 text-white pl-10 pr-10 px-4 py-1 rounded font-bold text-sm">XUẤT EXCEL</button>
            <button className="bg-teal-900 text-white pl-10 pr-10 px-4 py-1 rounded font-bold text-sm">NHẬP EXCEL</button>
          </div>
          <div className="text-gray-500">Cập nhật lần cuối: 15:10</div>

          {/* Status bar section - hidden on mobile */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 pt-3">
            <div className="flex shadow overflow-hidden bg-white w-full mt-1">
              {statuses.map((status, index) => (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`relative flex-grow flex flex-col items-center justify-center px-6 py-2 cursor-pointer transition-colors duration-150
                    ${index !== 0 ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-px before:bg-gray-300" : ""}
                    ${
                      activeIndex === index
                        ? "bg-red-50 border-t-4 border-red-600 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  <div className="mb-1 text-lg">
                    {status.icon}
                  </div>
                  <div className="text-sm font-bold">{status.label}</div>
                  <div className="text-sm text-gray-500">{status.count}</div>
                </div>
              ))}
            </div>
>>>>>>> Stashed changes
          </div>

          <div className="h-[3px] bg-red-600 w-full mb-2 mt-4"></div>
          
          <div className="p-2 font-sans text-[13px]">
            {/* Status Bar - hidden on mobile */}
            <div className="hidden md:flex flex-wrap items-center gap-3 border-b pb-2 mb-3">
              {statuses_1.map((s) => {
                const isActive = selectedStatus === s.label;
                return (
                  <div
                    key={s.label}
                    onClick={() => setSelectedStatus(s.label)}
                    className={`cursor-pointer px-2 py-1 text-sm font-semibold border-b-[3px] transition-colors duration-150 ${
                      isActive
                        ? `${s.color} border-red-600`
                        : "text-gray-600 border-transparent hover:text-red-600 hover:border-red-400"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`w-[10px] h-[10px] rounded-sm ${s.box}`}></div>
                      <span>
                        {s.label}
                        {s.count !== null && ` (${s.count})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Select - visible only on mobile */}
              <div className="md:hidden mb-3 relative">
                <div 
                  className="w-full p-2 border rounded-md text-sm flex items-center justify-between cursor-pointer bg-white"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-sm ${statuses_1.find(s => s.label === selectedStatus)?.box || 'bg-gray-200'}`}></span>
                    {selectedStatus || "Tất cả"}
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isSelectOpen ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isSelectOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div 
                      className={`p-2 flex items-center gap-2 ${!selectedStatus ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setSelectedStatus("");
                        setIsSelectOpen(false);
                      }}
                    >
                    </div>
                    {statuses_1.map((s) => (
                      <div 
                        key={s.label}
                        className={`p-2 flex items-center gap-2 ${selectedStatus === s.label ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        onClick={() => {
                          setSelectedStatus(s.label);
                          setIsSelectOpen(false);
                        }}
                      >
                        <span className={`inline-block w-3 h-3 rounded-sm ${s.box}`}></span>
                        {s.label} {s.count !== null && `(${s.count})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Desktop Table */}
            <div className="hidden md:flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
              <div className="overflow-y-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                    <tr className="text-center">
                      <th className="border px-2 py-1 w-6 text-sm">CHỌN</th>
                      <th className="border px-2 py-1 text-sm">THAO TÁC</th>
                      <th className="border px-2 py-1 text-sm">MÃ DỰ ÁN</th>
                      <th className="border px-2 py-1 text-sm">TÊN DỰ ÁN</th>
                      <th className="border px-2 py-1 text-sm">DÀI TUYẾN</th>
                      <th className="border px-2 py-1 text-sm">TRẠNG THÁI</th>
                      <th className="border px-2 py-1 text-sm">TIẾN ĐỘ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className="text-center">
                        <td className="border px-1 py-2 text-center">
                          <input type="checkbox" className="accent-red-500" />
                        </td>
                        <td className="border px-1 py-2">
                          <button
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                            title="Tệp đính kèm"
                          >
                            <img src={attachment} alt="Tệp đính kèm" className="w-5 h-5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                            title="Xoá"
                          >
                            <img src={trash} alt="Xoá" className="w-5 h-5" />
                          </button>
                          <button
                            className='p-1.5 hover:bg-gray-200 rounded-full transition-all'
                            title="Ghim"
                          >
                            <img src={pin} alt="Ghim" className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="border px-1 py-2 text-blue-600 font-medium">
                          <div>{row.id}</div>
                          <div className="text-blue-400 text-xs cursor-pointer hover:underline">Xem chi tiết</div>
                        </td>
                        <td className="border px-1 py-2">{row.project}</td>
                        <td className="border px-1 py-2">
                          {row.length}
                        </td>
                        
                        <td className="border px-1 py-2">
                          <span className={`px-2 py-[2px] text-white text-xs rounded-full ${
                            statusColor[row.status] || "bg-gray-400"
                          }`}>
                            {row.status}
                          </span>
                        </td>

                        <td className="border px-1 py-2">
                          <div className="grid grid-rows-3 gap-2">
                            <div className="flex items-center gap-2">
                              <img src={planIcon} width="16" height="16" alt="Kế hoạch" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Kế hoạch: <strong className="font-medium">{row.phanTramKeHoach || '0'}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={actualIcon} width="16" height="16" alt="Hoàn thành" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Hoàn thành: <strong className="font-medium">{row.phanTramHoanThanh || '0'}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={delayIcon} width="16" height="16" alt="Chậm tiến độ" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Chậm tiến độ: <strong className="font-medium">{row.phanTramChamTienDo || '0'}%</strong>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {data.map((row, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <input type="checkbox" className="accent-red-500 mr-2" />
                      <div className="text-blue-600 font-medium">
                        <div>{row.id}</div>
                        <div className="text-blue-400 text-xs cursor-pointer hover:underline">Xem chi tiết</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1.5 hover:bg-gray-200 rounded-full transition-all">
                        <img src={attachment} alt="Tệp đính kèm" className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded-full transition-all">
                        <img src={trash} alt="Xoá" className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded-full transition-all">
                        <img src={pin} alt="Ghim" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-gray-600 font-medium">Tên dự án:</div>
                    <div>{row.project}</div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-gray-600 font-medium">Dài tuyến:</div>
                    <div>{row.length}</div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-gray-600 font-medium">Trạng thái:</div>
                    <span className={`px-2 py-[2px] text-white text-xs rounded-full ${
                      statusColor[row.status] || "bg-gray-400"
                    }`}>
                      {row.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-gray-600 font-medium">Tiến độ:</div>
                    <div className="flex items-center gap-2">
                      <img src={planIcon} width="16" height="16" alt="Kế hoạch" />
                      <span className="text-xs">
                        Kế hoạch: <strong>{row.phanTramKeHoach || '0'}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={actualIcon} width="16" height="16" alt="Hoàn thành" />
                      <span className="text-xs">
                        Hoàn thành: <strong>{row.phanTramHoanThanh || '0'}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={delayIcon} width="16" height="16" alt="Chậm tiến độ" />
                      <span className="text-xs">
                        Chậm tiến độ: <strong>{row.phanTramChamTienDo || '0'}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
