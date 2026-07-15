'use client';
import { useState } from 'react';
import { useNavigate, useLocation } from '@/utils/reactRouterCompat';
import { ArrowLeft, Save, FileText, Loader2, Image, Tag, Sparkles, Eye, EyeOff, X, Info, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { blogService } from '../../services/dataService';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isContributor = location.pathname.startsWith('/contributor');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech Blog',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    isPublished: true,
  });

  const categories = [
    'Tech Blog', 'Career Tips', 'Interview Guide', 'Tutorial', 'News', 'Others'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await blogService.create({ ...formData, tags: tagsArray });
      if (response.data.success) {
        toast.success('Blog created successfully! +1 Point earned');
        navigate(isContributor ? '/contributor/my-posts' : '/dashboard/my-posts');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(isContributor ? '/contributor/my-posts' : '/dashboard/my-posts');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300 py-6 lg:py-10">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Posts</span>
          </button>
          <button type="button" onClick={() => setPreviewMode(!previewMode)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-100 transition-colors">
            {previewMode ? <><EyeOff className="w-4 h-4" /> Edit Mode</> : <><Eye className="w-4 h-4" /> Preview</>}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Write a Blog Post</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Share your knowledge and earn points</p>
              </div>
            </div>
          </div>

          {previewMode ? (
            /* Preview Mode */
            <div className="p-6 space-y-6">
              {formData.coverImage && (
                <img src={formData.coverImage} alt="Cover" className="w-full h-64 object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">{formData.category}</span>
                {formData.tags && formData.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 rounded-lg text-xs">#{tag.trim()}</span>
                ))}
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{formData.title || 'Untitled Blog'}</h2>
              {formData.excerpt && <p className="text-gray-600 dark:text-gray-400 text-lg">{formData.excerpt}</p>}
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{formData.content || 'No content yet...'}</div>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Instruction Alert */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowInstructions(true)}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl hover:shadow-md transition-all duration-300 group animate-pulse hover:animate-none"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">
                      📋 Blog Posting Instructions - Please Read First!
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                      Click here to view important guidelines for posting blogs
                    </p>
                  </div>
                </button>
              </div>

              {/* Instruction Modal */}
              {showInstructions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">Blog Posting Guidelines</h2>
                            <p className="text-blue-100 text-sm">Please read carefully before posting</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowInstructions(false)}
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      <div className="space-y-4">
                        {/* Eligibility */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            ✅ Reward Eligibility
                          </h3>
                          <p className="text-green-800 dark:text-green-200 text-sm">
                            Write high-quality, original blog posts about tech, career tips, interview guides, or tutorials to earn rewards. Make sure your content is valuable and well-written.
                          </p>
                        </div>

                        {/* Rules */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            ⚠️ Important Rules
                          </h3>
                          <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span><strong>Original Content Only:</strong> Do not copy content from other sources. Write your own articles.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span><strong>No Plagiarism:</strong> Plagiarized content will result in immediate action.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span><strong>Quality Matters:</strong> Write clear, informative, and well-structured articles.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span><strong>No Spam or Ads:</strong> Do not include excessive links, promotional content, or advertisements.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span><strong>Appropriate Content:</strong> Keep content professional and respectful.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span><strong>Verify Facts:</strong> Double-check all information before publishing.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Support */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            📧 Need Help?
                          </h3>
                          <p className="text-blue-800 dark:text-blue-200 text-sm">
                            If you have any issues or questions, please contact our support team at{' '}
                            <a href="mailto:edulumix@gmail.com" className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-400">
                              edulumix@gmail.com
                            </a>
                          </p>
                        </div>

                        {/* Warning Note */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                          <p className="text-amber-900 dark:text-amber-100 text-sm font-medium text-center">
                            ⚡ Violation of these guidelines may result in account suspension or removal of posting privileges.
                          </p>
                        </div>
                      </div>

                      {/* Close Button */}
                      <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        I Understand - Continue Posting
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Blog Title *
                </label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg" placeholder="Enter an attention-grabbing title..." />
              </div>

              {/* Category & Tags */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    Tags
                  </label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="react, javascript, web" />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Image className="w-4 h-4 text-gray-400" />
                  Cover Image URL
                </label>
                <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com/cover-image.jpg" />
                {formData.coverImage && (
                  <div className="mt-3 relative inline-block">
                    <img src={formData.coverImage} alt="Cover Preview" className="w-40 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" onError={(e) => { e.target.style.display = 'none'; }} />
                    <button type="button" onClick={() => setFormData({ ...formData, coverImage: '' })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Summary / Excerpt *</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} required rows={2} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Write a brief summary that appears in blog listings..." />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} required rows={12} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm" placeholder="Write your blog content here... Markdown is supported for formatting." />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Supports Markdown formatting for headings, bold, italic, code blocks, etc.</p>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-100 rounded-xl">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.isPublished ? 'Publish Immediately' : 'Save as Draft'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formData.isPublished ? 'Your blog will be visible to everyone' : 'Save now and publish later'}</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={handleBack} className="flex-1 px-6 py-3 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                  ) : (
                    <><Save className="w-5 h-5" /> {formData.isPublished ? 'Publish Blog' : 'Save Draft'}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Tips for a Great Blog</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Use a catchy title that clearly describes your topic</li>
            <li>• Add relevant tags to help readers find your content</li>
            <li>• Include a cover image to make your blog stand out</li>
            <li>• Write a compelling excerpt for blog listings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
