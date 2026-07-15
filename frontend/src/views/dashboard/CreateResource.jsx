'use client';
import { useState } from 'react';
import { useNavigate, useLocation } from '@/utils/reactRouterCompat';
import { ArrowLeft, Save, FolderOpen, Link2, Image, Play, FileText, Loader2, Info, X, CheckCircle, AlertCircle, Mail, Eye } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { resourceService } from '../../services/dataService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CreateResource = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isContributor = location.pathname.includes('/contributor');
  
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [descPreview, setDescPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Software Notes',
    subcategory: '',
    link: '',
    description: '',
    thumbnail: '',
  });

  const categories = [
    'Software Notes', 'Interview Notes', 'Tools & Technology',
    'Trending Technology', 'Video Resources', 'Software Project', 'Hardware Project'
  ];

  // Helper to get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  // Check if URL is a YouTube video
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await resourceService.create(formData);
      if (response.data.success) {
        toast.success('Resource added successfully! +1 Point');
        navigate(isContributor ? '/contributor/my-posts' : '/dashboard/my-posts');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  const previewThumbnail = formData.thumbnail || getYouTubeThumbnail(formData.link);

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <FolderOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Resource</h1>
              <p className="text-gray-500 dark:text-gray-400">Share learning materials with the community</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    📋 Resource Posting Instructions - Please Read First!
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                    Click here to view important guidelines for posting resources
                  </p>
                </div>
              </button>
            </div>

            {/* Instruction Modal */}
            {showInstructions && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <FolderOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Resource Posting Guidelines</h2>
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
                          Share high-quality, verified resources like notes, tutorials, projects, and videos to earn rewards. Make sure your resources are helpful and accurate.
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
                            <span><strong>No Fake Resources:</strong> Do not post fake, broken, or misleading content.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>Working Links Only:</strong> All resource links must be active and accessible.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>Quality Content:</strong> Share resources that are educational and valuable to the community.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>No Copyright Violation:</strong> Do not share pirated or copyrighted content without permission.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>Verify Before Posting:</strong> Double-check all information before submitting.</span>
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
                      className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    >
                      I Understand - Continue Posting
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resource Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g., Complete DSA Notes for Interviews"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="e.g., Data Structures"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Resource Link *
                </span>
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Google Drive / YouTube / Website link"
              />
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {isYouTubeUrl(formData.link) ? (
                  <span className="flex items-center gap-1 text-red-500">
                    <Play className="w-3.5 h-3.5" />
                    YouTube video detected - thumbnail auto-generated
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    YouTube links will be auto-detected as video resources
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Thumbnail URL
                </span>
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              {/* Thumbnail Preview */}
              {previewThumbnail && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={previewThumbnail}
                    alt="Thumbnail preview"
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.thumbnail ? 'Custom thumbnail' : 'Auto-generated from YouTube'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-xs text-gray-400 font-normal">(Markdown supported)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDescPreview((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {descPreview ? 'Edit' : 'Preview'}
                </button>
              </div>
              {descPreview ? (
                <div className="article-body min-h-[110px] w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 overflow-auto">
                  {formData.description ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.description}</ReactMarkdown>
                  ) : (
                    <span className="text-gray-400 text-sm">Nothing to preview…</span>
                  )}
                </div>
              ) : (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y font-mono text-sm"
                  placeholder={`Description supports Markdown:\n# Heading\n**bold**, *italic*, \`code\`\n- list item\n\`\`\`js\nconsole.log('hello')\n\`\`\``}
                />
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding Resource...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Add Resource
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                You'll earn 1 point for adding a resource
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateResource;
