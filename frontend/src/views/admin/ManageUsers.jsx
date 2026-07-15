import { useState, useEffect } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  ArrowLeft, Search, Filter, User, UserCheck, 
  UserX, Ban, Trash2, Edit, MoreVertical 
} from 'lucide-react';
import { userService } from '../../services/dataService';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'job_poster', label: 'Job Poster' },
    { value: 'resource_poster', label: 'Resource Poster' },
    { value: 'blog_poster', label: 'Blog Poster' },
    { value: 'tech_blog_poster', label: 'Tech Blog Poster' },
    { value: 'digital_product_poster', label: 'Digital Product Poster' },
    { value: 'others', label: 'Others' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'blocked', label: 'Blocked' },
  ];

  useEffect(() => {
    fetchUsers();
  }, [filterStatus, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterRole !== 'all') params.role = filterRole;
      
      const response = await userService.getAll(params);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await userService.approve(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, status: 'approved' } : u));
      toast.success('User approved');
      setActiveDropdown(null);
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleBlock = async (userId) => {
    try {
      await userService.block(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, status: 'blocked' } : u));
      toast.success('User blocked');
      setActiveDropdown(null);
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await userService.unblock(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, status: 'approved' } : u));
      toast.success('User unblocked');
      setActiveDropdown(null);
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-danger',
      blocked: 'badge-danger',
    };
    return badges[status] || 'badge-primary';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="w-full px-8 lg:px-12">
        <Link
          to="/admin"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">Manage Users</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select w-full md:w-48"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="select w-full md:w-48"
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 bg-dark-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-dark-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-dark-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-dark-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-dark-200 rounded w-10 ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-dark-200/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-gray-700"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold ${user.avatar ? 'hidden' : ''}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 capitalize text-sm">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}
                            className="p-2 rounded-lg hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {activeDropdown === user._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-dark-100 rounded-xl border border-gray-700 shadow-xl z-10 overflow-hidden">
                              {user.status !== 'approved' && (
                                <button
                                  onClick={() => handleApprove(user._id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-200 hover:text-blue-400"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Approve
                                </button>
                              )}
                              {user.status === 'blocked' ? (
                                <button
                                  onClick={() => handleUnblock(user._id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-200 hover:text-blue-400"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlock(user._id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-200 hover:text-blue-300"
                                >
                                  <Ban className="w-4 h-4" />
                                  Block
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-dark-200 hover:text-blue-800"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
