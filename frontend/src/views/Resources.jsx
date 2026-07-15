'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Search, FolderOpen, Video, Download, 
  Heart, ExternalLink, Play, Loader2, Zap, Filter,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { resourceService } from '../services/dataService';
import { ResourceCardSkeleton } from '../components/skeleton';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';
import ListingPageHero from '../components/listing/ListingPageHero';
import CategoryExplorer from '../components/listing/CategoryExplorer';
import { RESOURCE_HUB_CATEGORIES } from '../config/listingHubConfigs';
import ListingAdvancedFilters from '../components/listing/ListingAdvancedFilters';

const PAGE_SIZE = 12;

const SOURCE_LABELS = {
  manual: 'Manual / curated',
  devto: 'Dev.to',
  freecodecamp: 'freeCodeCamp',
  hashnode: 'Hashnode',
  youtube: 'YouTube',
  medium: 'Medium',
  hackernews: 'Hacker News',
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [listTotal, setListTotal] = useState(0);
  const [filterSubcategory, setFilterSubcategory] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterVideo, setFilterVideo] = useState('All');
  const [filterOptions, setFilterOptions] = useState({
    subcategories: [],
    sources: [],
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

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedCategory !== 'All') n += 1;
    if (filterSubcategory !== 'All') n += 1;
    if (filterSource !== 'All') n += 1;
    if (filterVideo !== 'All') n += 1;
    return n;
  }, [selectedCategory, filterSubcategory, filterSource, filterVideo]);

  const resetListingFilters = () => {
    setSelectedCategory('All');
    setFilterSubcategory('All');
    setFilterSource('All');
    setFilterVideo('All');
  };

  const categories = [
    'All',
    'Software Notes',
    'Interview Notes',
    'Tools & Technology',
    'Trending Technology',
    'Video Resources',
    'Software Project',
    'Hardware Project',
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOptionsLoading(true);
        const res = await resourceService.getFilterOptions();
        if (!cancelled && res.data?.success && res.data?.data) {
          setFilterOptions({
            subcategories: res.data.data.subcategories || [],
            sources: res.data.data.sources || [],
          });
        }
      } catch {
        if (!cancelled) setFilterOptions({ subcategories: [], sources: [] });
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Category colors for fallback thumbnails
  const categoryColors = {
    'Software Notes': 'from-blue-500 to-blue-600',
    'Interview Notes': 'from-purple-500 to-purple-600',
    'Tools & Technology': 'from-green-500 to-green-600',
    'Trending Technology': 'from-orange-500 to-orange-600',
    'Video Resources': 'from-red-500 to-red-600',
    'Software Project': 'from-indigo-500 to-indigo-600',
    'Hardware Project': 'from-teal-500 to-teal-600',
  };

  const fetchResources = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { limit: PAGE_SIZE, page: pageNum };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const q = searchTermRef.current?.trim();
      if (q) params.search = q;
      if (filterSubcategory !== 'All') params.subcategory = filterSubcategory;
      if (filterSource !== 'All') params.source = filterSource;
      if (filterVideo === 'true') params.isVideo = 'true';
      if (filterVideo === 'false') params.isVideo = 'false';
      const response = await resourceService.getAll(params);
      if (response.data.success) {
        const data = response.data.data || [];
        const totalPages = response.data.totalPages ?? 1;
        setPage(pageNum);
        setHasMore(pageNum < totalPages);

        if (append) {
          setResources(prev => [...prev, ...data]);
        } else {
          setResources(data);
          setListTotal(response.data.total ?? data.length);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, filterSubcategory, filterSource, filterVideo]);

  useEffect(() => {
    fetchResources(1);
  }, [fetchResources]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchResources(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadingMore, loading, page, fetchResources]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(1);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchResources(page + 1, true);
  };

  const handleLike = async (id, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      await resourceService.like(id);
      setResources(prev => prev.map(r =>
        r._id === id ? { ...r, likes: (r.likes || 0) + 1 } : r
      ));
    } catch (error) {
      console.error('Failed to like');
    }
  };

  const handleDownload = async (resource) => {
    try {
      await resourceService.download(resource._id);
      setResources(prev => prev.map(r =>
        r._id === resource._id ? { ...r, downloads: (r.downloads || 0) + 1 } : r
      ));
      window.open(resource.link, '_blank');
    } catch (error) {
      window.open(resource.link, '_blank');
    }
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const resourceFilterFields = useMemo(
    () => [
      {
        id: 'res-filter-category',
        label: 'Category',
        value: selectedCategory,
        onChange: (v) => {
          setSelectedCategory(v);
          setTimeout(scrollToListings, 120);
        },
        options: categories.map((c) => ({
          value: c,
          label: c === 'All' ? 'All types' : c,
        })),
      },
      {
        id: 'res-filter-subcategory',
        label: 'Tag / subcategory',
        value: filterSubcategory,
        onChange: setFilterSubcategory,
        options: [
          { value: 'All', label: 'All tags' },
          ...filterOptions.subcategories.map((s) => ({ value: s, label: s })),
        ],
      },
      {
        id: 'res-filter-source',
        label: 'Source',
        value: filterSource,
        onChange: setFilterSource,
        options: [
          { value: 'All', label: 'All sources' },
          ...filterOptions.sources.map((s) => ({
            value: s,
            label: SOURCE_LABELS[s] || s,
          })),
        ],
      },
      {
        id: 'res-filter-video',
        label: 'Format',
        value: filterVideo,
        onChange: setFilterVideo,
        options: [
          { value: 'All', label: 'Any format' },
          { value: 'true', label: 'Video only' },
          { value: 'false', label: 'Notes & links' },
        ],
      },
    ],
    [
      selectedCategory,
      filterSubcategory,
      filterSource,
      filterVideo,
      filterOptions.subcategories,
      filterOptions.sources,
      categories,
    ]
  );

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Resources', path: '/resources' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbs),
      {
        '@type': 'CollectionPage',
        '@id': 'https://edulumix.in/resources',
        name: 'Free Learning Resources',
        description: 'Free notes, tutorials, projects, and study materials for students and professionals',
        url: 'https://edulumix.in/resources'
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Free Resources - Notes, Projects, Tutorials & Study Materials | EduLumix"
        description="Access free learning resources including notes, video tutorials, software projects, PDF books, and study materials. Download free resources for programming, web development, and more."
        keywords="free resources, study notes, free tutorials, software projects, free pdf, programming notes, web development resources, free learning materials, download free notes, free ebooks, study materials"
        url="/resources"
        structuredData={structuredData}
      />
      
      <ListingPageHero
          imageUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85"
          objectPositionClass="object-[center_35%] sm:object-center"
          eyebrow={
            <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
              Notes, videos & projects — 100% free
            </p>
          }
          title="Free resources that actually help you level up"
          description="Curated notes, interview prep, video walkthroughs, and hands-on projects across software and hardware. Pick a lane below, search when you know what you need — no paywall."
          stat={{
            label: 'Resources in this list',
            value: listTotal.toLocaleString('en-IN'),
            Icon: FolderOpen,
          }}
          statLoading={loading && resources.length === 0}
        />

      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        <CategoryExplorer
          id="resource-categories-heading"
          title="Explore by type"
          subtitle="Jump straight into notes, videos, projects, or trending topics"
          categories={RESOURCE_HUB_CATEGORIES}
          selectedKey={selectedCategory === 'All' ? null : selectedCategory}
          onSelect={selectCategory}
          onViewAll={() => selectCategory('All')}
          viewAllLabel="View all resources"
        />

        {/* Search + quick chips */}
        <div className="mb-8" ref={listingsRef}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title or keywords..."
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
                aria-controls="resource-advanced-filters"
                title={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading && resources.length === 0 ? (
                'Loading listings…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {resources.length.toLocaleString('en-IN')}
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
            id="resource-advanced-filters"
            className={showFilters ? 'mt-5 block' : 'mt-5 hidden lg:block'}
          >
            <ListingAdvancedFilters
              title="Advanced filters"
              subtitle="Category, tags, source, and video vs notes"
              fields={resourceFilterFields}
              optionsLoading={optionsLoading}
              onReset={resetListingFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No resources found</h3>
            <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resources.map((resource) => (
              <Link
                key={resource._id}
                to={`/resources/${resource._id}`}
                className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group block"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {/* Always show colored background as base */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[resource.category] || 'from-gray-500 to-gray-600'} flex items-center justify-center p-6`}>
                    <h3 className="text-white font-bold text-lg text-center leading-tight line-clamp-4">
                      {resource.title}
                    </h3>
                  </div>
                  
                  {/* Try to load image on top if available */}
                  {resource.isVideo && resource.link && getYouTubeId(resource.link) ? (
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(resource.link)}/maxresdefault.jpg`}
                      alt={resource.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : resource.thumbnail && resource.thumbnail.startsWith('http') ? (
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  
                  {resource.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors z-20">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-md z-30">
                    {resource.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{resource.subcategory}</p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-500 line-clamp-2 mb-3">
                    {resource.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-500 text-sm">
                      <button
                        onClick={(e) => handleLike(resource._id, e)}
                        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{resource.likes || 0}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{resource.downloads || 0}</span>
                      </span>
                    </div>
                    
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-sm font-medium transition-colors">
                      Get
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Infinite scroll trigger */}
        {!loading && resources.length > 0 && hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-10 min-h-[60px]">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
        {!loading && resources.length > 0 && !hasMore && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">You've seen all resources</p>
        )}
      </div>
    </div>
  );
};

export default Resources;
