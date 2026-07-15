'use client';
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useParams, Link, useNavigate } from '@/utils/reactRouterCompat';
import { 
  ArrowLeft, Calendar, Clock, Eye, ThumbsUp, 
  User, Share2, Tag, Star, FileText, Loader2,
  Facebook, Twitter, Linkedin, Copy, Check, TrendingUp, ExternalLink
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { blogService } from '../services/dataService';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBlogSchema, generateBreadcrumbSchema } from '../utils/seoSchemas';
import VerifiedBadge from '../components/common/VerifiedBadge';
import { useAuth } from '../context/AuthContext';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullContent, setFullContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlog();
      fetchTrendingBlogs();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBySlug(slug);
      if (response.data.success) {
        const b = response.data.data;
        setBlog(b);
        // Auto-fetch full content for Dev.to and Medium blogs
        if (b.source === 'devto' || b.source === 'medium') {
          fetchFullContent(b._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      toast.error('Blog not found');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullContent = async (blogId) => {
    try {
      setContentLoading(true);
      const res = await blogService.getFullContent(blogId);
      if (res.data.success && res.data.data) {
        setFullContent(res.data.data);
      }
    } catch (_) {
      // fail silently — fall back to stored content
    } finally {
      setContentLoading(false);
    }
  };

  const fetchTrendingBlogs = async () => {
    try {
      const response = await blogService.getAll({ limit: 10 });
      if (response.data.success) {
        // Filter out current blog and get top trending
        const filtered = (response.data.data || [])
          .filter(b => b.slug !== slug)
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8);
        setTrendingBlogs(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch trending blogs');
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      await blogService.like(blog._id);
      setBlog({ ...blog, likes: (blog.likes || 0) + 1 });
      setLiked(true);
      toast.success('Thanks for the like!');
    } catch (error) {
      console.error('Failed to like blog');
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = blog?.title || 'Check out this blog';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy link');
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getReadingTime = (content) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Tech Blog': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Career Tips': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Interview Guide': 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      'Tutorial': 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
      'News': 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'Others': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    };
    return colors[category] || colors['Others'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Blog not found</h2>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">Back to Blogs</Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: blog.title, path: `/blog/${blog.slug}` }
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBlogSchema(blog),
      generateBreadcrumbSchema(breadcrumbs)
    ]
  };
  const desc = (blog.excerpt || blog.description || '').replace(/<[^>]*>/g, '').slice(0, 160);
  const blogKeywords = `${blog.title}, ${blog.category}, EduLumix, Edu Lumix, edulumix, tech blog`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <SEO
        title={`${blog.title} | EduLumix Blog`}
        description={desc || `${blog.title} - Read on EduLumix tech blog. Career tips, tutorials & more.`}
        keywords={blogKeywords}
        url={`/blog/${blog.slug}`}
        type="article"
        image={blog.coverImage || blog.image}
        structuredData={structuredData}
      />
      <div className="w-full px-8 lg:px-12 py-8 lg:py-12">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Blogs
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - 70% */}
          <article className="flex-1 bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Cover Image or Title Card */}
            {blog.coverImage ? (
              <div className="w-full bg-gray-100 dark:bg-dark-100 py-6 px-4">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-auto block rounded-xl"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 overflow-hidden flex items-center justify-center p-8 lg:p-12">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
                
                {/* Title */}
                <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center leading-tight drop-shadow-lg">
                  {blog.title}
                </h1>
              </div>
            )}

          <div className="p-6 lg:p-10">
            {/* Category, Featured & Sponsored Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(blog.category)}`}>
                {blog.category}
              </span>
              {blog.isSponsored && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Sponsored
                  {blog.sponsorName && (
                    blog.sponsorLink ? (
                      <a href={blog.sponsorLink} target="_blank" rel="noopener noreferrer" className="ml-1 hover:underline">
                        by {blog.sponsorName} ↗
                      </a>
                    ) : (
                      <span className="ml-1">by {blog.sponsorName}</span>
                    )
                  )}
                </span>
              )}
              {blog.isFeatured && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 border-l-4 border-blue-500 pl-4 italic">
                {blog.excerpt}
              </p>
            )}

            {/* Author & Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                {blog.author ? (
                  <>
                    {blog.author.avatar ? (
                      <img 
                        src={blog.author.avatar} 
                        alt={blog.author.name} 
                        className="w-12 h-12 rounded-full object-cover shadow-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling?.style?.setProperty('display', 'flex');
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-lg ${blog.author.avatar ? 'hidden' : ''}`}
                    >
                      {blog.author.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        {blog.author.name}
                        <VerifiedBadge user={blog.author} size="sm" />
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Deleted User</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(blog.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {getReadingTime(blog.content)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {blog.views || 0} views
                </span>
              </div>
            </div>

            {/* In-article Ad */}
            <AdSlot slotId={AD_SLOTS.IN_ARTICLE} className="my-8" />

            {/* Content */}
            {contentLoading ? (
              <div className="flex flex-col items-center gap-4 py-14 text-gray-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading full article…</span>
              </div>
            ) : fullContent?.bodyHtml ? (
              <div
                className="article-body mb-8"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fullContent.bodyHtml) }}
              />
            ) : (
              <div className="prose dark:prose-invert prose-lg max-w-none mb-8">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {blog.content}
                </div>
              </div>
            )}

            {/* Read on source CTA for external blogs */}
            {blog.externalLink && (
              <div className="mb-8">
                <a
                  href={blog.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-colors ${
                    blog.source === 'medium'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {blog.source === 'medium' ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Read full article on {blog.source === 'medium' ? 'Medium' : blog.source === 'devto' ? 'Dev.to' : 'source'} ↗
                </a>
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                <Tag className="w-4 h-4 text-gray-400" />
                {blog.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-dark-100 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions - Like & Share */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  liked 
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                {liked ? 'Liked!' : 'Like this post'}
                <span className="ml-1 px-2 py-0.5 bg-white dark:bg-dark-200 rounded-full text-sm">
                  {blog.likes || 0}
                </span>
              </button>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Share:</span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2.5 rounded-lg bg-gray-200 dark:bg-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-300 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </article>

          {/* Sidebar - Trending Blogs (30%) */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Trending Section */}
              {/* Sidebar Ad */}
              <AdSlot slotId={AD_SLOTS.SIDEBAR} className="mb-6 rounded-2xl overflow-hidden" />
              <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending Blogs</h3>
                </div>
                <div className="space-y-4">
                  {trendingBlogs.map((trendingBlog, index) => (
                    <Link
                      key={trendingBlog._id}
                      to={`/blog/${trendingBlog.slug}`}
                      className="group block"
                    >
                      <div className="flex gap-3">
                        {/* Rank Number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {trendingBlog.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {trendingBlog.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {trendingBlog.likes || 0}
                            </span>
                          </div>
                        </div>

                        {/* Thumbnail */}
                        {trendingBlog.coverImage && (
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-100">
                            <img
                              src={trendingBlog.coverImage}
                              alt={trendingBlog.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                      {index < trendingBlogs.length - 1 && (
                        <div className="mt-4 border-b border-gray-100 dark:border-gray-800"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">Share Your Knowledge</h3>
                <p className="text-blue-50 text-sm mb-4">Join our community and start writing amazing tech blogs!</p>
                <Link
                  to={user ? "/dashboard/create-blog" : "/signup"}
                  className="block w-full py-2.5 bg-white text-blue-600 rounded-xl font-semibold text-center hover:bg-blue-50 transition-colors"
                >
                  Write a Blog
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
