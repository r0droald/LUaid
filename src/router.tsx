import { createBrowserRouter, Navigate, useParams, useLocation } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { lazyWithReload } from "@/lib/lazy-reload";
import LandingPage from "./pages/LandingPage";

const ReliefMapPage = lazyWithReload(() => import("./pages/ReliefMapPage"));
const TransparencyPage = lazyWithReload(() => import("./pages/TransparencyPage"));
const ReportPage = lazyWithReload(() => import("./pages/ReportPage"));
const LoginPage = lazyWithReload(() => import("./pages/LoginPage"));
const AuthCallbackPage = lazyWithReload(() => import("./pages/AuthCallbackPage"));

function LegacyLocaleRedirect() {
  const { locale } = useParams<{ locale: string }>();
  const { pathname, search, hash } = useLocation();
  const suffix = pathname.replace(/^\/[^/]+/, "");
  return <Navigate to={`/demo/${locale ?? "en"}${suffix}${search}${hash}`} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  {
    path: "/demo/:locale",
    element: <RootLayout />,
    children: [
      { index: true, element: <ReliefMapPage /> },
      { path: "dashboard", element: <TransparencyPage /> },
      { path: "transparency", element: <Navigate to="../dashboard" replace /> },
      { path: "report", element: <ReportPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  {
    path: "/:locale",
    children: [
      { index: true, element: <LegacyLocaleRedirect /> },
      { path: "dashboard", element: <LegacyLocaleRedirect /> },
      { path: "transparency", element: <LegacyLocaleRedirect /> },
      { path: "report", element: <LegacyLocaleRedirect /> },
      { path: "login", element: <LegacyLocaleRedirect /> },
    ],
  },
]);
