import { useState, useEffect } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  ArrowLeft, Clock, UserCheck, UserX, User, Mail, Calendar 
} from 'lucide-react';
import { userService } from '../../services/dataService';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await userService.getPending();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await userService.approve(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User approved successfully!');
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async () => {
    try {
      await userService.reject(rejectModal.userId, rejectReason);
      setUsers(users.filter(u => u._id !== rejectModal.userId));
      setRejectModal({ open: false, userId: null });
      setRejectReason('');
      toast.success('User rejected');
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const openRejectModal = (userId) => {
    setRejectModal({ open: true, userId });
  };

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

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Pending Approvals</h1>
            <p className="text-gray-400">{users.length} users waiting for approval</p>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dark-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-dark-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-dark-200 rounded w-36"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-gray-400">No pending approval requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-gray-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold ${user.avatar ? 'hidden' : ''}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="inline-block mt-2 badge-primary capitalize">
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="btn bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <UserCheck className="w-5 h-5 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(user._id)}
                      className="btn-danger"
                    >
                      <UserX className="w-5 h-5 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-md animate-scale-in">
              <h3 className="text-xl font-bold text-white mb-4">Reject User</h3>
              <p className="text-gray-400 mb-4">
                Please provide a reason for rejection (optional):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="input resize-none mb-4"
                placeholder="Enter reason..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectModal({ open: false, userId: null });
                    setRejectReason('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="btn-danger flex-1"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;
