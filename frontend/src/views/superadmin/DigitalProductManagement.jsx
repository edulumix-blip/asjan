'use client';
import { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Eye, Edit2, Trash2, ChevronDown, 
  ExternalLink, X, Star, ShoppingBag, TrendingUp, IndianRupee, 
  Loader2, AlertCircle, CheckCircle, Image, Tag, Percent
} from 'lucide-react';
import { Table, Card, CardContent, Button } from '@heroui/react';
import { productService } from '../../services/dataService';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const LIMIT = 30;

const categories = [
  'AI Tools',
  'Design & Creative',
  'Entertainment & Streaming',
  'Productivity & Office',
  'Security & Utility',
  'Education & Learning',
  'Others',
];

const DigitalProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    featured: 0,
    totalViews: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    thumbnail: '',
    actualPrice: '',
    offerPrice: '',
    whatsappNumber: '918272946202',
    isAvailable: true,
    isFeatured: false,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, statusFilter, featuredFilter]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, categoryFilter, statusFilter, featuredFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { limit: LIMIT, page };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.isAvailable = statusFilter;
      if (featuredFilter) params.isFeatured = featuredFilter;

      const response = await productService.getAllAdmin(params);
      setProducts(response.data.data || []);
      setTotalProducts(response.data.total ?? 0);
      setTotalPages(response.data.totalPages ?? 1);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      await productService.create({
        ...formData,
        actualPrice: Number(formData.actualPrice),
        offerPrice: Number(formData.offerPrice),
      });
      toast.success('Product created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('update');
      await productService.update(editingProduct._id, {
        ...formData,
        actualPrice: Number(formData.actualPrice),
        offerPrice: Number(formData.offerPrice),
      });
      toast.success('Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading('delete');
      await productService.delete(showDeleteModal._id);
      toast.success('Product deleted successfully!');
      setShowDeleteModal(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAvailability = async (product) => {
    try {
      setActionLoading(product._id);
      await productService.update(product._id, { isAvailable: !product.isAvailable });
      toast.success(`Product ${!product.isAvailable ? 'available' : 'unavailable'} now`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      setActionLoading(product._id + '-featured');
      await productService.update(product._id, { isFeatured: !product.isFeatured });
      toast.success(`Product ${!product.isFeatured ? 'featured' : 'unfeatured'}`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      description: product.description || '',
      thumbnail: product.thumbnail || '',
      actualPrice: product.actualPrice || '',
      offerPrice: product.offerPrice || '',
      whatsappNumber: product.whatsappNumber || '918272946202',
      isAvailable: product.isAvailable ?? true,
      isFeatured: product.isFeatured ?? false,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      thumbnail: '',
      actualPrice: '',
      offerPrice: '',
      whatsappNumber: '918272946202',
      isAvailable: true,
      isFeatured: false,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercent = (actual, offer) => {
    if (actual && offer && actual > offer) {
      return Math.round(((actual - offer) / actual) * 100);
    }
    return 0;
  };

  const statCards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: 'blue', bg: 'bg-blue-500' },
    { label: 'Available', value: stats.available, icon: CheckCircle, color: 'green', bg: 'bg-green-500' },
    { label: 'Unavailable', value: stats.unavailable, icon: AlertCircle, color: 'red', bg: 'bg-red-500' },
    { label: 'Featured', value: stats.featured, icon: Star, color: 'yellow', bg: 'bg-yellow-500' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'purple', bg: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all digital products and subscriptions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-dark-200 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All Products</option>
                <option value="true">Featured Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first digital product to get started</p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-dark-100">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Digital Products Table" className="w-full">
                  <Table.Header>
                    <Table.Column isRowHeader className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Product</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6 hidden md:table-cell">Category</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6 hidden lg:table-cell">Price</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6 hidden sm:table-cell">Views</Table.Column>
                    <Table.Column className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Available</Table.Column>
                    <Table.Column className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6 hidden sm:table-cell">Featured</Table.Column>
                    <Table.Column className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Actions</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {products.map((product) => (
                      <Table.Row key={product._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors border-b border-gray-100 dark:border-gray-800">
                        <Table.Cell className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-100 flex-shrink-0">
                              {product.thumbnail ? (
                                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.subcategory || 'No subcategory'}</p>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                            <Tag className="w-3 h-3" />
                            {product.category}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex flex-col">
                            <span className="font-semibold text-green-600 dark:text-green-400">{formatPrice(product.offerPrice)}</span>
                            {product.actualPrice > product.offerPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through">{formatPrice(product.actualPrice)}</span>
                                <span className="text-xs font-medium text-orange-500">{getDiscountPercent(product.actualPrice, product.offerPrice)}% off</span>
                              </div>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 hidden sm:table-cell">
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Eye className="w-4 h-4" />
                            {product.views || 0}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleAvailability(product)}
                            disabled={actionLoading === product._id}
                            className="relative inline-flex items-center"
                          >
                            <div className={`w-11 h-6 rounded-full transition-colors ${product.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${product.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`}>
                                {actionLoading === product._id && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                              </div>
                            </div>
                          </button>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-center hidden sm:table-cell">
                          <button
                            onClick={() => toggleFeatured(product)}
                            disabled={actionLoading === product._id + '-featured'}
                            className={`p-1.5 rounded-lg transition-colors ${product.isFeatured ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'}`}
                          >
                            {actionLoading === product._id + '-featured' ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Star className={`w-5 h-5 ${product.isFeatured ? 'fill-current' : ''}`} />
                            )}
                          </button>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onPress={() => openEditModal(product)}
                              variant="light"
                              color="primary"
                              size="sm"
                              isIconOnly
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onPress={() => setShowDeleteModal(product)}
                              variant="light"
                              color="danger"
                              size="sm"
                              isIconOnly
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={totalProducts}
          limit={LIMIT}
          onPageChange={setPage}
        />
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-dark-200 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingProduct(null); resetForm(); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory</label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ChatGPT Plus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.actualPrice}
                    onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Offer Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="499"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.png"
                  />
                  {formData.thumbnail && (
                    <div className="mt-2">
                      <img src={formData.thumbnail} alt="Preview" className="w-20 h-20 object-cover rounded-lg" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the product..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="918272946202"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingProduct(null); resetForm(); }}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {showCreateModal ? 'Create Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Product</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "<span className="font-medium text-gray-700 dark:text-gray-300">{showDeleteModal.name}</span>"? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === 'delete'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'delete' && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalProductManagement;
