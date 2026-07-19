'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from '@/utils/reactRouterCompat';
import { 
  ArrowLeft, Building, MapPin, Clock, IndianRupee, 
  Calendar, Heart, Eye, ExternalLink, Share2,
  Tag, User, Mail, Briefcase, CheckCircle, AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { jobService } from '../services/dataService';
import toast from 'react-hot-toast';
import VerifiedBadge from '../components/common/VerifiedBadge';
import FormattedJobDescription from '../components/job/FormattedJobDescription';
import SEO from '../components/seo/SEO';
import CompanyAvatar from '../components/common/CompanyAvatar';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';
import { generateJobPostingSchema, generateBreadcrumbSchema } from '../utils/seoSchemas';
import { JOB_CATEGORIES } from '../config/jobCategories';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  useEffect(() => {
    setHeroImageFailed(false);
    fetchJob();
    // Check if user has liked this job
    const savedLikes = localStorage.getItem('likedJobs');
    if (savedLikes) {
      const likedJobs = new Set(JSON.parse(savedLikes));
      // Extract job ID from slug if needed
      const jobId = id.split('-').pop();
      setLiked(likedJobs.has(jobId) || likedJobs.has(id));
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      // Try to fetch by slug first, then by ID
      let response;
      try {
        response = await jobService.getBySlug(id);
      } catch {
        // Fallback to ID if slug doesn't work
        const jobId = id.split('-').pop();
        response = await jobService.getById(jobId);
      }
      
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await jobService.like(job._id);
      
      // Update local state
      const savedLikes = localStorage.getItem('likedJobs');
      const likedJobs = savedLikes ? new Set(JSON.parse(savedLikes)) : new Set();
      
      if (liked) {
        likedJobs.delete(job._id);
      } else {
        likedJobs.add(job._id);
      }
      
      localStorage.setItem('likedJobs', JSON.stringify([...likedJobs]));
      setLiked(!liked);
      setJob({ ...job, likesCount: response.data.likesCount });
      
      toast.success(liked ? 'Removed from favorites' : 'Added to favorites!');
    } catch (error) {
      console.error('Failed to like');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleApply = () => {
    if (!job.applyLink) return;
    
    if (job.applyType === 'email') {
      window.location.href = `mailto:${job.applyLink}?subject=Application for ${job.title} at ${job.company}`;
    } else {
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if applyLink is email
  const isEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">Job not found</h2>
          <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: job.title, path: `/jobs/${id}` }
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateJobPostingSchema(job),
      generateBreadcrumbSchema(breadcrumbs)
    ]
  };

  const jobUrl = `/jobs/${id}`;
  const description = job.description?.slice(0, 160) || `${job.title} position at ${job.company}. ${job.location}. ${job.salary ? `Salary: ₹${job.salary}` : ''} Apply now on EduLumix.`;

  const categoryVisual =
    JOB_CATEGORIES.find((c) => c.key === job.category) ||
    JOB_CATEGORIES[JOB_CATEGORIES.length - 1];
  const heroImageUrl = categoryVisual?.image;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <SEO
        title={`${job.title} at ${job.company} - ${job.location} | Fresher Job Opening | EduLumix`}
        description={description}
        keywords={`${job.title}, ${job.company} jobs, ${job.location} jobs, fresher jobs, ${job.category} jobs, entry level jobs, ${job.title} vacancy, job opening`}
        url={jobUrl}
        type="article"
        structuredData={structuredData}
      />
      
      {/* Back Button */}
      <div className="bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="w-full px-8 lg:px-12 py-4">
          <Link
            to="/jobs"
            className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>

      <div className="w-full px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Main Card (Left Column) */}
          <div className="w-full lg:w-[65%] bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm rounded-3xl">
          {/* Header — category hero image + dark scrim (readable content) */}
          <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800 min-h-[220px]">
            {!heroImageFailed && heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
                onError={() => setHeroImageFailed(true)}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryVisual.gradient}`}
                aria-hidden
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35 pointer-events-none"
              aria-hidden
            />
            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <CompanyAvatar
                  company={job.company}
                  logoUrl={job.companyLogo}
                  size="xl"
                  rounded="2xl"
                  className="flex-shrink-0 ring-2 ring-white/30 shadow-lg shadow-black/20"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/25 backdrop-blur-sm">
                      <Tag className="w-3 h-3 shrink-0 opacity-90" />
                      {job.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                        job.status === 'Closed'
                          ? 'bg-red-500/35 text-red-50 border-red-400/35'
                          : 'bg-emerald-500/35 text-emerald-50 border-emerald-400/35'
                      }`}
                    >
                      {job.status === 'Closed' ? 'Application Closed' : 'Application Open'}
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-white/90">
                    <Building className="w-5 h-5 shrink-0 text-white/80" />
                    <span className="truncate">{job.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-col lg:flex-row shrink-0">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all border ${
                      liked
                        ? 'bg-blue-500/90 text-white border-blue-400/50 shadow-lg shadow-black/20'
                        : 'bg-white/10 text-white border-white/25 hover:bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span>{job.likesCount || 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-white/10 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Job Meta Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-100">
            <div className="p-4 bg-white dark:bg-dark-200 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Location</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{job.location}</p>
            </div>

            <div className="p-4 bg-white dark:bg-dark-200 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Experience</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{job.experience}</p>
            </div>

            <div className="p-4 bg-white dark:bg-dark-200 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <IndianRupee className="w-4 h-4 text-blue-500" />
                <span>Salary</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{job.salary || 'Not Disclosed'}</p>
            </div>

            <div className="p-4 bg-white dark:bg-dark-200 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Posted On</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(job.createdAt)}</p>
            </div>
          </div>

          {/* In-content Ad */}
          <AdSlot slotId={AD_SLOTS.IN_ARTICLE} className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800" />

          {/* Job Description */}
          <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Job Description
            </h2>
            <div className="prose prose-sm lg:prose max-w-none text-gray-600 dark:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-600 dark:prose-ul:text-gray-300">
              <FormattedJobDescription text={job.description} />
            </div>
            {job.source === 'adzuna' && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                Full description available on the company's apply page.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="px-6 lg:px-8 py-4 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {job.views || 0} views
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {job.likesCount || 0} likes
            </span>
          </div>

          {/* Apply Section */}
          <div className="p-6 lg:p-8">
            <button
              onClick={handleApply}
              disabled={job.status === 'Closed'}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                job.status === 'Closed'
                  ? 'bg-gray-200 dark:bg-dark-100 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              {job.status === 'Closed' ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  This Job is Closed
                </>
              ) : isEmail(job.applyLink) ? (
                <>
                  <Mail className="w-5 h-5" />
                  Apply via Email
                </>
              ) : (
                <>
                  Apply Now
                  <ExternalLink className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Posted By Section */}
          <div className="px-6 lg:px-8 py-5 bg-gray-50 dark:bg-dark-100 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Posted By</p>
            <div className="flex items-center gap-3">
              {job.postedBy ? (
                <>
                  {job.postedBy.avatar ? (
                    <img 
                      src={job.postedBy.avatar} 
                      alt={job.postedBy.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg ${job.postedBy.avatar ? 'hidden' : ''}`}
                  >
                    {job.postedBy.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {job.postedBy.name}
                      <VerifiedBadge user={job.postedBy} size="sm" />
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {job.postedBy.email}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      Deleted User
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This user account has been removed
                    </p>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>

          {/* Suggested Jobs (Right Column) */}
          <div className="w-full lg:w-[35%] shrink-0">
            <SuggestedJobs currentJobId={job._id} category={job.category} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Suggested Jobs Component
const SuggestedJobs = ({ currentJobId, category }) => {
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSuggestedJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobService.getAll({ category, limit: 6 });
      if (response.data.success) {
        // Filter out current job and limit to 6
        const filtered = response.data.data
          .filter(job => job._id !== currentJobId)
          .slice(0, 6);
        setSuggestedJobs(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch suggested jobs');
    } finally {
      setLoading(false);
    }
  }, [currentJobId, category]);

  useEffect(() => {
    fetchSuggestedJobs();
  }, [fetchSuggestedJobs]);

  const createSlug = (job) => {
    const titleSlug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${titleSlug}-${companySlug}-${job._id}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'IT Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Non IT Job': 'bg-blue-200 dark:bg-blue-600/20 text-blue-800 dark:text-blue-200',
      'Walk In Drive': 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400',
      'Govt Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Internship': 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400',
      'Part Time Job': 'bg-blue-200 dark:bg-blue-600/20 text-blue-800 dark:text-blue-200',
      'Remote Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Others': 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400',
    };
    return colors[category] || colors['Non IT Job'];
  };

  if (loading || suggestedJobs.length === 0) return null;

  return (
    <div className="mt-12 lg:mt-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Similar Jobs
        </h2>
        <Link 
          to="/jobs"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {suggestedJobs.map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/jobs/${createSlug(job)}`)}
            className="bg-white dark:bg-dark-200 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer group"
          >
            <div className="p-5">
              <div className="flex items-start gap-4 mb-3">
                {/* Company Logo */}
                <CompanyAvatar
                  company={job.company}
                  logoUrl={job.companyLogo}
                  size="lg"
                  rounded="xl"
                  className="flex-shrink-0"
                />
                
                {/* Title & Company */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {job.company}
                  </p>
                </div>
              </div>

              {/* Job Details Row-aligned */}
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

            {/* Card Footer */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-dark-100 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {job.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {job.likesCount || 0}
                </span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                View Details →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobDetails;
