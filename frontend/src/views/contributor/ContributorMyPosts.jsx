'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import CompanyAvatar from '../../components/common/CompanyAvatar';
import { Card, CardContent, Button } from '@heroui/react';
import { 
  Briefcase, FolderOpen, FileText, ShoppingBag, 
  Search, Filter, Eye, Edit2, Trash2, ExternalLink,
  CheckCircle, Clock, XCircle, Building2, MapPin,
  Calendar, ThumbsUp, Loader2, Plus, AlertCircle, Download,
  ChevronDown, X, Save, Play, Link2
} from 'lucide-react';

const ContributorMyPosts = () => {
  const { canPostJobs, canPostResources, canPostBlogs, canPostProducts } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: 'all', label: 'All Posts', visible: true },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, visible: canPostJobs },
    { id: 'resources', label: 'Resources', icon: FolderOpen, visible: canPostResources },
    { id: 'blogs', label: 'Blogs', icon: FileText, visible: canPostBlogs },
    { id: 'products', label: 'Products', icon: ShoppingBag, visible: canPostProducts },
  ].filter(tab => tab.visible);

  const jobCategories = [
    'IT Job', 'Non IT Job', 'Walk In Drive', 'Govt Job',
    'Internship', 'Part Time Job', 'Remote Job', 'Others'
  ];

  const resourceCategories = [
    'Software Notes', 'Interview Notes', 'Tools & Technology',
    'Trending Technology', 'Video Resources', 'Software Project', 'Hardware Project'
  ];

  const blogCategories = [
    'Tech Blog', 'Career Tips', 'Interview Guide', 'Tutorial', 'News', 'Others'
  ];

  const experienceLevels = ['Fresher', '0-1 Years', '1-2 Years', '2-3 Years', '3+ Years'];

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const requests = [];
      if (canPostJobs) requests.push(api.get('/jobs/my/jobs').then(res => (res.data.data || []).map(item => ({ ...item, type: 'jobs' }))).catch(() => []));
      if (canPostResources) requests.push(api.get('/resources/my/resources').then(res => (res.data.data || []).map(item => ({ ...item, type: 'resources' }))).catch(() => []));
      if (canPostBlogs) requests.push(api.get('/blogs/my/blogs').then(res => (res.data.data || []).map(item => ({ ...item, type: 'blogs' }))).catch(() => []));
      if (canPostProducts) requests.push(api.get('/products/my/products').then(res => (res.data.data || []).map(item => ({ ...item, type: 'products' }))).catch(() => []));
      const results = await Promise.all(requests);
      const combined = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllPosts(combined);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = { jobs: Briefcase, resources: FolderOpen, blogs: FileText, products: ShoppingBag };
    return icons[type] || FileText;
  };

  const getTypeColor = (type) => {
    const colors = {
      jobs: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      resources: 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400',
      blogs: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      products: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
    };
    return colors[type] || colors.blogs;
  };

  const getCategoryBadge = (category) => {
    if (!category) return null;
    const colors = {
      'IT Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Software Notes': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Video Resources': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300'}`}>
        {category}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleStatusToggle = async (post) => {
    if (post.type !== 'jobs') return;
    try {
      setActionLoading(post._id);
      const newStatus = post.status === 'Open' ? 'Closed' : 'Open';
      await api.put(`/jobs/${post._id}`, { ...post, status: newStatus });
      toast.success(`Job status changed to ${newStatus}`);
      await fetchAllPosts();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (post) => {
    setDeleteLoading(true);
    try {
      const endpoints = { jobs: `/jobs/${post._id}`, resources: `/resources/${post._id}`, blogs: `/blogs/${post._id}`, products: `/products/${post._id}` };
      const response = await api.delete(endpoints[post.type]);
      if (response.data.success) {
        toast.success(response.data.message || 'Post deleted successfully');
        setAllPosts(allPosts.filter(p => p._id !== post._id));
        setShowDeleteModal(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    if (post.type === 'jobs') {
      setFormData({ title: post.title || '', company: post.company || '', location: post.location || '', category: post.category || 'IT Job', experience: post.experience || 'Fresher', salary: post.salary || '', description: post.description || '', applyLink: post.applyLink || '', status: post.status || 'Open', companyLogo: post.companyLogo || '' });
    } else if (post.type === 'resources') {
      setFormData({ title: post.title || '', category: post.category || 'Software Notes', subcategory: post.subcategory || '', link: post.link || '', description: post.description || '', thumbnail: post.thumbnail || '' });
    } else if (post.type === 'blogs') {
      setFormData({ title: post.title || '', category: post.category || 'Tech Blog', excerpt: post.excerpt || '', content: post.content || '', tags: post.tags?.join(', ') || '', coverImage: post.coverImage || '', isPublished: post.isPublished ?? true });
    }
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      setActionLoading('form');
      const endpoints = { jobs: `/jobs/${editingPost._id}`, resources: `/resources/${editingPost._id}`, blogs: `/blogs/${editingPost._id}`, products: `/products/${editingPost._id}` };
      let submitData = { ...formData };
      if (editingPost.type === 'blogs' && formData.tags) {
        submitData.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      await api.put(endpoints[editingPost.type], submitData);
      toast.success('Post updated successfully');
      await fetchAllPosts();
      setShowEditModal(false);
      setEditingPost(null);
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = allPosts.filter(post => {
    const matchesTab = activeTab === 'all' || post.type === activeTab;
    const matchesSearch = (post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || post.company?.toLowerCase().includes(searchTerm.toLowerCase()) || post.category?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || post.category === categoryFilter;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const stats = {
    total: allPosts.length,
    resources: allPosts.filter(p => p.type === 'resources').length,
    blogs: allPosts.filter(p => p.type === 'blogs').length,
    openJobs: allPosts.filter(p => p.type === 'jobs' && p.status === 'Open').length,
    totalDownloads: allPosts.filter(p => p.type === 'resources').reduce((acc, p) => acc + (p.downloads || 0), 0),
    totalLikes: allPosts.reduce((acc, p) => acc + (Array.isArray(p.likes) ? p.likes.length : (p.likes || 0)), 0),
    totalViews: allPosts.reduce((acc, p) => acc + (p.views || 0), 0),
  };

  const getCreateLink = () => {
    // Based on active tab, navigate to specific create page
    if (activeTab === 'jobs' && canPostJobs) return '/contributor/create-job';
    if (activeTab === 'resources' && canPostResources) return '/contributor/create-resource';
    if (activeTab === 'blogs' && canPostBlogs) return '/contributor/create-blog';
    if (activeTab === 'products' && canPostProducts) return '/contributor/create-product';
    // Default priority when on 'all' tab
    if (canPostJobs) return '/contributor/create-job';
    if (canPostResources) return '/contributor/create-resource';
    if (canPostBlogs) return '/contributor/create-blog';
    if (canPostProducts) return '/contributor/create-product';
    return '/contributor';
  };

  const getCreateLabel = () => {
    if (activeTab === 'jobs') return 'Create Job';
    if (activeTab === 'resources') return 'Create Resource';
    if (activeTab === 'blogs') return 'Create Blog';
    if (activeTab === 'products') return 'Create Product';
    return 'Create New';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">My Posts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all your contributions</p>
        </div>
        <Link to={getCreateLink()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25">
          <Plus className="w-5 h-5" />
          {getCreateLabel()}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Posts</p>
            </div>
          </div>
        </div>
        {canPostJobs && (
          <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openJobs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Open Jobs</p>
              </div>
            </div>
          </div>
        )}
        {canPostResources && (
          <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resources}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resources</p>
              </div>
            </div>
          </div>
        )}
        {canPostBlogs && (
          <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.blogs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Blog Posts</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex gap-1 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCategoryFilter(''); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100'}`}>
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search posts..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
              </div>
              {activeTab === 'jobs' && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
                    <option value="">All Categories</option>
                    {jobCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              {activeTab === 'resources' && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
                    <option value="">All Categories</option>
                    {resourceCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              {activeTab === 'blogs' && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
                    <option value="">All Categories</option>
                    {blogCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Post Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Posted</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Stats</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No posts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{searchTerm ? 'Try a different search term' : 'Create your first post to get started'}</p>
                    <Link to={getCreateLink()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                      <Plus className="w-4 h-4" />
                      Create Post
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const TypeIcon = getTypeIcon(post.type);
                  const postTitle = post.title || post.name || 'Untitled';
                  const likesCount = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
                  const resourceThumbnail = post.type === 'resources' ? (post.thumbnail || getYouTubeThumbnail(post.link)) : null;
                  const blogCoverImage = post.type === 'blogs' ? post.coverImage : null;
                  
                  return (
                    <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          {post.type === 'jobs' ? (
                            <CompanyAvatar company={post.company} logoUrl={post.companyLogo} size="table" rounded="lg" />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center ${(post.type === 'resources' && resourceThumbnail) || (post.type === 'blogs' && blogCoverImage) ? 'bg-white dark:bg-dark-100' : getTypeColor(post.type)}`}>
                              {post.type === 'resources' && resourceThumbnail ? (
                                <img src={resourceThumbnail} alt={postTitle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : post.type === 'blogs' && blogCoverImage ? (
                                <img src={blogCoverImage} alt={postTitle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : post.type === 'resources' ? (
                                isYouTubeUrl(post.link) ? <Play className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />
                              ) : (
                                <TypeIcon className="w-5 h-5" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{postTitle}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {post.type === 'jobs' && (
                                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{post.company}</span>
                              )}
                              {post.type === 'resources' && (
                                <span className="flex items-center gap-1">
                                  {isYouTubeUrl(post.link) ? <><Play className="w-3.5 h-3.5" /> Video</> : <><Link2 className="w-3.5 h-3.5" /> {post.subcategory || 'Resource'}</>}
                                </span>
                              )}
                              {(post.type === 'blogs' || post.type === 'products') && <span className="capitalize">{post.type}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">{getCategoryBadge(post.category)}</td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views || 0}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{likesCount}</span>
                          {post.type === 'resources' && <span className="flex items-center gap-1"><Download className="w-4 h-4" />{post.downloads || 0}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {post.type === 'jobs' ? (
                          <button onClick={() => handleStatusToggle(post)} disabled={actionLoading === post._id} className="relative inline-flex items-center">
                            <div className={`w-12 h-6 rounded-full transition-colors ${post.status === 'Open' ? 'bg-green-500' : 'bg-red-500'}`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${post.status === 'Open' ? 'translate-x-6' : 'translate-x-0.5'}`}>
                                {actionLoading === post._id && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                              </div>
                            </div>
                            <span className={`ml-2 text-xs font-medium ${post.status === 'Open' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{post.status}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { window.open(post.type === 'jobs' ? `/jobs/${post._id}` : post.type === 'resources' ? (post.link || '/resources') : post.type === 'blogs' && post.slug ? `/blog/${post.slug}` : '/', '_blank'); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="View">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          {(post.type === 'jobs' || post.type === 'resources' || post.type === 'blogs') && (
                            <button onClick={() => openEditModal(post)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setShowDeleteModal(post)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Post</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{showDeleteModal.title || 'Untitled'}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors" disabled={deleteLoading}>Cancel</button>
              <button onClick={() => handleDelete(showDeleteModal)} disabled={deleteLoading} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingPost && editingPost.type === 'jobs' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Job</h2>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingPost(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Title *</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company *</label>
                  <input type="text" name="company" value={formData.company || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location *</label>
                  <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select name="category" value={formData.category || 'IT Job'} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    {jobCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience</label>
                  <select name="experience" value={formData.experience || 'Fresher'} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    {experienceLevels.map(level => (<option key={level} value={level}>{level}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Salary</label>
                  <input type="text" name="salary" value={formData.salary || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select name="status" value={formData.status || 'Open'} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Logo URL</label>
                  <input type="url" name="companyLogo" value={formData.companyLogo || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Apply Link *</label>
                  <input type="url" name="applyLink" value={formData.applyLink || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleInputChange} required rows={4} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingPost(null); }} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading === 'form'} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  {actionLoading === 'form' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingPost && editingPost.type === 'resources' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Resource</h2>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingPost(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Resource Title *</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select name="category" value={formData.category || 'Software Notes'} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    {resourceCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subcategory</label>
                  <input type="text" name="subcategory" value={formData.subcategory || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Resource Link *</label>
                  <input type="url" name="link" value={formData.link || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">YouTube links are auto-detected as video resources</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Thumbnail URL</label>
                  <input type="url" name="thumbnail" value={formData.thumbnail || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                  {(formData.thumbnail || getYouTubeThumbnail(formData.link)) && (
                    <div className="mt-2">
                      <img src={formData.thumbnail || getYouTubeThumbnail(formData.link)} alt="Thumbnail" className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingPost(null); }} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading === 'form'} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  {actionLoading === 'form' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingPost && editingPost.type === 'blogs' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Blog</h2>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingPost(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blog Title *</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select name="category" value={formData.category || 'Tech Blog'} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                    {blogCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
                  <input type="text" name="tags" value={formData.tags || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="react, javascript, web" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cover Image URL</label>
                  <input type="url" name="coverImage" value={formData.coverImage || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                  {formData.coverImage && (
                    <div className="mt-2">
                      <img src={formData.coverImage} alt="Cover" className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Excerpt *</label>
                  <textarea name="excerpt" value={formData.excerpt || ''} onChange={handleInputChange} required rows={2} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Brief summary of the blog..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content *</label>
                  <textarea name="content" value={formData.content || ''} onChange={handleInputChange} required rows={8} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Full blog content..." />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isPublished" checked={formData.isPublished || false} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingPost(null); }} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading === 'form'} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  {actionLoading === 'form' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorMyPosts;
