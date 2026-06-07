import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

const OverviewPage = lazy(() => import('@/modules/overview/OverviewPage'));
const ScriptGeneratorPage = lazy(() => import('@/modules/script/ScriptGeneratorPage'));
const EditorialQueuePage = lazy(() => import('@/modules/editorial/EditorialQueuePage'));
const LocalizationPage = lazy(() => import('@/modules/localization/LocalizationPage'));

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="/script-generator" element={<ScriptGeneratorPage />} />
          <Route path="/editorial" element={<EditorialQueuePage />} />
          <Route path="/editorial/:id" element={<EditorialQueuePage />} />
          <Route path="/localization" element={<LocalizationPage />} />
          <Route path="/localization/:id" element={<LocalizationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
