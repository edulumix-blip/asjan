'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Search, ShoppingBag, Star, Loader2, Zap, Filter,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { productService } from '../services/dataService';
import { ProductCardSkeleton } from '../components/skeleton';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';
import ListingPageHero from '../components/listing/ListingPageHero';
import CategoryExplorer from '../components/listing/CategoryExplorer';
import { DIGITAL_PRODUCT_HUB_CATEGORIES } from '../config/listingHubConfigs';
import ListingAdvancedFilters from '../components/listing/ListingAdvancedFilters';

const DEFAULT_PRODUCT_CATEGORIES = [
  'All',
  'AI Tools',
  'Design & Creative',
  'Entertainment & Streaming',
  'Productivity & Office',
  'Security & Utility',
  'Education & Learning',
  'Others',
];

const DigitalProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [listTotal, setListTotal] = useState(0);
  const [filterSubcategory, setFilterSubcategory] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState('All');
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    subcategories: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const observerTarget = useRef(null);
  const listingsRef = useRef(null);
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;

  const scrollToListings = () => {
    listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setTimeout(scrollToListings, 120);
  };

  const categorySelectList = useMemo(() => {
    const fromApi = filterOptions.categories || [];
    if (fromApi.length === 0) return DEFAULT_PRODUCT_CATEGORIES;
    return ['All', ...fromApi.filter((c) => c && c !== 'All')];
  }, [filterOptions.categories]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedCategory !== 'All') n += 1;
    if (filterSubcategory !== 'All') n += 1;
    if (filterFeatured !== 'All') n += 1;
    return n;
  }, [selectedCategory, filterSubcategory, filterFeatured]);

  const resetListingFilters = () => {
    setSelectedCategory('All');
    setFilterSubcategory('All');
    setFilterFeatured('All');
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOptionsLoading(true);
        const res = await productService.getFilterOptions();
        if (!cancelled && res.data?.success && res.data?.data) {
          setFilterOptions({
            categories: res.data.data.categories || [],
            subcategories: res.data.data.subcategories || [],
          });
        }
      } catch {
        if (!cancelled) setFilterOptions({ categories: [], subcategories: [] });
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      const params = { limit: PAGE_SIZE, page: pageNum };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (filterSubcategory !== 'All') params.subcategory = filterSubcategory;
      if (filterFeatured === 'true') params.isFeatured = 'true';
      const q = searchTermRef.current?.trim();
      if (q) params.search = q;
      const response = await productService.getAll(params);
      if (response.data.success) {
        const data = response.data.data || [];
        const totalPages = response.data.totalPages ?? 1;
        setPage(pageNum);
        setHasMore(pageNum < totalPages);
        if (append) setProducts((prev) => [...prev, ...data]);
        else {
          setProducts(data);
          setListTotal(response.data.total ?? data.length);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, filterSubcategory, filterFeatured]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchProducts(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const calculateDiscount = (actual, offer) => {
    return Math.round(((actual - offer) / actual) * 100);
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Digital Products', path: '/digital-products' }
  ];

  const productFilterFields = useMemo(
    () => [
      {
        id: 'product-filter-category',
        label: 'Category',
        value: selectedCategory,
        onChange: (v) => {
          setSelectedCategory(v);
          setTimeout(scrollToListings, 120);
        },
        options: categorySelectList.map((c) => ({
          value: c,
          label: c === 'All' ? 'All categories' : c,
        })),
      },
      {
        id: 'product-filter-subcategory',
        label: 'Type / subcategory',
        value: filterSubcategory,
        onChange: setFilterSubcategory,
        options: [
          { value: 'All', label: 'All types' },
          ...filterOptions.subcategories.map((s) => ({ value: s, label: s })),
        ],
      },
      {
        id: 'product-filter-featured',
        label: 'Featured',
        value: filterFeatured,
        onChange: setFilterFeatured,
        options: [
          { value: 'All', label: 'All products' },
          { value: 'true', label: 'Featured only' },
        ],
      },
    ],
    [
      selectedCategory,
      filterSubcategory,
      filterFeatured,
      categorySelectList,
      filterOptions.subcategories,
    ]
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbs),
      {
        '@type': 'Store',
        '@id': 'https://edulumix.in/digital-products',
        name: 'Digital Products Store',
        description: 'Buy digital subscriptions, software, and tools at best prices',
        url: 'https://edulumix.in/digital-products'
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Digital Products - OTT Subscriptions, Software & Tools | EduLumix"
        description="Buy premium digital products at best prices - Netflix, Prime Video, Spotify, educational subscriptions, hosting, VPN, AI tools, and more. Get instant delivery and great deals!"
        keywords="digital products, OTT subscriptions, Netflix subscription, Prime Video, Spotify premium, educational subscription, hosting, VPN, AI tools, software, digital subscriptions, buy online"
        url="/digital-products"
        structuredData={structuredData}
      />
      
      <ListingPageHero
          imageUrl="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=85"
          objectPositionClass="object-[center_30%] sm:object-right"
          eyebrow={
            <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
              Subscriptions & tools — sharp pricing
            </p>
          }
          title="Digital products that pay for themselves"
          description="OTT, learning platforms, hosting, VPN, AI and productivity — browse by category, compare prices, and grab what you need without the noise."
          stat={{
            label: 'Products in this list',
            value: listTotal.toLocaleString('en-IN'),
            Icon: ShoppingBag,
          }}
          statLoading={loading && products.length === 0}
        />

      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        <CategoryExplorer
          id="digital-product-categories-heading"
          title="Shop by category"
          subtitle="Pick a bucket — offers and subscriptions grouped for quick scanning"
          categories={DIGITAL_PRODUCT_HUB_CATEGORIES}
          selectedKey={selectedCategory === 'All' ? null : selectedCategory}
          onSelect={selectCategory}
          onViewAll={() => selectCategory('All')}
          viewAllLabel="View all products"
        />

        <div className="mb-8" ref={listingsRef}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-colors shadow-lg shadow-blue-600/25"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((o) => !o)}
                className="lg:hidden px-4 py-3.5 bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-400"
                aria-expanded={showFilters}
                aria-controls="product-advanced-filters"
                title={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </form>

          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading && products.length === 0 ? (
                'Loading listings…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {products.length.toLocaleString('en-IN')}
                  </span>
                  {(activeFilterCount > 0 || searchTerm.trim()) && (
                    <>
                      {' '}
                      of{' '}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {listTotal.toLocaleString('en-IN')}
                      </span>
                      {activeFilterCount > 0 && (
                        <span className="text-gray-400 dark:text-gray-500">
                          {' '}
                          ·{' '}
                          <span className="text-blue-600 dark:text-blue-400">
                            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          <div
            id="product-advanced-filters"
            className={showFilters ? 'mt-5 block' : 'mt-5 hidden lg:block'}
          >
            <ListingAdvancedFilters
              title="Advanced filters"
              subtitle="Category, product type, and staff picks"
              fields={productFilterFields}
              optionsLoading={optionsLoading}
              onReset={resetListingFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/digital-products/${product._id}`}
                className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group block"
              >
                {/* Thumbnail - Only top half visible */}
                <div className="relative h-40 bg-gray-100 dark:bg-dark-200 overflow-hidden">
                  <img
                    src={product.thumbnail || '/images/placeholder.png'}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    style={{ minHeight: '280px', marginTop: '-70px' }}
                  />
                  
                  {/* Discount Badge */}
                  {product.actualPrice > product.offerPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                      {calculateDiscount(product.actualPrice, product.offerPrice)}% OFF
                    </div>
                  )}
                  
                  {product.isFeatured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{product.category}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-1 mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{product.subcategory}</p>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.offerPrice}</span>
                    {product.actualPrice > product.offerPrice && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{product.actualPrice}</span>
                    )}
                  </div>

                  {/* View Details */}
                  <div className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm text-sm group-hover:bg-blue-700">
                    View Details
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length > 0 && hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-10 min-h-[60px]">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
        {!loading && products.length > 0 && !hasMore && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">You've seen all products</p>
        )}
      </div>
    </div>
  );
};

export default DigitalProducts;
