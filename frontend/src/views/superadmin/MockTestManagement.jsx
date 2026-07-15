'use client';
import { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, Search, Eye, Edit2, Trash2, ChevronDown, 
  X, Star, Clock, Users, CheckCircle, AlertCircle, HelpCircle,
  Loader2, Target, Award, Brain, FileQuestion, PlusCircle, Minus
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { mockTestService } from '../../services/dataService';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const LIMIT = 30;

const categories = [
  'Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Technical - Programming',
  'Technical - DSA',
  'Technical - DBMS',
  'Technical - OS',
  'Technical - CN',
  'Technical - Web Dev',
  'Company Specific',
  'Gate',
  'Government Exams',
  'Others',
];

const difficulties = ['Easy', 'Medium', 'Hard', 'Mixed'];
const questionDifficulties = ['Easy', 'Medium', 'Hard'];

const MockTestManagement = () => {
  const [tests, setTests] = useState([]);
  const [totalTests, setTotalTests] = useState(0);
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
    totalAttempts: 0,
    totalQuestions: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(null);
  const [editingTest, setEditingTest] = useState(null);

  // Form state
  const initialFormState = {
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    company: '',
    difficulty: 'Medium',
    duration: 30,
    passingMarks: '',
    instructions: [''],
    tags: '',
    isFree: true,
    price: 0,
    isPublished: false,
    isFeatured: false,
    whatsappNumber: '918272946202',
    questions: [],
  };
  const [formData, setFormData] = useState(initialFormState);

  // Question form
  const emptyQuestion = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'Medium',
    marks: 1,
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, difficultyFilter, statusFilter]);

  useEffect(() => {
    fetchTests();
  }, [page, searchTerm, categoryFilter, difficultyFilter, statusFilter]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = { limit: LIMIT, page };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (statusFilter) params.isPublished = statusFilter;

      const response = await mockTestService.getAllAdmin(params);
      setTests(response.data.data || []);
      setTotalTests(response.data.total ?? 0);
      setTotalPages(response.data.totalPages ?? 1);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load mock tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      const testData = {
        ...formData,
        duration: Number(formData.duration),
        passingMarks: Number(formData.passingMarks) || undefined,
        price: Number(formData.price) || 0,
        instructions: formData.instructions.filter(i => i.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };
      await mockTestService.create(testData);
      toast.success('Mock test created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create test');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('update');
      const testData = {
        ...formData,
        duration: Number(formData.duration),
        passingMarks: Number(formData.passingMarks) || undefined,
        price: Number(formData.price) || 0,
        instructions: formData.instructions.filter(i => i.trim()),
        tags: typeof formData.tags === 'string' 
          ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
          : formData.tags,
      };
      await mockTestService.update(editingTest._id, testData);
      toast.success('Mock test updated successfully!');
      setShowEditModal(false);
      setEditingTest(null);
      resetForm();
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update test');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading('delete');
      await mockTestService.delete(showDeleteModal._id);
      toast.success('Mock test deleted successfully!');
      setShowDeleteModal(null);
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete test');
    } finally {
      setActionLoading(null);
    }
  };

  const togglePublish = async (test) => {
    try {
      setActionLoading(test._id);
      await mockTestService.togglePublish(test._id);
      toast.success(`Mock test ${!test.isPublished ? 'published' : 'unpublished'}`);
      fetchTests();
    } catch (error) {
      toast.error('Failed to update publish status');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeatured = async (test) => {
    try {
      setActionLoading(test._id + '-featured');
      await mockTestService.toggleFeatured(test._id);
      toast.success(`Mock test ${!test.isFeatured ? 'featured' : 'unfeatured'}`);
      fetchTests();
    } catch (error) {
      toast.error('Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title || '',
      description: test.description || '',
      thumbnail: test.thumbnail || '',
      category: test.category || '',
      company: test.company || '',
      difficulty: test.difficulty || 'Medium',
      duration: test.duration || 30,
      passingMarks: test.passingMarks || '',
      instructions: test.instructions?.length ? test.instructions : [''],
      tags: Array.isArray(test.tags) ? test.tags.join(', ') : '',
      isFree: test.isFree ?? true,
      price: test.price || 0,
      isPublished: test.isPublished || false,
      isFeatured: test.isFeatured || false,
      whatsappNumber: test.whatsappNumber || '918272946202',
      questions: test.questions || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  // Question management
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...emptyQuestion }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, questions: updated });
  };

  const updateQuestionOption = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'Hard': return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300';
      default: return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300';
    }
  };

  const statCards = [
    { label: 'Total Tests', value: stats.total, icon: ClipboardList, color: 'blue' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'green' },
    { label: 'Drafts', value: stats.drafts, icon: AlertCircle, color: 'yellow' },
    { label: 'Featured', value: stats.featured, icon: Star, color: 'purple' },
    { label: 'Free', value: stats.free, icon: Award, color: 'cyan' },
    { label: 'Total Questions', value: stats.totalQuestions, icon: HelpCircle, color: 'pink' },
    { label: 'Attempts', value: stats.totalAttempts, icon: Users, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock Test Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage mock tests with questions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Test
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border border-gray-200 dark:border-gray-800">
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
              placeholder="Search mock tests..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer">
                <option value="">All Categories</option>
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer">
                <option value="">All Difficulty</option>
                {difficulties.map(d => (<option key={d} value={d}>{d}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer">
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Drafts</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No mock tests found</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first mock test to get started</p>
          </div>
        ) : (
          tests.map((test) => (
            <Card key={test._id} className="border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-dark-200">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    {test.thumbnail ? (
                      <img src={test.thumbnail} alt={test.title} className="w-full h-full object-cover" />
                    ) : (
                      <Brain className="w-16 h-16 text-white/50" />
                    )}
                  </div>
                  {test.isFree && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">FREE</span>
                  )}
                  {test.isFeatured && (
                    <span className="absolute top-3 right-3 p-1.5 bg-yellow-500 text-white rounded-lg">
                      <Star className="w-4 h-4 fill-current" />
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getDifficultyColor(test.difficulty)}`}>{test.difficulty}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-lg">
                    <Clock className="w-3 h-3" />
                    {test.duration} min
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded-full">{test.category}</span>
                    {test.company && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">{test.company}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{test.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{test.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><FileQuestion className="w-4 h-4" />{test.totalQuestions || 0} Q</span>
                    <span className="flex items-center gap-1"><Target className="w-4 h-4" />{test.totalMarks || 0} marks</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{test.attempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${test.isPublished ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'}`}>
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {test.avgScore > 0 && (
                      <span className="text-sm text-gray-500">Avg Score: {test.avgScore}%</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish(test)}
                      disabled={actionLoading === test._id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl h-8 text-xs flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {actionLoading === test._id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : test.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <Button
                      onPress={() => toggleFeatured(test)}
                      disabled={actionLoading === test._id + '-featured'}
                      variant="light"
                      color="warning"
                      size="sm"
                      isIconOnly
                    >
                      {actionLoading === test._id + '-featured' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className={`w-4 h-4 ${test.isFeatured ? 'fill-current' : ''}`} />}
                    </Button>
                    <Button
                      onPress={() => openEditModal(test)}
                      variant="light"
                      color="primary"
                      size="sm"
                      isIconOnly
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onPress={() => setShowDeleteModal(test)}
                      variant="light"
                      color="danger"
                      size="sm"
                      isIconOnly
                    >
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
        total={totalTests}
        limit={LIMIT}
        onPageChange={setPage}
      />

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-dark-200 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Create Mock Test' : 'Edit Mock Test'}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingTest(null); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Enter test title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option value="">Select Category</option>
                      {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company (Optional)</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="e.g., TCS, Infosys" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                    <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      {difficulties.map(d => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes) *</label>
                    <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required min="1" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passing Marks</label>
                    <input type="number" value={formData.passingMarks} onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Auto: 40% of total" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                    <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="aptitude, reasoning" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail URL</label>
                    <input type="url" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Test description..." />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Instructions</h3>
                {formData.instructions.map((inst, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" value={inst} onChange={(e) => updateArrayItem('instructions', index, e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Instruction..." />
                    {formData.instructions.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('instructions', index)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Minus className="w-5 h-5" /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('instructions')} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">+ Add Instruction</button>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FileQuestion className="w-5 h-5" /> Questions ({formData.questions.length})</h3>
                  <button type="button" onClick={addQuestion} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-medium hover:bg-cyan-200 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Add Question
                  </button>
                </div>
                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 bg-gray-50 dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question {qIndex + 1}</span>
                      <button type="button" onClick={() => removeQuestion(qIndex)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><X className="w-4 h-4" /></button>
                    </div>
                    <textarea value={q.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Enter question..." rows={2} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIndex} onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)} className="w-4 h-4 text-cyan-600" />
                          <input type="text" value={opt} onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder={`Option ${oIndex + 1}`} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Difficulty</label>
                        <select value={q.difficulty} onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm">
                          {questionDifficulties.map(d => (<option key={d} value={d}>{d}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Marks</label>
                        <input type="number" value={q.marks} onChange={(e) => updateQuestion(qIndex, 'marks', Number(e.target.value))} min="1" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Explanation (Optional)</label>
                        <input type="text" value={q.explanation} onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" placeholder="Why this answer?" />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.questions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No questions added yet. Click "Add Question" to start.</p>
                )}
              </div>

              {/* Settings */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Free Test</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Publish</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingTest(null); resetForm(); }} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {showCreateModal ? 'Create Test' : 'Update Test'}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Mock Test</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "<span className="font-medium text-gray-700 dark:text-gray-300">{showDeleteModal.title}</span>"? This will also delete all {showDeleteModal.totalQuestions || 0} questions.
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

export default MockTestManagement;
