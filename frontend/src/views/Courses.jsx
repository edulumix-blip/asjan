'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from '@/utils/reactRouterCompat';
import { 
  Search, Filter, GraduationCap, Clock, Users, Star,
  Play, ChevronRight,
  Video, Loader2, Zap,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { courseService } from '../services/dataService';
import { CourseCardSkeleton } from '../components/skeleton';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';
import ListingPageHero from '../components/listing/ListingPageHero';
import CategoryExplorer from '../components/listing/CategoryExplorer';
import { COURSE_HUB_CATEGORIES } from '../config/listingHubConfigs';
import ListingAdvancedFilters from '../components/listing/ListingAdvancedFilters';

const DEFAULT_COURSE_CATEGORIES = [
  'All',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cybersecurity',
  'Cloud Computing',
  'UI/UX Design',
  'Digital Marketing',
  'Interview Prep',
  'DSA',
  'Programming Languages',
  'Others',
];

const DEFAULT_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const DEFAULT_LANGUAGES = ['All', 'English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Others'];

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [filterLanguage, setFilterLanguage] = useState('All');
  const [filterFree, setFilterFree] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState('All');
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    levels: [],
    languages: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listTotal, setListTotal] = useState(0);
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
    if (fromApi.length === 0) return DEFAULT_COURSE_CATEGORIES;
    return ['All', ...fromApi.filter((c) => c && c !== 'All')];
  }, [filterOptions.categories]);

  const levelSelectList = useMemo(() => {
    const fromApi = filterOptions.levels || [];
    if (fromApi.length === 0) return DEFAULT_LEVELS;
    return ['All', ...fromApi.filter((l) => l && l !== 'All')];
  }, [filterOptions.levels]);

  const languageSelectList = useMemo(() => {
    const fromApi = filterOptions.languages || [];
    if (fromApi.length === 0) return DEFAULT_LANGUAGES;
    return ['All', ...fromApi.filter((l) => l && l !== 'All')];
  }, [filterOptions.languages]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedCategory !== 'All') n += 1;
    if (selectedLevel !== 'All') n += 1;
    if (filterLanguage !== 'All') n += 1;
    if (filterFree !== 'All') n += 1;
    if (filterFeatured !== 'All') n += 1;
    return n;
  }, [selectedCategory, selectedLevel, filterLanguage, filterFree, filterFeatured]);

  const resetListingFilters = (andSearch = false) => {
    setSelectedCategory('All');
    setSelectedLevel('All');
    setFilterLanguage('All');
    setFilterFree('All');
    setFilterFeatured('All');
    if (andSearch) setSearchTerm('');
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOptionsLoading(true);
        const res = await courseService.getFilterOptions();
        if (!cancelled && res.data?.success && res.data?.data) {
          setFilterOptions({
            categories: res.data.data.categories || [],
            levels: res.data.data.levels || [],
            languages: res.data.data.languages || [],
          });
        }
      } catch {
        if (!cancelled) setFilterOptions({ categories: [], levels: [], languages: [] });
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const PAGE_SIZE = 12;

  const fetchCourses = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      const params = { limit: PAGE_SIZE, page: pageNum };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel !== 'All') params.level = selectedLevel;
      if (filterLanguage !== 'All') params.language = filterLanguage;
      if (filterFree === 'true') params.isFree = 'true';
      if (filterFree === 'false') params.isFree = 'false';
      if (filterFeatured === 'true') params.isFeatured = 'true';
      const q = searchTermRef.current?.trim();
      if (q) params.search = q;
      const response = await courseService.getAll(params);
      if (response.data.success) {
        const data = response.data.data || [];
        const totalPages = response.data.totalPages ?? 1;
        setPage(pageNum);
        setHasMore(pageNum < totalPages);
        if (append) setCourses((prev) => [...prev, ...data]);
        else {
          setCourses(data);
          setListTotal(response.data.total ?? data.length);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [
    selectedCategory,
    selectedLevel,
    filterLanguage,
    filterFree,
    filterFeatured,
  ]);

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchCourses(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadingMore, loading, page, fetchCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(1);
  };

  const handleViewCourse = (course) => {
    const slug = course.slug || `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${course._id}`;
    navigate(`/courses/${slug}`);
  };

  const formatPrice = (course) => {
    // Udemy: show actual course fee (INR), now free with coupon
    if (course.isFree && course.actualPrice > 0) {
      return (
        <span className="flex flex-col items-start gap-0.5">
          <span className="text-gray-700 dark:text-gray-300 font-semibold">₹{course.actualPrice}</span>
          <span className="text-green-600 dark:text-green-400 text-xs font-medium">Free with coupon</span>
        </span>
      );
    }
    if (course.isFree || !course.actualPrice || course.actualPrice === 0) return 'Free';
    if (course.offerPrice !== undefined && course.offerPrice < course.actualPrice) {
      return (
        <span className="flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400 font-bold">₹{course.offerPrice}</span>
          <span className="line-through text-gray-400 text-sm">₹{course.actualPrice}</span>
        </span>
      );
    }
    return `₹${course.actualPrice.toLocaleString('en-IN')}`;
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
      'Intermediate': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'Advanced': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
      'All Levels': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    };
    return colors[level] || colors['All Levels'];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Mobile Development': 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'Data Science': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
      'Machine Learning': 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
      'DevOps': 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
      'Cybersecurity': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
      'Cloud Computing': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'UI/UX Design': 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300',
      'DSA': 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      'Interview Prep': 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'Web Development': 'from-blue-500 to-blue-600',
      'Mobile Development': 'from-purple-500 to-purple-600',
      'Data Science': 'from-green-500 to-green-600',
      'Machine Learning': 'from-orange-500 to-orange-600',
      'DevOps': 'from-cyan-500 to-cyan-600',
      'Cybersecurity': 'from-red-500 to-red-600',
      'Cloud Computing': 'from-sky-500 to-sky-600',
      'UI/UX Design': 'from-pink-500 to-pink-600',
      'DSA': 'from-indigo-500 to-indigo-600',
      'Interview Prep': 'from-teal-500 to-teal-600',
    };
    return gradients[category] || 'from-gray-500 to-gray-600';
  };

  const courseFilterFields = useMemo(
    () => [
      {
        id: 'course-filter-category',
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
        id: 'course-filter-level',
        label: 'Level',
        value: selectedLevel,
        onChange: setSelectedLevel,
        options: levelSelectList.map((l) => ({
          value: l,
          label: l === 'All' ? 'All levels' : l,
        })),
      },
      {
        id: 'course-filter-language',
        label: 'Language',
        value: filterLanguage,
        onChange: setFilterLanguage,
        options: languageSelectList.map((l) => ({
          value: l,
          label: l === 'All' ? 'All languages' : l,
        })),
      },
      {
        id: 'course-filter-price',
        label: 'Price',
        value: filterFree,
        onChange: setFilterFree,
        options: [
          { value: 'All', label: 'Free & paid' },
          { value: 'true', label: 'Free only' },
          { value: 'false', label: 'Paid only' },
        ],
      },
      {
        id: 'course-filter-featured',
        label: 'Featured',
        value: filterFeatured,
        onChange: setFilterFeatured,
        options: [
          { value: 'All', label: 'All courses' },
          { value: 'true', label: 'Featured only' },
        ],
      },
    ],
    [
      selectedCategory,
      selectedLevel,
      filterLanguage,
      filterFree,
      filterFeatured,
      categorySelectList,
      levelSelectList,
      languageSelectList,
    ]
  );

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbs),
      {
        '@type': 'ItemList',
        '@id': 'https://edulumix.in/courses',
        name: 'Online Courses',
        description: 'Top online courses for skill development and career growth',
        itemListElement: courses.slice(0, 10).map((course, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Course',
            name: course.title,
            description: course.description,
            url: `https://edulumix.in/courses/${course.slug}`
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Online Courses - Learn Programming, Web Development & More | EduLumix"
        description="Explore top online courses in programming, web development, data science, AI/ML, and more. Learn from industry experts with hands-on projects. Start your learning journey today!"
        keywords="online courses, programming courses, web development courses, data science courses, AI courses, machine learning courses, free courses, paid courses, skill development, learn online, certification courses"
        url="/courses"
        structuredData={structuredData}
      />
      
      <ListingPageHero
          imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=85"
          objectPositionClass="object-[center_40%] sm:object-center"
          eyebrow={
            <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
              From basics to job-ready — one place to learn
            </p>
          }
          title="Courses picked for real careers"
          description="Web, mobile, data, cloud, interviews, DSA — filter by category and level, then dive in. Free and paid options, clear structure, no endless scrolling without a map."
          stat={{
            label: 'Courses in this list',
            value: listTotal.toLocaleString('en-IN'),
            Icon: GraduationCap,
          }}
          statLoading={loading && courses.length === 0}
        />

      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        <CategoryExplorer
          id="course-categories-heading"
          title="Explore by category"
          subtitle="Choose a track — then fine-tune with search and level"
          categories={COURSE_HUB_CATEGORIES}
          selectedKey={selectedCategory === 'All' ? null : selectedCategory}
          onSelect={selectCategory}
          onViewAll={() => selectCategory('All')}
          viewAllLabel="View all courses"
        />

        <div className="mb-8" ref={listingsRef}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by title, topic, or instructor..."
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
                aria-controls="course-advanced-filters"
                title={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading && courses.length === 0 ? (
                'Loading listings…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {courses.length.toLocaleString('en-IN')}
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
            id="course-advanced-filters"
            className={showFilters ? 'mt-5 block' : 'mt-5 hidden lg:block'}
          >
            <ListingAdvancedFilters
              title="Advanced filters"
              subtitle="Category, level, language, price, and featured picks"
              fields={courseFilterFields}
              optionsLoading={optionsLoading}
              onReset={resetListingFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || activeFilterCount > 0
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new courses'}
            </p>
            {(searchTerm || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  resetListingFilters(true);
                  // force refetch since searchTermRef won't trigger useEffect
                  setTimeout(() => fetchCourses(1), 0);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => handleViewCourse(course)}
                className="group bg-white dark:bg-dark-200 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-dark-100 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  {/* Colored fallback background with title */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(course.category)} flex items-center justify-center p-4`}>
                    <h3 className="text-white font-bold text-base text-center leading-tight line-clamp-4">
                      {course.title}
                    </h3>
                  </div>
                  
                  {/* Try to load thumbnail image on top */}
                  {course.thumbnail && course.thumbnail.startsWith('http') && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2 z-20">
                    {course.isFree && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        FREE
                      </span>
                    )}
                    {course.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay */}
                  {course.previewVideo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 z-20">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category & Level */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(course.category)}`}>
                      {course.category}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  {course.instructor?.name && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      By {course.instructor.name}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      {course.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(course.enrollments || 0).toLocaleString('en-IN')}
                    </span>
                    {course.rating > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        {course.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-100">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(course)}
                    </div>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1">
                      Enroll Now <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && courses.length > 0 && hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-10 min-h-[60px]">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
        {!loading && courses.length > 0 && !hasMore && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">You've seen all courses</p>
        )}


      </div>
    </div>
  );
};

export default Courses;
