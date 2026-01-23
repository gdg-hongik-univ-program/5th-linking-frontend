import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Layout from './components/layout/Layout';
import SignupPage from './pages/SignupPage';
import DeadlinePage from './pages/DeadlinePage';
import TrashPage from './pages/TrashPage';
import ProfilePage from './pages/ProfilePage';
import SchedulePage from './pages/SchedulePage';
import ImportantPage from './pages/ImportantPage';
import CleanUpPage from './pages/CleanUpPage';
import StoragePage from './pages/StoragePage';

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 flex justify-center items-center font-family-sans">
      <div className="w-full max-w-[390px] min-h-screen bg-bg-main shadow-2xl overflow-hidden relative border-x border-neutral-800">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />

            <Route path="/deadline" element={<DeadlinePage />} />
            <Route path="/important" element={<ImportantPage />} />
            <Route path="/cleanup" element={<CleanUpPage />} />
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
