import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AddNewPlan from '../AddNewPlan/AddNewPlan';
import AddNewCategories from '../AddNewCategories/AddNewCategories';
import UpdateProgress from '../UpdateProgress/UpdateProgress';
import IssueList from '../IssueList/IssueList';
import axios from 'axios';
import downIcon from '../../assets/img/down.png';
import { FiPlus, FiChevronLeft, FiCalendar, FiSearch, FiFilter } from 'react-icons/fi';

// Thêm style cho responsive
const responsiveStyles = {
  smallScreen: {
    transform: 'scale(0.9)',
    transformOrigin: 'top left',
    width: '111%', // 100% / 0.9 ≈ 111%
  },
  xsScreen: {
    transform: 'scale(0.85)',
    transformOrigin: 'top left',
    width: '117.5%', // 100% / 0.85 ≈ 117.5%
  },
  xxsScreen: {
    transform: 'scale(0.8)',
    transformOrigin: 'top left',
    width: '125%', // 100% / 0.8 = 125%
  }
};

// Thêm state và logic cho tìm kiếm và gợi ý
const SubProjectTable = ({ duAnThanhPhanId, packageId, onClose }) => {
  const [expandedItems, setExpandedItems] = useState({
    packages: {},
    categories: {},
    items: {}
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [progressPopup, setProgressPopup] = useState({
    visible: false,
    plan: null,
    progressData: []
  });

  // Thêm state cho tìm kiếm và gợi ý
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchMode, setSearchMode] = useState(null); // Lưu trạng thái tìm kiếm đặc biệt
  const [activeSearchInput, setActiveSearchInput] = useState(null); // 'desktop' hoặc 'mobile'
  const searchRef = useRef(null);
  const searchRefMobile = useRef(null);

  // Thêm state cho lọc ngày tháng
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState(null);

  // Thêm hàm xử lý khi thay đổi ngày
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Hàm lọc dữ liệu theo từ khóa tìm kiếm và phạm vi ngày
  const filterData = useCallback(() => {
    if (!data) return;

    // Copy cấu trúc data
    const filteredResult = {
      duAnThanhPhan: data.duAnThanhPhan ? { ...data.duAnThanhPhan, danhSachGoiThau: [] } : null,
      duAnTong: data.duAnTong ? {
        ...data.duAnTong,
        danhSachGoiThauTrucTiep: [],
        danhSachDuAnCon: data.duAnTong.danhSachDuAnCon ?
          data.duAnTong.danhSachDuAnCon.map(duAnCon => ({ ...duAnCon, danhSachGoiThau: [] })) : []
      } : null
    };

    // Function để kiểm tra từ khóa tìm kiếm
    const matchesSearchTerm = (text) => {
      if (!searchTerm || searchTerm.trim() === '') return true;

      const normalizeText = (text) => {
        return text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      };

      return normalizeText(text).includes(normalizeText(searchTerm));
    };

    // Function để kiểm tra phạm vi ngày
    const isWithinDateRange = (startDateStr, endDateStr) => {
      if (!startDate && !endDate) return true;

      const targetStartDate = new Date(startDateStr);
      const targetEndDate = new Date(endDateStr);

      const filterStartDate = startDate ? new Date(startDate) : null;
      const filterEndDate = endDate ? new Date(endDate) : null;

      if (filterStartDate && filterEndDate) {
        // Cả 2 ngày đều được chọn
        // Kiểm tra xem có sự trùng lặp giữa hai khoảng thời gian không
        return (
          (targetStartDate <= filterEndDate && targetEndDate >= filterStartDate)
        );
      } else if (filterStartDate) {
        // Chỉ có ngày bắt đầu
        return targetEndDate >= filterStartDate;
      } else if (filterEndDate) {
        // Chỉ có ngày kết thúc
        return targetStartDate <= filterEndDate;
      }

      return true;
    };

    // Lọc gói thầu
    const allPackages = [].concat(
      data.duAnThanhPhan?.danhSachGoiThau || [],
      data.duAnTong?.danhSachGoiThauTrucTiep || [],
      data.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    );

    // Lọc và tổ chức dữ liệu
    allPackages.forEach(pkg => {
      // Kiểm tra nếu gói thầu phù hợp với tìm kiếm hoặc phạm vi ngày
      const packageMatches = matchesSearchTerm(pkg.tenGoiThau) ||
        isWithinDateRange(pkg.ngayKhoiCong, pkg.ngayHoanThanh);

      // Lọc các hạng mục và kế hoạch phù hợp
      const filteredItems = [];

      pkg.danhSachHangMuc?.forEach(item => {
        // Kiểm tra hạng mục
        const itemMatches = matchesSearchTerm(item.tenHangMuc);

        // Lọc kế hoạch
        const filteredPlans = [];

        item.danhSachKeHoach?.forEach(plan => {
          // Kiểm tra kế hoạch
          const planMatches = matchesSearchTerm(plan.tenCongTac) ||
            isWithinDateRange(plan.ngayBatDau, plan.ngayKetThuc);

          // Nếu kế hoạch phù hợp, thêm vào
          if (planMatches) {
            filteredPlans.push(plan);
          }
        });

        // Nếu có kế hoạch phù hợp hoặc hạng mục phù hợp, thêm hạng mục này vào
        if (filteredPlans.length > 0 || itemMatches) {
          filteredItems.push({
            ...item,
            danhSachKeHoach: filteredPlans
          });
        }
      });

      // Nếu gói thầu phù hợp hoặc có hạng mục/kế hoạch phù hợp, thêm vào kết quả
      if (packageMatches || filteredItems.length > 0) {
        const filteredPackage = {
          ...pkg,
          danhSachHangMuc: filteredItems
        };

        // Thêm vào đúng vị trí
        if (data.duAnThanhPhan?.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId)) {
          filteredResult.duAnThanhPhan.danhSachGoiThau.push(filteredPackage);
        } else if (data.duAnTong?.danhSachGoiThauTrucTiep?.some(p => p.goiThauId === pkg.goiThauId)) {
          filteredResult.duAnTong.danhSachGoiThauTrucTiep.push(filteredPackage);
        } else {
          // Tìm dự án con phù hợp
          const duAnConIndex = data.duAnTong?.danhSachDuAnCon?.findIndex(duAnCon =>
            duAnCon.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId)
          );

          if (duAnConIndex !== -1 && duAnConIndex !== undefined) {
            filteredResult.duAnTong.danhSachDuAnCon[duAnConIndex].danhSachGoiThau.push(filteredPackage);
          }
        }
      }
    });

    setFilteredData(filteredResult);
  }, [data, searchTerm, startDate, endDate]);

  // Cập nhật lọc khi thay đổi từ khóa tìm kiếm hoặc phạm vi ngày
  useEffect(() => {
    if (data) {
      filterData();
    }
  }, [filterData, data]);

  // Hàm áp dụng bộ lọc khi nhấn nút Lọc
  const applyFilters = () => {
    filterData();
  };

  // Hàm reset bộ lọc
  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSearchMode(null); // Reset trạng thái tìm kiếm đặc biệt
  };

  // Sử dụng dữ liệu đã lọc hoặc dữ liệu gốc nếu không có lọc
  const displayData = useMemo(() => {
    // Nếu đang ở chế độ searchMode đặc biệt (chọn suggestion)
    if (searchMode && data) {
      // Tìm kiếm theo loại
      if (searchMode.type === 'goiThau') {
        // Tìm gói thầu
        const allPackages = [].concat(
          data.duAnThanhPhan?.danhSachGoiThau || [],
          data.duAnTong?.danhSachGoiThauTrucTiep || [],
          data.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
        );
        const pkg = allPackages.find(p => p.goiThauId === searchMode.objectId);
        if (!pkg) return null;
        // Xác định vị trí gói thầu
        let duAnThanhPhan = null, duAnTong = null;
        if (data.duAnThanhPhan?.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId)) {
          duAnThanhPhan = { ...data.duAnThanhPhan, danhSachGoiThau: [pkg] };
        } else if (data.duAnTong?.danhSachGoiThauTrucTiep?.some(p => p.goiThauId === pkg.goiThauId)) {
          duAnTong = { ...data.duAnTong, danhSachGoiThauTrucTiep: [pkg], danhSachDuAnCon: [] };
        } else {
          // Tìm dự án con
          const duAnCon = data.duAnTong?.danhSachDuAnCon?.find(duAnCon => duAnCon.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId));
          if (duAnCon) {
            duAnTong = { ...data.duAnTong, danhSachGoiThauTrucTiep: [], danhSachDuAnCon: [{ ...duAnCon, danhSachGoiThau: [pkg] }] };
          }
        }
        return { duAnThanhPhan, duAnTong };
      }
      if (searchMode.type === 'hangMuc') {
        // Tìm gói thầu chứa hạng mục
        const allPackages = [].concat(
          data.duAnThanhPhan?.danhSachGoiThau || [],
          data.duAnTong?.danhSachGoiThauTrucTiep || [],
          data.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
        );
        const pkg = allPackages.find(p => p.goiThauId === searchMode.parentId);
        if (!pkg) return null;
        const item = pkg.danhSachHangMuc?.find(i => i.hangMucId === searchMode.objectId);
        if (!item) return null;
        const pkgClone = { ...pkg, danhSachHangMuc: [item] };
        // Xác định vị trí gói thầu
        let duAnThanhPhan = null, duAnTong = null;
        if (data.duAnThanhPhan?.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId)) {
          duAnThanhPhan = { ...data.duAnThanhPhan, danhSachGoiThau: [pkgClone] };
        } else if (data.duAnTong?.danhSachGoiThauTrucTiep?.some(p => p.goiThauId === pkg.goiThauId)) {
          duAnTong = { ...data.duAnTong, danhSachGoiThauTrucTiep: [pkgClone], danhSachDuAnCon: [] };
        } else {
          const duAnCon = data.duAnTong?.danhSachDuAnCon?.find(duAnCon => duAnCon.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId));
          if (duAnCon) {
            duAnTong = { ...data.duAnTong, danhSachGoiThauTrucTiep: [], danhSachDuAnCon: [{ ...duAnCon, danhSachGoiThau: [pkgClone] }] };
          }
        }
        return { duAnThanhPhan, duAnTong };
      }
      if (searchMode.type === 'keHoach') {
        // Tìm gói thầu, hạng mục, kế hoạch
        const allPackages = [].concat(
          data.duAnThanhPhan?.danhSachGoiThau || [],
          data.duAnTong?.danhSachGoiThauTrucTiep || [],
          data.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
        );
        const pkg = allPackages.find(p => p.goiThauId === searchMode.grandParentId);
        if (!pkg) return null;
        const item = pkg.danhSachHangMuc?.find(i => i.hangMucId === searchMode.parentId);
        if (!item) return null;
        const plan = item.danhSachKeHoach?.find(kh => kh.keHoachId === searchMode.objectId);
        if (!plan) return null;
        const itemClone = { ...item, danhSachKeHoach: [plan] };
        const pkgClone = { ...pkg, danhSachHangMuc: [itemClone] };
        // Xác định vị trí gói thầu
        let duAnThanhPhan = null, duAnTong = null;
        if (data.duAnThanhPhan?.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId)) {
          duAnThanhPhan = { ...data.duAnThanhPhan, danhSachGoiThau: [pkgClone] };
        } else if (data.duAnTong?.danhSachGoiThauTrucTiep?.some(p => p.goiThauId === pkg.goiThauId)) {
          duAnTong = { ...data.duAnTong, danhSachGoiThauTrucTiep: [pkgClone], danhSachDuAnCon: [] };
        } else {
          const duAnCon = data.duAnTong?.danhSachDuAnCon?.find(duAnCon => duAnCon.danhSachGoiThau?.some(p => p.goiThauId === pkg.goiThauId));
          if (duAnCon) {
            duAnTong = { ...data.duAnTong, danhSachGoiThauTrucTiep: [], danhSachDuAnCon: [{ ...duAnCon, danhSachGoiThau: [pkgClone] }] };
          }
        }
        return { duAnThanhPhan, duAnTong };
      }
    }
    // Nếu không có searchMode, dùng logic cũ
    if (!searchTerm && !startDate && !endDate) {
      return data;  // Không có điều kiện lọc, hiển thị tất cả
    }
    return filteredData;
  }, [data, filteredData, searchTerm, startDate, endDate, searchMode]);

  // Hook để đóng gợi ý khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if ((searchRef.current && !searchRef.current.contains(event.target)) &&
          (searchRefMobile.current && !searchRefMobile.current.contains(event.target))) {
        setShowSuggestions(false);
        setActiveSearchInput(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef, searchRefMobile]);

  // Generate search suggestions
  const generateSuggestions = useCallback((term) => {
    if (!data || !term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    const results = [];

    // Function to normalize text for search (remove accents and lowercase)
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const normalizedTerm = normalizeText(term);

    // Search in packages
    const packages = [].concat(
      data?.duAnThanhPhan?.danhSachGoiThau || [],
      data?.duAnTong?.danhSachGoiThauTrucTiep || [],
      data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    );

    // Search in gói thầu
    packages.forEach(pkg => {
      if (normalizeText(pkg.tenGoiThau).includes(normalizedTerm)) {
        results.push({
          id: `GT-${pkg.goiThauId}`,
          text: pkg.tenGoiThau,
          type: 'goiThau',
          objectId: pkg.goiThauId
        });
      }

      // Search in hạng mục
      pkg.danhSachHangMuc?.forEach(item => {
        if (normalizeText(item.tenHangMuc).includes(normalizedTerm)) {
          results.push({
            id: `HM-${item.hangMucId}`,
            text: item.tenHangMuc,
            type: 'hangMuc',
            objectId: item.hangMucId,
            parentId: pkg.goiThauId
          });
        }

        // Search in kế hoạch
        item.danhSachKeHoach?.forEach(plan => {
          if (normalizeText(plan.tenCongTac).includes(normalizedTerm)) {
            results.push({
              id: `KH-${plan.keHoachId}`,
              text: plan.tenCongTac,
              type: 'keHoach',
              objectId: plan.keHoachId,
              parentId: item.hangMucId,
              grandParentId: pkg.goiThauId
            });
          }
        });
      });
    });

    setSuggestions(results.slice(0, 10)); // Limit to 10 results
  }, [data]);

  // Thêm hàm xử lý khi nhập tìm kiếm
  const handleSearchChange = (e, inputType = 'desktop') => {
    const term = e.target.value;
    setSearchTerm(term);
    setActiveSearchInput(inputType);

    if (term.length >= 2) {
      generateSuggestions(term);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Hàm để xử lý khi chọn một gợi ý
  const handleSuggestionClick = (suggestion) => {
    console.log('handleSuggestionClick called with:', suggestion);
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSearchMode(suggestion); // Lưu trạng thái tìm kiếm đặc biệt
    // Expand related items
    if (suggestion.type === 'goiThau') {
      setExpandedItems(prev => ({
        ...prev,
        packages: {
          ...prev.packages,
          [suggestion.objectId]: true
        }
      }));
    } else if (suggestion.type === 'hangMuc') {
      setExpandedItems(prev => ({
        ...prev,
        packages: {
          ...prev.packages,
          [suggestion.parentId]: true
        },
        items: {
          ...prev.items,
          [suggestion.objectId]: true
        }
      }));
    } else if (suggestion.type === 'keHoach') {
      setExpandedItems(prev => ({
        ...prev,
        packages: {
          ...prev.packages,
          [suggestion.grandParentId]: true
        },
        items: {
          ...prev.items,
          [suggestion.parentId]: true
        }
      }));
    }
    // Không cần scroll tự động
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/hangMuc/${duAnThanhPhanId}/detail`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
      console.log('Data fetched:', result.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [duAnThanhPhanId]); // Phụ thuộc vào duAnThanhPhanId

  // Sử dụng trong useEffect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm để mở chỉ đến level gói thầu khi lần đầu tải dữ liệu
  const expandPackagesOnly = useCallback(() => {
    if (!data) return;

    const newExpandedItems = {
      packages: {},
      categories: {},
      items: {}
    };

    // Chỉ mở các gói thầu (packages), không mở các hạng mục (items)
    [].concat(
      data?.duAnThanhPhan?.danhSachGoiThau || [],
      data?.duAnTong?.danhSachGoiThauTrucTiep || [],
      data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    ).forEach(pkg => {
      newExpandedItems.packages[pkg.goiThauId] = true;
      // Không mở các hạng mục (items) - để chúng ở trạng thái đóng
    });

    setExpandedItems(newExpandedItems);
  }, [data]);

  // Gọi hàm mở chỉ đến level gói thầu khi dữ liệu được tải xong
  useEffect(() => {
    if (data && !loading) {
      expandPackagesOnly();
    }
  }, [data, loading, expandPackagesOnly]);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const navigate = useNavigate();
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showIssuePopup, setShowIssuePopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleOpenIssuePopup = (plan, projectId) => {
    setSelectedPlan(plan);
    setSelectedProjectId(projectId);
    setShowIssuePopup(true);
  };

  // Hàm đóng popup
  const handleCloseIssuePopup = () => {
    setShowIssuePopup(false);
    setSelectedPlan(null);
    setSelectedProjectId(null);
  };

  // Hàm mở popup cập nhật tiến độ
  const handleOpenProgressPopup = (plan) => {
    setSelectedPlan(plan);
    setShowProgressPopup(true);
  };

  // Hàm đóng popup
  const handleCloseProgressPopup = () => {
    setShowProgressPopup(false);
    setSelectedPlan(null);
  };
  // Thêm state để theo dõi chế độ xem (năm/tháng)
  const [viewMode, setViewMode] = useState('month'); // 'month' hoặc 'year'
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  const handleAddCategoryClick = (goiThauId) => {
    setSelectedPackageId(goiThauId);
    setShowAddCategoryModal(true);
  };

  const handleCategoryAdded = (newCategory) => {
    setShowAddCategoryModal(false);
  };
  const handleAddPlanClick = (hangMucId) => {
    setSelectedCategoryId(hangMucId);
    setShowAddPlanModal(true);
  };

  const handlePlanAdded = (newPlan) => {
    setShowAddPlanModal(false);
  };
  // Thêm refs để đồng bộ cuộn
  const leftTableRef = useRef(null);
  const rightTableRef = useRef(null);
  const containerRef = useRef(null);


  // Theo dõi kích thước màn hình
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Thêm state để kiểm soát việc cuộn ngang Gantt chart
  const [scrollPosition, setScrollPosition] = useState(0);
  const ganttScrollContainerRef = useRef(null);

  // Hàm xử lý cuộn sang trái
  const handleScrollLeft = () => {
    if (ganttScrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - 300);
      ganttScrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Hàm xử lý cuộn sang phải
  const handleScrollRight = () => {
    if (ganttScrollContainerRef.current) {
      const newPosition = scrollPosition + 300;
      ganttScrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Hàm cập nhật vị trí cuộn khi người dùng cuộn
  const handleScroll = () => {
    if (ganttScrollContainerRef.current) {
      setScrollPosition(ganttScrollContainerRef.current.scrollLeft);
    }
  };

  // Xác định kiểu màn hình
  const getScreenType = () => {
    if (windowSize.width < 480) return 'xxs';
    if (windowSize.width < 640) return 'xs';
    if (windowSize.width < 1024) return 'sm';
    return 'md';
  };

  // Lấy style theo kích thước màn hình
  const getResponsiveStyle = () => {
    const screenType = getScreenType();
    if (screenType === 'xxs') return responsiveStyles.xxsScreen;
    if (screenType === 'xs') return responsiveStyles.xsScreen;
    if (screenType === 'sm') return responsiveStyles.smallScreen;
    return {};
  };

  // Đồng bộ cuộn dọc giữa hai bảng
  useEffect(() => {
    const leftTable = leftTableRef.current;
    const rightTable = rightTableRef.current;

    if (leftTable && rightTable) {
      const handleLeftScroll = () => {
        rightTable.scrollTop = leftTable.scrollTop;
      };

      const handleRightScroll = () => {
        leftTable.scrollTop = rightTable.scrollTop;
      };

      leftTable.addEventListener('scroll', handleLeftScroll);
      rightTable.addEventListener('scroll', handleRightScroll);

      return () => {
        leftTable.removeEventListener('scroll', handleLeftScroll);
        rightTable.removeEventListener('scroll', handleRightScroll);
      };
    }
  }, []);

  // Thêm effect mới để đồng bộ chiều cao giữa hai bảng
  useEffect(() => {
    const syncTableHeights = () => {
      const leftTable = leftTableRef.current;
      const rightTable = rightTableRef.current;

      if (leftTable && rightTable) {
        try {
          // Lấy tất cả các hàng từ bảng bên trái
          const leftRows = leftTable.querySelectorAll('tbody tr');
          const rightRows = rightTable.querySelectorAll('.gantt-row');

          // Xử lý từng cặp hàng dựa trên data-row-id
          leftRows.forEach((leftRow) => {
            const rowId = leftRow.getAttribute('data-row-id');
            if (!rowId) return;

            const rightRow = rightTable.querySelector(`.gantt-row[data-row-id="${rowId}"]`);
            if (rightRow) {
              const height = leftRow.offsetHeight;
              // Đảm bảo chiều cao tối thiểu 30px
              rightRow.style.height = `${Math.max(height, 30)}px`;
              rightRow.style.minHeight = `${Math.max(height, 30)}px`;
            }
          });

          // Đảm bảo tổng chiều cao của container phải bằng nhau
          const leftTbody = leftTable.querySelector('tbody');
          const rightContent = rightTable;

          if (leftTbody && rightContent) {
            const leftHeight = leftTbody.offsetHeight;
            rightContent.style.minHeight = `${leftHeight}px`;
          }
        } catch (error) {
          console.error("Error syncing table heights:", error);
        }
      }
    };

    // Đồng bộ ngay sau khi render và sau khi có thay đổi
    setTimeout(syncTableHeights, 300);
    // Đồng bộ lại lần nữa sau 500ms để đảm bảo tất cả DOM đã được cập nhật đầy đủ
    setTimeout(syncTableHeights, 800);

    // Đồng bộ lại chiều cao khi dữ liệu thay đổi
    if (data) {
      syncTableHeights();
    }

    // Thêm MutationObserver để theo dõi thay đổi DOM và cập nhật chiều cao
    const observer = new MutationObserver(() => {
      setTimeout(syncTableHeights, 100);
    });

    if (leftTableRef.current) {
      observer.observe(leftTableRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // Thêm listener cho sự kiện resize cửa sổ
    window.addEventListener('resize', syncTableHeights);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncTableHeights);
    };
  }, [data, expandedItems]); // Phụ thuộc vào data và expandedItems vì chúng ảnh hưởng đến chiều cao
  const fetchProgressData = async (keHoachId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tien-do/${keHoachId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return null;
    }
  };

  const handleViewDetails = async (plan) => {
    const progressData = await fetchProgressData(plan.keHoachId);

    setProgressPopup({
      visible: true,
      plan: plan,
      progressData: progressData?.danhSachTienDo || [] // Chỉ lấy danh sách tiến độ
    });
  };
  const handleDeleteHangMuc = async (hangMucId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng mục này?')) {
      return;
    }

    try {
      setDeletingId(hangMucId); // Để hiển thị loading cho item cụ thể

      const response = await fetch(`${API_BASE_URL}/hangmuc/${hangMucId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Xóa không thành công');
      }

      // Gọi lại fetchData để cập nhật danh sách
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };
  const handleDeleteKeHoach = async (hangMucId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng mục này?')) {
      return;
    }

    try {
      setDeletingId(hangMucId); // Để hiển thị loading cho item cụ thể

      const response = await fetch(`${API_BASE_URL}/kehoach/${hangMucId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Xóa không thành công');
      }

      // Gọi lại fetchData để cập nhật danh sách
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Theo dõi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sample data


  const toggleItem = (type, id) => {
    setExpandedItems(prev => {
      // Nếu đang mở rộng hạng mục (items), đóng tất cả hạng mục khác
      if (type === 'items') {
        const newItems = {};
        // Đóng tất cả hạng mục trước
        Object.keys(prev.items).forEach(itemId => {
          newItems[itemId] = false;
        });
        // Sau đó mở/đóng hạng mục được click
        newItems[id] = !prev.items[id];
        
        return {
          ...prev,
          items: newItems
        };
      }
      
      // Với các loại khác (packages, categories), hoạt động bình thường
      return {
        ...prev,
        [type]: {
          ...prev[type],
          [id]: !prev[type][id]
        }
      };
    });
  };

  // Gantt timeline calculations
  const ganttDateRange = useMemo(() => {
    const allDates = [];

    // Lấy tất cả các gói thầu từ các nguồn dữ liệu khác nhau
    const packages = [].concat(
      data?.duAnThanhPhan?.danhSachGoiThau || [],
      data?.duAnTong?.danhSachGoiThauTrucTiep || [],
      data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    ).filter(packageItem => !packageId || packageItem.goiThauId === packageId);

    // Thêm các ngày từ gói thầu
    packages.forEach(packageItem => {
      if (packageItem.ngayKhoiCong) allDates.push(new Date(packageItem.ngayKhoiCong));
      if (packageItem.ngayHoanThanh) allDates.push(new Date(packageItem.ngayHoanThanh));

      // Thêm các ngày từ hạng mục và kế hoạch
      packageItem.danhSachHangMuc?.forEach(item => {
        item.danhSachKeHoach?.forEach(plan => {
          if (plan.ngayBatDau) allDates.push(new Date(plan.ngayBatDau));
          if (plan.ngayKetThuc) allDates.push(new Date(plan.ngayKetThuc));
        });
      });
    });

    // Nếu không có dữ liệu, tạo phạm vi mặc định 18 tháng tính từ ngày hiện tại
    if (allDates.length === 0) {
      const today = new Date();
      
      // Ngày bắt đầu là ngày đầu tiên của tháng hiện tại
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Ngày kết thúc là 18 tháng sau ngày bắt đầu
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 18);
      
      return { 
        start: startDate, 
        end: endDate, 
        totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) 
      };
    }

    // Tìm ngày nhỏ nhất và lớn nhất, đảm bảo chuyển đổi thành timestamp
    const timestamps = allDates.map(date => date.getTime());
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    // Thêm thêm nhiều tháng đệm
    const endDateWithBuffer = new Date(maxDate);
    endDateWithBuffer.setMonth(endDateWithBuffer.getMonth() + 6); // Thêm 6 tháng để đảm bảo hiển thị đầy đủ

    const totalDays = Math.ceil((endDateWithBuffer - minDate) / (1000 * 60 * 60 * 24)) + 30; // Thêm 30 ngày đệm

    return { start: minDate, end: endDateWithBuffer, totalDays };
  }, [data, packageId]); // Phụ thuộc vào data và packageId

  // Generate timeline structure with years and months
  const timelineStructure = useMemo(() => {
    const { start, end } = ganttDateRange;
    const years = {};

    // Đảm bảo hiển thị ít nhất 18 tháng
    const minimumMonths = 18;
    
    // Tạo một bản sao của ngày bắt đầu để không ảnh hưởng đến ngày gốc
    let current = new Date(start);
    let monthCount = 0;
    
    // Lặp qua các tháng từ ngày bắt đầu đến ngày kết thúc
    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth();

      if (!years[year]) {
        years[year] = {};
      }

      if (!years[year][month]) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const daysInMonth = monthEnd.getDate();

        years[year][month] = {
          name: (month + 1).toString(),
          daysInMonth,
          monthStart,
          monthEnd
        };
        
        monthCount++;
      }

      // Tăng tháng lên 1
      current.setMonth(current.getMonth() + 1);
    }
    
    // Nếu số tháng hiển thị ít hơn mức tối thiểu, thêm các tháng tiếp theo
    if (monthCount < minimumMonths) {
      // Sử dụng ngày kết thúc hiện tại làm điểm bắt đầu để thêm các tháng
      let extendDate = new Date(end);
      
      while (monthCount < minimumMonths) {
        extendDate.setMonth(extendDate.getMonth() + 1);
        const year = extendDate.getFullYear();
        const month = extendDate.getMonth();
        
        if (!years[year]) {
          years[year] = {};
        }
        
        if (!years[year][month]) {
          const monthStart = new Date(year, month, 1);
          const monthEnd = new Date(year, month + 1, 0);
          const daysInMonth = monthEnd.getDate();
          
          years[year][month] = {
            name: (month + 1).toString(),
            daysInMonth,
            monthStart,
            monthEnd
          };
          
          monthCount++;
        }
      }
    }

    return years;
  }, [ganttDateRange]);

  // Sửa lại hàm renderTimelineHeader
  const renderTimelineHeader = () => {
    // Tạo cấu trúc dữ liệu đầy đủ cho các năm và 12 tháng
    const fullYearStructure = {};

    // Duyệt qua các năm trong dữ liệu hiện có
    Object.entries(timelineStructure).forEach(([year, months]) => {
      fullYearStructure[year] = {};

      // Đảm bảo mỗi năm có đủ 12 tháng
      for (let month = 0; month < 12; month++) {
        if (months[month]) {
          // Nếu tháng tồn tại trong dữ liệu, sử dụng nó
          fullYearStructure[year][month] = months[month];
        } else {
          // Nếu không, tạo tháng giả với 30 ngày
          const monthStart = new Date(parseInt(year), month, 1);
          const monthEnd = new Date(parseInt(year), month + 1, 0);
          fullYearStructure[year][month] = {
            name: (month + 1).toString(),
            daysInMonth: monthEnd.getDate(),
            monthStart,
            monthEnd
          };
        }
      }
    });

    return (
      <div className="bg-gray-50 sticky top-0 z-50">
        {/* Year headers */}
        <div className="flex h-4">
          {Object.entries(fullYearStructure).map(([year, months]) => {
            // Tính tổng độ rộng cho 12 tháng của mỗi năm
            const yearWidth = Object.values(months).reduce((sum, month) =>
              sum + calculateColumnWidth(month.daysInMonth), 0
            );

            return (
              <div key={year}
                className={`border-r border-gray-300 text-center font-medium bg-gray-100 py-0.5 relative ${getFontSizeClass()}`}
                style={{
                  width: `${yearWidth}px`,
                  minWidth: '240px' // Tăng kích thước tối thiểu đủ cho 12 tháng
                }}>
                {year}
              </div>
            );
          })}
        </div>

        {/* Month headers - chỉ hiển thị trong chế độ xem tháng */}
        {viewMode === 'month' && (
          <div className="flex mt-2 h-3">
            {Object.entries(fullYearStructure).flatMap(([year, months]) =>
              Object.entries(months).map(([monthIndex, monthData]) => {
                const monthWidth = calculateColumnWidth(monthData.daysInMonth);
                return (
                  <div key={`${year}-${monthIndex}`}
                    className={`border-r border-gray-300 text-center py-0 font-bold text-gray-600 ${windowSize.width < 640 ? 'text-[8px]' : 'text-[10px]'}`}
                    style={{
                      width: `${monthWidth}px`,
                      minWidth: '20px'
                    }}>
                    {monthData.name}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // Thu nhỏ kích thước của ô tháng
  const calculateColumnWidth = (days) => {
    // Thu nhỏ độ rộng dựa trên kích thước cửa sổ
    const scaleFactor = Math.max(0.5, Math.min(1, windowSize.width / 1440));

    if (viewMode === 'year') {
      // Cho chế độ xem theo năm, thu nhỏ hơn nữa
      return Math.max(days * 0.5 * scaleFactor, 20 * scaleFactor);
    }

    // Chế độ xem theo tháng (mặc định) - giảm kích thước từ 3px xuống 2px per day
    return Math.max(days * 0.5 * scaleFactor, 20 * scaleFactor); // Đồng bộ với giá trị ở chế độ năm
  };

  // Sửa lại hàm getTaskPosition để đặt thanh Gantt đúng vị trí
  const getTaskPosition = (startDate, endDate) => {
    if (!startDate || !endDate) return { left: 0, width: 0 };

    // Chuyển đổi thành Date object và đảm bảo ngày chính xác
    const taskStart = new Date(startDate);
    const taskEnd = new Date(endDate);

    // Lấy danh sách các năm trong timeline theo thứ tự
    const years = Object.keys(timelineStructure).sort();

    // Vị trí hiện tại (left)
    let currentLeft = 0;

    // Biến để lưu trữ vị trí bắt đầu và kết thúc của task
    let taskLeft = null;
    let taskRight = null;

    // Map để lưu vị trí bắt đầu của từng tháng
    const monthPositions = {};

    // Trước tiên, tính vị trí của tất cả các tháng
    for (let yearIdx = 0; yearIdx < years.length; yearIdx++) {
      const year = years[yearIdx];
      const months = Object.keys(timelineStructure[year]).sort((a, b) => parseInt(a) - parseInt(b));

      for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
        const month = months[monthIdx];
        const monthData = timelineStructure[year][month];

        // Lưu vị trí bắt đầu của tháng
        const key = `${year}-${month}`;
        monthPositions[key] = {
          left: currentLeft,
          width: calculateColumnWidth(monthData.daysInMonth),
          days: monthData.daysInMonth
        };

        // Cập nhật vị trí hiện tại
        currentLeft += monthPositions[key].width;
      }
    }

    // Reset lại vị trí hiện tại
    currentLeft = 0;

    // Sau đó, tìm vị trí của task
    for (let yearIdx = 0; yearIdx < years.length; yearIdx++) {
      const year = years[yearIdx];
      const months = Object.keys(timelineStructure[year]).sort((a, b) => parseInt(a) - parseInt(b));

      for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
        const month = months[monthIdx];
        const monthData = timelineStructure[year][month];

        // Tạo ngày đầu tháng và cuối tháng chính xác
        const monthStartDate = new Date(parseInt(year), parseInt(month), 1);
        const monthEndDate = new Date(parseInt(year), parseInt(month) + 1, 0);

        const monthPosition = monthPositions[`${year}-${month}`];
        const monthWidth = monthPosition.width;

        // Kiểm tra nếu task bắt đầu trong tháng này
        if (taskLeft === null && taskStart >= monthStartDate && taskStart <= monthEndDate) {
          // Tính vị trí bắt đầu của task trong tháng
          const daysIntoMonth = Math.floor((taskStart - monthStartDate) / (1000 * 60 * 60 * 24));
          const dayWidth = monthWidth / monthData.daysInMonth;
          taskLeft = monthPosition.left + (daysIntoMonth * dayWidth);
        }

        // Kiểm tra nếu task kết thúc trong tháng này
        if (taskEnd >= monthStartDate && taskEnd <= monthEndDate) {
          // Tính vị trí kết thúc của task trong tháng
          const daysIntoMonth = Math.ceil((taskEnd - monthStartDate) / (1000 * 60 * 60 * 24));
          const dayWidth = monthWidth / monthData.daysInMonth;
          taskRight = monthPosition.left + (daysIntoMonth * dayWidth);
          break; // Thoát vòng lặp vì đã tìm thấy tháng kết thúc
        }
      }

      // Nếu đã tìm thấy vị trí kết thúc, thoát khỏi vòng lặp năm
      if (taskRight !== null) {
        break;
      }
    }

    // Nếu không tìm thấy vị trí kết thúc, đặt nó ở cuối timeline
    if (taskRight === null) {
      taskRight = Object.values(monthPositions).reduce((total, pos) => total + pos.width, 0);
    }

    // Nếu không tìm thấy vị trí bắt đầu, đặt nó ở đầu timeline
    if (taskLeft === null) {
      taskLeft = 0;
    }

    // Tính toán độ rộng của task
    let taskWidth = taskRight - taskLeft;

    // Đảm bảo task có độ rộng tối thiểu
    taskWidth = Math.max(taskWidth, 8);

    // Thêm đoạn hiệu chỉnh vị trí để đưa task vào đúng tháng
    if (taskStart.getMonth() === 0) {
      taskLeft += 25; // Tăng offset lên để đẩy task sang phải

      // Hiệu chỉnh thêm cho các ngày khác 1/1
      if (taskStart.getDate() > 1) {
        // Tính toán vị trí tỷ lệ trong tháng
        const dayRatio = (taskStart.getDate() - 1) / 31;
        // Điều chỉnh thêm vị trí dựa vào ngày trong tháng
        const additionalOffset = dayRatio * 8;
        taskLeft += additionalOffset; // Tăng offset thêm tỷ lệ với ngày trong tháng
      }
    }

    return { left: taskLeft, width: taskWidth };
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const renderGanttBar = (startDate, endDate, progress, level = 0) => {
    if (!startDate || !endDate) return null;

    const position = getTaskPosition(startDate, endDate);
    const height = 'h-3'; // Tất cả thanh đều có chiều cao đồng nhất

    // Điều chỉnh vị trí ngày tháng để phù hợp với thanh thu nhỏ
    const dateFormat = windowSize.width < 640 ? 'dd/MM' : 'dd/MM/yyyy';
    const formatDateShort = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (dateFormat === 'dd/MM') {
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }
      return formatDate(date);
    };

          return (
        <div className="relative h-full flex items-center">
          <div
            className={`${height} rounded-lg relative ${getProgressColor(progress)} opacity-80 hover:opacity-100 transition-opacity z-10`}
            style={{
              marginLeft: `${position.left}px`,
              width: `${position.width}px`,
              minWidth: '8px'
            }}
          >
            {/* Text ngày bắt đầu - nằm trong cùng ô với thanh Gantt */}
            <div
              className='text-xs font-medium absolute text-gray-600 bg-white px-1 rounded shadow-sm'
              style={{ 
                left: '-2px',
                top: '-20px',
                zIndex: 20
              }}
            >
              {formatDate(startDate)}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
              {position.width > 20 ? `${progress.toFixed(0)}%` : ''}
            </div>
            <div
              className="h-full bg-black bg-opacity-20 rounded-lg"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div
            className='text-xs font-medium absolute'
            style={{ left: `${position.left + position.width + 5}px` }}
          >
            {formatDate(endDate)}
          </div>
        </div>
      );
  };

  // Điều chỉnh độ rộng timeline theo kích thước cửa sổ và chế độ xem
  const scaleFactor = Math.max(0.5, Math.min(1, windowSize.width / 1440));
  const pixelsPerDay = viewMode === 'year' ? 0.7 : 0.7; // Tăng từ 0.5 lên 0.7 để thanh Gantt dài hơn
  
  // Tính toán độ rộng tối thiểu cho timeline, đảm bảo ít nhất 12 tháng (khoảng 365 ngày)
  const minimumTimelineWidth = 1000; // Độ rộng tối thiểu cố định, đủ để hiển thị 12 tháng
  
  // Sử dụng giá trị lớn hơn giữa độ rộng tính toán từ dữ liệu và độ rộng tối thiểu
  const totalTimelineWidth = Math.max(
    (ganttDateRange.totalDays || 365) * pixelsPerDay * scaleFactor * 1.1, // Độ rộng tính từ dữ liệu thực tế
    minimumTimelineWidth // Độ rộng tối thiểu đủ cho 12 tháng
  );

  // Class CSS động dựa trên kích thước màn hình
  const getFontSizeClass = () => {
    if (windowSize.width < 480) return 'text-[8px]'; // Điện thoại rất nhỏ
    if (windowSize.width < 640) return 'text-[9px]'; // Điện thoại 
    if (windowSize.width < 768) return 'text-[10px]'; // Điện thoại lớn
    if (windowSize.width < 1024) return 'text-xs'; // Tablet
    return 'text-sm'; // Desktop
  };

  const getPaddingClass = () => {
    if (windowSize.width < 480) return 'px-0.5 py-0.5'; // Điện thoại rất nhỏ
    if (windowSize.width < 640) return 'px-0.5 py-0.5'; // Điện thoại
    if (windowSize.width < 768) return 'px-1 py-1'; // Điện thoại lớn
    if (windowSize.width < 1024) return 'px-1 py-1.5'; // Tablet
    return 'px-2 py-2'; // Desktop
  };

  // Chiều cao đồng nhất cho các hàng - thêm responsive
  const rowHeight = windowSize.width < 640 ? 'min-h-8' : windowSize.width < 1024 ? 'min-h-9' : 'min-h-10';
  const planRowHeight = windowSize.width < 640 ? 'min-h-12' : windowSize.width < 1024 ? 'min-h-14' : 'min-h-16';

  // Component chọn view mode cho màn hình nhỏ
  const ViewModeSelector = () => (
    <div className="md:hidden bg-white p-2 border-b">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-medium">Chế độ xem:</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-2 py-1 text-xs rounded-md ${viewMode === 'month' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Tháng
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-2 py-1 text-xs rounded-md ${viewMode === 'year' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Năm
          </button>
        </div>
      </div>
    </div>
  );

  // Thay đổi hiển thị trên điện thoại di động
  const renderIntegratedTable = () => (
    <div className="overflow-hidden border rounded-lg" ref={containerRef}>
      <ViewModeSelector />
      {/* Fixed columns */}
              <div className="flex">
          {/* Left fixed columns */}
          <div className={`flex-shrink-0 bg-white border-r max-h-68 overflow-hidden w-full md:w-auto relative`}
            ref={leftTableRef}>
          <table className="divide-y divide-gray-200 w-full">
            <thead className={`bg-gray-50 sticky top-0 z-50 ${getFontSizeClass()}`}>
              <tr>
                <th className={`${getPaddingClass()} text-xm text-left font-medium text-gray-500 w-8 sm:w-12`}>STT</th>
                <th className={`${getPaddingClass()} text-xm text-left font-medium text-gray-500 w-10 sm:w-16`}>Mã</th>
                <th className={`${getPaddingClass()} text-xm text-left font-medium text-gray-500 w-20 sm:w-28 md:w-40`}>Công việc</th>

                <th className={`${getPaddingClass()} text-xm font-medium text-gray-500 w-12 sm:w-14 md:w-20`}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {([]).concat(
                displayData?.duAnThanhPhan?.danhSachGoiThau || [],
                displayData?.duAnTong?.danhSachGoiThauTrucTiep || [],
                displayData?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
              )
                .filter(packageItem => !packageId || packageItem.goiThauId === packageId)
                .map((packageItem, packageIndex) => (

                  <React.Fragment key={`package-${packageItem.goiThauId}`}>
                    <tr
                      key={`package-${packageItem.goiThauId}`}
                      className={`group bg-blue-50 hover:bg-blue-100 ${rowHeight}`}
                      data-row-id={`package-${packageItem.goiThauId}`}
                    >
                      <td className={`${getPaddingClass()} whitespace-nowrap ${getFontSizeClass()}`}>{packageIndex + 1}</td>
                      <td className={`${getPaddingClass()} whitespace-nowrap ${getFontSizeClass()}`}>GT-{packageItem.goiThauId}</td>
                      <td className={`${getPaddingClass()} font-medium`}>
                        <button
                          onClick={() => toggleItem('packages', packageItem.goiThauId)}
                          className="flex items-center focus:outline-none w-full text-left"
                        >
                          {expandedItems.packages[packageItem.goiThauId] ?
                            <FaChevronDown className="w-3 h-3 mr-1 flex-shrink-0" /> :
                            <FaChevronRight className="w-3 h-3 mr-1 flex-shrink-0" />
                          }
                          <span className={`break-words ${getFontSizeClass()} ${windowSize.width < 480 ? 'max-w-[120px]' : windowSize.width < 640 ? 'max-w-[160px]' : windowSize.width < 1024 ? 'max-w-[200px]' : 'max-w-[240px]'}`} title={packageItem.tenGoiThau}>{packageItem.tenGoiThau}</span>
                        </button>
                      </td>

                      <td className={`${getPaddingClass()} whitespace-nowrap`}>
                      <button
                      className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                      title="Thêm hạng mục"
                      onClick={() => handleAddCategoryClick(packageItem.goiThauId)}
                    >
                      <FaPlus size={14} />
                    </button>
                      </td>
                    </tr>

                    {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => {
                      const progress = item.tongKhoiLuongKeHoach ?
                        Math.min((item.tongKhoiLuongThucHien / item.tongKhoiLuongKeHoach) * 100, 100) : 0;
                      const bgColor = progress >= 100 ? 'bg-green-100' : progress >= 40 ? 'bg-yellow-100' : 'bg-red-100';

                      // Lấy ngày bắt đầu sớm nhất và ngày kết thúc muộn nhất của tất cả kế hoạch trong hạng mục
                      const itemStart = item.danhSachKeHoach && item.danhSachKeHoach.length > 0
                        ? item.danhSachKeHoach.reduce((min, kh) => {
                            if (!kh.ngayBatDau) return min;
                            if (!min) return kh.ngayBatDau;
                            return new Date(kh.ngayBatDau) < new Date(min) ? kh.ngayBatDau : min;
                          }, null)
                        : null;
                      const itemEnd = item.danhSachKeHoach && item.danhSachKeHoach.length > 0
                        ? item.danhSachKeHoach.reduce((max, kh) => {
                            if (!kh.ngayKetThuc) return max;
                            if (!max) return kh.ngayKetThuc;
                            return new Date(kh.ngayKetThuc) > new Date(max) ? kh.ngayKetThuc : max;
                          }, null)
                        : null;

                      return (
                        <React.Fragment key={`item-${item.hangMucId}`}>
                          <tr
                            key={`item-${item.hangMucId}`}
                            className={`group ${bgColor} hover:${bgColor.replace('100', '200')} ${rowHeight}`}
                            data-row-id={`item-${item.hangMucId}`}
                          >
                            <td className={`${getPaddingClass()} whitespace-nowrap pl-4 ${getFontSizeClass()}`}>{`${packageIndex + 1}.${itemIndex + 1}`}</td>
                            <td className={`${getPaddingClass()} whitespace-nowrap ${getFontSizeClass()}`}>HM-{item.hangMucId}</td>
                            <td className={`${getPaddingClass()}`}>
                              <button
                                onClick={() => toggleItem('items', item.hangMucId)}
                                className="flex items-center focus:outline-none w-full text-left"
                              >
                                {expandedItems.items[item.hangMucId] ?
                                  <FaChevronDown className="w-3 h-3 mr-1 flex-shrink-0" /> :
                                  <FaChevronRight className="w-3 h-3 mr-1 flex-shrink-0" />
                                }
                                <span className={`break-words font-medium ${getFontSizeClass()} ${windowSize.width < 640 ? 'max-w-[140px]' : windowSize.width < 1024 ? 'max-w-[180px]' : 'max-w-[220px]'}`} title={`HM: ${item.tenHangMuc}`}>HM: {item.tenHangMuc}</span>
                              </button>
                            </td>

                            <td className={`${getPaddingClass()} whitespace-nowrap`}>
                            <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Thêm kế hoạch"
                            onClick={() => handleAddPlanClick(item.hangMucId)}
                          >
                            <FaPlus size={14} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Xóa"
                            onClick={() => handleAddCategoryClick(item.hangMucId)}
                          >
                            <FaTrash size={14} />
                          </button>
                            </td>
                          </tr>

                          {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                            <tr key={`plan-${plan.keHoachId}`} className={`group bg-white hover:bg-gray-50 ${planRowHeight}`} data-row-id={`plan-${plan.keHoachId}`}>
                              <td className={`${getPaddingClass()} whitespace-nowrap pl-8 ${getFontSizeClass()}`}>
                                {`${packageIndex + 1}.${itemIndex + 1}.${planIndex + 1}`}
                              </td>
                              <td className={`${getPaddingClass()} whitespace-nowrap ${getFontSizeClass()}`}>KH-{plan.keHoachId}</td>
                              <td className={`${getPaddingClass()}`}>
                                <div className={`${getFontSizeClass()} break-words ${windowSize.width < 640 ? 'max-w-[120px]' : windowSize.width < 1024 ? 'max-w-[160px]' : 'max-w-[200px]'}`} title={plan.tenCongTac}>{plan.tenCongTac}</div>
                                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                                  <button onClick={() => handleViewDetails(plan)} className={`px-1 py-0.5 ${windowSize.width < 640 ? 'text-[10px]' : 'text-xs'} text-white bg-blue-800 rounded hover:bg-blue-900`}>
                                    Chi tiết
                                  </button>
                                  <button onClick={() => handleOpenIssuePopup(plan, duAnThanhPhanId)} className={`px-1 py-0.5 ${windowSize.width < 640 ? 'text-[10px]' : 'text-xs'} text-white bg-blue-800 rounded hover:bg-blue-900`}>
                                    Vướng mắc
                                  </button>
                                  <button onClick={() => handleOpenProgressPopup(plan)} className={`px-1 py-0.5 ${windowSize.width < 640 ? 'text-[10px]' : 'text-xs'} text-white bg-blue-800 rounded hover:bg-blue-900`}>
                                    Cập nhật
                                  </button>
                                </div>
                              </td>

                              <td className={`${getPaddingClass()} whitespace-nowrap`}>
                                <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100" title="Xóa">
                                  <FaTrash size={windowSize.width < 640 ? 10 : 12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}

            </tbody>
          </table>
        </div>

        {/* Scrollable timeline section */}
        <div className="flex-1 relative overflow-hidden">
          {/* Thêm nút điều hướng trái/phải */}
          <button
            onClick={handleScrollLeft}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-50 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-r-md p-2 shadow-lg border border-gray-200 ${scrollPosition > 0 ? 'block' : 'hidden'}`}
          >
            <FiChevronLeft size={24} className="text-blue-800" />
          </button>

          <button
            onClick={handleScrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-50 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-l-md p-2 shadow-lg border border-gray-200"
          >
            <FiChevronLeft size={24} className="text-blue-800 transform rotate-180" />
          </button>

          {/* Thêm CSS để ẩn thanh cuộn nhưng vẫn cho phép cuộn */}
          <div
            ref={ganttScrollContainerRef}
            className="overflow-x-auto max-w-4xl hide-scrollbar scrollbar-none"
            onScroll={handleScroll}
          >
                      <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Edge */
            }
          `}</style>
            <div className={`${windowSize.width < 640 ? 'w-full' : 'min-w-[1000px]'}`} style={{ 
              width: `${totalTimelineWidth}px`
            }}>
              {/* Timeline header */}
              {renderTimelineHeader()}

              {/* Responsive styles for mobile */}
              {windowSize.width < 640 && (
                <style>{`
                  .mobile-timeline {
                    width: 100% !important;
                    margin-left: 0 !important;
                    overflow-x: auto;
                  }
                `}</style>
              )}

              {/* Timeline bars */}
              <div className={`bg-white max-h-68 relative ${viewMode === 'month' ? 'mt-0' : 'mt-5'}`} ref={rightTableRef}>
                {/* Đường kẻ dọc phân tách tháng */}
                {viewMode === 'month' && renderMonthGridlines()}

                {/* Thêm div trống với chiều cao tối thiểu khi không có dữ liệu */}
                {(!displayData || 
                  (!displayData?.duAnThanhPhan?.danhSachGoiThau?.length && 
                   !displayData?.duAnTong?.danhSachGoiThauTrucTiep?.length && 
                   !displayData?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau || [])?.length)) && (
                  <div className="h-40 flex items-center justify-center text-gray-400 italic">
                    Chưa có dữ liệu kế hoạch
                  </div>
                )}

                {([]).concat(
                  displayData?.duAnThanhPhan?.danhSachGoiThau || [],
                  displayData?.duAnTong?.danhSachGoiThauTrucTiep || [],
                  displayData?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
                )
                  .filter(packageItem => !packageId || packageItem.goiThauId === packageId)
                  .map((packageItem, packageIndex) => (

                    <React.Fragment key={`gantt-package-${packageItem.goiThauId}`}>
                      <div
                        key={`gantt-package-${packageItem.goiThauId}`}
                        className={`gantt-row border-b ${rowHeight}`}
                        data-row-id={`package-${packageItem.goiThauId}`}
                      >

                      </div>

                      {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => {
                        const progress = item.tongKhoiLuongKeHoach ?
                          Math.min((item.tongKhoiLuongThucHien / item.tongKhoiLuongKeHoach) * 100, 100) : 0;
                        const bgColor = progress >= 100 ? 'bg-green-100' : progress >= 40 ? 'bg-yellow-100' : 'bg-red-100';

                        // Lấy ngày bắt đầu sớm nhất và ngày kết thúc muộn nhất của tất cả kế hoạch trong hạng mục
                        const itemStart = item.danhSachKeHoach && item.danhSachKeHoach.length > 0
                          ? item.danhSachKeHoach.reduce((min, kh) => {
                              if (!kh.ngayBatDau) return min;
                              if (!min) return kh.ngayBatDau;
                              return new Date(kh.ngayBatDau) < new Date(min) ? kh.ngayBatDau : min;
                            }, null)
                          : null;
                        const itemEnd = item.danhSachKeHoach && item.danhSachKeHoach.length > 0
                          ? item.danhSachKeHoach.reduce((max, kh) => {
                              if (!kh.ngayKetThuc) return max;
                              if (!max) return kh.ngayKetThuc;
                              return new Date(kh.ngayKetThuc) > new Date(max) ? kh.ngayKetThuc : max;
                            }, null)
                          : null;

                        return (
                          <React.Fragment key={`gantt-item-${item.hangMucId}`}>
                            <div
                              key={`gantt-item-${item.hangMucId}`}
                              className={`gantt-row border-b ${rowHeight}`}
                              data-row-id={`item-${item.hangMucId}`}
                            >
                              {itemStart && itemEnd && renderGanttBar(itemStart, itemEnd, progress, 1)}
                            </div>

                            {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                              <div key={`gantt-plan-${plan.keHoachId}`} className={`gantt-row border-b `} data-row-id={`plan-${plan.keHoachId}`}>
                                {renderGanttBar(
                                  plan.ngayBatDau,
                                  plan.ngayKetThuc,
                                  plan.khoiLuongKeHoach ?
                                    Math.min((plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100, 100) : 0,
                                  2
                                )}
                              </div>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Tạo các đường kẻ dọc để phân tách các tháng trong biểu đồ Gantt
  const renderMonthGridlines = () => {
    // Mảng lưu vị trí các đường kẻ dọc (ranh giới giữa các tháng)
    const gridlines = [];

    // Tính toán vị trí của mỗi ranh giới tháng
    let accumulatedWidth = 0;

    Object.entries(timelineStructure).forEach(([year, months]) => {
      Object.entries(months).forEach(([monthIndex, monthData], index, monthArray) => {
        // Thêm vị trí bắt đầu của tháng (trừ tháng đầu tiên của timeline)
        if (!(year === Object.keys(timelineStructure)[0] && monthIndex === Object.keys(months)[0])) {
          gridlines.push(accumulatedWidth);
        }

        // Cộng dồn độ rộng của tháng này để tính vị trí của tháng tiếp theo
        const monthWidth = calculateColumnWidth(monthData.daysInMonth);
        accumulatedWidth += monthWidth;
      });
    });

    return gridlines.map((position, index) => (
      <div
        key={`gridline-${index}`}
        className="absolute h-full border-r border-gray-200"
        style={{
          left: `${position}px`,
          top: 0,
          zIndex: 1, // Giảm z-index xuống 1 để ở dưới thanh Gantt
          pointerEvents: 'none'
        }}
      />
    ));
  };

  // Điều chỉnh các lớp CSS cho responsive
  const containerClass = windowSize.width < 640 ? 'p-2' : windowSize.width < 1024 ? 'p-4' : 'p-6';
  const titleClass = windowSize.width < 640 ? 'text-lg' : windowSize.width < 1024 ? 'text-xl' : 'text-2xl';
  const ProgressPopup = ({ visible, plan, progressData, onClose }) => {
    if (!visible) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chi tiết tiến độ: {plan?.tenCongTac}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>

          {/* Status Alert */}
          {(() => {
            const isCompleted = plan?.tongKhoiLuongThucHien >= plan?.khoiLuongKeHoach;
            const isOverdue = !isCompleted && new Date() > new Date(plan?.ngayKetThuc);
            const daysOverdue = isOverdue
              ? Math.ceil((new Date() - new Date(plan?.ngayKetThuc)) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start ${isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : isOverdue
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                  }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isOverdue ? (
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">
                    {isCompleted
                      ? 'Đã hoàn thành'
                      : isOverdue
                        ? `Đã quá hạn ${Math.floor(daysOverdue)} ngày`
                        : 'Đang thực hiện'}
                  </h4>
                </div>
              </div>
            );
          })()}

          {/* Plan Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-500">Khối lượng kế hoạch</div>
              <div className="font-semibold text-lg mt-1">
                {plan?.khoiLuongKeHoach?.toLocaleString()} {plan?.donViTinh}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-gray-500">Đã thực hiện</div>
              <div className="font-semibold text-lg mt-1">
                {plan?.tongKhoiLuongThucHien?.toLocaleString()} {plan?.donViTinh}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {plan?.khoiLuongKeHoach
                  ? `${Math.round((plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100)}% hoàn thành`
                  : '0% hoàn thành'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-500">Thời gian</div>
              <div className="font-semibold text-sm mt-1">
                {formatDate(plan?.ngayBatDau)} → {formatDate(plan?.ngayKetThuc)}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {calculateDays(plan?.ngayBatDau, plan?.ngayKetThuc)} ngày
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <h4 className="font-medium mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Lịch sử cập nhật tiến độ
          </h4>

          <div className="space-y-4">
            {progressData?.length > 0 ? (
              progressData.map((progress, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4 relative pb-4">
                  {/* Timeline dot */}
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>

                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(progress.NgayCapNhat, true)}
                      </div>
                      <div className="text-blue-600 mt-1 font-semibold">
                        +{progress.KhoiLuongThucHien?.toLocaleString()} {progress.DonViTinh}
                      </div>
                    </div>
                  </div>

                  {progress.MoTaVuongMac && (
                    <div className="mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <div className="flex items-start">
                        <svg
                          className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-yellow-700">Vướng mắc</div>
                          <p className="text-sm text-yellow-600 mt-1">{progress.MoTaVuongMac}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {progress.GhiChu && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-start">
                        <svg
                          className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Ghi chú</div>
                          <p className="text-sm text-gray-600 mt-1">{progress.GhiChu}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500">Chưa có dữ liệu cập nhật tiến độ.</div>
            )}
          </div>
        </div>
      </div>

    );
  };
  const handleApproval = () => navigate(`/approvals/${duAnThanhPhanId}`)
  const handleProjectProgress = () => navigate(`/project-progress/${duAnThanhPhanId}`)
  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">No data available</div>;
  return (
<div className={`${containerClass} bg-gray-50 min-h-screen`}>
  <div className="max-w-full mx-auto">
    {/* Content */}
    <div className="bg-white rounded-lg shadow">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-md shadow-sm">
          {/* Search Box */}
        <div className="flex-1 mb-4" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tìm kiếm công việc, hạng mục..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e, 'desktop')}
                onFocus={() => setActiveSearchInput('desktop')}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none bg-transparent border-none"
                  onClick={resetFilters}
                  tabIndex={-1}
                  title="Xóa tìm kiếm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && activeSearchInput === 'desktop' && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto py-1">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-start"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {suggestion.type === 'goiThau' ? (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">GT</span>
                        ) : suggestion.type === 'hangMuc' ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">HM</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">KH</span>
                        )}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{suggestion.text}</div>
                        <div className="text-xs text-gray-500">
                          {suggestion.type === 'goiThau' ? 'Gói thầu' :
                            suggestion.type === 'hangMuc' ? 'Hạng mục' : 'Kế hoạch'} - {suggestion.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
                <label className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white">Từ ngày</label>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
                <label className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white">Đến ngày</label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                <FiFilter className="w-4 h-4" />
                <span>Lọc</span>
              </button>
              {(searchTerm || startDate || endDate) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center gap-2">
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 bg-white p-2 sm:p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <h3 className={`${getFontSizeClass()} font-medium`}>Chú thích màu sắc tiến độ:</h3>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-1 text-xs rounded-md ${viewMode === 'month' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Xem theo tháng
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-2 py-1 text-xs rounded-md ${viewMode === 'year' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Xem theo năm
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-2 bg-red-500 rounded mr-1"></div>
              <span className={windowSize.width < 640 ? 'text-[10px]' : 'text-xs'}>0-24%: Chậm tiến độ</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-2 bg-orange-500 rounded mr-1"></div>
              <span className={windowSize.width < 640 ? 'text-[10px]' : 'text-xs'}>25-49%: Cần theo dõi</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-2 bg-yellow-500 rounded mr-1"></div>
              <span className={windowSize.width < 640 ? 'text-[10px]' : 'text-xs'}>50-74%: Đúng tiến độ</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-2 bg-blue-500 rounded mr-1"></div>
              <span className={windowSize.width < 640 ? 'text-[10px]' : 'text-xs'}>75-99%: Gần hoàn thành</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-2 bg-green-500 rounded mr-1"></div>
              <span className={windowSize.width < 640 ? 'text-[10px]' : 'text-xs'}>100%: Hoàn thành</span>
            </div>
          </div>
        </div>
        <div className="p-2 sm:p-4 md:p-6">
          {renderIntegratedTable()}
        </div>
      </div>

      {/* Mobile View - Đã cập nhật để cuộn tốt */}
      <div className="md:hidden w-full">
      <div className="flex-1 mb-4" ref={searchRefMobile}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tìm kiếm công việc, hạng mục..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e, 'mobile')}
                onFocus={() => setActiveSearchInput('mobile')}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none bg-transparent border-none"
                  onClick={resetFilters}
                  tabIndex={-1}
                  title="Xóa tìm kiếm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && activeSearchInput === 'mobile' && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto py-1">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-start"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {suggestion.type === 'goiThau' ? (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">GT</span>
                        ) : suggestion.type === 'hangMuc' ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">HM</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">KH</span>
                        )}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{suggestion.text}</div>
                        <div className="text-xs text-gray-500">
                          {suggestion.type === 'goiThau' ? 'Gói thầu' :
                            suggestion.type === 'hangMuc' ? 'Hạng mục' : 'Kế hoạch'} - {suggestion.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        <div className="overflow-y-auto h-[calc(100vh-180px)] touch-pan-y px-2 py-2 -webkit-overflow-scrolling-touch">
          {([]).concat(
            displayData?.duAnThanhPhan?.danhSachGoiThau || [],
            displayData?.duAnTong?.danhSachGoiThauTrucTiep || [],
            displayData?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
          )
            .filter(packageItem => !packageId || packageItem.goiThauId === packageId)
            .map((packageItem, packageIndex) => (
              <React.Fragment key={`mobile-package-${packageItem.goiThauId}`}>
                {/* Package Card */}
                <div className="bg-blue-50 p-3 rounded-lg shadow-sm border border-gray-200 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        <button
                          onClick={() => toggleItem('packages', packageItem.goiThauId)}
                          className="flex items-center focus:outline-none"
                        >
                          <img
                            src={downIcon}
                            alt="Toggle"
                            className={`w-3 h-3 mr-1 transform ${expandedItems.packages[packageItem.goiThauId] ? 'rotate-180' : ''}`}
                          />
                          <span className='text-xs font-bold'>{packageItem.tenGoiThau}</span>
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">GT-{packageItem.goiThauId}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <div className="text-gray-500">Khối lượng TH</div>
                      <div>{packageItem.tongKhoiLuongThucHien?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Khối lượng KH</div>
                      <div>{packageItem.tongKhoiLuongKeHoach?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Bắt đầu</div>
                      <div>{formatDate(packageItem.ngayKhoiCong)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Kết thúc</div>
                      <div>{formatDate(packageItem.ngayHoanThanh)}</div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                      title="Thêm hạng mục"
                      onClick={() => handleAddCategoryClick(packageItem.goiThauId)}
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => {
                  const progress = item.tongKhoiLuongKeHoach ?
                    Math.min((item.tongKhoiLuongThucHien / item.tongKhoiLuongKeHoach) * 100, 100) : 0;

                  const bgColor =
                    progress >= 100
                      ? 'bg-green-100'
                      : progress >= 40
                        ? 'bg-yellow-100'
                        : 'bg-red-100';

                  return (
                    <React.Fragment key={`mobile-item-${item.hangMucId}`}>
                      <div className={`${bgColor} p-3 rounded-lg shadow-sm border border-gray-200 ml-4 mb-2`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              <button
                                onClick={() => toggleItem('items', item.hangMucId)}
                                className="flex items-center focus:outline-none"
                              >
                                <img
                                  src={downIcon}
                                  alt="Toggle"
                                  className={`w-3 h-3 mr-1 transform ${expandedItems.items[item.hangMucId] ? 'rotate-180' : ''}`}
                                />
                                <span className='font-bold text-xs'>Hạng mục: {item.tenHangMuc}</span>
                              </button>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">HM-{item.hangMucId}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <div className="text-gray-500">Khối lượng TH</div>
                            <div>{item.tongKhoiLuongThucHien?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Khối lượng KH</div>
                            <div>{item.tongKhoiLuongKeHoach?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Đơn vị</div>
                            <div>{item.danhSachKeHoach?.[0]?.donViTinh || ''}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Tiến độ</div>
                            <div className="font-medium">{progress.toFixed(0)}%</div>
                          </div>
                        </div>

                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                            title="Thêm kế hoạch"
                            onClick={() => handleAddPlanClick(item.hangMucId)}
                          >
                            <FaPlus size={14} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Xóa"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Plans */}
                      {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                        <div key={`mobile-plan-${plan.keHoachId}`} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 ml-8 mb-2 group">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-xs">{plan.tenCongTac}</div>
                              <div className="text-sm text-gray-500 mt-1">KH-{plan.keHoachId}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <div className="text-gray-500">Khối lượng TH</div>
                              <div>{plan.tongKhoiLuongThucHien?.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Khối lượng KH</div>
                              <div>{plan.khoiLuongKeHoach?.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Đơn vị</div>
                              <div>{plan.donViTinh}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Tiến độ</div>
                              <div>
                                {plan.khoiLuongKeHoach
                                  ? Math.min((plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100, 100).toFixed(0) + '%'
                                  : '0%'}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Thời gian</div>
                              <div>{calculateDays(plan.ngayBatDau, plan.ngayKetThuc)} ngày</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Bắt đầu</div>
                              <div>{formatDate(plan.ngayBatDau)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Kết thúc</div>
                              <div>{formatDate(plan.ngayKetThuc)}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-90 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
                            <button
                              onClick={() => handleViewDetails(plan)}
                              className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                            >
                              Chi tiết tiến độ
                            </button>
                            <button
                              onClick={() => handleOpenIssuePopup(plan, duAnThanhPhanId)}
                              className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                            >
                              Khó khăn vướng mắc
                            </button>
                            <button onClick={() => handleOpenProgressPopup(plan)} className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all">
                              Cập nhật tiến độ
                            </button>
                            <button className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all">
                              Chỉnh sửa
                            </button>
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Modals và Popups */}
      {showAddCategoryModal && (
        <AddNewCategories
          goiThauId={selectedPackageId}
          onClose={() => setShowAddCategoryModal(false)}
          onSuccess={handleCategoryAdded}
        />
      )}

      {showAddPlanModal && (
        <AddNewPlan
          hangMucId={selectedCategoryId}
          onClose={() => setShowAddPlanModal(false)}
          onSuccess={handlePlanAdded}
        />
      )}

      <ProgressPopup
        visible={progressPopup.visible}
        plan={progressPopup.plan}
        progressData={progressPopup.progressData}
        onClose={() => setProgressPopup({ ...progressPopup, visible: false })}
      />

      {showProgressPopup && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Cập nhật tiến độ - KH-{selectedPlan.keHoachId}</h3>
              <button
                onClick={handleCloseProgressPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <UpdateProgress
              keHoachId={selectedPlan.keHoachId}
              DonViTinh={selectedPlan.donViTinh}
              onClose={handleCloseProgressPopup}
              onSuccess={handleCloseProgressPopup}
            />
          </div>
        </div>
      )}

      {showIssuePopup && selectedPlan && duAnThanhPhanId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <IssueList
              keHoachId={selectedPlan.keHoachId}
              duAnId={duAnThanhPhanId}
              onClose={handleCloseIssuePopup}
            />
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default SubProjectTable;