import React from "react";
import styles from "./BlankLayout.module.css";
import { Outlet } from "react-router-dom";

export default function BlankLayout() {
  return <div>
    <Outlet></Outlet>
  </div>;
}
