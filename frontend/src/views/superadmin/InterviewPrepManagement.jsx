'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Plus, Search, Filter, Edit2, Trash2, 
  ChevronDown, X, Save, AlertCircle, Loader2, Sparkles, BookOpen
} from 'lucide-react';
import { Table, Button } from '@heroui/react';
import { interviewPrepService } from '../../services/dataService';
import toast from 'react-hot-toast';

const InterviewPrepManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Frontend',
    question: '',
    difficulty: 'Easy',
    answer: '',
    tips: '',
  });

  const categories = ['Frontend', 'Backend', 'Database', 'Behavioral', 'System Design', 'DevOps', 'HR', 'Architecture', 'Mobile Dev', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Testing & QA', 'Product Management', 'Project Management'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const fetchQuestions = useCallback(async () => {
    try {
      setTableLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (categoryFilter) params.category = categoryFilter;

      const res = await interviewPrepService.getAll(params);
      if (res.data.success) {
        setQuestions(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch interview questions');
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      category: 'Frontend',
      question: '',
      difficulty: 'Easy',
      answer: '',
      tips: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category,
      question: q.question,
      difficulty: q.difficulty,
      answer: q.answer,
      tips: q.tips,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim() || !formData.tips.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      if (editingQuestion) {
        // Update
        const res = await interviewPrepService.update(editingQuestion._id, formData);
        if (res.data.success) {
          toast.success('Question updated successfully!');
          setShowModal(false);
          fetchQuestions();
        }
      } else {
        // Create
        const res = await interviewPrepService.create(formData);
        if (res.data.success) {
          toast.success('Question created successfully!');
          setShowModal(false);
          fetchQuestions();
        }
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(error.response?.data?.message || 'Failed to save question');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setActionLoading(true);
    try {
      const res = await interviewPrepService.delete(showDeleteModal._id);
      if (res.data.success) {
        toast.success('Question deleted successfully');
        setShowDeleteModal(null);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Interview Prep Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, view, modify, and delete curriculum prep questions for candidates.
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-750 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 self-start sm:self-auto active:scale-[0.98] transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="p-5 bg-white dark:bg-dark-200 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <Button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
            }}
            className="px-4 py-2.5 bg-gray-100 dark:bg-dark-100 hover:bg-gray-200 dark:hover:bg-dark-150 border border-gray-250 dark:border-gray-800 text-gray-650 dark:text-gray-300 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-550 dark:text-gray-400 text-sm">Loading questions database...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-3xl">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400">No questions found</h3>
          <p className="text-sm text-gray-450 dark:text-gray-500 mt-1">Try adding a new question or adjusting filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm relative">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-dark-200/50 backdrop-blur-xs flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-100/50 text-gray-500 dark:text-gray-400 font-semibold">
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Posted By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-50/40 dark:hover:bg-dark-100/30 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{q.question}</p>
                      <p className="text-xs text-gray-450 dark:text-gray-500 line-clamp-1 mt-0.5">{q.answer}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        q.difficulty === 'Hard'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450'
                          : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {q.postedBy?.name || 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(q)}
                          className="p-2 text-gray-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-dark-100 rounded-xl transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-blue-500" />
                {editingQuestion ? 'Edit Prep Question' : 'Add New Prep Question'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Question Text</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is the difference between Virtual DOM and Real DOM?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model Answer / Explanation</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a detailed, professional model answer..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Interviewer Tip</label>
                <textarea
                  value={formData.tips}
                  onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                  placeholder="Key terms to mention, STAR template tip, or common pitfalls..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-250 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold bg-transparent active:scale-[0.98]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Question
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-dark-200 border border-gray-250 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6 animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Question?</h3>
                <p className="text-sm text-gray-550 dark:text-gray-400 leading-relaxed font-medium">
                  Are you sure you want to permanently delete this prep question? This action is irreversible.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3 border border-gray-250 dark:border-gray-850 text-gray-700 dark:text-gray-300 rounded-xl font-bold bg-transparent active:scale-[0.98]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-650 hover:bg-red-750 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrepManagement;
