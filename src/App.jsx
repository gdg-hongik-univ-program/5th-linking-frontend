import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import StoragePage from './pages/StoragePage';
import ProfilePage from './pages/ProfilePage';
import UpcomingItemsPage from './pages/UpcomingItemsPage';
import ImportantItemsPage from './pages/ImportantItemsPage';
import StaleItemsPage from './pages/StaleItemsPage';
import TrashPage from './pages/TrashPage';
import ItemEditorPage from './pages/ItemEditorPage';
import ItemViewerPage from './pages/ItemViewerPage';
import NotificationPage from './pages/NotificationPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <div className="h-screen bg-neutral-950 grid place-items-center font-family-sans">
      <div className="w-full max-w-[390px] h-full bg-bg-main shadow-2xl overflow-hidden relative border-x border-neutral-800">
        <Routes>
          {/* NavigationBar 제외 페이지 */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/notification" element={<NotificationPage />} />

          {/* NavigationBar 포함 페이지 (Layout 내부) */}
          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/upcoming" element={<UpcomingItemsPage />} />
            <Route path="/important" element={<ImportantItemsPage />} />
            <Route path="/stale" element={<StaleItemsPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/storage/:folderId" element={<StoragePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create" element={<ItemEditorPage />} />
            <Route path="/edit/:itemId" element={<ItemEditorPage />} />
            <Route path="/view/:itemId" element={<ItemViewerPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}
