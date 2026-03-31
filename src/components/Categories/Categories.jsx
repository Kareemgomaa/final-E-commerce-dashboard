/** @format */

import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../Pagination/Pagination";

const ITEMS_PER_PAGE = 5;

export default function Categories() {
  const TOKEN = localStorage.getItem("userToken");
  const API = "https://nti-ecommerce.vercel.app/api/v1/categories";

  const [allCategories, setAllCategories] = useState([]);
  const [pageCategories, setPageCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let all = [];
      let page = 1;

      while (true) {
        const res = await axios.get(`${API}?page=${page}`, {
          headers: { token: TOKEN },
        });

        const fetched = res?.data?.categories || [];
        all = [...all, ...fetched];
        if (fetched.length < ITEMS_PER_PAGE) break;
        page += 1;
      }

      setAllCategories(all);
      const pages = Math.ceil(all.length / ITEMS_PER_PAGE);
      setTotalPages(pages);
      if (currentPage > pages && pages > 0) {
        setCurrentPage(pages);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPageCategories(allCategories.slice(startIndex, endIndex));
  }, [allCategories, currentPage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setImagePreview(null);
    setError("");
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return setError("Name is required.");
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", categoryName);
      if (categoryImage) formData.append("image", categoryImage);

      const url = editingCategory ? `${API}/${editingCategory._id}` : API;
      const method = editingCategory ? "put" : "post";

      await axios[method](url, formData, {
        headers: { token: TOKEN, "Content-Type": "multipart/form-data" },
      });

      resetModal();
      await fetchCategories(); 
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`, { headers: { token: TOKEN } });
      await fetchCategories(); 
    } catch (err) {
      alert("Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setImagePreview(category.image);
    setCategoryImage(null);
    setShowModal(true);
    setError("");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800">Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95"
        >
          Add New
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Image
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td
                  colSpan="3"
                  className="py-20 text-center text-gray-400 animate-pulse"
                >
                  Loading...
                </td>
              </tr>
            ) : pageCategories.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="py-20 text-center text-gray-400 font-medium"
                >
                  No categories found.
                </td>
              </tr>
            ) : (
              pageCategories.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2.5 text-amber-500 bg-amber-50 hover:bg-amber-100 rounded-xl mr-2 transition-all"
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-800 mb-6">
              {editingCategory ? "Update Category" : "New Category"}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border-l-4 border-red-500">
                {error}
              </div>
            )}

            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 ring-green-500/20 outline-none transition-all mb-6"
              placeholder="e.g. Electronics"
            />

            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden mb-8">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2"></i>
                  <p className="text-xs font-bold">Select File</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={resetModal}
                className="flex-1 py-3.5 text-gray-500 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                disabled={loading}
                className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {loading ? "Processing..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
