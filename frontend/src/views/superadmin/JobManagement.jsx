'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Clock,
  Loader2,
  ChevronDown,
  X,
  Save,
  AlertCircle,
  User,
  Mail,
  XCircle,
  Download,
  Lock
} from 'lucide-react';
import api from '../../services/api';
import { jobService } from '../../services/dataService';
import toast from 'react-hot-toast';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import CompanyAvatar from '../../components/common/CompanyAvatar';
import Pagination from '../../components/common/Pagination';
import { 
  Table, 
  Button 
} from '@heroui/react';

const LIMIT = 30;

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [contributors, setContributors] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [contributorFilter, setContributorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    category: 'IT Job',
    experience: 'Fresher',
    salary: '',
    description: '',
    applyLink: '',
    status: 'Open',
    companyLogo: '',
  });
  const [logoError, setLogoError] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const categories = [
    'IT Job',
    'Non IT Job',
    'Walk In Drive',
    'Govt Job',
    'Internship',
    'Part Time Job',
    'Remote Job',
    'Others',
  ];

  const experienceLevels = ['Fresher', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'];
  const statusOptions = ['Open', 'Closed'];

  const refreshDashboardStats = useCallback(async () => {
    try {
      const res = await api.get('/jobs/stats');
      if (res.data?.success && res.data?.data) setDashboardStats(res.data.data);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    fetchContributors();
    refreshDashboardStats();
  }, [refreshDashboardStats]);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    const delay = trimmed === '' ? 0 : 350;
    const id = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setPage(1);
    }, delay);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const fetchJobs = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.set('limit', String(LIMIT));
      params.set('page', String(page));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (categoryFilter) params.set('category', categoryFilter);
      if (contributorFilter) params.set('postedBy', contributorFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data || []);
      setTotalJobs(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setTableLoading(false);
      setInitialLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, contributorFilter, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const fetchContributors = async () => {
    try {
      const res = await api.get('/users/approved');
      // Filter only job contributors
      const jobContributors = (res.data.data || []).filter(u => 
        u.role === 'job_poster' || u.role === 'admin' || u.role === 'super_admin'
      );
      setContributors(jobContributors);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  const handleFetchExternalJobs = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await jobService.fetchExternal();
      const data = res.data?.data || {};
      const created = data.created ?? 0;
      const skipped = data.skipped ?? 0;
      toast.success(res.data?.message ? `${res.data.message} (${created} new, ${skipped} skipped)` : `Fetched: ${created} new, ${skipped} skipped`);
      await fetchJobs();
      await refreshDashboardStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch jobs from API');
    } finally {
      setFetchLoading(false);
    }
  }, [fetchJobs, refreshDashboardStats]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      category: 'IT Job',
      experience: 'Fresher',
      salary: '',
      description: '',
      applyLink: '',
      status: 'Open',
      companyLogo: '',
    });
    setEditingJob(null);
    setLogoError(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      category: job.category || 'IT Job',
      experience: job.experience || 'Fresher',
      salary: job.salary || '',
      description: job.description || '',
      applyLink: job.applyLink || '',
      status: job.status || 'Open',
      companyLogo: job.companyLogo || '',
    });
    setLogoError(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('form');
      
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, formData);
      } else {
        await api.post('/jobs', formData);
      }
      
      await fetchJobs();
      await refreshDashboardStats();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      setActionLoading(jobId);
      await api.delete(`/jobs/${jobId}`);
      await fetchJobs();
      await refreshDashboardStats();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'IT Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Non IT Job': 'bg-blue-200 dark:bg-blue-400/20 text-blue-800 dark:text-blue-200',
      'Walk In Drive': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Govt Job': 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400',
      'Internship': 'bg-sky-200 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200',
      'Part Time Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      'Remote Job': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Others': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[category] || colors['Non IT Job']}`}>
        {category}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Open': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
      'Closed': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors['Open']}`}>
        {status}
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

  // Toggle job status
  const handleStatusToggle = async (job) => {
    try {
      setActionLoading(job._id);
      const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
      await api.put(`/jobs/${job._id}`, { ...job, status: newStatus });
      toast.success(`Job status changed to ${newStatus}`);
      await fetchJobs();
      await refreshDashboardStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (initialLoading) {
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
            Fresher Job Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all job postings on the platform
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Create Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(dashboardStats?.total ?? totalJobs).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(dashboardStats?.open ?? jobs.filter((j) => j.status === 'Open').length).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Open Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(dashboardStats?.closed ?? jobs.filter((j) => j.status === 'Closed').length).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Closed Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardStats?.totalViews != null
                  ? dashboardStats.totalViews.toLocaleString('en-IN')
                  : jobs.reduce((acc, j) => acc + (j.views || 0), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={contributorFilter}
              onChange={(e) => {
                setContributorFilter(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
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
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[170px]"
            >
              <option value="">All Status</option>
              <option value="Open">Active Jobs</option>
              <option value="Closed">Closed Jobs</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-dark-200">
          {jobs.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  {debouncedSearch || categoryFilter || contributorFilter || statusFilter
                    ? 'No jobs match your filters'
                    : 'No jobs found'}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Job Listings Table" className="w-full">
                  <Table.Header>
                    <Table.Column isRowHeader className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6">Job Details</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden lg:table-cell">Posted By</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden md:table-cell">Category</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6 hidden sm:table-cell">Posted</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6">Status</Table.Column>
                    <Table.Column className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-100 py-3.5 px-6">Actions</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {jobs.map((job) => (
                      <Table.Row key={job._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors border-b border-gray-100 dark:border-gray-800">
                        <Table.Cell className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <CompanyAvatar
                              company={job.company}
                              logoUrl={job.companyLogo}
                              size="table"
                              rounded="lg"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{job.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {job.company}
                                </span>
                                <span className="hidden sm:flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4 hidden lg:table-cell">
                          {job.postedBy ? (
                            <div className="flex items-center gap-2">
                              {job.postedBy.avatar ? (
                                <img 
                                  src={job.postedBy.avatar} 
                                  alt={job.postedBy.name} 
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium ${job.postedBy.avatar ? 'hidden' : ''}`}
                              >
                                {job.postedBy.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {job.postedBy.name}
                                  </p>
                                  <VerifiedBadge user={job.postedBy} size="xs" />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{job.postedBy.email}</p>
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
                            {getCategoryBadge(job.category)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatDate(job.createdAt)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4">
                          <button
                            onClick={() => handleStatusToggle(job)}
                            disabled={actionLoading === job._id}
                            className="relative inline-flex items-center"
                          >
                            <div className={`w-12 h-6 rounded-full transition-colors ${
                              job.status === 'Open' 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            }`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                                job.status === 'Open' ? 'translate-x-6' : 'translate-x-0.5'
                              }`}>
                                {actionLoading === job._id && (
                                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                )}
                              </div>
                            </div>
                            <span className={`ml-2 text-xs font-medium ${
                              job.status === 'Open' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {job.status}
                            </span>
                          </button>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              as="a"
                              href={`/jobs/${job.slug || job._id}`}
                              variant="light"
                              isIconOnly
                              className="text-gray-400 hover:text-blue-600"
                              title="Open Job Details"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              onPress={() => openEditModal(job)}
                              variant="light"
                              isIconOnly
                              className="text-gray-400 hover:text-blue-600"
                              title="Edit Job"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onPress={() => setShowDeleteModal(job)}
                              variant="light"
                              isIconOnly
                              className="text-gray-400 hover:text-red-600"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          )}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={totalJobs}
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
                {editingJob ? 'Edit Job' : 'Create New Job'}
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
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., TCS, Infosys"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Bangalore, Remote"
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
                    Experience *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {experienceLevels.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., 3-5 LPA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Company Logo URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      name="companyLogo"
                      value={formData.companyLogo}
                      onChange={(e) => {
                        handleInputChange(e);
                        setLogoError(false);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.companyLogo && (
                      <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-dark-100 flex items-center justify-center">
                        {logoError ? (
                          <AlertCircle className="w-5 h-5 text-blue-400" />
                        ) : (
                          <img
                            src={formData.companyLogo}
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={() => setLogoError(true)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Apply Link or Email *
                  </label>
                  <input
                    type="text"
                    name="applyLink"
                    value={formData.applyLink}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://... or hr@company.com"
                  />
                  {formData.applyLink && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.applyLink.includes('@') ? '📧 Email detected' : '🔗 Link detected'}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Job description..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
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
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === 'form' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-700/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Job</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{showDeleteModal.title}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this job posting? This action cannot be undone.
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
                className="flex-1 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === showDeleteModal._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
