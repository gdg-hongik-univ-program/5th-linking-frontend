import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // 공통으로 쓰는 텍스트 스타일
  const linkStyle = "flex flex-col items-center gap-1 w-12";
  const textStyle = (path) => 
    `text-xs font-medium ${isActive(path) ? 'text-brand-text-main' : 'text-brand-text-sub'}`;

  return (
    <nav className="fixed bottom-0 w-full max-w-[390px] h-[60px] bg-brand-nav border-t border-brand-border z-50">
      <div className="relative w-full h-full flex justify-between items-center px-6">
        
        {/* 왼쪽 */}
        <div className="flex gap-8">
          <Link to="/home" className={linkStyle}>
            <span className={textStyle('/home')}>홈</span>
          </Link>
          <Link to="/folder" className={linkStyle}>
            <span className={textStyle('/folder')}>폴더</span>
          </Link>
        </div>

        {/* 중앙 링크 추가 버튼 */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-3">
          <button className="w-14 h-14 bg-brand-bg border border-brand-text-main rounded-full flex justify-center items-center shadow-lg">
             {/* 임시로 가져다 사용하는 플러스 아이콘 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="#E6E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 오른쪽 */}
        <div className="flex gap-8">
          <Link to="/schedule" className={linkStyle}>
            <span className={textStyle('/schedule')}>일정</span>
          </Link>
          <Link to="/profile" className={linkStyle}>
            <span className={textStyle('/profile')}>프로필</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
