
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaRegBell, FaFilter } from "react-icons/fa";
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

  useClickOutside(menuRef, () => {
    setShowMenu(false);
  });

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
      count: statusCounts.total,
      color: "text-red-600",
      box: "bg-red-600",
    },
    {
      label: "Đang chuẩn bị",
      count: statusCounts["Đang chuẩn bị"],
      color: "text-red-600",
      box: "bg-blue-600",
    },
    {
      label: "Đang thi công",
      count: statusCounts["Đang thi công"],
      color: "text-red-600",
      box: "bg-green-600",
    },
    {
      label: "Hoàn thành",
      count: statusCounts["Hoàn thành"],
      color: "text-red-600",
      box: "bg-yellow-500",
    },
    {
      label: "Tạm dừng",
      count: statusCounts["Tạm dừng"],
      color: "text-red-600",
      box: "bg-purple-500",
    }
  ];

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 pt-12 md:pt-0 text-base">
      <header className="bg-white px-6 py-1 shadow-sm flex justify-end items-center space-x-4 pt-3 md:pt-0 mb-3 md:mb-0">
        <div className="flex items-center space-x-4 pt-0 md:pt-1">
          <span className="text-gray-500">Thông báo</span>
          <FaRegBell />
          <span></span>
          <div className="inline-block" ref={menuRef}>
              <button className="bg-red-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center"
                onClick={() => setShowMenu(!showMenu)}
              >
                R
              </button>
              {showMenu && (
            <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-10">
              <button
                className="block w-full text-left px-4 py-2  text-red-600 hover:bg-gray-100"
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

      {/* Mobile Filter Button - chỉ hiển thị trên mobile */}
      <div className="md:hidden flex justify-between items-center px-4 mb-2">
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        >
          <FaFilter className="text-gray-600" />
          <span>Bộ lọc</span>
        </button>
        
        <button 
          onClick={handleExportReport}
          className="bg-green-700 text-white px-4 py-1 rounded font-bold"
        >
          XUẤT BÁO CÁO
        </button>
      </div>

      {/* Mobile Filter Panel - chỉ hiển thị trên mobile */}
      {showMobileFilters && (
        <div className="md:hidden grid grid-cols-1 gap-4 mb-4 p-4 border rounded-lg bg-gray-50 mx-4">
          {/* Các phần tử filter giống như bản desktop nhưng responsive cho mobile */}
          <div>
            <div>
              <input
                type="text"
                placeholder="Tìm dự án"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-3 pr-10 py-1 border rounded w-full"
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
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
          </div>

          <div>
            <div className="inline-flex items-center border border-gray-300 rounded px-3 py-0.5 text-gray-700 bg-white w-full">
              <FaRegCalendarAlt className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent w-[120px]"
              />
              <span className="mx-1">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent w-[120px]"
              />
            </div>
          </div>


          <div>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="px-3 py-1 border rounded w-full"
            >
              <option value="">Tất cả tỉnh</option>
              {mergedProvinces.map((province, index) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1 border rounded w-full"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang chuẩn bị">Đang chuẩn bị</option>
              <option value="Đang thi công">Đang thi công</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Tạm dừng">Tạm dừng</option>
            </select>
          </div>

          {/* Contractor */}
          <div>
            <select
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              className="px-3 py-1 border rounded w-full"
            >
              <option value="all">Tất cả nhà thầu</option>
              {contractorList.map((nhathau) => (
                <option key={nhathau.NhaThauID} value={nhathau.NhaThauID}>
                  {nhathau.TenNhaThau}
                </option>
              ))}
            </select>
          </div>

          {/* Completion Level */}
          <div>
            <select
              value={completionLevel}
              onChange={(e) => setCompletionLevel(e.target.value)}
              className="px-3 py-1 border rounded w-full"
            >
              <option value="all">Mọi tiến độ</option>
              <option value="20">&gt;20%</option>
              <option value="50">&gt;50%</option>
              <option value="80">&gt;80%</option>
              <option value="100">100%</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                resetFilters();
                setShowMobileFilters(false);
              }}
              className="h-9 px-3 bg-gray-100 hover:bg-gray-200 rounded font-medium"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      )}

      <div className="px-6 pb-2 pt-2">
        <h2 className="font-bold">
          Danh sách dự án đường bộ
        </h2>
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0">
        <div className={`bg-white rounded-lg p-4 flex flex-col flex-1 ${showFilters ? 'min-h-screen' : 'min-h-0'}`}>
          <div className="hidden md:flex flex-col md:flex-row items-center gap-2">
            <div className=" w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm dự án"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-3 pr-10 py-1 border rounded w-full "
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto ">
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
            <div className="inline-flex items-center border border-gray-300 rounded px-3 py-0.5  text-gray-700 bg-white w-full md:w-auto">
              <FaRegCalendarAlt className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent  w-[120px]"
              />
              <span className="mx-1">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="appearance-none outline-none border-none bg-transparent  w-[120px]"
              />
            </div>
            <select
  value={selectedProvince}
  onChange={handleProvinceChange}
  className="px-3 py-1 border rounded w-full md:w-48"
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
              className="px-3 py-1 border rounded w-full md:w-48"
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
              className="h-9 px-3 bg-gray-100 hover:bg-gray-200 rounded  font-medium md:col-start-4"
            >
              Xóa lọc
            </button>
          </div>
          <div className="hidden md:flex gap-2 mb-2 mt-3">
            <button className="bg-green-700 text-white pl-10 pr-10 px-4 py-1 rounded font-bold ">
              XUẤT BÁO CÁO
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
                  <div className=" font-bold">{status.label}</div>
                  <div className=" text-gray-500">{status.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[3px] bg-red-600 w-full mb-2 mt-4"></div>

          <div className="p-2 font-sans">
            {/* Status Bar - hidden on mobile */}
            <div className="hidden md:flex flex-wrap items-center gap-3 border-b pb-2 mb-3">
              {statusesLabel.map((s) => {
                const isActive = selectedStatus === s.label;
                return (
                  <div
                    key={s.label}
                    onClick={() => handleStatusClick(s.label)}
                    className={`cursor-pointer px-2 py-1  font-semibold border-b-[3px] transition-colors duration-150 ${isActive
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
            <div className="md:hidden mb-3" ref={triggerRef}>
              <div
                className="w-full p-2 border rounded-md  flex items-center justify-between cursor-pointer bg-white"
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
                <div className="z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
                  style={{
                    top: `calc(${triggerRef.current?.getBoundingClientRect().bottom}px + 8px)`
                  }}
                >
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
                <table className="min-w-full border border-gray-300 ">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                    <tr className="text-center">
                      <th className="border px-2 py-1 w-6 ">CHỌN</th>
                      <th className="border px-2 py-1 ">THAO TÁC</th>
                      <th className="border px-2 py-1 ">MÃ DỰ ÁN</th>
                      <th className="border px-2 py-1 ">TÊN DỰ ÁN</th>
                      <th className="border px-2 py-1 ">DÀI TUYẾN</th>
                      <th className="border px-2 py-1 ">TRẠNG THÁI</th>
                      <th className="border px-2 py-1 ">TIẾN ĐỘ</th>
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

                              <button
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                title="Sửa thông tin"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(project.DuAnID, project.ParentID);
                                }}
                              >
                                <img src={edit} alt="Ghim" className="w-5 h-5" />
                              </button>


                            </td>
                            <td className="border px-1 py-2 text-blue-600 font-medium">
                              <div>{project.DuAnID}</div>
                              <div
                                className="text-blue-400  cursor-pointer hover:underline"
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
                                className={`px-2 py-[2px] text-white  rounded-full ${getStatusColor(
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
                                  <span className=" text-blue-600 font-bold">
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
                                  <span className=" text-green-600 font-bold">
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
                                  <span className=" text-yellow-600 font-bold">
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
                          <button
                                className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                title="Sửa thông tin"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(project.DuAnID, project.ParentID);
                                }}
                              >
                                <img src={edit} alt="Ghim" className="w-5 h-5" />
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
                          className={`px-2 py-[2px] text-white  rounded-full ${getStatusColor(
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
                          <span className="">
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
                          <span className="">
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
                          <span className="">
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