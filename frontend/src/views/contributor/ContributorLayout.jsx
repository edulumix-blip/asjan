import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import UserAvatar from '../../components/common/UserAvatar';
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  FileText,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronRight,
  Plus,
  BarChart3,
  Bell,
  Trophy
} from 'lucide-react';

const ContributorLayout = () => {
  const { user, canPostJobs, canPostResources, canPostBlogs, canPostProducts } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'job_poster': 'Job Contributor',
      'resource_poster': 'Resource Contributor',
      'blog_poster': 'Blog Contributor',
      'tech_blog_poster': 'Tech Blog Writer',
      'digital_product_poster': 'Product Contributor',
      'admin': 'Admin',
    };
    return roleNames[role] || 'Contributor';
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      'job_poster': 'from-blue-600 to-blue-500',
      'resource_poster': 'from-blue-500 to-blue-400',
      'blog_poster': 'from-blue-700 to-blue-600',
      'tech_blog_poster': 'from-blue-800 to-blue-700',
      'digital_product_poster': 'from-blue-600 to-blue-500',
      'admin': 'from-blue-900 to-blue-800',
    };
    return colors[role] || 'from-blue-500 to-blue-400';
  };

  // Build navigation items based on permissions
  const navItems = [
    { path: '/contributor', label: 'Dashboard', icon: LayoutDashboard, exact: true, visible: true },
    { path: '/contributor/my-posts', label: 'My Posts', icon: BarChart3, visible: true },
    { path: '/contributor/rewards', label: 'Rewards', icon: Trophy, visible: true },
    { path: '/contributor/create-job', label: 'Post New Job', icon: Briefcase, visible: canPostJobs },
    { path: '/contributor/create-resource', label: 'Add Resource', icon: FolderOpen, visible: canPostResources },
    { path: '/contributor/create-blog', label: 'Write Blog', icon: FileText, visible: canPostBlogs },
    { path: '/contributor/create-product', label: 'Add Product', icon: ShoppingBag, visible: canPostProducts },
    { path: '/contributor/profile', label: 'My Profile', icon: User, visible: true },
  ].filter(item => item.visible);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-300 flex flex-col pt-16">
      {/* Fixed Navbar at top */}
      <Navbar />
      
      <div className="flex flex-1">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed on desktop */}
        <aside className={`
          fixed top-16 bottom-0 left-0 z-40 w-72 bg-white dark:bg-dark-200 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Profile Section - Fixed at top */}
            <div className="flex-shrink-0 p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-end mb-4 lg:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            
            {/* Profile Card */}
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getRoleColor(user?.role)} relative overflow-hidden`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-8 border-white"></div>
                <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full border-4 border-white"></div>
              </div>
              
              <div className="relative flex items-center gap-3">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border-2 border-white/30 shadow-lg ${user?.avatar ? 'hidden' : ''}`}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-lg">
                    {user?.name || 'Contributor'}
                  </h3>
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white/90">
                    {getRoleDisplayName(user?.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>
            <ul className="space-y-1">
              {navItems.slice(0, 2).map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Create Section */}
            {navItems.length > 2 && (
              <>
                <p className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Create New
                </p>
                <ul className="space-y-1">
                  {navItems.slice(2, -1).map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <Plus className="w-4 h-4 opacity-50" />
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Settings Section */}
            <p className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Settings
            </p>
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/contributor/profile"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">My Profile</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

        {/* Main Content - with left margin for fixed sidebar on desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
          {/* Mobile Header - Only show hamburger for sidebar */}
          <header className="lg:hidden bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Contributor Panel</span>
            </div>
            
            {/* Notification Bell */}
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContributorLayout;
