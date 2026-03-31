/** @format */

import { useContext } from "react";
import { User } from "../../contexts/UserContext.jsx";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { userToken } = useContext(User);
  if (!userToken) return <Navigate to="/login" replace />;
  return children;
}
