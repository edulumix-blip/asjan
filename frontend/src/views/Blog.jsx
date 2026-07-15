'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Search, FileText, Eye, ThumbsUp, 
  User, Clock, Star, MessageCircle, Share2, 
  Heart, Filter, Loader2,
  Globe, Tag, ArrowLeft, Zap, LayoutGrid, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { blogService } from '../services/dataService';
import { BlogCardSkeleton } from '../components/skeleton';
import VerifiedBadge from '../components/common/VerifiedBadge';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';
import ListingPageHero from '../components/listing/ListingPageHero';

const PAGE_SIZE = 20;

const Blog = () => {
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [likedPosts, setLikedPosts] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listTotal, setListTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const observerTarget = useRef(null);
  const listingsRef = useRef(null);

  const scrollToListings = () => {
    listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setShowFilters(false);
    setTimeout(scrollToListings, 120);
  };

  const categories = [
    'All',
    'Tech Blog',
    'Career Tips',
    'Interview Guide',
    'Tutorial',
    'News',
    'Others',
  ];

  const fetchBlogs = useCallback(async (pageNum = 1, append = false, opts = {}) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const effectiveSearch = opts.search !== undefined ? opts.search : searchTerm;

      const params = { limit: PAGE_SIZE, page: pageNum };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (selectedSource !== 'All') {
        params.source = selectedSource;
      }
      if (effectiveSearch) {
        params.search = effectiveSearch;
      }
      const response = await blogService.getAll(params);
      if (response.data.success) {
        const data = response.data.data || [];
        const pages = response.data.totalPages ?? 1;
        setPage(pageNum);
        setHasMore(pageNum < pages);

        if (append) {
          setDisplayedBlogs(prev => [...prev, ...data]);
        } else {
          setDisplayedBlogs(data);
          setListTotal(response.data.total ?? data.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, selectedSource, searchTerm]);

  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  const fetchTrendingBlogs = async () => {
    try {
      setTrendingLoading(true);
      const response = await blogService.getAll({
        limit: 20,
        page: 1,
        sort: 'trending',
      });
      if (response.data.success) {
        setTrendingBlogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch trending blogs');
      setTrendingBlogs([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingBlogs();
  }, []);

  const loadMoreBlogs = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchBlogs(page + 1, true);
  }, [page, hasMore, loadingMore, selectedCategory, searchTerm]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreBlogs();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreBlogs, hasMore, loadingMore, loading]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleLike = async (id) => {
    if (likedPosts[id]) return;
    try {
      await blogService.like(id);
      setDisplayedBlogs(prev => prev.map(b =>
        b._id === id ? { ...b, likes: (b.likes || 0) + 1 } : b
      ));
      setLikedPosts(prev => ({ ...prev, [id]: true }));
    } catch (error) {
      console.error('Failed to like blog');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getReadingTime = (content) => {
    if (!content) return '1 min';
    const words = content.split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Tech Blog': 'bg-blue-500',
      'Career Tips': 'bg-emerald-500',
      'Interview Guide': 'bg-purple-500',
      'Tutorial': 'bg-orange-500',
      'News': 'bg-red-500',
      'Others': 'bg-gray-500',
    };
    return colors[category] || colors['Others'];
  };

  const handleShare = async (blog) => {
    const url = `${window.location.origin}/blog/${blog.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbs),
      {
        '@type': 'Blog',
        '@id': 'https://edulumix.in/blog',
        name: 'EduLumix Tech Blog',
        description: 'Technology tutorials, career tips, programming guides, and latest tech trends',
        url: 'https://edulumix.in/blog',
        publisher: {
          '@type': 'Organization',
          name: 'EduLumix'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <SEO
        title="Tech Blog - Programming Tutorials, Career Tips & Technology Guides | EduLumix"
        description="Read latest tech blogs, programming tutorials, interview tips, career guidance, web development guides, and technology trends. Learn from industry experts and enhance your technical skills."
        keywords="tech blog, programming tutorials, coding tutorials, web development, interview tips, career guidance, technology trends, software development blog, learning resources, programming guides, tech articles"
        url="/blog"
        structuredData={structuredData}
      />

      <ListingPageHero
          imageUrl="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=2000&q=85"
          objectPositionClass="object-[center_40%] sm:object-center"
          eyebrow={
            <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
              Tutorials, career & tech — from the community
            </p>
          }
          title="Tech blog that reads with you"
          description="Deep dives, interview prep, tutorials, and news. Filter by category, search any keyword, then like and share what helps."
          stat={{
            label: 'Posts in this list',
            value: listTotal.toLocaleString('en-IN'),
            Icon: FileText,
          }}
          statLoading={loading && displayedBlogs.length === 0}
        />

      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        <div className="mb-8" ref={listingsRef}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-5">
            <div className="relative sm:w-72 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-blue-600/25"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-3 py-2.5 bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-xl"
                aria-expanded={showFilters}
              >
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </form>

          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading && displayedBlogs.length === 0 ? (
                'Loading posts…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {displayedBlogs.length.toLocaleString('en-IN')}
                  </span>
                  {(selectedCategory !== 'All' || searchTerm) && (
                    <>
                      {' '}
                      of{' '}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {listTotal.toLocaleString('en-IN')}
                      </span>
                    </>
                  )}
                  {selectedCategory !== 'All' && (
                    <span className="text-gray-400 dark:text-gray-500">
                      {' '}
                      · <span className="text-blue-600 dark:text-blue-400">{selectedCategory}</span>
                    </span>
                  )}
                  {selectedSource !== 'All' && (
                    <span className="text-gray-400 dark:text-gray-500">
                      {' '}
                      · <span className="text-purple-600 dark:text-purple-400">{selectedSource}</span>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="text-gray-400 dark:text-gray-500">
                      {' '}
                      · search: <span className="text-blue-600 dark:text-blue-400">&quot;{searchTerm}&quot;</span>
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          <div
            className={`flex flex-wrap items-center gap-2 ${showFilters ? 'flex' : 'hidden lg:flex'}`}
            role="tablist"
            aria-label="Blog category"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                onClick={() => selectCategory(category)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                {category === 'All' && <LayoutGrid className="w-3.5 h-3.5 opacity-80" />}
                {category}
              </button>
            ))}

            {/* Platform filter */}
            <div className="ml-auto">
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setTimeout(scrollToListings, 120);
                }}
                className="pl-3 pr-8 py-2 rounded-full text-sm font-medium bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Platforms</option>
                <option value="devto">Dev.to</option>
                <option value="medium">Medium</option>
                <option value="manual">EduLumix</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
          {/* Main Feed */}
          <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0 space-y-4 lg:max-w-none lg:pr-2">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : displayedBlogs.length === 0 ? (
              <div className="bg-white dark:bg-dark-200 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Try a different search term' : 'Be the first to share something!'}
                </p>
              </div>
            ) : (
              displayedBlogs.map((blog) => (
                <article key={blog._id} className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-start">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {blog.author ? (
                        <>
                          {blog.author.avatar ? (
                            <img
                              src={blog.author.avatar}
                              alt={blog.author.name}
                              loading="lazy"
                              decoding="async"
                              className="w-12 h-12 rounded-full object-cover shadow-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ${blog.author.avatar ? 'hidden' : ''}`}
                          >
                            {blog.author.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        </>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-lg">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{blog.author?.name || 'Deleted User'}</h3>
                          <VerifiedBadge user={blog.author} size="sm" />
                          {blog.isSponsored && (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                              Sponsored
                            </span>
                          )}
                          {blog.isFeatured && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(blog.createdAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            Public
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image - Top of card for fetched blogs */}
                  {blog.coverImage && (
                    <Link to={`/blog/${blog.slug}`} className="block px-4 pb-3">
                      <div className="relative w-full h-48 sm:h-56 bg-gray-100 dark:bg-dark-100 rounded-xl overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                        />
                      </div>
                    </Link>
                  )}

                  {/* Category Badge */}
                  <div className="px-4 pb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(blog.category)}`}>
                      <Tag className="w-3 h-3" />
                      {blog.category}
                    </span>
                  </div>

                  {/* Post Title */}
                  <div className="px-4 pb-3">
                    <Link to={`/blog/${blog.slug}`} className="block">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {blog.title}
                      </h2>
                    </Link>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {blog.excerpt || blog.content?.substring(0, 300)}
                    </p>
                    {(blog.content?.length > 300 || blog.excerpt) && (
                      <Link 
                        to={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm mt-2 hover:underline"
                      >
                        Read more
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Link>
                    )}
                  </div>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {blog.tags.slice(0, 5).map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTagSearch(tag)}
                          className="text-blue-600 dark:text-blue-400 text-sm hover:underline text-left"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <ThumbsUp className="w-3 h-3 text-white fill-white" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </div>
                      </div>
                      <span className="ml-1">{blog.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {blog.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getReadingTime(blog.content)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-2 py-1 border-t border-gray-100 dark:border-gray-800 flex items-center">
                    <button 
                      onClick={() => handleLike(blog._id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                        likedPosts[blog._id] 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100'
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${likedPosts[blog._id] ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                      <span>{likedPosts[blog._id] ? 'Liked' : 'Like'}</span>
                    </button>
                    <Link 
                      to={`/blog/${blog.slug}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 font-medium transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Read</span>
                    </Link>
                    <button 
                      onClick={() => handleShare(blog)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 font-medium transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </article>
              ))
            )}

            {/* Infinite Scroll Loader */}
            {hasMore && (
              <div ref={observerTarget} className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Loading more posts...</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
            {!hasMore && displayedBlogs.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">You've reached the end! 🎉</p>
              </div>
            )}
          </div>

          {/* Desktop only: sticky top 20 trending */}
          <aside className="hidden lg:block w-80 flex-shrink-0" aria-label="Trending blog posts">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-dark-100/80">
                  <TrendingUp className="w-5 h-5 text-orange-500" aria-hidden />
                  <h3 className="font-bold text-gray-900 dark:text-white">Top 20 trending</h3>
                </div>
                <div className="p-3">
                  {trendingLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      Loading…
                    </div>
                  ) : trendingBlogs.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No trending posts yet</p>
                  ) : (
                    <ol className="space-y-1">
                      {trendingBlogs.map((blog, index) => (
                        <li key={blog._id}>
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="flex gap-3 rounded-lg p-2 -mx-2 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors group"
                          >
                            <span className="text-lg font-bold text-gray-300 dark:text-gray-600 tabular-nums w-7 shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {blog.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-0.5">
                                  <Eye className="w-3.5 h-3.5" />
                                  {(blog.views ?? 0).toLocaleString('en-IN')}
                                </span>
                                <span>·</span>
                                <span className="truncate max-w-[140px]">{blog.author?.name || 'Anonymous'}</span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                <div className="flex flex-wrap gap-2">
                  <Link to="/about" className="hover:underline">About</Link>
                  <span>•</span>
                  <Link to="/contact" className="hover:underline">Contact</Link>
                  <span>•</span>
                  <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
                  <span>•</span>
                  <Link to="/terms-of-service" className="hover:underline">Terms</Link>
                </div>
                <p className="mt-2">© 2026 EduLumix. All rights reserved.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile footer (sidebar is desktop-only) */}
        <div className="lg:hidden mt-10 text-xs text-gray-500 dark:text-gray-400 px-1">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/about" className="hover:underline">About</Link>
            <span>•</span>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <span>•</span>
            <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link to="/terms-of-service" className="hover:underline">Terms</Link>
          </div>
          <p className="mt-2 text-center">© 2026 EduLumix. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Blog;
