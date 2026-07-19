'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Search, Filter, Briefcase, MapPin, Clock, 
  Heart, Eye,
  Tag, Loader2,
  Zap, ArrowRight, LayoutGrid,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { jobService } from '../services/dataService';
import { JOB_CATEGORIES, JOB_CATEGORY_KEYS } from '../config/jobCategories';
import { JobCardSkeleton } from '../components/skeleton';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import CompanyAvatar from '../components/common/CompanyAvatar';
import { generateBreadcrumbSchema, generateJobListSchema, generateSearchActionSchema } from '../utils/seoSchemas';
import { getSEOConfig, JOB_CATEGORY_SEO, getRandomVariant } from '../config/seoConfig';
import JobListingFilters from '../components/listing/JobListingFilters';

const PAGE_SIZE = 12;

const DEFAULT_EXPERIENCE_LEVELS = [
  'Fresher',
  '1 Year',
  '2 Years',
  '3 Years',
  '4 Years',
  '5+ Years',
];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterExperience, setFilterExperience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    cities: [],
    experiences: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  /** Mobile: collapse / expand advanced filter panel */
  const [showFilters, setShowFilters] = useState(false);
  const [likedJobs, setLikedJobs] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  const listingsRef = useRef(null);
  const searchTermRef = useRef(searchTerm);
  searchTermRef.current = searchTerm;
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listTotal, setListTotal] = useState(0);

  const categorySelectOptions = ['All', ...JOB_CATEGORY_KEYS];

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
    if (filterCity !== 'All') n += 1;
    if (filterLocation !== 'All') n += 1;
    if (filterExperience !== 'All') n += 1;
    if (filterStatus !== 'All') n += 1;
    return n;
  }, [selectedCategory, filterCity, filterLocation, filterExperience, filterStatus]);

  const resetListingFilters = () => {
    setSelectedCategory('All');
    setFilterCity('All');
    setFilterLocation('All');
    setFilterExperience('All');
    setFilterStatus('All');
  };

  useEffect(() => {
    const savedLikes = localStorage.getItem('likedJobs');
    if (savedLikes) {
      setLikedJobs(new Set(JSON.parse(savedLikes)));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatsLoading(true);
        const res = await jobService.getStats();
        if (!cancelled && res.data?.success && res.data?.data) {
          setStats(res.data.data);
        }
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOptionsLoading(true);
        const res = await jobService.getFilterOptions();
        if (!cancelled && res.data?.success && res.data?.data) {
          setFilterOptions({
            locations: res.data.data.locations || [],
            cities: res.data.data.cities || [],
            experiences: res.data.data.experiences || [],
          });
        }
      } catch {
        if (!cancelled) {
          setFilterOptions({ locations: [], cities: [], experiences: [] });
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const experienceOptions =
    filterOptions.experiences.length > 0
      ? filterOptions.experiences
      : DEFAULT_EXPERIENCE_LEVELS;

  const fetchJobs = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { limit: PAGE_SIZE, page: pageNum };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filterCity !== 'All') params.city = filterCity;
      if (filterLocation !== 'All') params.location = filterLocation;
      if (filterExperience !== 'All') params.experience = filterExperience;
      if (filterStatus !== 'All') params.status = filterStatus;
      const response = await jobService.getAll(params);
      if (response.data.success) {
        const data = response.data.data || [];
        const totalPages = response.data.totalPages ?? 1;
        setPage(pageNum);
        setHasMore(pageNum < totalPages);

        if (append) {
          setJobs(prev => [...prev, ...data]);
        } else {
          setJobs(data);
          setListTotal(response.data.total ?? data.length);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, filterCity, filterLocation, filterExperience, filterStatus]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchJobs(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasMore, loadingMore, loading, page, fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchJobs(page + 1, true);
  };

  const handleLike = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await jobService.like(id);
      
      // Update local state
      const newLikedJobs = new Set(likedJobs);
      if (likedJobs.has(id)) {
        newLikedJobs.delete(id);
      } else {
        newLikedJobs.add(id);
      }
      setLikedJobs(newLikedJobs);
      localStorage.setItem('likedJobs', JSON.stringify([...newLikedJobs]));
      
      // Update job likes count
      setJobs(prev => prev.map(job =>
        job._id === id ? { ...job, likesCount: response.data.likesCount } : job
      ));
    } catch (error) {
      console.error('Failed to like job');
    }
  };

  // Create URL-friendly slug
  const createSlug = (job) => {
    const titleSlug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${titleSlug}-${companySlug}-${job._id}`;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'IT Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Non IT Job': 'bg-blue-200 dark:bg-blue-600/20 text-blue-800 dark:text-blue-200',
      'Walk In Drive': 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400',
      'Govt Job': 'bg-blue-300 dark:bg-blue-700/20 text-blue-900 dark:text-blue-100',
      'Internship': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Part Time Job': 'bg-sky-200 dark:bg-sky-600/20 text-sky-800 dark:text-sky-200',
      'Remote Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Others': 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
    };
    return colors[category] || colors['Non IT Job'];
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Jobs', path: '/jobs' }
  ];

  // Get SEO config based on category
  const seoConfig = selectedCategory !== 'All' && JOB_CATEGORY_SEO[selectedCategory]
    ? {
        title: getRandomVariant(JOB_CATEGORY_SEO[selectedCategory].titles),
        description: getRandomVariant(JOB_CATEGORY_SEO[selectedCategory].descriptions)
      }
    : getSEOConfig('jobs');

  // Enhanced structured data with JobPosting schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbs),
      generateSearchActionSchema(),
      generateJobListSchema(jobs.slice(0, 20)), // Top 20 jobs for structured data
      {
        '@type': 'CollectionPage',
        '@id': 'https://edulumix.in/jobs',
        url: 'https://edulumix.in/jobs',
        name: seoConfig.title,
        description: seoConfig.description,
        isPartOf: {
          '@id': 'https://edulumix.in/#website'
        },
        breadcrumb: {
          '@id': 'https://edulumix.in/jobs#breadcrumb'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords="fresher jobs 2026, jobs for freshers india, entry level jobs, IT jobs freshers, software developer jobs, fresher vacancies, govt jobs, internship opportunities, walk in drive, remote jobs freshers, job openings 2026, campus placement, graduate jobs, first job, fresher recruitment, job portal india, career opportunities, fresher hiring, entry level positions, job search india"
        url="/jobs"
        type="website"
        canonical="https://edulumix.in/jobs"
        structuredData={structuredData}
      />
      
      {/* Hero + live stats */}
      <section className="relative min-h-[320px] sm:min-h-[380px] overflow-hidden mb-10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=85"
            alt=""
            className="h-full w-full object-cover object-[center_30%] sm:object-right"
            loading="eager"
            decoding="async"
          />
          {/* Dark scrim only on the text (left) side; right stays vivid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 28%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0.08) 68%, transparent 82%)',
            }}
            aria-hidden
          />
        </div>
        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
              Freshers or experienced — your next move starts here
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-display tracking-tight mb-4 drop-shadow-md [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
              Land the role that fits your story
            </h1>
            <p className="text-white/95 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl [text-shadow:0_1px_16px_rgba(0,0,0,0.45)]">
              From first job to your next big leap — explore IT, government, internships, remote roles and more. Smart categories, zero clutter — find what fits you and apply with confidence.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 px-5 py-4 min-w-[200px] shadow-lg shadow-black/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/80 uppercase tracking-wide font-medium">Total jobs</p>
                  <p className="text-3xl font-bold text-white tabular-nums">
                    {statsLoading ? '—' : (stats?.total ?? 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        {/* Category explorer */}
        <section className="mb-10" aria-labelledby="job-categories-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 id="job-categories-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">
                Explore by category
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Jump in by role type — fresher or experienced, there&apos;s a lane for you
              </p>
            </div>
            <button
              type="button"
              onClick={() => selectCategory('All')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-auto"
            >
              View all jobs
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {JOB_CATEGORIES.map((cat) => {
              const Icon = cat.Icon;
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => selectCategory(cat.key)}
                  className={`group relative text-left overflow-hidden rounded-2xl border transition-all duration-300 active:scale-[0.98] focus:outline-none ${
                    active
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/5 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'border-gray-200 dark:border-gray-850 bg-white/60 dark:bg-dark-100/60 backdrop-blur-sm hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-none'
                  }`}
                >
                  <div className="relative h-24 sm:h-28 overflow-hidden bg-gray-100 dark:bg-dark-100">
                    <img
                      src={cat.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="relative p-3 sm:p-4 bg-white dark:bg-dark-200">
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg ${cat.ring} ring-2`}
                    >
                      <Icon className="w-5 h-5" aria-hidden />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                      {cat.shortTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {cat.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Search + quick chips */}
        <div className="mb-8" ref={listingsRef}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, or keywords..."
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
                onClick={() => setShowFilters((open) => !open)}
                className="lg:hidden px-4 py-3.5 bg-gray-100 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-400"
                aria-expanded={showFilters}
                aria-controls="job-advanced-filters"
                title={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </form>

          <div
            id="job-advanced-filters"
            className={showFilters ? 'mt-5 block' : 'mt-5 hidden lg:block'}
          >
            <JobListingFilters
              category={selectedCategory}
              onCategoryChange={(v) => {
                setSelectedCategory(v);
                setTimeout(scrollToListings, 120);
              }}
              city={filterCity}
              onCityChange={setFilterCity}
              location={filterLocation}
              onLocationChange={setFilterLocation}
              experience={filterExperience}
              onExperienceChange={setFilterExperience}
              status={filterStatus}
              onStatusChange={setFilterStatus}
              categories={categorySelectOptions}
              cities={filterOptions.cities}
              locations={filterOptions.locations}
              experiences={experienceOptions}
              optionsLoading={optionsLoading}
              onReset={resetListingFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? (
                'Loading listings…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {jobs.length.toLocaleString('en-IN')}
                  </span>
                  {activeFilterCount > 0 || searchTerm.trim() ? (
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
                  ) : (
                    <>
                      {' '}
                      loaded ·{' '}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {(stats?.total ?? listTotal).toLocaleString('en-IN')}
                      </span>
                      {' '}
                      in database
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const jobPath = `/jobs/${createSlug(job)}`;
              return (
                <div
                  key={job._id}
                  onClick={() => window.location.href = jobPath}
                  className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-md rounded-3xl border border-gray-200/60 dark:border-gray-850 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 dark:hover:shadow-none hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-3">
                      <CompanyAvatar
                        company={job.company}
                        logoUrl={job.companyLogo}
                        size="lg"
                        rounded="xl"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Row 1: Location & Category */}
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate font-semibold">{job.location}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex-shrink-0 tracking-wider uppercase ${getCategoryColor(job.category)}`}>
                          <Tag className="w-3 h-3" />
                          {job.category}
                        </span>
                      </div>

                      {/* Row 2: Experience & Status */}
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate font-semibold">{job.experience}</span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex-shrink-0 tracking-wider uppercase ${
                          job.status === 'Closed'
                            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/30'
                            : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            job.status === 'Closed' ? 'bg-red-500' : 'bg-green-500 animate-pulse'
                          }`} />
                          {job.status === 'Closed' ? 'Closed' : 'Open'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50/40 dark:bg-dark-100/40 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-850 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {job.views || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        {job.likesCount || 0}
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite scroll trigger + Load more fallback */}
        {!loading && jobs.length > 0 && hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-10 min-h-[60px]">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
        {!loading && jobs.length > 0 && !hasMore && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">You've seen all jobs</p>
        )}
      </div>
    </div>
  );
};

export default Jobs;
