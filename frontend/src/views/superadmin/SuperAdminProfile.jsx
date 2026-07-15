'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, Camera, Save, Edit2, X,
  Loader2, Shield, Calendar, MapPin, Lock,
  Link as LinkIcon, Briefcase, AlertTriangle, CheckCircle,
  Award, FileText, Users
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import toast from 'react-hot-toast';

const SuperAdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    location: '',
    website: '',
    linkedin: '',
  });
  
  const [originalData, setOriginalData] = useState({});

  // Load user data on mount and when user changes
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
      };
      setProfileData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - restore original data
      setProfileData(originalData);
    }
    setIsEditMode(!isEditMode);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        bio: profileData.bio,
        avatar: profileData.avatar,
        location: profileData.location,
        website: profileData.website,
        linkedin: profileData.linkedin,
      });
      
      if (result.success) {
        setOriginalData(profileData);
        setIsEditMode(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
    
    setLoading(false);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEditMode ? 'Update your profile information' : 'View and manage your account details'}
          </p>
        </div>
        
        {/* Edit/Cancel Button */}
        <button
          onClick={handleEditToggle}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
            isEditMode
              ? 'bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-50'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
          }`}
        >
          {isEditMode ? (
            <>
              <X className="w-5 h-5" /> Cancel Edit
            </>
          ) : (
            <>
              <Edit2 className="w-5 h-5" /> Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 p-6 lg:p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-[20px] border-white -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-[15px] border-white -mb-16 -ml-16"></div>
        </div>
        
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {profileData.avatar ? (
              <img 
                src={profileData.avatar} 
                alt={profileData.name}
                className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-4xl border-4 border-white/30 shadow-xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
            {isEditMode && (
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white dark:bg-dark-200 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">{profileData.name || user?.name}</h2>
            <p className="text-white/80 mt-1">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                <Shield className="w-4 h-4" />
                Super Admin
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                <CheckCircle className="w-4 h-4" />
                Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                <Calendar className="w-4 h-4" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-dark-200 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-white dark:bg-dark-200 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'stats'
              ? 'bg-white dark:bg-dark-200 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode ? 'Edit your personal details below' : 'Your personal details'}
            </p>
          </div>
          
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name {isEditMode && <span className="text-red-500">*</span>}
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{profileData.name || '-'}</span>
                  </div>
                )}
              </div>
              
              {/* Email - Always Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                  <span className="ml-2 text-xs text-gray-400">(Cannot be changed)</span>
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-dark-300 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400 flex-1">{profileData.email}</span>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{profileData.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      placeholder="Bangalore, India"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{profileData.location || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Avatar URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Profile Picture URL
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="avatar"
                      value={profileData.avatar}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/your-photo.jpg"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-xl">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white truncate">{profileData.avatar || 'No avatar set'}</span>
                  </div>
                )}
              </div>
              
              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Website
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-xl">
                    <LinkIcon className="w-5 h-5 text-gray-400" />
                    {profileData.website ? (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                        {profileData.website}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-white">Not provided</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  LinkedIn Profile
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-xl">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    {profileData.linkedin ? (
                      <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                        {profileData.linkedin}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-white">Not provided</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bio
              </label>
              {isEditMode ? (
                <>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{profileData.bio?.length || 0}/500</p>
                </>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-xl min-h-[100px]">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {profileData.bio || 'No bio provided'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Save Button - Only show in edit mode */}
          {isEditMode && (
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password Change Disabled Notice */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Super Admin Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  As a Super Admin, password changes require database-level access for security reasons.
                  Contact the system administrator or use the resetSuperAdmin utility for password reset.
                </p>
                <div className="bg-gray-100 dark:bg-dark-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    Run: <code className="text-blue-600 dark:text-blue-400">node backend/utils/resetSuperAdmin.js</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Info */}
          <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Account Security
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Account Status</p>
                  <p className="text-sm text-gray-500">Your account is active</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                  Super Admin
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Member Since</p>
                  <p className="text-sm text-gray-500">{formatDate(user?.createdAt)}</p>
                </div>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-blue-200" />
                <span className="text-blue-100 font-medium">Role</span>
              </div>
              <p className="text-xl font-bold">Super Admin</p>
            </div>
            <div className="bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-sky-200" />
                <span className="text-sky-100 font-medium">Access Level</span>
              </div>
              <p className="text-xl font-bold">Full Access</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-indigo-200" />
                <span className="text-indigo-100 font-medium">Status</span>
              </div>
              <p className="text-xl font-bold capitalize">{user?.status || 'Active'}</p>
            </div>
          </div>

          {/* Activity Info */}
          <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Activity</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Last Login</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Account Created</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600 dark:text-gray-400">Role</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminProfile;
