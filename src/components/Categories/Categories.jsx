/** @format */

import React, { useEffect, useState } from "react";
import axios from "axios";


const API = "https://nti-ecommerce.vercel.app/api/v1/categories";

export default function Categories() {
  const TOKEN = localStorage.getItem("userToken");
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCategories = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          token: TOKEN,
        },
      });
      console.log("GET response:", res.data);
      setCategories(res?.data?.categories ?? []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCategoryImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setImagePreview(null);
    setError("");
  };

  const addCategory = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }
    if (!categoryImage) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", categoryName);
      formData.append("image", categoryImage);

      await axios.post(API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: TOKEN,
        },
      });

      resetModal();
      await getCategories();
    } catch (err) {
      console.error("addCategory error:", err);
      const serverErr = err?.response?.data?.err || "";
      if (serverErr.includes("dup key")) {
        setError("A category with this name already exists.");
      } else {
        setError(err?.response?.data?.message || "Failed to add category.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { token: TOKEN },
      });
      await getCategories();
    } catch (err) {
      console.error("deleteCategory error:", err);
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryImage(null);
    setImagePreview(cat.image || null);
    setError("");
    setShowModal(true);
  };

  const updateCategory = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", categoryName);
      if (categoryImage) formData.append("image", categoryImage);

      await axios.put(`${API}/${editingCategory._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: TOKEN,
        },
      });

      resetModal();
      await getCategories();
    } catch (err) {
      console.error("updateCategory error:", err);
      const serverErr = err?.response?.data?.err || "";
      if (serverErr.includes("dup key")) {
        setError("A category with this name already exists.");
      } else {
        setError(err?.response?.data?.message || "Failed to update category.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories?.length} categor{categories?.length === 1 ? "y" : "ies"}{" "}
            total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryName("");
            setCategoryImage(null);
            setImagePreview(null);
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-medium shadow-sm"
        >
          <span className="text-lg leading-none">
            <i className="fa-solid fa-plus"></i>
          </span>{" "}
          Add Category
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories?.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">
                  No categories yet. Add one!
                </td>
              </tr>
            )}
            {categories?.map((cat) => (
              <tr
                key={cat._id}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {cat.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-amber-500 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <i class="fa-solid fa-pencil"></i>Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(cat._id)}
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

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-500/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                {editingCategory ? " Update Category" : " New Category"}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                <i class="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Electronics"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full border border-gray-300 focus:ring-2outline-none p-2.5 rounded-xl mb-5 transition"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category Image <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer transition mb-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-xl mb-2"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-3xl mb-1"><i class="fa-regular fa-folder"></i></div>
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

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={editingCategory ? updateCategory : addCategory}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition active:scale-95 ${
                  editingCategory
                    ? "bg-amber-500 hover:bg-amber-700"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading
                  ? "Saving..."
                  : editingCategory
                    ? "Update"
                    : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
