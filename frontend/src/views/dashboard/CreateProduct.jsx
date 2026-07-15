'use client';
import { useState } from 'react';
import { useNavigate } from '@/utils/reactRouterCompat';
import { ArrowLeft, Save, ShoppingBag } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { productService } from '../../services/dataService';
import toast from 'react-hot-toast';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTT Subscriptions',
    subcategory: '',
    description: '',
    thumbnail: '',
    actualPrice: '',
    offerPrice: '',
    whatsappNumber: '',
    isAvailable: true,
    isFeatured: false,
  });

  const categories = [
    'OTT Subscriptions', 'Education Subscription', 'Hosting', 'VPN',
    'Cloud Storage', 'AI Tools', 'Productivity Tools', 'Marketing Tools',
    'Design Tools', 'Others'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await productService.create({
        ...formData,
        actualPrice: Number(formData.actualPrice),
        offerPrice: Number(formData.offerPrice),
      });
      if (response.data.success) {
        toast.success('Product added successfully!');
        navigate('/dashboard/my-posts');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="w-full px-8 lg:px-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="card p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Add Digital Product</h1>
              <p className="text-gray-400">List a product for Digital Products</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., Netflix Premium 1 Month"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Subcategory</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 4K UHD"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Actual Price (₹) *</label>
                <input
                  type="number"
                  name="actualPrice"
                  value={formData.actualPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input"
                  placeholder="e.g., 499"
                />
              </div>

              <div>
                <label className="label">Offer Price (₹) *</label>
                <input
                  type="number"
                  name="offerPrice"
                  value={formData.offerPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input"
                  placeholder="e.g., 99"
                />
              </div>
            </div>

            <div>
              <label className="label">WhatsApp Number *</label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                required
                className="input"
                placeholder="919876543210 (with country code, no +)"
              />
            </div>

            <div>
              <label className="label">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com/product-image.jpg"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input resize-none"
                placeholder="Product details, features, validity..."
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-dark-200 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="text-gray-300">
                  Available for purchase
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-dark-200 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="text-gray-300">
                  Featured product
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Add Product
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
