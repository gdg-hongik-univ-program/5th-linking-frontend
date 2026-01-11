import { Link, useLocation } from "react-router-dom";
import HomeIcon from '../../assets/home.svg?react';
import ScheduleIcon from '../../assets/schedule.svg?react';
import StorageIcon from '../../assets/storage.svg?react';
import ProfileIcon from '../../assets/profile.svg?react';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const linkStyle = "flex flex-col items-center gap-1 w-12 p-2 min-h-[48px]";
  const iconStyle = (path) => 
  `w-6 h-6 fill-current ${isActive(path) ? 'text-[#E6E6E6]' : 'text-[#505050]'}`;
  
  return (
    <nav className="fixed bottom-0 w-full max-w-[390px] h-[80px] pt-4 pb-6 bg-brand-nav border-t border-brand-border z-50">
      <div className="relative w-full h-full flex justify-between items-center px-6">
        {/* 왼쪽 */}
        <div className="flex gap-8">
          <Link to="/home" className={linkStyle}>
            <HomeIcon className={iconStyle('/home')} />
          </Link>
          <Link to="/schedule" className={linkStyle}>
            <ScheduleIcon className={iconStyle('/schedule')} />
          </Link>
        </div>

        {/* 중앙 플로팅 버튼 */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <button className="w-14 h-14 bg-brand-key text-white rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:shadow-[0_0_30px_rgba(255,215,0,0.7)] active:scale-95 active:shadow-lg transition-all duration-200 border-0 outline-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="#E6E6E6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="#E6E6E6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 오른쪽 */}
        <div className="flex gap-8">
          <Link to="/storage" className={linkStyle}>
            <StorageIcon className={iconStyle('/storage')} />
          </Link>
          <Link to="/profile" className={linkStyle}>
            <ProfileIcon className={iconStyle('/profile')} />
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
