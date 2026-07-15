'use client';
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useParams, useNavigate, Link } from '@/utils/reactRouterCompat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Heart,
  Share2,
  Calendar,
  FolderOpen,
  Video,
  FileText,
  Mail,
  User,
  Clock,
  Eye,
  Tag,
  Play,
  BookOpen,
  Globe,
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { resourceService } from '../services/dataService';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import VerifiedBadge from '../components/common/VerifiedBadge';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';

const SOURCE_META = {
  devto: {
    label: 'Dev.to',
    color: 'bg-gray-900 text-white',
    dot: 'bg-white',
  },
  medium: {
    label: 'Medium',
    color: 'bg-green-600 text-white',
    dot: 'bg-white',
  },
  manual: {
    label: 'Curated',
    color: 'bg-blue-600 text-white',
    dot: 'bg-white',
  },
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [relatedResources, setRelatedResources] = useState([]);
  const [fullContent, setFullContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  const normalizedTags = (() => {
    const tags = fullContent?.tags;
    if (Array.isArray(tags)) return tags.filter(Boolean);
    if (typeof tags === 'string') {
      return tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  })();

  const safeBodyHtml = typeof fullContent?.bodyHtml === 'string' ? DOMPurify.sanitize(fullContent.bodyHtml) : '';

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getById(id);
      if (response.data.success) {
        const res = response.data.data;
        setResource(res);
        setLikeCount(Number(res.likes) || 0);
        setFullContent(null);
        fetchRelatedResources(res.category);
        // Auto-fetch full content for Dev.to (with externalId) and Medium articles
        if ((res.source === 'devto' && res.externalId) || res.source === 'medium') {
          fetchFullContent(res._id);
        }
      } else {
        // success: false — resource not found or deleted
        navigate('/resources');
      }
    } catch (error) {
      toast.error('Failed to fetch resource details');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullContent = async (resourceId) => {
    try {
      setContentLoading(true);
      const res = await resourceService.getFullContent(resourceId);
      if (res.data.success && res.data.data) {
        setFullContent(res.data.data);
      }
    } catch (_) {
      // fail silently â€” will fall back to description
    } finally {
      setContentLoading(false);
    }
  };

  const fetchRelatedResources = async (category) => {
    try {
      const response = await resourceService.getAll({ category });
      if (response.data.success) {
        const filtered = response.data.data
          .filter(r => r._id !== id)
          .slice(0, 4);
        setRelatedResources(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch related resources');
    }
  };

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
    toast.success(liked ? 'Like removed' : 'Resource liked!');
  };

  const handleDownload = () => {
    if (resource?.link) {
      window.open(resource.link, '_blank');
      toast.success('Opening resource...');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: resource?.title,
      text: `Check out this resource: ${resource?.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getCategoryIcon = () => {
    if (resource?.isVideo) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Software Notes': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Interview Notes': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Tools & Technology': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Trending Technology': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Video Resources': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Software Project': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Hardware Project': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'Software Notes': 'from-blue-500 to-blue-600',
      'Interview Notes': 'from-purple-500 to-purple-600',
      'Tools & Technology': 'from-green-500 to-green-600',
      'Trending Technology': 'from-orange-500 to-orange-600',
      'Video Resources': 'from-red-500 to-red-600',
      'Software Project': 'from-indigo-500 to-indigo-600',
      'Hardware Project': 'from-teal-500 to-teal-600',
    };
    return gradients[category] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">Resource not found</h2>
          <Link to="/resources" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  const sourceLabel = SOURCE_META[resource?.source]?.label || 'Source';
  const ytId = getYouTubeId(resource?.link || '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <SEO
        title={`${resource.title} - Free Resource | EduLumix`}
        description={resource.description || `Download ${resource.title} - ${resource.category}`}
        keywords={`${resource.title}, ${resource.category}, ${resource.subcategory}, free resources, download, edulumix`}
        ogType="article"
        canonicalUrl={`https://edulumix.in/resources/${id}`}
      />

      {/* â”€â”€ Sticky breadcrumb nav â”€â”€ */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-dark-200/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-3 flex items-center gap-2 min-w-0">
          <Link
            to="/resources"
            className="flex-shrink-0 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Resources
          </Link>
          <span className="text-gray-300 dark:text-gray-700 flex-shrink-0">/</span>
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">{resource.title}</span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
        <div className="max-w-[1400px] mx-auto">

          {/* â”€â”€ Two-column grid â”€â”€ */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* â•â•â•â•â•â•â•â• MAIN ARTICLE â•â•â•â•â•â•â•â• */}
            <main className="flex-1 min-w-0">
              <article className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

                {/* Hero: YouTube embed */}
                {ytId && (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={resource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                {/* Hero: thumbnail image */}
                {!ytId && resource.thumbnail && (
                  <div className="overflow-hidden bg-gray-100 dark:bg-dark-100">
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full max-h-96 object-cover"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Article header */}
                <div className="px-6 lg:px-10 pt-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    {resource.source && SOURCE_META[resource.source] && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${SOURCE_META[resource.source].color}`}>
                        <Globe className="w-3 h-3" />
                        {SOURCE_META[resource.source].label}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                      <Tag className="w-3 h-3" />
                      {resource.category}
                    </span>
                    {resource.subcategory && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        {resource.subcategory}
                      </span>
                    )}
                    {resource.isVideo && (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> Video
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl lg:text-3xl xl:text-[2rem] font-bold text-gray-900 dark:text-white mb-5 leading-snug">
                    {resource.title}
                  </h1>

                  {/* Author + date row (populated from fullContent for Dev.to) */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                    {fullContent?.author?.name && (
                      <div className="flex items-center gap-2.5">
                        {fullContent.author.avatar ? (
                          <img
                            src={fullContent.author.avatar}
                            alt={fullContent.author.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-dark-200 shadow"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {fullContent.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{fullContent.author.name}</p>
                          {fullContent.author.username && (
                            <p className="text-xs text-gray-400">@{fullContent.author.username}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {fullContent?.publishedAt && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(fullContent.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {!fullContent?.publishedAt && resource.createdAt && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {fullContent?.readingTimeMinutes && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {fullContent.readingTimeMinutes} min read
                      </span>
                    )}
                  </div>
                </div>

                {/* â”€â”€ Article body â”€â”€ */}
                {contentLoading ? (
                  <div className="px-6 lg:px-10 py-14 flex flex-col items-center gap-4 text-gray-400">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading full articleâ€¦</span>
                  </div>
                ) : safeBodyHtml ? (
                  <>
                    <div
                      className="article-body px-6 lg:px-10 py-8"
                      dangerouslySetInnerHTML={{ __html: safeBodyHtml }}
                    />
                    {resource.source === 'medium' && resource.link && (
                      <div className="px-6 lg:px-10 pb-8">
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                          Read Full Article on Medium
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </>
                ) : resource.description ? (
                  <div className="px-6 lg:px-10 py-8">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      About this Resource
                    </h2>
                    <div className="article-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{resource.description}</ReactMarkdown>
                    </div>
                    {resource.source === 'medium' && resource.link && (
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center justify-center gap-2.5 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                        Read Full Article on Medium
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : null}

                {/* Tags row */}
                {normalizedTags.length > 0 && (
                  <div className="px-6 lg:px-10 py-5 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-2">
                    {normalizedTags.map((t) => (
                      <span key={t} className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ad slot */}
                <AdSlot slotId={AD_SLOTS.IN_ARTICLE} className="px-6 lg:px-10 py-4 border-t border-gray-200 dark:border-gray-800" />

                {/* Reactions / comments stats */}
                {(fullContent?.reactions > 0 || fullContent?.commentsCount > 0) && (
                  <div className="px-6 lg:px-10 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-5 text-sm text-gray-400 dark:text-gray-500">
                    {fullContent.reactions > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-red-400" /> {fullContent.reactions} reactions
                      </span>
                    )}
                    {fullContent.commentsCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" /> {fullContent.commentsCount} comments
                      </span>
                    )}
                  </div>
                )}
              </article>
            </main>

            {/* â•â•â•â•â•â•â•â• SIDEBAR â•â•â•â•â•â•â•â• */}
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-16 space-y-4">

                {/* CTA Card */}
                <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
                  {resource.link && (
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => resourceService.download(resource._id).catch(() => {})}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/25 text-sm"
                    >
                      {resource.isVideo ? (
                        <><Play className="w-4 h-4 fill-current" /> Watch on {sourceLabel}</>
                      ) : (
                        <><ExternalLink className="w-4 h-4" /> Read on {sourceLabel}</>
                      )}
                    </a>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleLike}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                        liked
                          ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-500/10'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      {likeCount}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-all"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>

                {/* Article Meta */}
                {(fullContent?.readingTimeMinutes || resource.downloads > 0 || fullContent?.reactions > 0) && (
                  <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Stats</h3>
                    <div className="space-y-2.5">
                      {fullContent?.readingTimeMinutes && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Reading time</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{fullContent.readingTimeMinutes} min</span>
                        </div>
                      )}
                      {fullContent?.reactions > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Reactions</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{fullContent.reactions}</span>
                        </div>
                      )}
                      {resource.downloads > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Views</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{resource.downloads}</span>
                        </div>
                      )}
                      {likeCount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" /> Likes</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{likeCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Author card (Dev.to only â€” comes from fullContent) */}
                {fullContent?.author?.name && (
                  <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Author</h3>
                    <div className="flex items-center gap-3">
                      {fullContent.author.avatar ? (
                        <img
                          src={fullContent.author.avatar}
                          alt={fullContent.author.name}
                          className="w-12 h-12 rounded-full object-cover shadow"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {fullContent.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{fullContent.author.name}</p>
                        {fullContent.author.username && (
                          <a
                            href={`https://dev.to/${fullContent.author.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
                          >
                            @{fullContent.author.username}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags (sidebar version) */}
                {normalizedTags.length > 0 && (
                  <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {normalizedTags.map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posted By (EduLumix uploader) */}
                <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Posted on EduLumix by</h3>
                  <div className="flex items-center gap-3">
                    {resource.postedBy ? (
                      <>
                        {resource.postedBy.avatar ? (
                          <img
                            src={resource.postedBy.avatar}
                            alt={resource.postedBy.name}
                            className="w-10 h-10 rounded-full object-cover shadow"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ${resource.postedBy.avatar ? 'hidden' : ''}`}>
                          {resource.postedBy.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1 leading-tight">
                            {resource.postedBy.name}
                            <VerifiedBadge user={resource.postedBy} size="sm" />
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resource.postedBy.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Deleted User</p>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </aside>
          </div>

          {/* â”€â”€ Related Resources â”€â”€ */}
          {relatedResources.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center justify-between">
                <span>More from {resource.category}</span>
                <Link to="/resources" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  View All â†’
                </Link>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedResources.map((rel) => (
                  <Link
                    key={rel._id}
                    to={`/resources/${rel._id}`}
                    className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-dark-100">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(rel.category)} flex items-center justify-center p-4`}>
                        <h3 className="text-white font-bold text-sm text-center leading-tight line-clamp-3">{rel.title}</h3>
                      </div>
                      {rel.thumbnail && rel.thumbnail.startsWith('http') && (
                        <img src={rel.thumbnail} alt={rel.title} className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      {getYouTubeId(rel.link) && (
                        <img src={`https://img.youtube.com/vi/${getYouTubeId(rel.link)}/mqdefault.jpg`} alt={rel.title} className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      {rel.isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rel.title}
                      </h3>
                      {rel.subcategory && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rel.subcategory}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
