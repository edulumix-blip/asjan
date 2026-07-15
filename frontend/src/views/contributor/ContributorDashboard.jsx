import { useState, useEffect } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card, CardContent } from '@heroui/react';
import Loader from '../../components/common/Loader';
import { 
  Briefcase, FolderOpen, FileText, ShoppingBag, 
  Eye, ThumbsUp, MessageCircle, TrendingUp,
  ArrowRight, Calendar, Clock, BarChart3,
  CheckCircle, AlertCircle, PenLine, Zap, Trophy
} from 'lucide-react';

const ContributorDashboard = () => {
  const { user, canPostJobs, canPostResources, canPostBlogs, canPostProducts } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    thisMonth: 0,
    points: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch real data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const requests = [];
      
      // Fetch user info for points
      requests.push(api.get('/auth/me'));
      
      // Fetch jobs if applicable
      if (canPostJobs) {
        requests.push(api.get('/jobs/my/jobs').catch(() => ({ data: { data: [] } })));
      }
      
      // Fetch resources if applicable
      if (canPostResources) {
        requests.push(api.get('/resources/my/resources').catch(() => ({ data: { data: [] } })));
      }
      
      // Fetch blogs if applicable
      if (canPostBlogs) {
        requests.push(api.get('/blogs/my/blogs').catch(() => ({ data: { data: [] } })));
      }
      
      // Fetch products if applicable
      if (canPostProducts) {
        requests.push(api.get('/products/my/products').catch(() => ({ data: { data: [] } })));
      }

      const results = await Promise.all(requests);
      const userInfo = results[0].data.data;
      const allPosts = results.slice(1).flatMap(res => res.data.data || []);
      
      // Calculate stats
      const totalPosts = allPosts.length;
      const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      // Handle likes - it can be an array of ObjectIds or a number (likesCount)
      const totalLikes = allPosts.reduce((sum, post) => {
        if (Array.isArray(post.likes)) {
          return sum + post.likes.length;
        }
        return sum + (post.likesCount || 0);
      }, 0);
      
      // Posts this month
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const thisMonth = allPosts.filter(post => new Date(post.createdAt) >= thisMonthStart).length;
      
      setStats({
        totalPosts,
        totalViews,
        totalLikes,
        thisMonth,
        points: userInfo.points || 0,
      });
      
      // Get recent 5 posts with type
      const postsWithType = [];
      if (canPostJobs && results[1]?.data?.data) {
        postsWithType.push(...results[1].data.data.map(p => ({ ...p, type: 'job' })));
      }
      if (canPostResources && results[2]?.data?.data) {
        postsWithType.push(...results[2].data.data.map(p => ({ ...p, type: 'resource' })));
      }
      if (canPostBlogs && results[3]?.data?.data) {
        postsWithType.push(...results[3].data.data.map(p => ({ ...p, type: 'blog' })));
      }
      if (canPostProducts && results[4]?.data?.data) {
        postsWithType.push(...results[4].data.data.map(p => ({ ...p, type: 'product' })));
      }
      
      postsWithType.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentPosts(postsWithType.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Post a Job',
      description: 'Share job opportunities',
      icon: Briefcase,
      path: '/contributor/create-job',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      visible: canPostJobs,
    },
    {
      title: 'Add Resource',
      description: 'Upload study materials',
      icon: FolderOpen,
      path: '/contributor/create-resource',
      color: 'bg-blue-600',
      gradient: 'from-blue-600 to-blue-700',
      visible: canPostResources,
    },
    {
      title: 'Write Blog',
      description: 'Share your knowledge',
      icon: FileText,
      path: '/contributor/create-blog',
      color: 'bg-blue-700',
      gradient: 'from-blue-700 to-blue-800',
      visible: canPostBlogs,
    },
    {
      title: 'Add Product',
      description: 'List digital products',
      icon: ShoppingBag,
      path: '/contributor/create-product',
      color: 'bg-blue-800',
      gradient: 'from-blue-800 to-blue-900',
      visible: canPostProducts,
    },
  ].filter(action => action.visible);

  const getPostTypeIcon = (type) => {
    const icons = {
      job: Briefcase,
      resource: FolderOpen,
      blog: FileText,
      product: ShoppingBag,
    };
    return icons[type] || FileText;
  };

  const getPostTypeColor = (type) => {
    const colors = {
      job: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      resource: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      blog: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      product: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <AlertCircle className="w-3 h-3" />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 p-6 lg:p-8">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-blue-300/10 rounded-full blur-xl"></div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-200 text-sm font-medium">{getGreeting()}</span>
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-blue-100 text-sm lg:text-base max-w-lg">
              Ready to share something amazing today? Your contributions help thousands of freshers succeed.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contributor/my-posts"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              View My Posts
            </Link>
            {quickActions.length > 0 && (
              <Link
                to={quickActions[0].path}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-all shadow-lg"
              >
                <Zap className="w-4 h-4" />
                Quick Create
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-dark-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <PenLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">
                +{stats.thisMonth} this month
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-dark-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-dark-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Likes</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-dark-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-dark-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stats.points}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="group relative overflow-hidden bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-transparent hover:shadow-xl transition-all duration-300"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-white transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">
                    {action.description}
                  </p>
                  <ArrowRight className="absolute bottom-0 right-0 w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
          <Link
            to="/contributor/my-posts"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {recentPosts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet</p>
              {quickActions.length > 0 && (
                <Link
                  to={quickActions[0].path}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            recentPosts.map((post) => {
              const PostIcon = getPostTypeIcon(post.type);
              return (
                <div key={post.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                  <div className={`w-11 h-11 rounded-xl ${getPostTypeColor(post.type)} flex items-center justify-center flex-shrink-0`}>
                    <PostIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views} views
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.date}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(post.status)}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pro Tip!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Posts with detailed descriptions and proper formatting get 3x more views. Take your time to create quality content that helps freshers succeed in their career journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;
