'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from '@/utils/reactRouterCompat';
import { 
  Search, Filter, ClipboardList, Users, Star,
  Target, ChevronRight, Trophy,
  CheckCircle, Timer, Brain, Loader2, Zap,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { mockTestService } from '../services/dataService';
import { MockTestCardSkeleton } from '../components/skeleton';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';
import ListingPageHero from '../components/listing/ListingPageHero';
import CategoryExplorer from '../components/listing/CategoryExplorer';
import { MOCK_TEST_HUB_CATEGORIES } from '../config/listingHubConfigs';
import ListingAdvancedFilters from '../components/listing/ListingAdvancedFilters';

const DEFAULT_MOCK_CATEGORIES = [
  'All',
  'Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Technical - Programming',
  'Technical - DSA',
  'Technical - DBMS',
  'Technical - OS',
  'Technical - CN',
  'Technical - Web Dev',
  'Company Specific',
  'Gate',
  'Government Exams',
  'Others',
];

const DEFAULT_DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard', 'Mixed'];

const MockTests = () => {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterFree, setFilterFree] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState('All');
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    difficulties: [],
    companies: [],
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
    if (fromApi.length === 0) return DEFAULT_MOCK_CATEGORIES;
    return ['All', ...fromApi.filter((c) => c && c !== 'All')];
  }, [filterOptions.categories]);

  const difficultySelectList = useMemo(() => {
    const fromApi = filterOptions.difficulties || [];
    if (fromApi.length === 0) return DEFAULT_DIFFICULTIES;
    return ['All', ...fromApi.filter((d) => d && d !== 'All')];
  }, [filterOptions.difficulties]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedCategory !== 'All') n += 1;
    if (selectedDifficulty !== 'All') n += 1;
    if (filterCompany !== 'All') n += 1;
    if (filterFree !== 'All') n += 1;
    if (filterFeatured !== 'All') n += 1;
    return n;
  }, [selectedCategory, selectedDifficulty, filterCompany, filterFree, filterFeatured]);

  const resetListingFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setFilterCompany('All');
    setFilterFree('All');
    setFilterFeatured('All');
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOptionsLoading(true);
        const res = await mockTestService.getFilterOptions();
        if (!cancelled && res.data?.success && res.data?.data) {
          setFilterOptions({
            categories: res.data.data.categories || [],
            difficulties: res.data.data.difficulties || [],
            companies: res.data.data.companies || [],
          });
        }
      } catch {
        if (!cancelled) setFilterOptions({ categories: [], difficulties: [], companies: [] });
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const PAGE_SIZE = 12;

  const fetchMockTests = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      const params = { limit: PAGE_SIZE, page: pageNum };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (filterCompany !== 'All') params.company = filterCompany;
      if (filterFree === 'true') params.isFree = 'true';
      if (filterFree === 'false') params.isFree = 'false';
      if (filterFeatured === 'true') params.isFeatured = 'true';
      const q = searchTermRef.current?.trim();
      if (q) params.search = q;
      const response = await mockTestService.getAll(params);
      if (response.data.success) {
        const data = response.data.data || [];
        const totalPages = response.data.totalPages ?? 1;
        setPage(pageNum);
        setHasMore(pageNum < totalPages);
        if (append) setMockTests((prev) => [...prev, ...data]);
        else {
          setMockTests(data);
          setListTotal(response.data.total ?? data.length);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch mock tests');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, selectedDifficulty, searchTerm]);

  useEffect(() => {
    fetchMockTests(1);
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMockTests(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadingMore, loading, page, selectedCategory, selectedDifficulty, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMockTests(1);
  };

  const handleViewTest = (test) => {
    const slug = test.slug || `${test.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${test._id}`;
    navigate(`/mock-test/${slug}`);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Medium': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Hard': 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      'Mixed': 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300',
    };
    return colors[difficulty] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
  };

  const mockTestFilterFields = useMemo(
    () => [
      {
        id: 'mock-filter-category',
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
        id: 'mock-filter-difficulty',
        label: 'Difficulty',
        value: selectedDifficulty,
        onChange: setSelectedDifficulty,
        options: difficultySelectList.map((d) => ({
          value: d,
          label: d === 'All' ? 'All difficulties' : d,
        })),
      },
      {
        id: 'mock-filter-company',
        label: 'Company / exam',
        value: filterCompany,
        onChange: setFilterCompany,
        options: [
          { value: 'All', label: 'All companies' },
          ...filterOptions.companies.map((co) => ({ value: co, label: co })),
        ],
      },
      {
        id: 'mock-filter-free',
        label: 'Access',
        value: filterFree,
        onChange: setFilterFree,
        options: [
          { value: 'All', label: 'Free & paid' },
          { value: 'true', label: 'Free only' },
          { value: 'false', label: 'Paid only' },
        ],
      },
      {
        id: 'mock-filter-featured',
        label: 'Featured',
        value: filterFeatured,
        onChange: setFilterFeatured,
        options: [
          { value: 'All', label: 'All tests' },
          { value: 'true', label: 'Featured only' },
        ],
      },
    ],
    [
      selectedCategory,
      selectedDifficulty,
      filterCompany,
      filterFree,
      filterFeatured,
      categorySelectList,
      difficultySelectList,
      filterOptions.companies,
    ]
  );

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Mock Tests', path: '/mock-test' }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbs),
      {
        '@type': 'ItemList',
        '@id': 'https://edulumix.in/mock-test',
        name: 'Mock Tests & Practice Exams',
        description: 'Free mock tests for interview preparation and competitive exams',
        url: 'https://edulumix.in/mock-test'
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Mock Tests - Practice Tests for Interview & Exam Preparation | EduLumix"
        description="Take free mock tests for aptitude, reasoning, technical skills, and competitive exams. Practice with real exam patterns and boost your interview preparation. Assess your skills now!"
        keywords="mock tests, practice tests, online mock test, aptitude test, reasoning test, technical test, interview preparation, competitive exam preparation, free mock test, placement test, skill assessment"
        url="/mock-test"
        structuredData={structuredData}
      />
      
      <ListingPageHero
          imageUrl="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=2000&q=85"
          objectPositionClass="object-[center_35%] sm:object-center"
          eyebrow={
            <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
              Practice like it&apos;s the real paper
            </p>
          }
          title="Mock tests built for placement & exams"
          description="Aptitude, reasoning, verbal, technical, company-specific, GATE and more — timed sets with clear difficulty. Choose a track, tighten filters, and start a run."
          stat={{
            label: 'Tests in this list',
            value: listTotal.toLocaleString('en-IN'),
            Icon: ClipboardList,
          }}
          statLoading={loading && mockTests.length === 0}
        />

      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        <CategoryExplorer
          id="mock-test-categories-heading"
          title="Explore by paper type"
          subtitle="Pick what you’re preparing for — filters and search sit just below"
          categories={MOCK_TEST_HUB_CATEGORIES}
          selectedKey={selectedCategory === 'All' ? null : selectedCategory}
          onSelect={selectCategory}
          onViewAll={() => selectCategory('All')}
          viewAllLabel="View all mock tests"
        />

        <div className="mb-8" ref={listingsRef}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mock tests by title or topic..."
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
                aria-controls="mock-advanced-filters"
                title={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading && mockTests.length === 0 ? (
                'Loading listings…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {mockTests.length.toLocaleString('en-IN')}
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
            id="mock-advanced-filters"
            className={showFilters ? 'mt-5 block' : 'mt-5 hidden lg:block'}
          >
            <ListingAdvancedFilters
              title="Advanced filters"
              subtitle="Paper type, difficulty, company, access, and featured sets"
              fields={mockTestFilterFields}
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
              <MockTestCardSkeleton key={i} />
            ))}
          </div>
        ) : mockTests.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No mock tests found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || activeFilterCount > 0
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new mock tests'}
            </p>
            {(searchTerm || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  resetListingFilters();
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Mock Tests Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTests.map((test) => (
              <div
                key={test._id}
                onClick={() => handleViewTest(test)}
                className="group bg-white dark:bg-dark-200 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-dark-100 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
              >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-blue-500 to-blue-700 p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                        {test.category}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </div>
                    {test.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute bottom-4 left-5 right-5">
                    <Brain className="w-10 h-10 text-white/30" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {test.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {test.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" />
                      {test.questions?.length || test.totalQuestions || 0} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {formatDuration(test.duration || 30)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {test.totalMarks || test.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0} marks
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {test.attempts || 0}
                    </span>
                  </div>

                  {/* Passing marks info */}
                  {test.passingMarks && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      Pass: {test.passingMarks} marks ({Math.round((test.passingMarks / (test.totalMarks || 100)) * 100)}%)
                    </div>
                  )}

                  {/* CTA */}
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                    Start Test <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && mockTests.length > 0 && hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-10 min-h-[60px]">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
        {!loading && mockTests.length > 0 && !hasMore && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">You've seen all mock tests</p>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Practice with Our Mock Tests?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real Exam Pattern</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests designed to match actual exam patterns</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Detailed Solutions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learn from detailed explanations for each question</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your improvement with performance analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTests;
