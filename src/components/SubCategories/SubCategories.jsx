/** @format */

import React, { useEffect, useState } from "react";
import axios from "axios";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ik9tbmlhbXNhbGFtYTI1QGdtYWlsLmNvbSIsIm5hbWUiOiJPbW5pYSBTYWxhbWEiLCJpZCI6IjY5YjVjNDI1MjUwZGIwNzk0YWU1NDllMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczNTM2NzM3fQ.x6QinFFi4ovrxYVKEQzptSySJFEydWKcE3XdsWSp0Gs";
const API = "https://nti-ecommerce.vercel.app/api/v1/subcategories";
const CATEGORIES_API = "https://nti-ecommerce.vercel.app/api/v1/categories";

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryImage, setSubCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getSubCategories = async () => {
    try {
      let all = [];
      let page = 1;
      while (true) {
        const res = await axios.get(`${API}?page=${page}`, {
          headers: { token: TOKEN },
        });
        const fetched = res?.data?.categories ?? [];
        all = [...all, ...fetched];
        if (fetched.length < 5) break;
        page++;
      }
      setSubCategories(all);
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
      setSubCategories([]);
    }
  };

  const getCategories = async () => {
    try {
      let all = [];
      let page = 1;
      while (true) {
        const res = await axios.get(`${CATEGORIES_API}?page=${page}`, {
          headers: { token: TOKEN },
        });
        const fetched = res?.data?.categories ?? [];
        all = [...all, ...fetched];
        if (fetched.length < 5) break;
        page++;
      }
      setCategories(all);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    getSubCategories();
    getCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSubCategoryImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingSubCategory(null);
    setSubCategoryName("");
    setSelectedCategory("");
    setSubCategoryImage(null);
    setImagePreview(null);
    setError("");
  };
  const addSubCategory = async () => {
    if (!subCategoryName.trim()) {
      setError("Name is required.");
      return;
    }
    if (!selectedCategory) {
      setError("Please select a parent category.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(
        API,
        { name: subCategoryName, category: selectedCategory }, // ✅ plain JSON
        { headers: { token: TOKEN } },
      );

      resetModal();
      await getSubCategories();
    } catch (err) {
      console.error("addSubCategory error:", err);
      const status = err?.response?.status;
      const serverErr = err?.response?.data?.err || "";
      const message = err?.response?.data?.message || "";

      if (status === 409 || serverErr.includes("dup key")) {
        setError("A subcategory with this name already exists.");
      } else {
        setError(message || serverErr || "Failed to add subcategory.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { token: TOKEN },
      });
      await getSubCategories();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const openEditModal = (sub) => {
    setEditingSubCategory(sub);
    setSubCategoryName(sub.name);
    setSelectedCategory(sub.category?._id || sub.category || "");
    setSubCategoryImage(null);
    setImagePreview(sub.image || null);
    setError("");
    setShowModal(true);
  };

  const updateSubCategory = async () => {
    if (!subCategoryName.trim()) {
      setError("Name is required.");
      return;
    }
    if (!selectedCategory) {
      setError("Please select a parent category.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", subCategoryName);
      formData.append("category", selectedCategory);
      if (subCategoryImage) formData.append("image", subCategoryImage);

      await axios.put(`${API}/${editingSubCategory._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: TOKEN,
        },
      });

      resetModal();
      await getSubCategories();
    } catch (err) {
      console.error("updateSubCategory error:", err);
      const serverErr = err?.response?.data?.err || "";
      if (serverErr.includes("dup key")) {
        setError("A subcategory with this name already exists.");
      } else {
        setError(
          err?.response?.data?.message || "Failed to update subcategory.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sub Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            {subCategories?.length} subcategor
            {subCategories?.length === 1 ? "y" : "ies"} total
          </p>
        </div>
        <button
          onClick={() => {
            resetModal();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-medium shadow-sm"
        >
          <span className="text-lg leading-none">
            {" "}
            <i className="fa-solid fa-plus"></i>
          </span>{" "}
          Add Sub Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Parent Category</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subCategories?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No subcategories yet. Add one!
                </td>
              </tr>
            )}
            {subCategories?.map((sub) => (
              <tr
                key={sub._id}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  {sub.image ? (
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {sub.name}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {sub.category?.name || sub.category || "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-amber-400 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button
                      onClick={() => deleteSubCategory(sub._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <i className="fa-regular fa-trash-can"></i> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-700/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                {editingSubCategory
                  ? " Update Sub Category"
                  : " New Sub Category"}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Name Input */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sub Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Laptops"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none p-2.5 rounded-xl mb-5 transition"
            />

            {/* Parent Category Dropdown */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none p-2.5 rounded-xl mb-5 transition bg-white"
            >
              <option value="">-- Select a category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Image Upload */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-4 cursor-pointer transition mb-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-xl mb-2"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-3xl mb-1">📁</div>
                  <div className="text-sm">Click to upload image</div>
                </div>
              )}
              <input
                type="file"
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </label>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={
                  editingSubCategory ? updateSubCategory : addSubCategory
                }
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition active:scale-95 ${
                  editingSubCategory
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading ? "Saving..." : editingSubCategory ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
