import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingOverlay from './components/common/LoadingOverlay';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SchedulePage = React.lazy(() => import('./pages/SchedulePage'));
const StoragePage = React.lazy(() => import('./pages/StoragePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const UpcomingItemsPage = React.lazy(() => import('./pages/UpcomingItemsPage'));
const ImportantItemsPage = React.lazy(
  () => import('./pages/ImportantItemsPage'),
);
const StaleItemsPage = React.lazy(() => import('./pages/StaleItemsPage'));
const TrashPage = React.lazy(() => import('./pages/TrashPage'));
const ItemEditorPage = React.lazy(() => import('./pages/ItemEditorPage'));
const ItemViewerPage = React.lazy(() => import('./pages/ItemViewerPage'));
const NotificationPage = React.lazy(() => import('./pages/NotificationPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <div className="h-screen bg-neutral-950 grid place-items-center font-family-sans">
      <div className="w-full max-w-[390px] h-full bg-bg-main shadow-2xl overflow-hidden relative border-x border-neutral-800">
        <Suspense fallback={<LoadingOverlay />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/notification" element={<NotificationPage />} />

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
        </Suspense>
      </div>
    </div>
  );
}
