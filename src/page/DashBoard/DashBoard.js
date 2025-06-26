
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaRegBell } from "react-icons/fa";
import pin from "../../assets/img/pin.png";
import attachment from "../../assets/img/attachment.png";
import trash from "../../assets/img/file.png";
import planIcon from "../../assets/img/plan-icon.png";
import actualIcon from "../../assets/img/actual-icon.png";
import delayIcon from "../../assets/img/delay-icon.png";
import axios from "axios";
import { useProject } from "../../contexts/ProjectContext";


const Dashboard = () => {
  const [selected, setSelected] = useState("total");
  const [startDate, setStartDate] = useState("dd/mm/yyyy");
  const [endDate, setEndDate] = useState("dd/mm/yyyy");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("Tổng số dự án");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { setSelectedProjectId } = useProject();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedDuAnIds, setSelectedDuAnIds] = useState([]);
  const [selectedDuAnId, setSelectedDuAnId] = useState(null);
  const navigate = useNavigate();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("all");
  const [isMapView, setIsMapView] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [contractor, setContractor] = useState("all");
  const [contractorList, setContractorList] = useState([]);
  const [completionLevel, setCompletionLevel] = useState("all");

  const { logout } = useProject();

  const [showMenu, setShowMenu] = useState(false);

  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    "Đang triển khai": 0,
    "Đã hoàn thành": 0,
    "Chậm tiến độ": 0,
    "Đã phê duyệt – chờ khởi công": 0,
    "Đã phê duyệt – chậm tiến độ": 0,
    "Dự kiến khởi công": 0,
  });

  const statuses = [
    { label: "Tổng số dự án", count: statusCounts.total },
    { label: "Đang triển khai", count: statusCounts["Đang triển khai"] },
    { label: "Đã hoàn thành", count: statusCounts["Đã hoàn thành"] },
    { label: "Chậm tiến độ", count: statusCounts["Chậm tiến độ"] },
    {
      label: "Đã phê duyệt – chờ khởi công",
      count: statusCounts["Đã phê duyệt – chờ khởi công"],
    },
    {
      label: "Đã phê duyệt – chậm tiến độ",
      count: statusCounts["Đã phê duyệt – chậm tiến độ"],
    },
    { label: "Dự kiến khởi công", count: statusCounts["Dự kiến khởi công"] },
  ];

  const [activeStatus, setActiveStatus] = useState("Tổng số dự án");

  const statusesLabel = [
    {
      label: "Tổng số dự án",
      count: statusCounts.total,
      color: "text-red-600",
      box: "bg-red-600",
    },
    {
      label: "Đang triển khai",
      count: statusCounts["Đang triển khai"],
      color: "text-red-600",
      box: "bg-blue-600",
    },
    {
      label: "Đã hoàn thành",
      count: statusCounts["Đã hoàn thành"],
      color: "text-red-600",
      box: "bg-green-600",
    },
    {
      label: "Chậm tiến độ",
      count: statusCounts["Chậm tiến độ"],
      color: "text-red-600",
      box: "bg-yellow-500",
    },
    {
      label: "Đã phê duyệt – chờ khởi công",
      count: statusCounts["Đã phê duyệt – chờ khởi công"],
      color: "text-red-600",
      box: "bg-purple-500",
    },
    {
      label: "Đã phê duyệt – chậm tiến độ",
      count: statusCounts["Đã phê duyệt – chậm tiến độ"],
      color: "text-red-600",
      box: "bg-orange-500",
    },
    {
      label: "Dự kiến khởi công",
      count: statusCounts["Dự kiến khởi công"],
      color: "text-red-600",
      box: "bg-gray-500",
    },
  ];

  const getStatusColor = (status) => {
    const foundStatus = statusesLabel.find((s) => s.label === status);
    return foundStatus ? foundStatus.box : "bg-gray-400";
  };

  const calculateStatusCounts = (projects) => {
    const counts = {
      total: projects.length,
      "Đang triển khai": 0,
      "Đã hoàn thành": 0,
      "Chậm tiến độ": 0,
      "Đã phê duyệt – chờ khởi công": 0,
      "Đã phê duyệt – chậm tiến độ": 0,
      "Dự kiến khởi công": 0,
    };

    projects.forEach((project) => {
      if (counts.hasOwnProperty(project.TrangThai)) {
        counts[project.TrangThai]++;
      }
    });

    return counts;
  };

  useEffect(() => {
    if (projects.length > 0) {
      const counts = calculateStatusCounts(projects);
      setStatusCounts(counts);
    }
  }, [projects]);

  const handleStatusClick = (statusLabel) => {
    if (statusLabel === "Tổng số dự án") {
      setStatus("all");
      setSelectedStatus("Tổng số dự án");
      setActiveStatus("Tổng số dự án");
    } else {
      setStatus(statusLabel);
      setSelectedStatus(statusLabel);
      setActiveStatus(statusLabel);
    }
  };

  const filterProjects = () => {
    let result = [...projects];

    // Lọc theo ngày
    if (fromDate || toDate) {
      result = result.filter((project) => {
        const projectStartDate = new Date(project.NgayKhoiCong || "1970-01-01");
        const filterFromDate = fromDate
          ? new Date(fromDate)
          : new Date("1970-01-01");
        const filterToDate = toDate ? new Date(toDate) : new Date("9999-12-31");
        return (
          projectStartDate >= filterFromDate && projectStartDate <= filterToDate
        );
      });
    }

    // Lọc theo trạng thái
    if (status !== "all") {
      result = result.filter((project) => project.TrangThai === status);
    }

    // Lọc theo tên dự án
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.TenDuAn && project.TenDuAn.toLowerCase().includes(term)
      );
    }

    // Lọc theo tỉnh thành
    if (selectedProvince) {
      result = result.filter((project) => {
        if (!project.TinhThanh) return false;
        const searchProvince = selectedProvince
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const projectProvinces = project.TinhThanh.split("–").map((p) =>
          p
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        );
        return projectProvinces.some((p) => p.includes(searchProvince));
      });
    }

    // Lọc theo nhà thầu (mới thêm)
    if (contractor !== "all") {
      result = result.filter((project) => {
        // Kiểm tra xem dự án có chứa nhà thầu được chọn không
        return project.danhSachNhaThau?.some(
          (nhathau) => nhathau.NhaThauID.toString() === contractor
        );
      });
    }

    if (completionLevel !== "all") {
      const minCompletion = parseFloat(completionLevel);
      result = result.filter((project) => {
        const completion = parseFloat(project.phanTramHoanThanh || "0");
        console.log(completion);

        return completion >= minCompletion;
      });
    }

    if (status !== "all") {
      result = result.filter((project) => project.TrangThai === status);
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
      .filter(
        (project) =>
          project.TenDuAn && project.TenDuAn.toLowerCase().includes(termLower)
      )
      .map((project) => project.TenDuAn)
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
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, provincesRes, contractorRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/duAnTong`),
          axios.get("https://provinces.open-api.vn/api/?depth=1"),
          axios.get(`${API_BASE_URL}/nhaThauList`),
        ]);

        setProjects(projectsRes.data.data);
        setFilteredProjects(projectsRes.data.data);
        setContractorList(contractorRes.data.data);
        setProvinces(provincesRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
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
          const promises = selectedDuAnIds.map((id) =>
            axios.get(`${API_BASE_URL}/duAn/${id}`)
          );

          // Chạy tất cả các requests cùng lúc
          const results = await Promise.all(promises);

          // Tổng hợp kết quả
          fetchedData = results.map((res, index) => ({
            ...res.data.data,
            DuAnID: selectedDuAnIds[index],
          }));
        }
        // Xử lý một ID
        else if (selectedDuAnId) {
          const response = await axios.get(
            `${API_BASE_URL}/duAn/${selectedDuAnId}`
          );
          fetchedData = [
            {
              ...response.data.data,
              DuAnID: selectedDuAnId,
            },
          ];

          setSelectedDuAnId(null);
        }
        // Trường hợp không có ID nào, lấy tất cả dự án
        else {
          const response = await axios.get(`${API_BASE_URL}/duAnTong`);
          fetchedData = response.data.data;
        }

        console.log("Dữ liệu đã tìm nạp:", fetchedData);
        setProjects(fetchedData);
        setFilteredProjects(fetchedData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedDuAnIds, selectedDuAnId]);
  useEffect(() => {
    filterProjects();
  }, [
    fromDate,
    toDate,
    status,
    searchTerm,
    selectedProvince,
    contractor,
    completionLevel,
    projects,
  ]);
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/duan/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Thêm token authorization nếu cần
          // 'Authorization': `Bearer ${yourToken}`
        },
      });

      const data = await response.json();

      if (data.success) {
        // Cập nhật UI sau khi xóa thành công
        setProjects(projects.filter(project => project.DuAnID !== projectId));
        alert('Xóa dự án thành công');
      } else {
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa dự án:', error);
      alert('Có lỗi xảy ra khi xóa dự án');
    }
  };
  const handleDetail = (DuAnID, TenDuAn, soLuongDuAnThanhPhan, soLuongGoiThau) => {
    if (soLuongDuAnThanhPhan > 0) {
      navigate(`/side-project/${DuAnID}`);
    } else if (soLuongDuAnThanhPhan === 0 && soLuongGoiThau === 0) {
      navigate(`/side-project/${DuAnID}`);
    }
    else {
      navigate('/detail', {
        state: {
          projectId: DuAnID,
          projectName: TenDuAn,
          subProjectName: null,
          subProjectId: DuAnID
        }
      });

    }
    setSelectedProjectId(DuAnID);
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
  };
  const [pinnedProjects, setPinnedProjects] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinnedProjects");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Hàm xử lý ghim/bỏ ghim
  const handlePinProject = (projectId) => {
    setPinnedProjects((prev) => {
      const newPinned = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [projectId, ...prev];

      // Lưu vào localStorage
      localStorage.setItem("pinnedProjects", JSON.stringify(newPinned));
      return newPinned;
    });
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case "Đang tiến hành":
        return { backgroundColor: "#f28c5e", color: "white" };
      case "Đã hoàn thành":
        return { backgroundColor: "#2ecc71", color: "black" };
      case "Chậm tiến độ":
        return { backgroundColor: "#e74c3c", color: "white" };
      default:
        return { backgroundColor: "#3498db", color: "white" };
    }
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("all");
    setSearchTerm("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setContractor("all");
  };

  const handleExportReport = () => {
    navigate("/bao-cao-tong");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <header className="bg-white px-6 py-1 shadow-sm flex justify-end items-center space-x-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">Thông báo</span>
          <FaRegBell />
          <span>Rdsic</span>
          <div className="relative inline-block">
          <button className="bg-gray-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center"
            onClick={() => setShowMenu(!showMenu)}
          >
            R
          </button>
          {showMenu && (
        <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-10">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Đăng xuất
            </button>
        </div>
      )}
    </div>
        </div>
      </header>

      <div className="px-6 pb-2 pt-2">
        <h2 className="text-l mt-6 md:mt-0 font-bold">
          Danh sách dự án đường bộ
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0">
        <div className="bg-white rounded-lg p-4 flex flex-col flex-1 min-h-screen">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm dự án"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-3 pr-10 py-1 border rounded w-full text-sm"
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto text-xs">
                  {searchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="inline-flex items-center border border-gray-300 rounded px-3 py-0.5 text-sm text-gray-700 bg-white w-full md:w-auto">
              <FaRegCalendarAlt className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent text-sm w-[120px]"
              />
              <span className="mx-1">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent text-sm w-[120px]"
              />
            </div>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="px-3 py-1 border rounded w-full md:w-48"
            >
              <option value="">Tất cả tỉnh</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1 border rounded w-full md:w-48"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chậm tiến độ">Chậm tiến độ</option>
              <option value="Đang triển khai">Đang triển khai</option>
              <option value="Đang tiến hành">Đang tiến hành</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Đã phê duyệt – chờ khởi công">
                Đã phê duyệt-chờ khởi công
              </option>
              <option value="Đã phê duyệt – chậm tiến độ">
                Đã phê duyệt-chậm tiến độ
              </option>
              <option value="Dự kiến khởi công">Dự kiến khởi công</option>
            </select>
            <select
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              className="px-3 py-1 border rounded w-full md:w-48"
            >
              <option value="all">Tất cả nhà thầu</option>
              {contractorList.map((nhathau) => (
                <option key={nhathau.NhaThauID} value={nhathau.NhaThauID}>
                  {nhathau.TenNhaThau}
                </option>
              ))}
            </select>
            <select
              value={completionLevel}
              onChange={(e) => setCompletionLevel(e.target.value)}
              className="px-3 py-1 border rounded w-full md:w-48"
            >
              <option value="all">Mọi tiến độ</option>
              <option value="20">&gt;20%</option>
              <option value="50">&gt;50%</option>
              <option value="80">&gt;80%</option>
              <option value="100">100%</option>
            </select>
            <button
              onClick={resetFilters}
              className="h-9 px-3 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium md:col-start-4"
            >
              Xóa lọc
            </button>
          </div>
          <div className="flex gap-2 mb-2 mt-3">
            <button className="bg-green-700 text-white pl-10 pr-10 px-4 py-1 rounded font-bold text-sm">
              XUẤT EXCEL
            </button>
            <button className="bg-teal-900 text-white pl-10 pr-10 px-4 py-1 rounded font-bold text-sm">
              NHẬP EXCEL
            </button>
          </div>
          {/* <div className="text-gray-500">Cập nhật lần cuối: 15:10</div> */}

          {/* Status bar section - hidden on mobile */}
          <div className="hidden md:flex flex-col flex-1 min-h-0 pt-3">
            <div className="flex shadow overflow-hidden bg-white w-full mt-1">
              {statuses.map((status) => (
                <div
                  key={status.label}
                  onClick={() => handleStatusClick(status.label)}
                  className={`relative flex-grow flex flex-col items-center justify-center px-6 py-2 cursor-pointer transition-colors duration-150
                    ${status.label !== "Tổng số dự án"
                      ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-px before:bg-gray-300"
                      : ""
                    }
                    ${activeStatus === status.label
                      ? "bg-red-50 border-t-4 border-red-600 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  <div className="mb-1 text-lg">{status.icon}</div>
                  <div className="text-sm font-bold">{status.label}</div>
                  <div className="text-sm text-gray-500">{status.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[3px] bg-red-600 w-full mb-2 mt-4"></div>

          <div className="p-2 font-sans text-[13px]">
            {/* Status Bar - hidden on mobile */}
            <div className="hidden md:flex flex-wrap items-center gap-3 border-b pb-2 mb-3">
              {statusesLabel.map((s) => {
                const isActive = selectedStatus === s.label;
                return (
                  <div
                    key={s.label}
                    onClick={() => handleStatusClick(s.label)}
                    className={`cursor-pointer px-2 py-1 text-sm font-semibold border-b-[3px] transition-colors duration-150 ${isActive
                        ? `${s.color} border-red-600`
                        : "text-gray-600 border-transparent hover:text-red-600 hover:border-red-400"
                      }`}
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-[10px] h-[10px] rounded-sm ${s.box}`}
                      ></div>
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
                  <span
                    className={`inline-block w-3 h-3 rounded-sm ${statusesLabel.find((s) => s.label === selectedStatus)?.box ||
                      "bg-gray-200"
                      }`}
                  ></span>
                  {selectedStatus || "Tất cả"}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isSelectOpen ? "transform rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {isSelectOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div
                    className={`p-2 flex items-center gap-2 ${!selectedStatus ? "bg-blue-50" : "hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      setSelectedStatus("");
                      setIsSelectOpen(false);
                    }}
                  ></div>
                  {statusesLabel.map((s) => (
                    <div
                      key={s.label}
                      className={`p-2 flex items-center gap-2 ${selectedStatus === s.label
                          ? "bg-blue-50"
                          : "hover:bg-gray-100"
                        }`}
                      onClick={() => {
                        setSelectedStatus(s.label);
                        setIsSelectOpen(false);
                      }}
                    >
                      <span
                        className={`inline-block w-3 h-3 rounded-sm ${s.box}`}
                      ></span>
                      {s.label} {s.count !== null && `(${s.count})`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div
              className="hidden md:flex flex-col"
              style={{ height: "calc(100vh - 300px)" }}
            >
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
                    {filteredProjects.length > 0 ? (
                      [...filteredProjects]
                        .sort((a, b) => {
                          const aIsPinned = pinnedProjects.includes(a.DuAnID);
                          const bIsPinned = pinnedProjects.includes(b.DuAnID);
                          if (aIsPinned && !bIsPinned) return -1;
                          if (!aIsPinned && bIsPinned) return 1;
                          return 0;
                        })
                        .map((project, index) => (
                          <tr key={project.DuAnID} className="text-center">
                            <td className="border px-1 py-2 text-center">
                              <input
                                type="checkbox"
                                className="accent-red-500"
                              />
                            </td>
                            <td className="border px-1 py-2">
                              <button
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                title="Tệp đính kèm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  src={attachment}
                                  alt="Tệp đính kèm"
                                  className="w-5 h-5"
                                />
                              </button>

                              <button
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                title="Xoá"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.DuAnID);
                                }}
                              >
                                <img
                                  src={trash}
                                  alt="Xoá"
                                  className="w-5 h-5"
                                />
                              </button>

                              <button
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                title="Ghim"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinProject(project.DuAnID);
                                }}
                              >
                                <img src={pin} alt="Ghim" className="w-5 h-5" />
                              </button>
                            </td>
                            <td className="border px-1 py-2 text-blue-600 font-medium">
                              <div>{project.DuAnID}</div>
                              <div
                                className="text-blue-400 text-xs cursor-pointer hover:underline"
                                onClick={() => handleDetail(project.DuAnID, project.TenDuAn, project.soLuongDuAnThanhPhan, project.soLuongGoiThau)}
                              >
                                Xem chi tiết
                              </div>
                            </td>
                            <td className="border px-1 py-2">
                              {project.TenDuAn}
                            </td>
                            <td className="border px-1 py-2">
                              {project.TongChieuDai} Km
                            </td>

                            <td className="border px-1 py-2">
                              <span
                                className={`px-2 py-[2px] text-white text-xs rounded-full ${getStatusColor(
                                  project.TrangThai
                                )}`}
                              >
                                {project.TrangThai}
                              </span>
                            </td>

                            <td className="border px-1 py-2">
                              <div className="grid grid-rows-3 gap-2">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={planIcon}
                                    width="16"
                                    height="16"
                                    alt="Kế hoạch"
                                    className="flex-shrink-0"
                                  />
                                  <span className="text-xs text-blue-600 font-bold">
                                    Kế hoạch:{" "}
                                    <strong className="font-medium">
                                      {project.phanTramKeHoach || "0"}%
                                    </strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={actualIcon}
                                    width="16"
                                    height="16"
                                    alt="Hoàn thành"
                                    className="flex-shrink-0"
                                  />
                                  <span className="text-xs text-green-600 font-bold">
                                    Hoàn thành:{" "}
                                    <strong className="font-medium">
                                      {project.phanTramHoanThanh || "0"}%
                                    </strong>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={delayIcon}
                                    width="16"
                                    height="16"
                                    alt="Chậm tiến độ"
                                    className="flex-shrink-0"
                                  />
                                  <span className="text-xs text-yellow-600 font-bold">
                                    Chậm tiến độ:{" "}
                                    <strong className="font-medium">
                                      {project.phanTramChamTienDo || "0"}%
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center text-gray-500 py-4"
                        >
                          Không tìm thấy dự án nào phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredProjects.length > 0 ? (
                [...filteredProjects]
                  .sort((a, b) => {
                    const aIsPinned = pinnedProjects.includes(a.DuAnID);
                    const bIsPinned = pinnedProjects.includes(b.DuAnID);
                    if (aIsPinned && !bIsPinned) return -1;
                    if (!aIsPinned && bIsPinned) return 1;
                    return 0;
                  })
                  .map((project, index) => (
                    <div
                      key={project.DuAnID}
                      className="bg-white rounded-lg shadow p-4 border border-gray-200"
                      onClick={(e) => {
                        // Chỉ chuyển trang nếu không click vào checkbox
                        if (!e.target.closest('input[type="checkbox"]')) {
                          handleDetail(project.DuAnID, project.TenDuAn, project.soLuongDuAnThanhPhan, project.soLuongGoiThau)
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="accent-red-500 mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="text-blue-600 font-medium">
                            <div>{project.DuAnID}</div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1.5 hover:bg-gray-200 rounded-full transition-all">
                            <img
                              src={attachment}
                              alt="Tệp đính kèm"
                              className="w-5 h-5"
                            />
                          </button>
                          <button
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                title="Xoá"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.DuAnID);
                                }}
                              >
                                <img
                                  src={trash}
                                  alt="Xoá"
                                  className="w-5 h-5"
                                />
                              </button>
                          
                          <button className="p-1.5 hover:bg-gray-200 rounded-full transition-all">
                            <img src={pin} alt="Ghim" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-600 font-medium">
                          Tên dự án:
                        </div>
                        <div>{project.TenDuAn}</div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-600 font-medium">
                          Dài tuyến:
                        </div>
                        <div>{project.TongChieuDai}</div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-600 font-medium">
                          Trạng thái:
                        </div>
                        <span
                          className={`px-2 py-[2px] text-white text-xs rounded-full ${getStatusColor(
                            project.TrangThai
                          )}`}
                        >
                          {project.TrangThai}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-gray-600 font-medium">
                          Tiến độ:
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={planIcon}
                            width="16"
                            height="16"
                            alt="Kế hoạch"
                          />
                          <span className="text-xs">
                            Kế hoạch:{" "}
                            <strong>{project.phanTramKeHoach || "0"}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={actualIcon}
                            width="16"
                            height="16"
                            alt="Hoàn thành"
                          />
                          <span className="text-xs">
                            Hoàn thành:{" "}
                            <strong>{project.phanTramHoanThanh || "0"}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={delayIcon}
                            width="16"
                            height="16"
                            alt="Chậm tiến độ"
                          />
                          <span className="text-xs">
                            Chậm tiến độ:{" "}
                            <strong>
                              {project.phanTramChamTienDo || "0"}%
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Không tìm thấy dự án nào phù hợp
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup thêm mới */}
      {showAddPopup && (
        <div className="popup" onClick={() => setShowAddPopup(false)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
