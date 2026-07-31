
import React, { useState, useEffect, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiPlus,
  FiMapPin,
  FiMoreVertical,
  FiDownload,
  FiSettings,
  FiGrid,
  FiList,
} from "react-icons/fi";
import "./DashBoard.css";
import pin from "../../assets/img/pin.png";
import attachment from "../../assets/img/attachment.png";
import trash from "../../assets/img/file.png";
import planIcon from "../../assets/img/plan-icon.png";
import actualIcon from "../../assets/img/actual-icon.png";
import delayIcon from "../../assets/img/delay-icon.png";
import edit from "../../assets/img/edit.png"
import axios from "axios";
import { useProject } from "../../contexts/ProjectContext";
import AddNewSubProject from "../AddNewSubProject/AddNewSubProject";
import TienDoHangMucPopup from "./TienDoHangMucPopup";
import { debounce } from 'lodash';


const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const Dashboard = () => {
  const ProgressPieChart = ({ project }) => {
    const hoanThanh = parseFloat(project?.thongKe?.phanTramHoanThanh || 0);
    const cham = parseFloat(project?.thongKe?.phanTramChamTienDo || 0);
    const dangLam = parseFloat(project?.thongKe?.phanTramKeHoach || 0);
    const data = [
      { name: 'Hoàn thành', value: hoanThanh, color: '#52c41a' },
      { name: 'Chậm tiến độ', value: cham, color: '#faad14' },
      { name: 'Đang làm', value: dangLam, color: '#1890ff' },
    ].filter((d) => d.value > 0);
    const display = Math.round(hoanThanh || dangLam || 0);

    return (
      <div className="home-progress-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ value: 1, color: '#f0f0f0' }]}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={34}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {(data.length ? data : [{ color: '#f0f0f0' }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="home-progress-chart-center">{display}%</div>
      </div>
    );
  };
  const [popupStatus, setPopupStatus] = useState(null);
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
  const [showEdit, setShowEdit] = useState(false)
  const [selectedID, setSelectedID] = useState(null)
  const [selectedParentID, setSelectedParentID] = useState(null)
  const [showFilters, setShowFilters] = useState(false);

  const { logout } = useProject();
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [expandedMenuId, setExpandedMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useClickOutside(menuRef, () => {
    setShowMenu(false);
  });
  const [popupData, setPopupData] = useState({
    status: null,  // 'danglam' | 'hoanthanh' | 'chamtienDo'
    duAnId: null   // ID của dự án được chọn
  });
  const handleOpenPopup = (duAnId, status) => {
    setPopupData({ status, duAnId });
  };

  const handleClosePopup = () => {
    setPopupData({ status: null, duAnId: null });
  };

  const debouncedSetPopupStatus = useCallback(
    debounce((status) => {
      setPopupStatus(status);
    }, 300),
    []
  );
  const mergedProvinces = [
    "Thành phố Hà Nội",
    "Thành phố Huế",
    "Tỉnh Quảng Ninh",
    "Tỉnh Cao Bằng",
    "Tỉnh Lạng Sơn",
    "Tỉnh Lai Châu",
    "Tỉnh Điện Biên",
    "Tỉnh Sơn La",
    "Tỉnh Thanh Hóa",
    "Tỉnh Nghệ An",
    "Tỉnh Hà Tĩnh",
    "Tỉnh Tuyên Quang",
    "Tỉnh Lào Cai",
    "Tỉnh Thái Nguyên",
    "Tỉnh Phú Thọ",
    "Tỉnh Bắc Ninh",
    "Tỉnh Hưng Yên",
    "Thành phố Hải Phòng",
    "Tỉnh Ninh Bình",
    "Tỉnh Quảng Trị",
    "Thành phố Đà Nẵng",
    "Tỉnh Quảng Ngãi",
    "Tỉnh Gia Lai",
    "Tỉnh Khánh Hòa",
    "Tỉnh Lâm Đồng",
    "Tỉnh Đắk Lắk",
    "Thành phố Hồ Chí Minh",
    "Tỉnh Đồng Nai",
    "Tỉnh Tây Ninh",
    "Thành phố Cần Thơ",
    "Tỉnh Vĩnh Long",
    "Tỉnh Đồng Tháp",
    "Tỉnh Cà Mau",
    "Tỉnh An Giang"
  ];
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    "Đang chuẩn bị": 0,
    "Đang thi công": 0,
    "Hoàn thành": 0,
    "Tạm dừng": 0
  });

  const statuses = [
    { label: "Tổng số dự án", count: statusCounts.total },
    { label: "Đang chuẩn bị", count: statusCounts["Đang chuẩn bị"] },
    { label: "Đang thi công", count: statusCounts["Đang thi công"] },
    { label: "Hoàn thành", count: statusCounts["Hoàn thành"] },
    { label: "Tạm dừng", count: statusCounts["Tạm dừng"] },
  ];

  const [activeStatus, setActiveStatus] = useState("Tổng số dự án");

  const statusesLabel = [
    {
      label: "Tổng số dự án",
      tabLabel: "Tất cả",
      count: statusCounts.total,
      color: "text-red-600",
      box: "bg-red-500",
      valueColor: "#ff4d4f",
      iconBg: "#fff1f0",
    },
    {
      label: "Đang chuẩn bị",
      tabLabel: "Đang chuẩn bị",
      count: statusCounts["Đang chuẩn bị"],
      color: "text-blue-600",
      box: "bg-blue-500",
      valueColor: "#1890ff",
      iconBg: "#e6f4ff",
    },
    {
      label: "Đang thi công",
      tabLabel: "Đang thi công",
      count: statusCounts["Đang thi công"],
      color: "text-green-600",
      box: "bg-green-500",
      valueColor: "#52c41a",
      iconBg: "#f6ffed",
    },
    {
      label: "Hoàn thành",
      tabLabel: "Hoàn thành",
      count: statusCounts["Hoàn thành"],
      color: "text-orange-600",
      box: "bg-orange-400",
      valueColor: "#fa8c16",
      iconBg: "#fff7e6",
    },
    {
      label: "Tạm dừng",
      tabLabel: "Tạm dừng",
      count: statusCounts["Tạm dừng"],
      color: "text-purple-600",
      box: "bg-purple-500",
      valueColor: "#722ed1",
      iconBg: "#f9f0ff",
    },
  ];

  const getStatusDotColor = (status) => {
    switch (status) {
      case "Đang chuẩn bị": return "#1890ff";
      case "Đang thi công": return "#52c41a";
      case "Hoàn thành": return "#fa8c16";
      case "Tạm dừng": return "#722ed1";
      default: return "#999";
    }
  };

  const formatDisplayDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  const getMainContractor = (project) =>
    project?.danhSachNhaThau?.[0]?.TenNhaThau || "—";

  const pctOfTotal = (count) =>
    statusCounts.total ? ((count / statusCounts.total) * 100).toFixed(2) : "0.00";

  const getStatusColor = (status) => {
    const foundStatus = statusesLabel.find((s) => s.label === status);
    return foundStatus ? foundStatus.box : "bg-gray-400";
  };

  const calculateStatusCounts = (projects) => {
    const counts = {
      total: projects.length,
      "Đang chuẩn bị": 0,
      "Đang thi công": 0,
      "Hoàn thành": 0,
      "Tạm dừng": 0
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
  const toggleMenu = (projectId) => {
    setExpandedMenuId(expandedMenuId === projectId ? null : projectId);
  };

  // Add this effect to close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setExpandedMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
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
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (project) =>
          (project.TenDuAn && project.TenDuAn.toLowerCase().includes(term)) ||
          String(project.DuAnID).includes(term)
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
        const completion = parseFloat(
          project?.thongKe?.phanTramHoanThanh || project.phanTramHoanThanh || "0"
        );
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
  const handleEdit = (projectID, parentID) => {
    setSelectedID(projectID);
    setSelectedParentID(parentID);
    setShowEdit(true);
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
          axios.get(`${API_BASE_URL}/duAnTongList`),
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
          const response = await axios.get(`${API_BASE_URL}/duAnTongList`);
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
    console.log(soLuongDuAnThanhPhan, soLuongGoiThau);

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
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aPin = pinnedProjects.includes(a.DuAnID);
    const bPin = pinnedProjects.includes(b.DuAnID);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    return 0;
  });

  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));

  const dateRangeLabel =
    fromDate && toDate
      ? `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`
      : "01/01/2020 - 31/12/2025";

  return (
    <div className="home-page flex flex-col min-h-full pt-12 md:pt-0">
      <div className="flex-1 p-4 md:p-5 flex flex-col gap-4 min-h-0">
        {/* Toolbar lọc */}
        <div className="home-toolbar flex flex-wrap items-center gap-3">
          <div className="home-search-wrap">
            <FiSearch className="home-search-icon" size={15} />
            <input
              type="text"
              placeholder="Tìm dự án, mã dự án..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="home-search-input"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <ul className="home-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => selectSuggestion(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="home-date-range">
            <FiCalendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border-none outline-none bg-transparent text-xs w-[110px]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border-none outline-none bg-transparent text-xs w-[110px]"
            />
            {!fromDate && !toDate && (
              <span className="text-gray-400 text-xs hidden lg:inline">{dateRangeLabel}</span>
            )}
          </div>

          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="home-filter-select"
          >
            <option value="">Tất cả tỉnh</option>
            {mergedProvinces.map((province, index) => (
              <option key={index} value={province}>
                {province}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="home-filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang chuẩn bị">Đang chuẩn bị</option>
            <option value="Đang thi công">Đang thi công</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>

          <select
            value={contractor}
            onChange={(e) => setContractor(e.target.value)}
            className="home-filter-select"
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
            className="home-filter-select"
          >
            <option value="all">Mọi tiến độ</option>
            <option value="20">&gt;20%</option>
            <option value="50">&gt;50%</option>
            <option value="80">&gt;80%</option>
            <option value="100">100%</option>
          </select>

          <button type="button" className="home-btn-outline" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter size={14} />
            Bộ lọc nâng cao
          </button>

          <button type="button" className="home-btn-primary ml-auto" onClick={() => navigate("/add-new")}>
            <FiPlus size={16} />
            Thêm dự án
          </button>
        </div>

        {/* KPI cards */}
        <div className="home-stat-grid">
          {statusesLabel.map((s) => (
            <div
              key={s.label}
              className="home-stat-card cursor-pointer"
              onClick={() => handleStatusClick(s.label)}
            >
              <div>
                <div className="home-stat-label">{s.label}</div>
                <div className="home-stat-value" style={{ color: s.valueColor }}>
                  {s.count}
                </div>
                <div className="home-stat-pct">{pctOfTotal(s.count)}%</div>
              </div>
              <div className="home-stat-icon" style={{ background: s.iconBg, color: s.valueColor }}>
                <span className={`inline-block w-3 h-3 rounded-sm ${s.box}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Table panel */}
        <div className="home-table-panel flex flex-col flex-1 min-h-0">
          <div className="home-tabs px-3 pt-1">
            {statusesLabel.map((s) => {
              const isActive = activeStatus === s.label;
              return (
                <button
                  key={s.label}
                  type="button"
                  className={`home-tab ${isActive ? "home-tab--active" : ""}`}
                  onClick={() => handleStatusClick(s.label)}
                >
                  <span className={`home-tab-dot ${s.box}`} />
                  {s.tabLabel} ({s.count})
                </button>
              );
            })}
          </div>

          <div className="home-table-toolbar">
            <button type="button" className="home-table-btn" onClick={handleExportReport}>
              <FiDownload size={14} />
              Xuất Excel
            </button>
            <button type="button" className="home-table-btn">
              <FiSettings size={14} />
              Cấu hình cột
            </button>
            <button type="button" className="home-table-btn">
              <FiGrid size={14} />
            </button>
            <button type="button" className="home-table-btn">
              <FiList size={14} />
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="home-data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" className="accent-blue-500" readOnly />
                  </th>
                  <th>Mã dự án</th>
                  <th>Tên dự án</th>
                  <th>Dài tuyến</th>
                  <th>Trạng thái</th>
                  <th>Tiến độ tổng thể</th>
                  <th>Nhà thầu chính</th>
                  <th>Giá trị HĐ (Tỷ đồng)</th>
                  <th>Khởi công</th>
                  <th>Dự kiến HT</th>
                  <th style={{ width: 48 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : paginatedProjects.length > 0 ? (
                  paginatedProjects.map((project) => (
                    <tr key={project.DuAnID}>
                      <td>
                        <input type="checkbox" className="accent-blue-500" />
                      </td>
                      <td>
                        <div className="home-project-id">{project.DuAnID}</div>
                        <div
                          className="home-project-link"
                          onClick={() =>
                            handleDetail(
                              project.DuAnID,
                              project.TenDuAn,
                              project.soLuongDuAnThanhPhan,
                              project.soLuongGoiThau
                            )
                          }
                        >
                          Xem chi tiết
                        </div>
                      </td>
                      <td>
                        <div className="home-project-name">{project.TenDuAn}</div>
                        {project.TinhThanh && (
                          <div className="home-project-location">
                            <FiMapPin size={11} />
                            {project.TinhThanh}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{project.TongChieuDai ?? "—"}</strong> km
                      </td>
                      <td>
                        <div className="flex items-center">
                          <span
                            className="home-status-dot"
                            style={{ background: getStatusDotColor(project.TrangThai) }}
                          />
                          <span className="home-status-text">{project.TrangThai}</span>
                        </div>
                        <div className="home-package-sub">
                          <strong>{project.soLuongGoiThau ?? 0}</strong> gói thầu
                        </div>
                      </td>
                      <td>
                        <div className="home-progress-cell">
                          <ProgressPieChart project={project} />
                          <div className="home-progress-lines">
                            <div>
                              Đang làm:{" "}
                              <strong className="text-blue-600">
                                {project?.thongKe?.phanTramKeHoach ?? "0"}%
                              </strong>
                            </div>
                            <div>
                              Hoàn thành:{" "}
                              <strong className="text-green-600">
                                {project?.thongKe?.phanTramHoanThanh ?? "0"}%
                              </strong>
                            </div>
                            <div>
                              Chậm tiến độ:{" "}
                              <strong className="text-orange-500">
                                {project?.thongKe?.phanTramChamTienDo ?? "0"}%
                              </strong>
                            </div>
                          </div>
                        </div>
                        {popupData.status && popupData.duAnId === project.DuAnID && (
                          <TienDoHangMucPopup
                            duAnId={popupData.duAnId}
                            status={popupData.status}
                            onClose={handleClosePopup}
                          />
                        )}
                      </td>
                      <td className="max-w-[140px] truncate" title={getMainContractor(project)}>
                        {getMainContractor(project)}
                      </td>
                      <td>—</td>
                      <td>{formatDisplayDate(project.NgayKhoiCong)}</td>
                      <td>{formatDisplayDate(project.KeHoachHoanThanh)}</td>
                      <td>
                        <div className="relative">
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(project.DuAnID);
                            }}
                          >
                            <FiMoreVertical size={16} className="text-gray-500" />
                          </button>
                          {expandedMenuId === project.DuAnID && (
                            <div className="home-action-menu">
                              <button type="button" onClick={(e) => e.stopPropagation()}>
                                <img src={attachment} alt="" className="w-4 h-4 mr-2 inline" />
                                Tệp đính kèm
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(project.DuAnID, project.ParentID);
                                }}
                              >
                                <img src={edit} alt="" className="w-4 h-4 mr-2 inline" />
                                Sửa thông tin
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinProject(project.DuAnID);
                                }}
                              >
                                <img src={pin} alt="" className="w-4 h-4 mr-2 inline" />
                                {pinnedProjects.includes(project.DuAnID) ? "Bỏ ghim" : "Ghim"}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.DuAnID);
                                }}
                              >
                                <img src={trash} alt="" className="w-4 h-4 mr-2 inline" />
                                Xoá
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-400">
                      Không tìm thấy dự án nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredProjects.length > 0 && (
            <div className="home-pagination">
              <span>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredProjects.length)} trong tổng số{" "}
                {filteredProjects.length} dự án
              </span>
              <div className="flex items-center">
                <button
                  type="button"
                  className="home-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`home-page-btn ${currentPage === page ? "home-page-btn--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="home-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddPopup && (
        <div className="popup" onClick={() => setShowAddPopup(false)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          ></div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="
        w-full 
        max-w-6xl 
        bg-white 
        rounded-lg 
        shadow-xl 
        overflow-hidden 
        p-6 
        sm:p-4 
        md:p-6 
        lg:p-8 
        h-auto 
        max-h-[90vh] 
        overflow-y-auto
      "
          >
            <AddNewSubProject
              isEdit={1}
              ProjectID={selectedID}
              DuAnID={selectedParentID}
              onClose={() => setShowEdit(false)}
              onSuccess={() => {
                setShowEdit(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;