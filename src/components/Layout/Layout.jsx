/** @format */

import React from "react";
import Navbar from "./../Navbar/Navbar.jsx";
import { Link, Outlet, NavLink } from "react-router-dom";

const navItems = [
  { label: "Category", path: ".", icon: "fa-solid fa-list" },
  {
    label: "Sub Category",
    path: "subcategories",
    icon: "fa-solid fa-sitemap",
  },
  { label: "Brands", path: "brands", icon: "fa-solid fa-tag" },
  { label: "Coupons", path: "coupons", icon: "fa-solid fa-ticket" },
  { label: "Products", path: "products", icon: "fa-solid fa-box" },
  { label: "Orders", path: "orders", icon: "fa-solid fa-bag-shopping" },
];
export default function Layout() {
  return (
    <>
      <Navbar />
      <aside
        id="top-bar-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-full transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-neutral-primary-soft border-e border-default">
          <div className="flex items-center ps-2.5 mb-5">
            <span className="self-center text-lg text-blue-500 font-semibold whitespace-nowrap">
              Admin Dashboard
            </span>
          </div>

          <ul className="space-y-2 font-medium">
            {navItems.map(({ label, path, icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-1.5 rounded-base transition-colors group ${isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-body hover:bg-neutral-tertiary hover:text-fg-brand"
                    }`
                  }
                >
                  <i
                    className={`${icon} w-5 text-center transition duration-75`}
                  ></i>
                  <span className="ms-3 whitespace-nowrap">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="p-4 sm:ml-64 mt-14">
        <Outlet />
      </div>
    </>
  );
}
