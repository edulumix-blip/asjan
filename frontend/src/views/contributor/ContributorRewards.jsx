'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Table 
} from '@heroui/react';
import {
  Trophy, Target, TrendingUp, Gift, Star, 
  Sparkles, Award, CheckCircle, Clock, XCircle,
  Smartphone, CreditCard, IndianRupee
} from 'lucide-react';

const ClaimModal = ({ isOpen, onClose, milestone, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentDetails.trim()) {
      toast.error('Please enter your payment details');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/claims', {
        points: milestone.points,
        paymentMethod,
        paymentDetails: paymentDetails.trim(),
      });

      if (response.data.success) {
        toast.success('Claim request submitted successfully!');
        onSubmit();
        onClose();
        setPaymentDetails('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Claim ₹{milestone.amount}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You're redeeming {milestone.points} points
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  UPI ID
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('phone')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'phone'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Smartphone className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === 'phone' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Phone Number
                </span>
              </button>
            </div>
          </div>

          {/* Payment Details Input */}
          <div>
            <label className="label">
              {paymentMethod === 'upi' ? 'UPI ID' : 'Phone Number'}
            </label>
            <input
              type="text"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder={paymentMethod === 'upi' ? 'yourname@upi' : '9876543210'}
              className="input"
              required
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Your request will be reviewed by our admin team. You'll receive your payment within 24-48 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
                  Submitting...
                </span>
              ) : (
                `Claim ₹${milestone.amount}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContributorRewards = () => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const milestones = [
    { points: 10, amount: 15, color: 'from-blue-400 to-blue-500', icon: Sparkles },
    { points: 25, amount: 30, color: 'from-blue-500 to-blue-600', icon: Star },
    { points: 50, amount: 60, color: 'from-blue-600 to-blue-700', icon: Award },
    { points: 100, amount: 120, color: 'from-blue-700 to-blue-800', icon: Trophy },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meResponse, claimsResponse] = await Promise.all([
        api.get('/auth/me'),
        api.get('/claims/my-claims'),
      ]);

      if (meResponse.data.success) {
        setUserPoints(meResponse.data.data.points || 0);
        setClaimedMilestones(meResponse.data.data.claimedMilestones || []);
      }

      if (claimsResponse.data.success) {
        setClaims(claimsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = (milestone) => {
    // Check if milestone already claimed
    if (claimedMilestones.includes(milestone.points)) {
      toast.error('You have already claimed this milestone!');
      return;
    }
    
    if (userPoints < milestone.points) {
      toast.error(`You need ${milestone.points - userPoints} more points to claim this reward!`);
      return;
    }

    // Check if there's a pending claim
    const hasPendingClaim = claims.some(claim => claim.status === 'pending');
    if (hasPendingClaim) {
      toast.error('You already have a pending claim. Please wait for it to be processed.');
      return;
    }

    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pending' },
      processing: { icon: TrendingUp, color: 'bg-blue-200 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300', label: 'Processing' },
      paid: { icon: CheckCircle, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', label: 'Paid' },
      rejected: { icon: XCircle, color: 'bg-blue-900/10 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300 py-8">
      <div className="w-full px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Rewards & Milestones
            </h1>
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Earn points by contributing content and redeem them for real money!
          </p>
        </div>

        {/* Points Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 p-8 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Target className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Your Balance</span>
            </div>
            <div className="text-6xl font-bold text-white mb-2">
              {userPoints}
            </div>
            <div className="text-white/80 text-lg">
              Points Available
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-white/90">
              <div className="text-sm">
                💡 Earn 1 point for every post you create
              </div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-blue-500" />
            Available Milestones
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const isClaimed = claimedMilestones.includes(milestone.points);
              const canClaim = userPoints >= milestone.points && !isClaimed;
              const progress = Math.min((userPoints / milestone.points) * 100, 100);

              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-2xl bg-white dark:bg-dark-100 border-2 transition-all duration-300 ${
                    isClaimed
                      ? 'border-gray-300 dark:border-gray-700 opacity-60'
                      : canClaim
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Progress Bar Background */}
                  <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}></div>

                  <div className="relative p-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Points & Amount */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        ₹{milestone.amount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {milestone.points} Points Required
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.min(userPoints, milestone.points)}/{milestone.points}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${milestone.color} transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Claim Button */}
                    <button
                      onClick={() => handleClaimClick(milestone)}
                      disabled={!canClaim || isClaimed}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        isClaimed
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                          : canClaim
                          ? `bg-gradient-to-r ${milestone.color} text-white shadow-lg hover:shadow-xl hover:scale-105`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Claimed
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Gift className="w-5 h-5" />
                          Claim
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claims History */}
        {claims.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              Claim History
            </h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-dark-100">
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label="Claims History Table" className="w-full">
                    <Table.Header>
                      <Table.Column isRowHeader className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Date</Table.Column>
                      <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Points</Table.Column>
                      <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Amount</Table.Column>
                      <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Payment Info</Table.Column>
                      <Table.Column className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-dark-200 py-3.5 px-6">Status</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {claims.map((claim) => (
                        <Table.Row key={claim._id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors border-b border-gray-100 dark:border-gray-800">
                          <Table.Cell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {new Date(claim.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {claim.points} pts
                            </span>
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4">
                            <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                              <IndianRupee className="w-4 h-4" />
                              ₹{claim.amount}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
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
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        milestone={selectedMilestone}
        onSubmit={fetchData}
      />
    </div>
  );
};

export default ContributorRewards;
