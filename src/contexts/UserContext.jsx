import { createContext, useState } from "react";

export const User = createContext();

export default function UserProvider({ children }) {
  const [userToken, setUserToken] = useState(localStorage.getItem("userToken") || null);

  const [categoriesAllData, setCategoriesAllData] = useState([]);
  const [categoriesPageData, setCategoriesPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <User.Provider
      value={{
        userToken,
        setUserToken,
        categoriesAllData,
        setCategoriesAllData,
        categoriesPageData,
        setCategoriesPageData,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </User.Provider>
  );
}