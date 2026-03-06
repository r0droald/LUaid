import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { DashboardPage } from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/en" replace />,
  },
  {
    path: "/:locale",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
]);
