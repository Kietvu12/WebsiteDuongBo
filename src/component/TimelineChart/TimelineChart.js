import React, { useState, useEffect } from 'react';

const TimeZoomHeader = () => {
  const [zoomLevel, setZoomLevel] = useState(0); // 0: năm, 1: quý, 2: tháng, 3: ngày
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayItems, setDisplayItems] = useState([]);

  // Xử lý sự kiện lăn chuột
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Zoom in
        setZoomLevel(prev => Math.min(prev + 1, 3));
      } else {
        // Zoom out
        setZoomLevel(prev => Math.max(prev - 1, 0));
      }
    };

    const container = document.getElementById('time-zoom-container');
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Cập nhật các mục hiển thị khi zoomLevel hoặc currentDate thay đổi
  useEffect(() => {
    const year = currentDate.getFullYear();
    
    switch (zoomLevel) {
      case 0: // Hiển thị các năm
        setDisplayItems(Array.from({ length: 5 }, (_, i) => year - 2 + i));
        break;
      
      case 1: // Hiển thị các quý
        setDisplayItems([1, 2, 3, 4].map(q => `Quý ${q} ${year}`));
        break;
      
      case 2: { // Hiển thị các tháng trong quý hiện tại
        const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
        const startMonth = (currentQuarter - 1) * 3;
        setDisplayItems(
          Array.from({ length: 3 }, (_, i) => {
            const month = new Date(year, startMonth + i, 1);
            return month.toLocaleString('default', { month: 'long' });
          })
        );
        break;
      }
      
      case 3: { // Hiển thị các ngày trong tháng hiện tại
        const daysInMonth = new Date(
          year, 
          currentDate.getMonth() + 1, 
          0
        ).getDate();
        
        setDisplayItems(
          Array.from({ length: daysInMonth }, (_, i) => i + 1)
        );
        break;
      }
      
      default:
        setDisplayItems([]);
    }
  }, [zoomLevel, currentDate]);

  // Xử lý khi click vào một mục
  const handleItemClick = (index) => {
    const year = currentDate.getFullYear();
    
    switch (zoomLevel) {
      case 0: // Chọn năm
        setCurrentDate(new Date(displayItems[index], 0, 1));
        setZoomLevel(1); // Tự động zoom vào quý
        break;
      
      case 1: // Chọn quý
        const quarterStartMonth = index * 3;
        setCurrentDate(new Date(year, quarterStartMonth, 1));
        setZoomLevel(2); // Tự động zoom vào tháng
        break;
      
      case 2: // Chọn tháng
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);
        const monthInYear = currentQuarter * 3 + index;
        setCurrentDate(new Date(year, monthInYear, 1));
        setZoomLevel(3); // Tự động zoom vào ngày
        break;
      
      case 3: // Chọn ngày
        setCurrentDate(new Date(
          year, 
          currentDate.getMonth(), 
          displayItems[index]
        ));
        break;
    }
  };

  return (
    <div 
      id="time-zoom-container"
      style={{
        width: '100%',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        userSelect: 'none'
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => setZoomLevel(prev => Math.max(prev - 1, 0))}
          disabled={zoomLevel === 0}
        >
          Zoom Out
        </button>
        <span style={{ margin: '0 10px' }}>
          {['Năm', 'Quý', 'Tháng', 'Ngày'][zoomLevel]}
        </span>
        <button 
          onClick={() => setZoomLevel(prev => Math.min(prev + 1, 3))}
          disabled={zoomLevel === 3}
        >
          Zoom In
        </button>
      </div>
      
      <div style={{ 
        display: 'flex',
        overflowX: 'auto',
        gap: '10px',
        padding: '10px 0'
      }}>
        {displayItems.map((item, index) => (
          <div
            key={index}
            onClick={() => handleItemClick(index)}
            style={{
              padding: '10px 15px',
              border: '1px solid #eee',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: isItemActive(item, index) ? '#e3f2fd' : 'white',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  // Kiểm tra xem mục có đang được chọn không
  function isItemActive(item, index) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    
    switch (zoomLevel) {
      case 0: return item === year;
      case 1: return index === Math.floor(month / 3);
      case 2: return index === month % 3;
      case 3: return item === date;
      default: return false;
    }
  }
};

export default TimeZoomHeader;