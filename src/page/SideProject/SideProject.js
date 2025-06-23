
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./SideProject.css";
import menuIcon from "../../assets/img/menu-icon.png";
import helpIcon from "../../assets/img/help-icon.png";
import userIcon from "../../assets/img/user-icon.png";
import addIcon from "../../assets/img/add-icon.png";
import editIcon from "../../assets/img/edit-icon.png";
import deleteIcon from "../../assets/img/delete-icon.png";
import planIcon from "../../assets/img/plan-icon.png";
import actualIcon from "../../assets/img/actual-icon.png";
import delayIcon from "../../assets/img/delay-icon.png";
import { useProject } from "../../contexts/ProjectContext";
import pin from "../../assets/img/pin.png";
import attachment from "../../assets/img/attachment.png";
import trash from "../../assets/img/file.png";
import { FaRegCalendarAlt, FaRegBell } from "react-icons/fa";
import AddNewSubProject from '../AddNewSubProject/AddNewSubProject';
import AddNewPackage from '../AddNewPackage/AddNewPackage';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';


const SideProject = () => {
  const location = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { DuAnID } = useParams();
  const [selectedDuAnConIds, setSelectedDuAnConIds] = useState([]);
  const [selectedDuAnConId, setSelectedDuAnConId] = useState(null);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [subProjects, setSubProjects] = useState([]);
  const { setSelectedSubProjectId } = useProject();
  const [loading, setLoading] = useState(true);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [completionLevel, setCompletionLevel] = useState("all");
  const [filteredSubProjects, setFilteredProjects] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tổng số dự án");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    "Đang hoạt động": 0,
    "Đang hoàn thiện hồ sơ đầu tư": 0,
    "Chậm tiến độ – đang hoàn thiện": 0,
    "Đang thực hiện": 0,
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const statuses = [
    { label: "Tổng số dự án", count: statusCounts.total },
    { label: "Đang hoạt động", count: statusCounts["Đang hoạt động"] },
    {
      label: "Đang hoàn thiện hồ sơ đầu tư",
      count: statusCounts["Đang hoàn thiện hồ sơ đầu tư"],
    },
    {
      label: "Chậm tiến độ – đang hoàn thiện",
      count: statusCounts["Chậm tiến độ – đang hoàn thiện"],
    },
    { label: "Đang thực hiện", count: statusCounts["Đang thực hiện"] },
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
      label: "Đang hoạt động",
      count: statusCounts["Đang hoạt động"],
      color: "text-red-600",
      box: "bg-blue-600",
    },
    {
      label: "Đang hoàn thiện hồ sơ đầu tư",
      count: statusCounts["Đang hoàn thiện hồ sơ đầu tư"],
      color: "text-red-600",
      box: "bg-green-600",
    },
    {
      label: "Chậm tiến độ – đang hoàn thiện",
      count: statusCounts["Chậm tiến độ – đang hoàn thiện"],
      color: "text-red-600",
      box: "bg-yellow-500",
    },
    {
      label: "Đang thực hiện",
      count: statusCounts["Đang thực hiện"],
      color: "text-red-600",
      box: "bg-purple-500",
    },
  ];

  const getStatusColor = (status) => {
    const foundStatus = statusesLabel.find((s) => s.label === status);
    return foundStatus ? foundStatus.box : "bg-gray-400";
  };

  const calculateStatusCounts = (subProjects) => {
    const counts = {
      total: subProjects.length,
      "Đang hoạt động": 0,
      "Đang hoàn thiện hồ sơ đầu tư": 0,
      "Chậm tiến độ – đang hoàn thiện": 0,
      "Đang thực hiện": 0,
    };

    subProjects.forEach((subProject) => {
      if (counts.hasOwnProperty(subProject.TrangThai)) {
        counts[subProject.TrangThai]++;
      }
    });

    return counts;
  };

  useEffect(() => {
    if (subProjects.length > 0) {
      const counts = calculateStatusCounts(subProjects);
      setStatusCounts(counts);
    }
  }, [subProjects]);

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
    let result = [...subProjects];
    if (fromDate || toDate) {
      result = result.filter((subProject) => {
        const subProjectStartDate = new Date(
          subProject.NgayKhoiCong || "1970-01-01"
        );
        const filterFromDate = fromDate
          ? new Date(fromDate)
          : new Date("1970-01-01");
        const filterToDate = toDate ? new Date(toDate) : new Date("9999-12-31");

        return (
          subProjectStartDate >= filterFromDate &&
          subProjectStartDate <= filterToDate
        );
      });
    }
    if (status !== "all") {
      result = result.filter((subProject) => subProject.TrangThai === status);
    }
    if (completionLevel !== "all") {
      const level = parseInt(completionLevel, 10);
      result = result.filter((subProject) => {
        const percentage = parseFloat(subProject.phanTramHoanThanh || "0");
        return percentage > level;
      });
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.TenDuAn && project.TenDuAn.toLowerCase().includes(term)
      );
    }

    setFilteredProjects(result);
  };
  const updateSearchSuggestions = (term) => {
    if (!term) {
      setSearchSuggestions([]);
      return;
    }

    const termLower = term.toLowerCase();
    const suggestions = subProjects
      .filter(
        (project) =>
          project.TenDuAn && project.TenDuAn.toLowerCase().includes(termLower)
      )
      .map((project) => project.TenDuAn)
      .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
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
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/duan/${projectId}`, {
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
        setSubProjects(subProjects.filter(project => project.DuAnID !== projectId));
        alert('Xóa dự án thành công');
      } else {
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa dự án:', error);
      alert('Có lỗi xảy ra khi xóa dự án');
    }
  };
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!DuAnID) {
        console.error("Project ID is missing");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/duAnThanhPhan/${DuAnID}`
        );
        setProject(response.data.data.duAnTong);
        setSubProjects(response.data.data.duAnThanhPhan);
        setFilteredProjects(response.data.data.duAnThanhPhan);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [DuAnID, navigate]);
  useEffect(() => {
    filterProjects();
  }, [fromDate, toDate, status, completionLevel, subProjects, searchTerm]);
  useEffect(() => {
    // Đọc danh sách ID từ URL query parameter
    const queryParams = new URLSearchParams(location.search);

    // Kiểm tra tham số DuAnConIDs (nhiều ID)
    const duAnConIdsString = queryParams.get("DuAnConIDs");
    if (duAnConIdsString) {
      const idList = duAnConIdsString.split(",").map((id) => Number(id));
      console.log("Danh sách DuAnConIDs từ URL:", idList);
      setSelectedDuAnConIds(idList);
    }
    // Kiểm tra tham số DuAnConID (một ID)
    else {
      const singleId = queryParams.get("DuAnConID");
      if (singleId) {
        console.log("Đọc DuAnConID từ URL:", singleId);
        setSelectedDuAnConId(Number(singleId));
      }
    }

    // Xóa query params sau khi đã lấy
  }, [location.search, DuAnID]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Trường hợp 1: Có danh sách ID dự án con cần hiển thị
        if (selectedDuAnConIds.length > 0) {
          console.log("Đang xử lý nhiều dự án con:", selectedDuAnConIds);

          // Tạo mảng các promises cho các request API
          const promises = selectedDuAnConIds.map((conId) =>
            axios.get(`http://localhost:5000/duAntp/${conId}`)
          );

          // Chạy tất cả các requests cùng lúc
          const results = await Promise.all(promises);

          // Xử lý kết quả và cập nhật state hiển thị
          const duAnConData = results.map((res, index) => ({
            ...res.data.data,
            DuAnID: selectedDuAnConIds[index],
          }));

          // Cập nhật subProjects để hiển thị trong bảng
          setSubProjects(duAnConData);
          setLoading(false);

          // Xóa IDs khỏi URL sau khi đã lấy dữ liệu
          // window.history.replaceState({}, '', `/side-project/${DuAnID}`);
          // setSelectedDuAnConIds([]);
        }
        // Trường hợp 2: Có một ID dự án con duy nhất
        else if (selectedDuAnConId) {
          console.log("Đang xử lý một dự án con:", selectedDuAnConId);

          const response = await axios.get(
            `http://localhost:5000/duAntp/${selectedDuAnConId}`
          );
          const duAnConData = [
            {
              ...response.data.data,
              DuAnID: selectedDuAnConId,
            },
          ];

          // Cập nhật subProjects để hiển thị trong bảng
          setSubProjects(duAnConData);
          setLoading(false);

          // Xóa ID khỏi URL sau khi đã lấy dữ liệu
          window.history.replaceState({}, "", `/side-project/${DuAnID}`);
          setSelectedDuAnConId(null);
        }
        // Trường hợp 3: Tải tất cả dự án con (trường hợp mặc định)
        else {
          console.log("Đang tải tất cả dự án con của dự án cha:", DuAnID);

          // Tải dữ liệu dự án cha và danh sách dự án con
          const response = await axios.get(
            `http://localhost:5000/duAnThanhPhan/${DuAnID}`
          );
          if (response.data.data) {
            setProject(response.data.data.duAnTong);
            setSubProjects(response.data.data.duAnThanhPhan);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dự án:", error);
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [DuAnID, selectedDuAnConIds, selectedDuAnConId]);

  const handleDetail = (subProjectId) => {
    const selectedSubProject = subProjects.find(
      (sp) => sp.DuAnID === subProjectId
    );
    if (!selectedSubProject || !project) {
      console.error("Không tìm thấy dữ liệu dự án");
      return;
    }
    navigate("/detail", {
      state: {
        projectId: DuAnID,
        projectName: project.TenDuAn,
        subProjectName: selectedSubProject.TenDuAn,
        subProjectId: selectedSubProject.DuAnID,
      },
    });
    setSelectedSubProjectId(selectedSubProject.DuAnID);
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
  const [pinnedProjects, setPinnedProjects] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinnedProjects");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handlePinProject = (subProjectId) => {
    setPinnedProjects((prev) => {
      const newPinned = prev.includes(subProjectId)
        ? prev.filter((id) => id !== subProjectId)
        : [subProjectId, ...prev];

      // Lưu vào localStorage
      localStorage.setItem("pinnedProjects", JSON.stringify(newPinned));
      return newPinned;
    });
  };
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("all");
    setCompletionLevel("all");
    setSearchTerm("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (!project) {
    return <div className="error">Không tìm thấy dự án</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <header className="bg-white px-6 py-1 shadow-sm flex justify-between items-center space-x-4">
        <button
          onClick={() => setShowAddProject(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
        >
          <FiPlus className="w-3 h-3" />
          <span>Tạo dự án mới</span>
        </button>

        <div>
          <button
            className="p-2 rounded hover:bg-gray-200"
            aria-label="Navigation menu"
          ></button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">Thông báo</span>
          <FaRegBell />
          <span>Rdsic</span>
          <div className="bg-gray-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center">
            R
          </div>
        </div>
      </header>

      <div className="px-6 pb-2 pt-2">
        <h2 className="text-l mt-6 md:mt-0 font-bold">
          Danh sách dự án thành phần
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1 border rounded w-full md:w-48"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chậm tiến độ">Chậm tiến độ</option>
              <option value="Đang triển khai">Đang triển khai</option>
              <option value="Đang tiến hành">Đang tiến hành</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Đã phê duyệt - chờ khởi công">
                Đã phê duyệt-chờ khởi công
              </option>
              <option value="Đã phê duyệt - chậm tiến độ">
                Đã phê duyệt-chậm tiến độ
              </option>
              <option value="Dự kiến khởi công">Dự kiến khởi công</option>
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
          <div className="text-gray-500">Cập nhật lần cuối: 15:10</div>

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
                    className={`inline-block w-3 h-3 rounded-sm ${statusesLabel.find((s) => s.label === selectedStatus)
                        ?.box || "bg-gray-200"
                      }`}
                  ></span>
                  {selectedStatus || "Tổng số dự án"}{" "}
                  {statusesLabel.find((s) => s.label === selectedStatus)
                    ?.count !== null &&
                    `(${statusesLabel.find((s) => s.label === selectedStatus)
                      ?.count
                    })`}
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
                    {filteredSubProjects.length > 0 ? (
                      [...filteredSubProjects]
                        .sort((a, b) => {
                          const aIsPinned = pinnedProjects.includes(a.DuAnID);
                          const bIsPinned = pinnedProjects.includes(b.DuAnID);
                          if (aIsPinned && !bIsPinned) return -1;
                          if (!aIsPinned && bIsPinned) return 1;
                          return 0;
                        })
                        .map((subProject, index) => (
                          <tr key={subProject.DuAnID} className="text-center">
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
                                  handleDeleteProject(subProject.DuAnID);
                                }}
                              >
                                <img
                                  src={trash}
                                  alt="Xoá"
                                  className="w-5 h-5"
                                />
                              </button>
                              <button
                                className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${pinnedProjects.includes(subProject.DuAnID)
                                    ? "bg-yellow-100"
                                    : ""
                                  }`}
                                title="Ghim"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinProject(subProject.DuAnID);
                                }}
                              >
                                <img src={pin} alt="Ghim" className="w-5 h-5" />
                              </button>
                            </td>
                            <td className="border px-1 py-2 text-blue-600 font-medium">
                              <div>{subProject.DuAnID}</div>
                              <div
                                className="text-blue-400 text-xs cursor-pointer hover:underline"
                                onClick={() => handleDetail(subProject.DuAnID)}
                              >
                                Xem chi tiết
                              </div>
                            </td>
                            <td className="border px-1 py-2">
                              {subProject.TenDuAn}
                            </td>
                            <td className="border px-1 py-2">
                              {subProject.TongChieuDai} Km
                            </td>

                            <td className="border px-1 py-2">
                              <span
                                className={`px-2 py-[2px] text-white text-xs rounded-full ${getStatusColor(
                                  subProject.TrangThai
                                )}`}
                              >
                                {subProject.TrangThai}
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
                                      {subProject.phanTramKeHoach || "0"}%
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
                                      {subProject.phanTramHoanThanh || "0"}%
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
                                      {subProject.phanTramChamTienDo || "0"}%
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-4 text-center text-sm text-gray-500">
                          <div className="text-center text-gray-500 py-4">
                            Không tìm thấy dự án nào phù hợp
                            <div className="mt-2 text-sm text-gray-500">
                              <p>Dự án này hiện chưa có dự án thành phần nào.</p>
                              <p className="mt-1">Bạn có thể thêm gói thầu trực tiếp vào dự án này.</p>
                            </div>
                            <div className="mt-6">
                              <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => setShowAddPackage(true)}
                              >
                                <svg
                                  className="-ml-1 mr-2 h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Thêm mới gói thầu
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredSubProjects.length > 0 ? (
                [...filteredSubProjects]
                  .sort((a, b) => {
                    const aIsPinned = pinnedProjects.includes(a.DuAnID);
                    const bIsPinned = pinnedProjects.includes(b.DuAnID);
                    if (aIsPinned && !bIsPinned) return -1;
                    if (!aIsPinned && bIsPinned) return 1;
                    return 0;
                  })
                  .map((subProject, index) => (
                    <div
                      key={subProject.DuAnID}
                      className="bg-white rounded-lg shadow p-4 border border-gray-200"
                      onClick={(e) => {
                        // Chỉ chuyển trang nếu không click vào checkbox
                        if (!e.target.closest('input[type="checkbox"]')) {
                          handleDetail(
                            subProject.DuAnID,
                            subProject.TenDuAn,
                            subProject.soLuongGoiThau
                          );
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
                            <div>{subProject.DuAnID}</div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
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
                                  handleDeleteProject(subProject.DuAnID);
                                }}
                              >
                                <img
                                  src={trash}
                                  alt="Xoá"
                                  className="w-5 h-5"
                                />
                              </button>
                          <button
                            className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${pinnedProjects.includes(project.DuAnID)
                                ? "bg-yellow-100"
                                : ""
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinProject(subProject.DuAnID);
                            }}
                          >
                            <img src={pin} alt="Ghim" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-600 font-medium">
                          Tên dự án:
                        </div>
                        <div>{subProject.TenDuAn}</div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-600 font-medium">
                          Dài tuyến:
                        </div>
                        <div>{subProject.TongChieuDai}</div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-600 font-medium">
                          Trạng thái:
                        </div>
                        <span
                          className={`px-2 py-[2px] text-white text-xs rounded-full ${getStatusColor(
                            subProject.TrangThai
                          )}`}
                        >
                          {subProject.TrangThai}
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
                          <span className="text-xs text-blue-600 font-bold">
                            Kế hoạch:{" "}
                            <strong>
                              {subProject.phanTramKeHoach || "0"}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={actualIcon}
                            width="16"
                            height="16"
                            alt="Hoàn thành"
                          />
                          <span className="text-xs text-green-600 font-bold">
                            Hoàn thành:{" "}
                            <strong>
                              {subProject.phanTramHoanThanh || "0"}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={delayIcon}
                            width="16"
                            height="16"
                            alt="Chậm tiến độ"
                          />
                          <span className="text-xs text-yellow-600 font-bold">
                            Chậm tiến độ:{" "}
                            <strong>
                              {subProject.phanTramChamTienDo || "0"}%
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Không tìm thấy dự án nào phù hợp
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Dự án này hiện chưa có dự án thành phần nào.</p>
                    <p className="mt-1">Bạn có thể thêm gói thầu trực tiếp vào dự án này.</p>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowAddPackage(true)}
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Thêm mới gói thầu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup thêm mới */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AddNewSubProject
            DuAnID={project.DuAnID}
            onClose={() => setShowAddProject(false)}
            onSuccess={(newProject) => {
              // Xử lý khi thêm thành công
            }}
          />
        </div>
      )}
      {showAddPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Lớp phủ mờ */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowAddPackage(false)}
            ></div>

            {/* Container pop-up - đã điều chỉnh max-width và width */}
            <div className="relative w-full max-w-6xl z-10"> {/* Tăng từ max-w-4xl lên max-w-6xl */}
              <AddNewPackage
                projectId={DuAnID}
                onClose={() => setShowAddPackage(false)}
                onSuccess={(newPackage) => {

                }}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideProject;
