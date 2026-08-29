import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MainLayout from "@/layouts/MainLayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Items from "@/pages/Items";
import Transactions from "@/pages/Transactions";
import GroceryLists from "@/pages/GroceryLists";
import Stores from "@/pages/Stores";
import Brands from "@/pages/Brands";
import Categories from "@/pages/Categories";
import ProtectedRoute from "./ProtectedRoute";
import GroceryListDetail from "@/pages/GroceryListDetail";
import { ThemeProvider } from "@emotion/react";
import { theme } from "../theme";
import UnitOfMeasures from "@/pages/UnitOfMeasures";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Items /> },
      {
        path: "/dashboard",
        element: (
          <ThemeProvider theme={theme}>
            <Dashboard />
          </ThemeProvider>
        ),
      },
      { path: "/transactions", element: <Transactions /> },
      { path: "/grocery-lists", element: <GroceryLists /> },
      { path: "/grocery-lists/:id", element: <GroceryListDetail /> },
      { path: "/stores", element: <Stores /> },
      { path: "/brands", element: <Brands /> },
      { path: "/categories", element: <Categories /> },
      { path: "/uom", element: <UnitOfMeasures /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
