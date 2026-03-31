import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const schema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters.'),
    price: z.coerce.number().positive('Price must be a positive number.'),
    description: z.string().min(5, 'Description must be at least 5 characters.'),
    stock: z.coerce.number().int().nonnegative('Stock must be a non-negative number.'),
    category: z.string().nonempty('Category is required.'),
    subCategory: z.string().nonempty('SubCategory is required.'),
    brand: z.string().nonempty('Brand is required.'),
    imageCover: z.any().optional(),
    images: z.any().optional(),
});

export default function AddProductModal({ onClose, onSuccess, editingProduct }) {
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagesPreview, setImagesPreview] = useState([]);

    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
        resolver: zodResolver(schema),
    });

    const selectedCategory = watch('category');

    useEffect(() => {
        if (editingProduct) {
            reset({
                title: editingProduct.title,
                price: editingProduct.price,
                description: editingProduct.description,
                stock: editingProduct.stock,
                category: editingProduct.category,
                subCategory: editingProduct.subCategory,
                brand: editingProduct.brand,
            });
            setCoverPreview(editingProduct.imageCover || null);
            setImagesPreview(editingProduct.images || []);
        } else {
            reset();
            setCoverPreview(null);
            setImagesPreview([]);
        }
    }, [editingProduct, reset]);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setValue('imageCover', e.target.files);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setValue('images', e.target.files);
            const urls = files.map(file => URL.createObjectURL(file));
            setImagesPreview(urls);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    axios.get('https://nti-ecommerce.vercel.app/api/v1/categories'),
                    axios.get('https://nti-ecommerce.vercel.app/api/v1/brands'),
                ]);
                setCategories(catRes.data.categories || []);
                setBrands(brandRes.data.brands || []);
            } catch (error) {
                console.error('Failed to fetch categories or brands', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const fetchSubCategories = async () => {
                try {
                    const { data } = await axios.get(`https://nti-ecommerce.vercel.app/api/v1/categories/${selectedCategory}/subcategories`);
                    const subCategoryList = data.data || data.subcategories || data.subCategories || data.categories || (Array.isArray(data) ? data : []);
                    setSubCategories(subCategoryList);
                } catch (error) {
                    console.error('Failed to fetch subcategories', error);
                    setSubCategories([]);
                }
            };
            fetchSubCategories();
        } else {
            setSubCategories([]);
        }
    }, [selectedCategory]);

    const onSubmit = async (values) => {
        setIsLoading(true);
        setApiError('');

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (key !== 'imageCover' && key !== 'images' && values[key] !== undefined) {
                formData.append(key, values[key]);
            }
        });

        if (values.imageCover && values.imageCover.length > 0) {
            formData.append('imageCover', values.imageCover[0]);
        }
        if (values.images && values.images.length > 0) {
            Array.from(values.images).forEach(file => {
                formData.append('images', file);
            });
        }

        try {
            if (editingProduct) {
                await axios.put(`https://nti-ecommerce.vercel.app/api/v1/products/${editingProduct._id}`, formData, {
                    headers: {
                        token: localStorage.getItem('userToken'),
                    },
                });
            } else {
                await axios.post('https://nti-ecommerce.vercel.app/api/v1/products', formData, {
                    headers: {
                        token: localStorage.getItem('userToken'),
                    },
                });
            }
            onSuccess();
        } catch (err) {
            setApiError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = "w-full border border-gray-300 focus:ring-2 outline-none p-2.5 rounded-xl transition disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <div className="fixed inset-0 bg-gray-500/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">{editingProduct ? "Update Product" : "New Product"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>

                {apiError && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl"><i className="fa-solid fa-triangle-exclamation mr-2"></i> {apiError}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                        <input {...register('title')} id="title" className={inputStyle} />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Price <span className="text-red-500">*</span></label><input {...register('price')} type="number" step="0.01" id="price" className={inputStyle} />{errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}</div>
                        <div><label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1.5">Stock <span className="text-red-500">*</span></label><input {...register('stock')} type="number" id="stock" className={inputStyle} />{errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}</div>
                    </div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label><textarea {...register('description')} id="description" rows="3" className={inputStyle}></textarea>{errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label><select {...register('category')} id="category" className={inputStyle}><option value="">Select category</option>{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select>{errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}</div>
                        <div><label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1.5">SubCategory <span className="text-red-500">*</span></label><select {...register('subCategory')} id="subCategory" className={inputStyle} disabled={!selectedCategory}><option value="">Select subcategory</option>{subCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}</select>{errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory.message}</p>}</div>
                        <div><label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1.5">Brand <span className="text-red-500">*</span></label><select {...register('brand')} id="brand" className={inputStyle}><option value="">Select brand</option>{brands.map(brand => <option key={brand._id} value={brand._id}>{brand.name}</option>)}</select>{errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
                        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer transition">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover Preview" className="w-24 h-24 object-cover rounded-xl mb-2" />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <div className="text-3xl mb-1"><i className="fa-regular fa-folder"></i></div>
                                    <div className="text-sm">Click to upload cover image</div>
                                </div>
                            )}
                            <input onChange={handleCoverChange} type="file" id="imageCover" className="hidden" accept="image/*" />
                        </label>
                        {errors.imageCover && <p className="text-red-500 text-xs mt-1">{errors.imageCover.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Images (up to 20)</label>
                        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer transition">
                            {imagesPreview.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {imagesPreview.map((url, index) => (
                                        <img key={index} src={url} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <div className="text-3xl mb-1"><i className="fa-regular fa-folder"></i></div>
                                    <div className="text-sm">Click to upload additional images</div>
                                </div>
                            )}
                            <input onChange={handleImagesChange} type="file" id="images" multiple className="hidden" accept="image/*" />
                        </label>
                        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition active:scale-95 ${editingProduct
                                ? "bg-amber-500 hover:bg-amber-700"
                                : "bg-green-600 hover:bg-green-700"
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}