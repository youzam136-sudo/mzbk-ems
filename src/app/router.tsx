import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthSession } from '../features/auth/session/AuthSessionProvider';
import { AuthLayout } from '../shared/layouts/AuthLayout';
import { DashboardLayout } from '../shared/layouts/DashboardLayout';
import { PageDocumentTitle } from '../shared/navigation/PageDocumentTitle';
import { useNavigationPageTitle } from '../shared/navigation/useNavigationPageTitle';
import { PageLoadingFallback } from '../shared/ui/PageLoadingFallback';

const LoginPage = lazy(() => import('../features/auth/login/page/LoginPage').then((module) => ({ default: module.LoginPage })));
const PlantOperationStatusPage = lazy(() =>
  import('../features/dashboard/plant-operation-status/page/PlantOperationStatusPage').then((module) => ({
    default: module.PlantOperationStatusPage
  }))
);
const PlantOperationTotalStatusPage = lazy(() =>
  import('../features/dashboard/plant-operation-status/page/PlantOperationTotalStatusPage').then((module) => ({
    default: module.PlantOperationTotalStatusPage
  }))
);
const BaseGenerationPage = lazy(() =>
  import('../features/dashboard/base-generation/page/BaseGenerationPage').then((module) => ({ default: module.BaseGenerationPage }))
);
const SupportGenerationStatusPage = lazy(() =>
  import('../features/dashboard/support-generation-status/page/SupportGenerationStatusPage').then((module) => ({
    default: module.SupportGenerationStatusPage
  }))
);
const PcsChargeDischargeStatusPage = lazy(() =>
  import('../features/dashboard/pcs-charge-discharge-status/page/PcsChargeDischargeStatusPage').then((module) => ({
    default: module.PcsChargeDischargeStatusPage
  }))
);
const PowerConsumptionStatusPage = lazy(() =>
  import('../features/dashboard/power-consumption-status/page/PowerConsumptionStatusPage').then((module) => ({
    default: module.PowerConsumptionStatusPage
  }))
);
const AcStatusPage = lazy(() =>
  import('../features/dashboard/ac-status/page/AcStatusPage').then((module) => ({
    default: module.AcStatusPage
  }))
);
const GridBaseGenerationHistoryPage = lazy(() =>
  import('../features/history/grid-base-generation-history/page/GridBaseGenerationHistoryPage').then((module) => ({
    default: module.GridBaseGenerationHistoryPage
  }))
);
const SupportGenerationHistoryPage = lazy(() =>
  import('../features/history/support-generation-history/page/SupportGenerationHistoryPage').then((module) => ({
    default: module.SupportGenerationHistoryPage
  }))
);
const PcsChargeDischargeHistoryPage = lazy(() =>
  import('../features/history/pcs-charge-discharge-history/page/PcsChargeDischargeHistoryPage').then((module) => ({
    default: module.PcsChargeDischargeHistoryPage
  }))
);
const PowerConsumptionHistoryPage = lazy(() =>
  import('../features/history/power-consumption-history/page/PowerConsumptionHistoryPage').then((module) => ({
    default: module.PowerConsumptionHistoryPage
  }))
);
const MonitoringResourceHistoryPage = lazy(() =>
  import('../features/history/monitoring-resource-history/page/MonitoringResourceHistoryPage').then((module) => ({
    default: module.MonitoringResourceHistoryPage
  }))
);
const OperationReportPage = lazy(() => import('../pages/report/OperationReportPage').then((module) => ({ default: module.OperationReportPage })));
const MasterManagementPage = lazy(() => import('../pages/admin/MasterManagementPage').then((module) => ({ default: module.MasterManagementPage })));
const CodeManagementPage = lazy(() => import('../pages/admin/CodeManagementPage').then((module) => ({ default: module.CodeManagementPage })));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage').then((module) => ({ default: module.UserManagementPage })));
const RoleManagementPage = lazy(() => import('../pages/admin/RoleManagementPage').then((module) => ({ default: module.RoleManagementPage })));
const PopupSamplesPage = lazy(() => import('../pages/system/PopupSamplesPage').then((module) => ({ default: module.PopupSamplesPage })));
const SearchResultsPage = lazy(() => import('../pages/search/SearchResultsPage').then((module) => ({ default: module.SearchResultsPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

const DEFAULT_DASHBOARD_PATH = '/dashboard/individual';

function AuthOutlet() {
  const { isAuthenticated, isInitializing } = useAuthSession();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? DEFAULT_DASHBOARD_PATH;

  if (isInitializing) {
    return <PageLoadingFallback label="로그인 상태를 확인하는 중입니다." />;
  }

  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  return (
    <AuthLayout>
      <PageDocumentTitle title="로그인" preferMenuTitle={false} />
      <Suspense fallback={<PageLoadingFallback label="로그인 화면을 불러오는 중입니다." />}>
        <Outlet />
      </Suspense>
    </AuthLayout>
  );
}

function DashboardRouteLoadingFallback() {
  const displayTitle = useNavigationPageTitle('화면');

  return <PageLoadingFallback label={`${displayTitle} 화면을 불러오는 중입니다.`} />;
}

function DashboardOutlet() {
  const { isAuthenticated, isInitializing } = useAuthSession();
  const location = useLocation();

// TEMP PREVIEW: PREVIEW_SKIP_AUTH true 이면 로그인 검사를 건너뜁니다. 업체 전달 전 반드시 false로 되돌릴 것.
  const PREVIEW_SKIP_AUTH = true;

  if (isInitializing && !PREVIEW_SKIP_AUTH) {
    return <PageLoadingFallback label="로그인 상태를 확인하는 중입니다." />;
  }

  if (!isAuthenticated && !PREVIEW_SKIP_AUTH) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <DashboardLayout>
      <PageDocumentTitle title="화면" />
      <Suspense fallback={<DashboardRouteLoadingFallback />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>

  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthOutlet />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<DashboardOutlet />}>
        <Route path="/" element={<Navigate to={DEFAULT_DASHBOARD_PATH} replace />} />
        <Route path="/dashboard/plant-operation-status" element={<PlantOperationStatusPage />} />
        <Route path="/dashboard/individual" element={<PlantOperationStatusPage />} />
        <Route path="/dashboard/integrated" element={<PlantOperationTotalStatusPage />} />
        <Route path="/dashboard/base-generation" element={<BaseGenerationPage />} />
        <Route path="/dashboard/support-generation" element={<SupportGenerationStatusPage />} />
        <Route path="/dashboard/charge-discharge" element={<PcsChargeDischargeStatusPage />} />
        <Route path="/dashboard/power-consumption-status" element={<PowerConsumptionStatusPage />} />
        <Route path="/dashboard/ac-status" element={<AcStatusPage />} />
        <Route path="/monitoring/dashboard" element={<PlantOperationStatusPage />} />
        <Route path="/monitoring/dashboard/plant" element={<PlantOperationStatusPage />} />
        <Route path="/monitoring/dashboard/total" element={<PlantOperationTotalStatusPage />} />
        <Route path="/monitoring/grid" element={<BaseGenerationPage />} />
        <Route path="/monitoring/base/plant" element={<BaseGenerationPage />} />
        <Route path="/monitoring/base/total" element={<BaseGenerationPage />} />
        <Route path="/monitoring/ess" element={<SupportGenerationStatusPage />} />
        <Route path="/monitoring/assist" element={<SupportGenerationStatusPage />} />
        <Route path="/monitoring/diesel1" element={<SupportGenerationStatusPage />} />
        <Route path="/monitoring/diesel2" element={<SupportGenerationStatusPage />} />
        <Route path="/monitoring/pcs" element={<PcsChargeDischargeStatusPage />} />
        <Route path="/monitoring/battery" element={<PcsChargeDischargeStatusPage />} />
        <Route path="/monitoring/standby" element={<PcsChargeDischargeStatusPage />} />
        <Route path="/monitoring/ac" element={<AcStatusPage />} />
        <Route path="/monitoring/dispatch" element={<PowerConsumptionStatusPage />} />
        <Route path="/analysis/base/plant/history" element={<GridBaseGenerationHistoryPage />} />
        <Route path="/analysis/base/total/history" element={<GridBaseGenerationHistoryPage />} />
        <Route path="/analysis/assist/history" element={<SupportGenerationHistoryPage />} />
        <Route path="/analysis/standby/history" element={<PcsChargeDischargeHistoryPage />} />
        <Route path="/analysis/dispatch/history" element={<PowerConsumptionHistoryPage />} />
        <Route path="/history/grid" element={<GridBaseGenerationHistoryPage />} />
        <Route path="/history/ess" element={<SupportGenerationHistoryPage />} />
        <Route path="/history/pcs" element={<PcsChargeDischargeHistoryPage />} />
        <Route path="/history/battery" element={<PcsChargeDischargeHistoryPage />} />
        <Route path="/history/diesel1" element={<SupportGenerationHistoryPage />} />
        <Route path="/history/diesel2" element={<SupportGenerationHistoryPage />} />
        <Route path="/history/ac" element={<MonitoringResourceHistoryPage />} />
        <Route path="/history/power-consumption" element={<PowerConsumptionHistoryPage />} />
        <Route path="/history/grid-base-generation-history" element={<GridBaseGenerationHistoryPage />} />
        <Route path="/history/support-generation-history" element={<SupportGenerationHistoryPage />} />
        <Route path="/history/pcs-charge-discharge-history" element={<PcsChargeDischargeHistoryPage />} />
        <Route path="/history/power-consumption-history" element={<PowerConsumptionHistoryPage />} />
        <Route path="/reports/operation" element={<OperationReportPage />} />
        <Route path="/report/daily" element={<OperationReportPage />} />
        <Route path="/report/weekly" element={<OperationReportPage />} />
        <Route path="/report/monthly" element={<OperationReportPage />} />
        <Route path="/report/yearly" element={<OperationReportPage />} />
        <Route path="/report/pcs" element={<OperationReportPage />} />
        <Route path="/report/battery" element={<OperationReportPage />} />
        <Route path="/report/diesel1" element={<OperationReportPage />} />
        <Route path="/report/diesel2" element={<OperationReportPage />} />
        <Route path="/report/grid" element={<OperationReportPage />} />
        <Route path="/report/ess" element={<OperationReportPage />} />
        <Route path="/report/ac" element={<OperationReportPage />} />
        <Route path="/excel" element={<OperationReportPage />} />
        <Route path="/admin/master" element={<MasterManagementPage />} />
        <Route path="/admin/code" element={<CodeManagementPage />} />
        <Route path="/admin/user" element={<UserManagementPage />} />
        <Route path="/admin/role" element={<RoleManagementPage />} />
        <Route path="/master/plants" element={<MasterManagementPage />} />
        <Route path="/master/pcs" element={<MasterManagementPage />} />
        <Route path="/master/inverters" element={<MasterManagementPage />} />
        <Route path="/master/batteries" element={<MasterManagementPage />} />
        <Route path="/master/diesels" element={<MasterManagementPage />} />
        <Route path="/system/roles" element={<RoleManagementPage />} />
        <Route path="/system/menus" element={<RoleManagementPage />} />
        <Route path="/system/users" element={<UserManagementPage />} />
        <Route path="/system/codes" element={<CodeManagementPage />} />
        <Route path="/system/popups" element={<PopupSamplesPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
      </Route>

      <Route
        path="*"
        element={
          <Suspense fallback={<DashboardRouteLoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
