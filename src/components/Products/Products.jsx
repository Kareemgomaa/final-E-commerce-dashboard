import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddProductModal from './AddProductModal';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const getProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('https://nti-ecommerce.vercel.app/api/v1/products');
      setProducts(data.Products || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://nti-ecommerce.vercel.app/api/v1/products/${productId}`, {
          headers: {
            token: localStorage.getItem('userToken'),
          },
        });
        getProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              {products?.length} product{products?.length === 1 ? "" : "s"}{" "}
              total
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-medium shadow-sm"
          >
            <span className="text-lg leading-none">
              <i className="fa-solid fa-plus"></i>
            </span>{" "}
            Add Product
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Image</th>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Sold</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {product.imageCover ?
                        <img src={product.imageCover} className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm" alt={product.title} /> :
                        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400 text-xs">No img</div>
                      }
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{product.title}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">${product.price}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{product.stock}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{product.sold}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(product)} className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-amber-500 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"><i className="fa-solid fa-pencil"></i>Edit</button>
                        <button onClick={() => handleDelete(product._id)} className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><i className="fa-regular fa-trash-can"></i> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-12 text-gray-400">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && <AddProductModal
          editingProduct={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
            getProducts();
          }} />}
      </div>
    </>
  );
}
