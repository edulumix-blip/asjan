'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Table, 
  Card, 
  CardContent, 
  Button 
} from '@heroui/react';
import {
  IndianRupee, Clock, CheckCircle, XCircle, TrendingUp,
  User, Smartphone, CreditCard, Calendar, Filter,
  Search, RefreshCw, Eye, Check, X, AlertCircle
} from 'lucide-react';

const ClaimDetailsModal = ({ claim, onClose, onUpdate }) => {
  const [status, setStatus] = useState(claim?.status || 'pending');
  const [transactionId, setTransactionId] = useState(claim?.transactionId || '');
  const [notes, setNotes] = useState(claim?.notes || '');
  const [loading, setLoading] = useState(false);

  if (!claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/claims/${claim._id}`, {
        status,
        transactionId: transactionId.trim(),
        notes: notes.trim(),
      });

      if (response.data.success) {
        toast.success(`Claim ${status} successfully!`);
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claim Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contributor Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {claim.user?.name}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {claim.user?.email}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Role:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                  {claim.user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Current Points:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {claim.user?.points} points
                </p>
              </div>
            </div>
          </div>

          {/* Claim Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Points Redeemed
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {claim.points} points
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  Amount to Pay
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ₹{claim.amount}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Payment Details
            </h4>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-100 rounded-lg">
              {claim.paymentMethod === 'upi' ? (
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {claim.paymentMethod === 'upi' ? 'UPI ID' : 'Phone Number'}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {claim.paymentDetails}
                </div>
              </div>
            </div>
          </div>

          {/* Request Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              Requested on {new Date(claim.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="label">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {status === 'paid' && (
              <div>
                <label className="label">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="input"
                />
              </div>
            )}

            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments..."
                rows={3}
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Claim'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [claimsRes, statsRes] = await Promise.all([
        api.get('/claims', { params: { status: filters.status || undefined } }),
        api.get('/claims/stats'),
      ]);

      if (claimsRes.data.success) {
        setClaims(claimsRes.data.data);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        claim.user?.name?.toLowerCase().includes(searchLower) ||
        claim.user?.email?.toLowerCase().includes(searchLower) ||
        claim.paymentDetails?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      processing: { icon: TrendingUp, color: 'bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' },
      paid: { icon: CheckCircle, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
      rejected: { icon: XCircle, color: 'bg-blue-900/10 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Claims Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and process contributor reward claims
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.pending.count}
                </span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Pending Claims
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                ₹{stats.pending.totalAmount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-100 dark:bg-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-700 dark:text-blue-300" />
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.processing.count}
                </span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Processing
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                ₹{stats.processing.totalAmount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-200 dark:bg-blue-700/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-blue-800 dark:text-blue-200" />
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.paid.count}
                </span>
              </div>
              <div className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                Paid
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                ₹{stats.paid.totalAmount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-900/10 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-blue-900 dark:text-blue-100" />
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.rejected.count}
                </span>
              </div>
              <div className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                Rejected
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                ₹{stats.rejected.totalAmount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or payment details..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={fetchData}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No claims found</p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-dark-100">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Claims Management Table" className="w-full">
                  <Table.Header>
                    <Table.Column isRowHeader className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Contributor</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Points</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Amount</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Payment Info</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Status</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Date</Table.Column>
                    <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Actions</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {filteredClaims.map((claim) => (
                      <Table.Row key={claim._id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors border-b border-gray-100 dark:border-gray-800">
                        <Table.Cell className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {claim.user?.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {claim.user?.email}
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {claim.points} pts
                          </span>
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            ₹{claim.amount}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            {claim.paymentMethod === 'upi' ? (
                              <CreditCard className="w-4 h-4" />
                            ) : (
                              <Smartphone className="w-4 h-4" />
                            )}
                            <span>{claim.paymentDetails}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          {getStatusBadge(claim.status)}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(claim.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <Button
                            onPress={() => setSelectedClaim(claim)}
                            variant="solid"
                            color="primary"
                            size="sm"
                            startContent={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </div>
        )}
      </div>

      {/* Claim Details Modal */}
      {selectedClaim && (
        <ClaimDetailsModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={() => {
            fetchData();
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
};

export default ClaimsManagement;
