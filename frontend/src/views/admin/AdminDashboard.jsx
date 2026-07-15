import { useState, useEffect } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Users, UserCheck, UserX, Shield, Clock, 
  Briefcase, FolderOpen, ShoppingBag, TrendingUp 
} from 'lucide-react';
import { userService } from '../../services/dataService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await userService.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingUsers || 0,
      icon: Clock,
      color: 'from-blue-400 to-blue-500',
      link: '/admin/pending',
    },
    {
      title: 'Approved Users',
      value: stats?.approvedUsers || 0,
      icon: UserCheck,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Blocked Users',
      value: stats?.blockedUsers || 0,
      icon: UserX,
      color: 'from-blue-700 to-blue-800',
    },
  ];

  const quickLinks = [
    { title: 'Manage Users', icon: Users, path: '/admin/users', description: 'View and manage all users' },
    { title: 'Pending Approvals', icon: Clock, path: '/admin/pending', description: 'Review new signup requests' },
  ];

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="w-full px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Super Admin Dashboard</h1>
            <p className="text-gray-400">Manage users and monitor platform activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-12 w-12 bg-dark-200 rounded-xl mb-4"></div>
                <div className="h-8 bg-dark-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-dark-200 rounded w-24"></div>
              </div>
            ))
          ) : (
            statCards.map((stat, index) => (
              <div key={index} className="card p-6">
                {stat.link ? (
                  <Link to={stat.link} className="block">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-gray-400">{stat.title}</p>
                  </Link>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-gray-400">{stat.title}</p>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Role Distribution */}
        {stats?.roleStats && stats.roleStats.length > 0 && (
          <div className="card p-6 mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Users by Role</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.roleStats.map((role, index) => (
                <div key={index} className="bg-dark-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{role._id.replace(/_/g, ' ')}</span>
                  <span className="text-xl font-bold text-white">{role.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="card p-6 flex items-center gap-4 group hover:-translate-y-1 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <link.icon className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
