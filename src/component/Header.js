import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRegBell } from 'react-icons/fa';


// Hook để xử lý click bên ngoài component
const useClickOutside = (ref, callback) => {
  React.useEffect(() => {
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

const Header = ({ title, showBackButton = true }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => {
    setShowMenu(false);
  });

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full bg-white shadow-md px-3 sm:px-4 py-2 sm:py-3 mt-3 md:mt-0">
      <div className="flex justify-between items-center gap-2">
        {/* Nút back - chỉ hiển thị nếu showBackButton là true */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            aria-label="Quay lại"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Nếu không có nút back, chúng ta vẫn giữ một khoảng trống để căn đều */}
        {!showBackButton && <div></div>}

        {/* Tiêu đề */}
        {title && (
          <h1 className="flex-1 text-left font-bold text-gray-800 text-sm md:text-base px-2">
            {title}
          </h1>
        )}

        {/* Nhóm icon bên phải */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Thông báo</span>
          <FaRegBell />
          <span></span>
          <div className="inline-block" ref={menuRef}>
            <button
              className="bg-red-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center"
              onClick={() => setShowMenu(!showMenu)}
            >
              {/* Hiển thị chữ cái đầu của tên user nếu có */}
              {user && user.TenTaiKhoan ? user.TenTaiKhoan.charAt(0) : 'U'}
            </button>
            {showMenu && (
              <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    if (onLogout) onLogout();
                    navigate('/login');
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;