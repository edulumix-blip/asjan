'use client';
import { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Search, Eye, Edit2, Trash2, ChevronDown, 
  X, Star, Clock, Users, Play, BookOpen, Globe, IndianRupee,
  Loader2, AlertCircle, CheckCircle, Video, ListChecks, Award
} from 'lucide-react';
import { courseService } from '../../services/dataService';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import { Card, CardContent, Button } from '@heroui/react';

const LIMIT = 30;

const categories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cybersecurity',
  'Cloud Computing',
  'UI/UX Design',
  'Digital Marketing',
  'Interview Prep',
  'DSA',
  'Programming Languages',
  'Others',
];

const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Others'];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    free: 0,
    totalViews: 0,
    totalEnrollments: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showLessonsModal, setShowLessonsModal] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form state
  const initialFormState = {
    title: '',
    description: '',
    shortDescription: '',
    thumbnail: '',
    previewVideo: '',
    category: '',
    level: 'All Levels',
    language: 'English',
    actualPrice: '',
    offerPrice: '',
    isFree: false,
    instructor: { name: '', bio: '', avatar: '' },
    features: [''],
    requirements: [''],
    whatYouWillLearn: [''],
    tags: '',
    enrollmentLink: '',
    whatsappNumber: '918272946202',
    isPublished: false,
    isFeatured: false,
    lessons: [],
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, levelFilter, statusFilter]);

  useEffect(() => {
    fetchCourses();
  }, [page, searchTerm, categoryFilter, levelFilter, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { limit: LIMIT, page };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (levelFilter) params.level = levelFilter;
      if (statusFilter) params.isPublished = statusFilter;

      const response = await courseService.getAllAdmin(params);
      setCourses(response.data.data || []);
      setTotalCourses(response.data.total ?? 0);
      setTotalPages(response.data.totalPages ?? 1);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      const courseData = {
        ...formData,
        actualPrice: Number(formData.actualPrice) || 0,
        offerPrice: Number(formData.offerPrice) || 0,
        features: formData.features.filter(f => f.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        whatYouWillLearn: formData.whatYouWillLearn.filter(w => w.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };
      await courseService.create(courseData);
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('update');
      const courseData = {
        ...formData,
        actualPrice: Number(formData.actualPrice) || 0,
        offerPrice: Number(formData.offerPrice) || 0,
        features: formData.features.filter(f => f.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        whatYouWillLearn: formData.whatYouWillLearn.filter(w => w.trim()),
        tags: typeof formData.tags === 'string' 
          ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
          : formData.tags,
      };
      await courseService.update(editingCourse._id, courseData);
      toast.success('Course updated successfully!');
      setShowEditModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading('delete');
      await courseService.delete(showDeleteModal._id);
      toast.success('Course deleted successfully!');
      setShowDeleteModal(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  const togglePublish = async (course) => {
    try {
      setActionLoading(course._id);
      await courseService.togglePublish(course._id);
      toast.success(`Course ${!course.isPublished ? 'published' : 'unpublished'}`);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update publish status');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeatured = async (course) => {
    try {
      setActionLoading(course._id + '-featured');
      await courseService.toggleFeatured(course._id);
      toast.success(`Course ${!course.isFeatured ? 'featured' : 'unfeatured'}`);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      thumbnail: course.thumbnail || '',
      previewVideo: course.previewVideo || '',
      category: course.category || '',
      level: course.level || 'All Levels',
      language: course.language || 'English',
      actualPrice: course.actualPrice || '',
      offerPrice: course.offerPrice || '',
      isFree: course.isFree || false,
      instructor: course.instructor || { name: '', bio: '', avatar: '' },
      features: course.features?.length ? course.features : [''],
      requirements: course.requirements?.length ? course.requirements : [''],
      whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : [''],
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      enrollmentLink: course.enrollmentLink || '',
      whatsappNumber: course.whatsappNumber || '918272946202',
      isPublished: course.isPublished || false,
      isFeatured: course.isFeatured || false,
      lessons: course.lessons || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const updateArrayItem = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  // Lesson management
  const addLesson = () => {
    setFormData({
      ...formData,
      lessons: [...formData.lessons, { title: '', description: '', videoUrl: '', duration: 0, isFree: false, order: formData.lessons.length + 1 }]
    });
  };

  const updateLesson = (index, field, value) => {
    const updated = [...formData.lessons];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, lessons: updated });
  };

  const removeLesson = (index) => {
    setFormData({ ...formData, lessons: formData.lessons.filter((_, i) => i !== index) });
  };

  const statCards = [
    { label: 'Total Courses', value: stats.total, icon: GraduationCap, color: 'blue' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'green' },
    { label: 'Drafts', value: stats.drafts, icon: AlertCircle, color: 'yellow' },
    { label: 'Featured', value: stats.featured, icon: Star, color: 'purple' },
    { label: 'Free', value: stats.free, icon: Award, color: 'cyan' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'pink' },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: Users, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage online courses</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm bg-white dark:bg-dark-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
                <option value="">All Categories</option>
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
                <option value="">All Levels</option>
                {levels.map(level => (<option key={level} value={level}>{level}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Drafts</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first course to get started</p>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course._id} className="border-none bg-white dark:bg-dark-200 overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video bg-gray-100 dark:bg-dark-100">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {course.isFree && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">FREE</span>
                  )}
                  {course.isFeatured && (
                    <span className="absolute top-3 right-3 p-1.5 bg-yellow-500 text-white rounded-lg">
                      <Star className="w-4 h-4 fill-current" />
                    </span>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-lg">
                    <Clock className="w-3 h-3" />
                    {formatDuration(course.totalDuration)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">{course.category}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">{course.level}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{course.shortDescription || course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Video className="w-4 h-4" />{course.totalLessons || 0} lessons</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{course.views || 0}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.enrollments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    {course.isFree ? (
                      <span className="text-lg font-bold text-green-600">Free</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{formatPrice(course.offerPrice)}</span>
                        {course.actualPrice > course.offerPrice && (
                          <span className="text-sm text-gray-400 line-through">{formatPrice(course.actualPrice)}</span>
                        )}
                      </div>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.isPublished ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onPress={() => togglePublish(course)} disabled={actionLoading === course._id} variant="flat" className={`flex-1 h-9 font-medium transition-colors ${course.isPublished ? 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-500/10' : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/10'}`}>
                      {actionLoading === course._id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : course.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button onPress={() => toggleFeatured(course)} disabled={actionLoading === course._id + '-featured'} variant="flat" isIconOnly className={`h-9 w-9 transition-colors ${course.isFeatured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10' : 'text-gray-500'}`}>
                      {actionLoading === course._id + '-featured' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className={`w-4 h-4 ${course.isFeatured ? 'fill-current' : ''}`} />}
                    </Button>
                    <Button onPress={() => openEditModal(course)} variant="flat" isIconOnly className="h-9 w-9 text-blue-600 bg-blue-50 dark:bg-blue-500/10">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onPress={() => setShowDeleteModal(course)} variant="flat" isIconOnly className="h-9 w-9 text-red-600 bg-red-50 dark:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        total={totalCourses}
        limit={LIMIT}
        onPageChange={setPage}
      />

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-dark-200 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Create New Course' : 'Edit Course'}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingCourse(null); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><BookOpen className="w-5 h-5" /> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter course title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select Category</option>
                      {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
                    <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      {levels.map(level => (<option key={level} value={level}>{level}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                    <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      {languages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                    <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="react, javascript, web" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                    <input type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Brief description for cards" maxLength={300} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Description *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Detailed course description..." />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Video className="w-5 h-5" /> Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail URL</label>
                    <input type="url" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview Video URL</label>
                    <input type="url" value={formData.previewVideo} onChange={(e) => setFormData({ ...formData, previewVideo: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://youtube.com/..." />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><IndianRupee className="w-5 h-5" /> Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual Price (₹)</label>
                    <input type="number" value={formData.actualPrice} onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })} disabled={formData.isFree} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" placeholder="1999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Offer Price (₹)</label>
                    <input type="number" value={formData.offerPrice} onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })} disabled={formData.isFree} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" placeholder="499" />
                  </div>
                  <div className="flex items-center pt-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This is a Free Course</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Users className="w-5 h-5" /> Instructor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                    <input type="text" value={formData.instructor.name} onChange={(e) => setFormData({ ...formData, instructor: { ...formData.instructor, name: e.target.value } })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Instructor name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
                    <input type="url" value={formData.instructor.avatar} onChange={(e) => setFormData({ ...formData, instructor: { ...formData.instructor, avatar: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                    <input type="text" value={formData.instructor.bio} onChange={(e) => setFormData({ ...formData, instructor: { ...formData.instructor, bio: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Brief bio" />
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ListChecks className="w-5 h-5" /> What You'll Learn</h3>
                {formData.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" value={item} onChange={(e) => updateArrayItem('whatYouWillLearn', index, e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Learning outcome" />
                    {formData.whatYouWillLearn.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('whatYouWillLearn', index)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><X className="w-5 h-5" /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('whatYouWillLearn')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">+ Add Learning Outcome</button>
              </div>

              {/* Lessons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Play className="w-5 h-5" /> Lessons ({formData.lessons.length})</h3>
                {formData.lessons.map((lesson, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Lesson {index + 1}</span>
                      <button type="button" onClick={() => removeLesson(index)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" value={lesson.title} onChange={(e) => updateLesson(index, 'title', e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Lesson title" />
                      <input type="url" value={lesson.videoUrl} onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Video URL" />
                      <input type="number" value={lesson.duration} onChange={(e) => updateLesson(index, 'duration', Number(e.target.value))} className="px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Duration (min)" />
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={lesson.isFree} onChange={(e) => updateLesson(index, 'isFree', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Free Preview</span>
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addLesson} className="text-sm text-purple-600 hover:text-purple-700 font-medium">+ Add Lesson</button>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Globe className="w-5 h-5" /> Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enrollment Link</label>
                    <input type="url" value={formData.enrollmentLink} onChange={(e) => setFormData({ ...formData, enrollmentLink: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
                    <input type="text" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="918272946202" />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center gap-6 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Publish Course</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingCourse(null); resetForm(); }} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {showCreateModal ? 'Create Course' : 'Update Course'}
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
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Course</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "<span className="font-medium text-gray-700 dark:text-gray-300">{showDeleteModal.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {actionLoading === 'delete' && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
