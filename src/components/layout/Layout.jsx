import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";

function Layout() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16"> 
        <Outlet />
      </div>
      
      {/* 네비게이션 바 */}
      <Navbar />
    </div>
  );
}

export default Layout;
