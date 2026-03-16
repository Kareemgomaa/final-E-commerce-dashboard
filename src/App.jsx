import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "./components/AuthLayout/AuthLayout";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Layout from "./components/Layout/Layout.jsx";
import Categories from "./components/Categories/Categories";
import SubCategories from "./components/SubCategories/SubCategories";
import Brands from "./components/Brands/Brands";
import Products from "./components/Products/Products";
import Coupons from "./components/Coupons/Coupons";
import Orders from "./components/Orders/Orders";
import "../node_modules/flowbite/dist/flowbite.min.js";

let routes = createBrowserRouter([
  {
    path: "",
    element: <AuthLayout />,
    errorElement: <div className="h-screen flex items-center justify-center text-2xl font-bold">404 - Page Not Found</div>,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "dashboard",
    element: <Layout />,
    errorElement: <div className="h-screen flex items-center justify-center text-2xl font-bold">Dashboard Error - Return to <a href="/dashboard" className="text-blue-500 ml-2">Home</a></div>,
    children: [
      { index: true, element: <Categories /> },
      { path: "subcategories", element: <SubCategories /> },
      { path: "brands", element: <Brands /> },
      { path: "products", element: <Products /> },
      { path: "coupons", element: <Coupons /> },
      { path: "orders", element: <Orders /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
