'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from 'next-themes';
import Logo from '../common/Logo';
import UserAvatar from '../common/UserAvatar';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownPopover,
  DropdownMenu, 
  DropdownItem 
} from '@heroui/react';
import { 
  Menu, X, User, LogOut, LayoutDashboard, 
  Briefcase, FolderOpen, ShoppingBag, ChevronDown,
  Sun, Moon, BookOpen, GraduationCap, FileText, ClipboardList, Sparkles
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout, isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Fresher Job', path: '/jobs', icon: Briefcase },
    { name: 'Free Resources', path: '/resources', icon: FolderOpen },
    { name: 'Courses', path: '/courses', icon: GraduationCap },
    { name: 'Tech Blog', path: '/blog', icon: FileText },
    { name: 'Digital Product', path: '/digital-products', icon: ShoppingBag },
    { name: 'Mock Test', path: '/mock-test', icon: ClipboardList },
    { name: 'AI Resume Analyzer', path: '/resume-analyzer', icon: Sparkles },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white/80 dark:bg-dark-300/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="w-full px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="default" showText={true} linkTo="/" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path || (link.path !== '/' && pathname?.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Theme Toggle & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              isIconOnly
              variant="ghost"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : isDark ? (
                <Sun className="w-5 h-5 text-blue-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            {isAuthenticated ? (
              <Dropdown>
                <DropdownTrigger>
                  <div className="flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-xl bg-gray-100/50 dark:bg-dark-100 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors">
                    <UserAvatar 
                      avatar={user?.avatar}
                      name={user?.name}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </DropdownTrigger>
                <DropdownPopover placement="bottom end" className="p-1 bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-[200px]">
                  <DropdownMenu aria-label="User actions">
                    <DropdownItem key="profile_header" className="h-14 gap-2" textValue="Signed in email">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{user?.email}</p>
                    </DropdownItem>
                    <DropdownItem 
                      key="dashboard" 
                      onPress={() => router.push(isSuperAdmin ? '/super-admin' : '/contributor')}
                      textValue="Dashboard"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{isSuperAdmin ? 'Super Admin Panel' : 'My Dashboard'}</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="profile" 
                      onPress={() => router.push(isSuperAdmin ? '/super-admin/profile' : '/contributor/profile')}
                      textValue="Profile"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      className="text-danger"
                      onPress={handleLogout}
                      textValue="Logout"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-danger" />
                        <span>Logout</span>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </DropdownPopover>
              </Dropdown>
            ) : (
              <>
                <Button 
                  onPress={() => router.push('/login')}
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Sign In
                </Button>
                <Button 
                  onPress={() => router.push('/signup')}
                  variant="primary"
                  className="text-sm font-medium text-white shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 cursor-pointer text-gray-600 dark:text-gray-300"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : isDark ? (
                <Sun className="w-5 h-5 text-blue-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-100 cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 animate-slide-down bg-white dark:bg-dark-300">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.path || (link.path !== '/' && pathname?.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.name}
                  </div>
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {isAuthenticated ? (
                <>
                  <Link
                    href={isSuperAdmin ? '/super-admin' : '/contributor'}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-100"
                  >
                    {isSuperAdmin ? 'Super Admin Panel' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-dark-100 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-100 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-center text-sm font-medium text-white bg-blue-600 rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
