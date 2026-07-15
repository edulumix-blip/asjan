'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Download,
  Heart,
  Loader2,
  ChevronDown,
  X,
  Save,
  AlertCircle,
  FileText,
  Video,
  Link as LinkIcon,
  User,
  Image,
  Eye,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Link } from '@/utils/reactRouterCompat';
import api from '../../services/api';
import toast from 'react-hot-toast';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Pagination from '../../components/common/Pagination';
import { 
  Table, 
  Button 
} from '@heroui/react';

const LIMIT = 30;

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [totalResources, setTotalResources] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [contributors, setContributors] = useState([]);
  const [descPreview, setDescPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [contributorFilter, setContributorFilter] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Software Notes',
    subcategory: '',
    link: '',
    thumbnail: '',
  });

  const categories = [
    'Software Notes',
    'Interview Notes',
    'Tools & Technology',
    'Trending Technology',
    'Video Resources',
    'Software Project',
    'Hardware Project',
  ];

  useEffect(() => {
    fetchContributors();
  }, []);

  // Debounce search input
  useEffect(() => {
    const trimmed = searchTerm.trim();
    const delay = trimmed === '' ? 0 : 350;
    const id = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setPage(1);
    }, delay);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, sourceFilter, contributorFilter]);

  const fetchResources = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = { limit: LIMIT, page };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryFilter) params.category = categoryFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (contributorFilter) params.postedBy = contributorFilter;
      const res = await api.get('/resources', { params });
      setResources(res.data.data || []);
      setTotalResources(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, sourceFilter, contributorFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFetchExternal = async () => {
    try {
      setFetchLoading(true);
      const res = await api.post('/resources/fetch-external', {});
      const d = res.data?.data || {};
      const created = d.created ?? 0;
      const skipped = d.skipped ?? 0;
      if (created === 0 && skipped > 0) {
        toast.success(`✅ Already up-to-date — ${skipped} articles already in DB.`);
      } else {
        toast.success(`✅ Fetched: ${created} new article${created !== 1 ? 's' : ''} added${skipped > 0 ? `, ${skipped} already existed` : ''}`);
      }
      await fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch external resources');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchContributors = async () => {
    try {
      const res = await api.get('/users/approved');
      // Filter only resource contributors
      const resourceContributors = (res.data.data || []).filter(u => 
        u.role === 'resource_poster' || u.role === 'admin' || u.role === 'super_admin'
      );
      setContributors(resourceContributors);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Software Notes',
      subcategory: '',
      link: '',
      thumbnail: '',
    });
    setEditingResource(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      category: resource.category || 'Software Notes',
      subcategory: resource.subcategory || '',
      link: resource.link || '',
      thumbnail: resource.thumbnail || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('form');
      
      if (editingResource) {
        await api.put(`/resources/${editingResource._id}`, formData);
        toast.success('Resource updated successfully');
      } else {
        await api.post('/resources', formData);
        toast.success('Resource created successfully');
      }
      
      await fetchResources();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error(error.response?.data?.message || 'Failed to save resource');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      setActionLoading(resourceId);
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deleted successfully');
      await fetchResources();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'Software Notes': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Interview Notes': 'bg-blue-200 dark:bg-blue-600/20 text-blue-800 dark:text-blue-200',
      'Tools & Technology': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Trending Technology': 'bg-sky-200 dark:bg-sky-600/20 text-sky-800 dark:text-sky-200',
      'Video Resources': 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400',
      'Software Project': 'bg-sky-50 dark:bg-sky-400/20 text-sky-600 dark:text-sky-400',
      'Hardware Project': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-700'}`}>
        {category}
      </span>
    );
  };

  const getResourceIcon = (resource) => {
    if (resource.isVideo || resource.link?.includes('youtube') || resource.link?.includes('youtu.be')) {
      return <Video className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const isVideoResource = (resource) => {
    return resource.isVideo || resource.link?.includes('youtube') || resource.link?.includes('youtu.be');
  };

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const filteredResources = resources;

  const stats = {
    total: totalResources,
    videos: resources.filter(r => isVideoResource(r)).length,
    notes: resources.filter(r => !isVideoResource(r)).length,
    downloads: resources.reduce((acc, r) => acc + (r.downloads || 0), 0),
    likes: resources.reduce((acc, r) => acc + (r.likes || 0), 0),
  };

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Resource Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all learning resources on the platform
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Resources</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.videos}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Video Resources</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-200 dark:bg-blue-600/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.notes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notes & PDFs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-200 dark:bg-sky-600/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-sky-700 dark:text-sky-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.downloads}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Downloads</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.likes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={contributorFilter}
              onChange={(e) => setContributorFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">All Contributors</option>
              {contributors.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Platforms</option>
              <option value="manual">Manual / Curated</option>
              <option value="devto">Dev.to</option>
              <option value="medium">Medium</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-dark-200">
          {filteredResources.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No resources found</p>
              </div>
            </div>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Resources Listings Table" className="w-full">
                  <Table.Header>
                    <Table.Column isRowHeader className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6">Resource Details</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden lg:table-cell">Posted By</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden md:table-cell">Category</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden sm:table-cell">Posted</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden lg:table-cell">Stats</Table.Column>
                    <Table.Column className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6">Actions</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {filteredResources.map((resource) => {
                      const ytThumbnail = getYouTubeThumbnail(resource.link);
                      const thumbnail = resource.thumbnail || ytThumbnail;
                      
                      return (
                        <Table.Row key={resource._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors border-b border-gray-100 dark:border-gray-800">
                          <Table.Cell className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              {/* Thumbnail or Icon */}
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {thumbnail ? (
                                  <img
                                    src={thumbnail}
                                    alt={resource.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center ${thumbnail ? 'hidden' : ''} ${
                                  isVideoResource(resource) 
                                    ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                                    : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                }`}>
                                  {getResourceIcon(resource)}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{resource.title}</p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {resource.subcategory && (
                                    <span className="truncate max-w-[150px]">{resource.subcategory}</span>
                                  )}
                                  {isVideoResource(resource) && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs">
                                      <Video className="w-3 h-3" />
                                      Video
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 hidden lg:table-cell">
                            {resource.postedBy ? (
                              <div className="flex items-center gap-2">
                                {resource.postedBy.avatar ? (
                                  <img 
                                    src={resource.postedBy.avatar} 
                                    alt={resource.postedBy.name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium ${resource.postedBy.avatar ? 'hidden' : ''}`}>
                                  {resource.postedBy.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {resource.postedBy.name}
                                    </p>
                                    <VerifiedBadge user={resource.postedBy} size="xs" />
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {resource.postedBy.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs">
                                  <User className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Deleted User</span>
                              </div>
                            )}
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 hidden md:table-cell">
                            <div className="whitespace-nowrap">
                              {getCategoryBadge(resource.category)}
                            </div>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {formatDate(resource.createdAt)}
                            </div>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {resource.downloads || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {resource.likes || 0}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                as="a"
                                href={`/resources/${resource._id}`}
                                variant="light"
                                isIconOnly
                                className="text-gray-400 hover:text-blue-600"
                                title="View on Platform"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                onPress={() => openEditModal(resource)}
                                variant="light"
                                isIconOnly
                                className="text-gray-400 hover:text-blue-600"
                                title="Edit Resource"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onPress={() => setShowDeleteModal(resource)}
                                variant="light"
                                isIconOnly
                                className="text-gray-400 hover:text-red-600"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          )}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={totalResources}
          limit={LIMIT}
          onPageChange={setPage}
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Complete React Interview Notes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., React, JavaScript, DSA"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Resource Link *
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://drive.google.com/... or https://youtube.com/..."
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    YouTube links will automatically be marked as video resources
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Thumbnail URL (Optional)
                  </label>
                  <div className="relative">
                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    For YouTube videos, thumbnail will be auto-generated if not provided
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
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
                    <div className="article-body min-h-[110px] w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 overflow-auto">
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
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-y font-mono text-sm"
                      placeholder={`Description supports Markdown:\n# Heading\n**bold**, *italic*, \`code\`\n- list item\n\`\`\`js\nconsole.log('hello')\n\`\`\``}
                    />
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'form'}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === 'form' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingResource ? 'Update Resource' : 'Add Resource'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-700/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-700 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Resource</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {showDeleteModal.title}
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal._id)}
                disabled={actionLoading === showDeleteModal._id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                {actionLoading === showDeleteModal._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
