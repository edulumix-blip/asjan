'use client';
import { Link } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, FolderOpen, FileText, ShoppingBag, 
  Plus, User, Settings, TrendingUp 
} from 'lucide-react';
import { Card, CardContent } from '@heroui/react';

const Dashboard = () => {
  const { user, canPostJobs, canPostResources, canPostBlogs, canPostProducts } = useAuth();

  const actions = [
    {
      title: 'Post a Job',
      description: 'Add new job opportunities',
      icon: Briefcase,
      path: '/dashboard/create-job',
      color: 'from-blue-500 to-blue-600',
      visible: canPostJobs,
    },
    {
      title: 'Add Resource',
      description: 'Share learning materials',
      icon: FolderOpen,
      path: '/dashboard/create-resource',
      color: 'from-blue-400 to-blue-500',
      visible: canPostResources,
    },
    {
      title: 'Write Blog',
      description: 'Create a new blog post',
      icon: FileText,
      path: '/dashboard/create-blog',
      color: 'from-blue-600 to-blue-700',
      visible: canPostBlogs,
    },
    {
      title: 'Add Product',
      description: 'List a digital product',
      icon: ShoppingBag,
      path: '/dashboard/create-product',
      color: 'from-blue-700 to-blue-800',
      visible: canPostProducts,
    },
  ];

  const quickLinks = [
    { title: 'My Posts', icon: FileText, path: '/dashboard/my-posts' },
    { title: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="w-full px-8 lg:px-12">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-br from-blue-600/20 to-blue-400/20 border border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-400">
                  You're logged in as{' '}
                  <span className="text-blue-400 font-medium">
                    {user?.role?.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
              <Link to="/dashboard/my-posts" className="btn-secondary">
                <TrendingUp className="w-5 h-5 mr-2" />
                View My Posts
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.filter(a => a.visible).map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="group"
              >
                <Card className="hover:-translate-y-1 transition-all border border-gray-200 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="group"
            >
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-200 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <link.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{link.title}</h3>
                    <p className="text-gray-400 text-sm">Manage your {link.title.toLowerCase()}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
