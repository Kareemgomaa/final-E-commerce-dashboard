/** @format */

import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://nti-ecommerce.vercel.app/api/v1/coupons";

export default function Coupons() {
  const TOKEN = localStorage.getItem("userToken");
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [code, setCode] = useState("");
  const [expires, setExpires] = useState("");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCoupons = async () => {
    try {
      let all = [];
      let page = 1;
      while (true) {
        const res = await axios.get(`${API}?page=${page}`, {
          headers: { token: TOKEN },
        });
        const fetched = res?.data?.coupons ?? [];
        all = [...all, ...fetched];
        if (fetched.length < 5) break;
        page++;
      }
      setCoupons(all);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      setCoupons([]);
    }
  };

  useEffect(() => {
    getCoupons();
  }, []);

  const resetModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setCode("");
    setExpires("");
    setDiscount("");
    setError("");
  };

  const validate = () => {
    if (!code.trim()) {
      setError("Coupon code is required.");
      return false;
    }
    if (!expires) {
      setError("Expiry date is required.");
      return false;
    }
    if (discount === "" || isNaN(discount)) {
      setError("Discount percentage is required.");
      return false;
    }
    if (discount < 0 || discount > 100) {
      setError("Discount must be between 0–100.");
      return false;
    }
    return true;
  };

  const addCoupon = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(
        API,
        { code, expires, discount: Number(discount) },
        { headers: { token: TOKEN } },
      );
      resetModal();
      await getCoupons();
    } catch (err) {
      console.error("addCoupon error:", err);
      const serverErr = err?.response?.data?.err || "";
      if (serverErr.includes("dup key")) {
        setError("A coupon with this code already exists.");
      } else {
        setError(err?.response?.data?.message || "Failed to add coupon.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { token: TOKEN },
      });
      await getCoupons();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setExpires(coupon.expires?.slice(0, 10));
    setDiscount(coupon.discount);
    setError("");
    setShowModal(true);
  };

  const updateCoupon = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      await axios.put(
        `${API}/${editingCoupon._id}`,
        { code, expires, discount: Number(discount) },
        { headers: { token: TOKEN } },
      );
      resetModal();
      await getCoupons();
    } catch (err) {
      console.error("updateCoupon error:", err);
      const serverErr = err?.response?.data?.err || "";
      if (serverErr.includes("dup key")) {
        setError("A coupon with this code already exists.");
      } else {
        setError(err?.response?.data?.message || "Failed to update coupon.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            {coupons?.length} coupon{coupons?.length === 1 ? "" : "s"} total
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
          Add Coupon
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Expires</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  No coupons yet. Add one!
                </td>
              </tr>
            )}
            {coupons?.map((coupon) => (
              <tr
                key={coupon._id}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-blue-600">
                  {coupon.discount}%
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(coupon.expires).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {isExpired(coupon.expires) ? (
                    <span className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-full">
                      Expired
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-600 rounded-full">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon._id)}
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
                {editingCoupon ? " Update Coupon" : " New Coupon"}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-2.5 rounded-xl mb-5 transition font-mono"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Discount % <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-5">
              <input
                type="number"
                placeholder="e.g. 20"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-2.5 rounded-xl transition pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                %
              </span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none p-2.5 rounded-xl mb-5 transition"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={editingCoupon ? updateCoupon : addCoupon}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition active:scale-95 ${
                  editingCoupon
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading
                  ? "Saving..."
                  : editingCoupon
                    ? "Update"
                    : "Add Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
