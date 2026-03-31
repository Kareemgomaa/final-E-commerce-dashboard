import axios from "axios";

const ITEMS_PER_PAGE = 5;

export function customerFetch(setAllData, setPageData, page = 1) {
  axios
    .get("https://nti-ecommerce.vercel.app/api/v1/categories", {
      headers: { token: localStorage.getItem("userToken") },
    })
    .then((response) => {
      const data = response.data.data || [];

      setAllData(data);

      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setPageData(data.slice(start, end));
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}