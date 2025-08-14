import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '../components/Common/PageLoader';
import { ChunkErrorBoundary } from '../components/Common/ChunkErrorBoundary';

// Lazy load pages
const Journal = lazy(() => import('../pages/Journal'));
const EquityCurve = lazy(() => import('../pages/EquityCurve'));
const Analysis = lazy(() => import('../pages/Analysis'));
const ChartBook = lazy(() => import('../pages/ChartBook'));
const Import = lazy(() => import('../pages/Import'));
const Settings = lazy(() => import('../pages/Settings'));

export const AppRouter = () => {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/journal" element={<Journal />} />
          <Route path="/equity-curve" element={<EquityCurve />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/chartbook" element={<ChartBook />} />
          <Route path="/chart-book" element={<Navigate to="/chartbook" replace />} />
          <Route path="/import" element={<Import />} />
          <Route path="/settings" element={<Settings />} />
          {/* 이전 경로 호환성을 위한 리다이렉트 */}
          <Route path="/today-trading" element={<Navigate to="/journal" replace />} />
          {/* 기본 경로는 journal로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/journal" replace />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
};