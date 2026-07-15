import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, FileText, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="w-full px-8 lg:px-12">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="card p-6 lg:p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-800">
            <div className="relative">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-700"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-4xl text-white font-bold ${user?.avatar ? 'hidden' : ''}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-dark-100 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <span className="inline-block mt-2 badge-primary">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="input pl-12 opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input pl-12 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Changes
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
