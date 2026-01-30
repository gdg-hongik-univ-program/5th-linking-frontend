import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import StoragePage from './pages/StoragePage';
import ProfilePage from './pages/ProfilePage';
import UpcomingLinksPage from './pages/UpcomingLinksPage';
import ImportantLinksPage from './pages/ImportantLinksPage';
import StaleLinksPage from './pages/StaleLinksPage';
import TrashPage from './pages/TrashPage';
import LinkEditorPage from './pages/LinkEditorPage';
import LinkViewerPage from './pages/LinkViewerPage';

function App() {
  return (
    <div className="h-screen bg-neutral-950 grid place-items-center font-family-sans">
      <div className="w-full max-w-[390px] h-full bg-bg-main shadow-2xl overflow-hidden relative border-x border-neutral-800">
        <Routes>
          {/* NavBar 없는 페이지들 */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/create" element={<LinkEditorPage />} />
          <Route path="/edit/:itemId" element={<LinkEditorPage />} />
          <Route path="/link/:itemId" element={<LinkViewerPage />} />

          {/* NavBar 포함 레이아웃 */}
          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/deadline" element={<UpcomingLinksPage />} />
            <Route path="/important" element={<ImportantLinksPage />} />
            <Route path="/cleanup" element={<StaleLinksPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
