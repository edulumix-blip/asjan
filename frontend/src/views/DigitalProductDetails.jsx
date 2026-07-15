'use client';
import { useState, useEffect } from 'react';
import { useParams, Link } from '@/utils/reactRouterCompat';
import { 
  ArrowLeft, MessageCircle, Star, Tag, ShoppingBag,
  CheckCircle, Clock, Shield, Award, TrendingUp
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { productService } from '../services/dataService';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import VerifiedBadge from '../components/common/VerifiedBadge';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';

const DigitalProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
    fetchTrendingProducts();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(id);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 8, isFeatured: true });
      if (response.data.success) {
        // Filter out current product
        setTrendingProducts(response.data.data.filter(p => p._id !== id).slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to load trending products');
    }
  };

  const openWhatsApp = (prod) => {
    const message = encodeURIComponent(
      `Hi, I'm interested in "${prod.name}" (₹${prod.offerPrice}). Please share more details.`
    );
    window.open(`https://wa.me/${prod.whatsappNumber}?text=${message}`, '_blank');
  };

  const calculateDiscount = (actual, offer) => {
    return Math.round(((actual - offer) / actual) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="w-full px-8 lg:px-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Product not found</h3>
        <Link to="/digital-products" className="text-blue-600 hover:underline">
          Back to Digital Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <SEO
        title={`${product.name} - Digital Product | EduLumix`}
        description={product.description || `Buy ${product.name} at best price. ${product.category} - ${product.subcategory}`}
        keywords={`${product.name}, ${product.category}, ${product.subcategory}, digital product, buy online`}
        url={`/digital-products/${id}`}
      />

      <div className="w-full px-8 lg:px-12">
        {/* Back Button */}
        <Link
          to="/digital-products"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </Link>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image */}
          <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <img
              src={product.thumbnail || '/images/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isFeatured && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <Star className="w-4 h-4" />
                Featured
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg mb-3">
              {product.category}
            </span>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">{product.subcategory}</p>

            {/* Posted By */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {product.postedBy?.name?.charAt(0) || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-500">Posted by</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {product.postedBy?.name || 'EduLumix'}
                  </p>
                  <VerifiedBadge user={product.postedBy} size="sm" />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{product.offerPrice}
                </span>
                {product.actualPrice > product.offerPrice && (
                  <>
                    <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                      ₹{product.actualPrice}
                    </span>
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                      {calculateDiscount(product.actualPrice, product.offerPrice)}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.actualPrice > product.offerPrice && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  You save ₹{product.actualPrice - product.offerPrice}!
                </p>
              )}
            </div>

            {/* In-content Ad */}
            <AdSlot slotId={AD_SLOTS.IN_ARTICLE} className="my-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800">
                <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Instant Delivery</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800">
                <Award className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Best Quality</p>
              </div>
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={() => openWhatsApp(product)}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-500/25"
            >
              <MessageCircle className="w-6 h-6" />
              Order on WhatsApp
            </button>
          </div>
        </div>

        {/* Trending Digital Products */}
        {trendingProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trending Digital Products
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {trendingProducts.map((item) => (
                <Link
                  key={item._id}
                  to={`/digital-products/${item._id}`}
                  className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
                >
                  {/* Thumbnail - Top half only */}
                  <div className="relative h-40 bg-gray-100 dark:bg-dark-200 overflow-hidden">
                    <img
                      src={item.thumbnail || '/images/placeholder.png'}
                      alt={item.name}
                      className="w-full h-auto object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      style={{ minHeight: '280px', marginTop: '-70px' }}
                    />
                    {item.actualPrice > item.offerPrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {calculateDiscount(item.actualPrice, item.offerPrice)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{item.category}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">₹{item.offerPrice}</span>
                      {item.actualPrice > item.offerPrice && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{item.actualPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalProductDetails;
