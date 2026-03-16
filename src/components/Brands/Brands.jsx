/** @format */

import React, { useEffect, useState } from "react";
import axios from "axios";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ik9tbmlhbXNhbGFtYTI1QGdtYWlsLmNvbSIsIm5hbWUiOiJPbW5pYSBTYWxhbWEiLCJpZCI6IjY5YjVjNDI1MjUwZGIwNzk0YWU1NDllMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczNTM4NjAyfQ.07LBrh5WRKRISXltZca7GVeulsxn1P1tFjmii7dko3c";
const API = "https://nti-ecommerce.vercel.app/api/v1/brands";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getBrands = async () => {
    try {
      let all = [];
      let page = 1;
      while (true) {
        const res = await axios.get(`${API}?page=${page}`, {
          headers: { token: TOKEN },
        });
        const fetched = res?.data?.brands ?? [];
        all = [...all, ...fetched];
        if (fetched.length < 5) break;
        page++;
      }
      setBrands(all);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      setBrands([]);
    }
  };

  useEffect(() => {
    getBrands();
  }, []);

  const resetModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setBrandName("");
    setError("");
  };

  const addBrand = async () => {
    if (!brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(API, { name: brandName }, { headers: { token: TOKEN } });
      resetModal();
      await getBrands();
    } catch (err) {
      const status = err?.response?.status;
      const serverErr = err?.response?.data?.err || "";
      const message = err?.response?.data?.message || "";
      if (status === 409 || serverErr.includes("dup key")) {
        setError("A brand with this name already exists.");
      } else {
        setError(message || "Failed to add brand.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const deleteBrand = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { token: TOKEN },
      });
      await getBrands();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────
  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setError("");
    setShowModal(true);
  };

  // ── Update ───────────────────────────────────────────────────────
  const updateBrand = async () => {
    if (!brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.put(
        `${API}/${editingBrand._id}`,
        { name: brandName },
        { headers: { token: TOKEN } },
      );
      resetModal();
      await getBrands();
    } catch (err) {
      const status = err?.response?.status;
      const serverErr = err?.response?.data?.err || "";
      const message = err?.response?.data?.message || "";
      if (status === 409 || serverErr.includes("dup key")) {
        setError("A brand with this name already exists.");
      } else {
        setError(message || "Failed to update brand.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">
            {brands?.length} brand{brands?.length === 1 ? "" : "s"} total
          </p>
        </div>
        <button
          onClick={() => {
            resetModal();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-medium shadow-sm"
        >
          <i className="fa-solid fa-plus"></i> Add Brand
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brands?.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">
                  <i className="fa-solid fa-tag text-3xl mb-2 block"></i>
                  No brands yet. Add one!
                </td>
              </tr>
            )}
            {brands?.map((brand, index) => (
              <tr
                key={brand._id}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {brand.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button
                      onClick={() => deleteBrand(brand._id)}
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
          className="fixed inset-0 bg-gray-700/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                {editingBrand ? (
                  <>
                    <i className="fa-solid fa-pen-to-square text-amber-500 mr-2"></i>
                    Update Brand
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus text-green-500 mr-2"></i>New
                    Brand
                  </>
                )}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Nike"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none p-2.5 rounded-xl mb-5 transition"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition"
              >
                <i className="fa-solid fa-xmark mr-2"></i>Cancel
              </button>
              <button
                onClick={editingBrand ? updateBrand : addBrand}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                  editingBrand
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : editingBrand ? (
                  <>
                    <i className="fa-solid fa-pen-to-square mr-2"></i>Update
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus mr-2"></i>Add Brand
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
