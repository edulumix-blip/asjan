import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Newspaper,
  GraduationCap,
  Package,
  ClipboardList,
  Menu,
  X,
  Shield,
  ChevronRight,
  User,
  Gift,
  Globe,
  MessageSquare
} from 'lucide-react';
import VerifiedBadge from '../../components/common/VerifiedBadge';

const SuperAdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/super-admin/contributors', label: 'Contributors', icon: Users },
    { path: '/super-admin/jobs', label: 'Fresher Jobs', icon: Briefcase },
    { path: '/super-admin/resources', label: 'Resources', icon: FileText },
    { path: '/super-admin/blogs', label: 'Tech Blog/Events', icon: Newspaper },
    { path: '/super-admin/courses', label: 'Courses', icon: GraduationCap },
    { path: '/super-admin/external-api', label: 'External API', icon: Globe },
    { path: '/super-admin/products', label: 'Digital Products', icon: Package },
    { path: '/super-admin/mock-tests', label: 'Mock Tests', icon: ClipboardList },
    { path: '/super-admin/interview-prep', label: 'Interview Prep', icon: MessageSquare },
    { path: '/super-admin/claims', label: 'Claims Management', icon: Gift },
    { path: '/super-admin/profile', label: 'My Profile', icon: User },
  ];

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
              <div className="flex items-center justify-between">
                {/* Profile Card */}
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-blue-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ${user?.avatar ? 'hidden' : ''}`}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                      {user?.name || 'Super Admin'}
                      <VerifiedBadge user={user} size="sm" />
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Super Admin
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <ul className="space-y-1">
              {navItems.map((item) => (
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
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        </aside>

        {/* Main Content - with left margin for fixed sidebar on desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
          {/* Mobile Header - Only show hamburger for sidebar */}
          <header className="lg:hidden bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Super Admin Panel</span>
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

export default SuperAdminLayout;
