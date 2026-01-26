import { Outlet } from 'react-router-dom';
import NavigationBar from '../common/NavigationBar';

function Layout() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </div>
      <NavigationBar />
    </div>
  );
}

export default Layout;
