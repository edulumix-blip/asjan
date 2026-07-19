import { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FolderOpen, 
  FileText, 
  GraduationCap, 
  ShoppingBag, 
  ClipboardList,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Check,
  Trash2,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import api from '../../services/api';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalContributors: 0,
    totalJobs: 0,
    totalResources: 0,
    totalBlogs: 0,
    totalCourses: 0,
    totalProducts: 0,
    totalMockTests: 0,
    totalInterviewPreps: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    blockedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review pending contributor requests', completed: false },
    { id: 2, text: 'Update job postings for this week', completed: false },
    { id: 3, text: 'Add new resources to the platform', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('edulumix_admin_todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
    setIsLoaded(true);
    fetchStats();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('edulumix_admin_todos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel with fallback handling
      const handleGet = async (url) => {
        try {
          return await api.get(url);
        } catch (err) {
          console.error(`Error fetching ${url}:`, err);
          return { data: { success: false, data: {}, total: 0 } };
        }
      };

      const [userStats, jobsRes, resourcesRes, blogsRes, coursesRes, productsRes, mockTestsRes, interviewPrepRes] = await Promise.all([
        handleGet('/users/stats'),
        handleGet('/jobs?limit=1'),
        handleGet('/resources?limit=1'),
        handleGet('/blogs?limit=1'),
        handleGet('/courses?limit=1'),
        handleGet('/products?limit=1'),
        handleGet('/mocktests?limit=1'),
        handleGet('/interview-prep'),
      ]);

      setStats({
        totalContributors: userStats.data?.data?.approvedUsers || 0,
        totalJobs: jobsRes.data?.total || 0,
        totalResources: resourcesRes.data?.total || 0,
        totalBlogs: blogsRes.data?.total || 0,
        totalCourses: coursesRes.data?.total || 0,
        totalProducts: productsRes.data?.total || 0,
        totalMockTests: mockTestsRes.data?.total || 0,
        totalInterviewPreps: interviewPrepRes.data?.data?.length || 0,
        pendingUsers: userStats.data?.data?.pendingUsers || 0,
        approvedUsers: userStats.data?.data?.approvedUsers || 0,
        blockedUsers: userStats.data?.data?.blockedUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Contributors', 
      value: stats.totalContributors, 
      icon: Users, 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'Total Jobs', 
      value: stats.totalJobs, 
      icon: Briefcase, 
      color: 'blue',
      gradient: 'from-blue-400 to-blue-500'
    },
    { 
      label: 'Total Resources', 
      value: stats.totalResources, 
      icon: FolderOpen, 
      color: 'blue',
      gradient: 'from-blue-600 to-blue-700'
    },
    { 
      label: 'Tech Blog/Events', 
      value: stats.totalBlogs, 
      icon: FileText, 
      color: 'sky',
      gradient: 'from-sky-500 to-sky-600'
    },
    { 
      label: 'Total Courses', 
      value: stats.totalCourses, 
      icon: GraduationCap, 
      color: 'blue',
      gradient: 'from-blue-300 to-blue-400'
    },
    { 
      label: 'Digital Products', 
      value: stats.totalProducts, 
      icon: ShoppingBag, 
      color: 'sky',
      gradient: 'from-sky-400 to-sky-500'
    },
    { 
      label: 'Mock Tests', 
      value: stats.totalMockTests, 
      icon: ClipboardList, 
      color: 'blue',
      gradient: 'from-blue-700 to-blue-800'
    },
    { 
      label: 'Interview Prep Qs', 
      value: stats.totalInterviewPreps, 
      icon: MessageSquare, 
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600'
    },
  ];

  const userStatCards = [
    { 
      label: 'Pending Approval', 
      value: stats.pendingUsers, 
      icon: Clock, 
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      label: 'Approved Users', 
      value: stats.approvedUsers, 
      icon: UserCheck, 
      color: 'blue',
      bgColor: 'bg-sky-50 dark:bg-sky-500/10',
      textColor: 'text-sky-600 dark:text-sky-400'
    },
    { 
      label: 'Blocked Users', 
      value: stats.blockedUsers, 
      icon: UserX, 
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-700/10',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
  ];

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setTodos([
      ...todos,
      { id: Date.now(), text: newTodo.trim(), completed: false }
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  if (loading) {
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
            Dashboard Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening on your platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span>All systems operational</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-none shadow-sm bg-white dark:bg-dark-200 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {userStatCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`border-none shadow-sm ${stat.bgColor}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.textColor} bg-white dark:bg-dark-200 flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Todo List Section */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Admin Todo List
          </h2>
        </div>
        
        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <Button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 h-11"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </form>

        {/* Todo Items */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-80 overflow-y-auto">
          {todos.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                  }`}
                >
                  {todo.completed && <Check className="w-4 h-4" />}
                </button>
                <span className={`flex-1 text-gray-700 dark:text-gray-300 ${
                  todo.completed ? 'line-through' : ''
                }`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-700/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Todo Footer */}
        {todos.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-dark-100 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {todos.filter(t => t.completed).length} of {todos.length} tasks completed
            </span>
            <button
              onClick={() => setTodos(todos.filter(t => !t.completed))}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
