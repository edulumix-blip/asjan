'use client';
import { useState } from 'react';
import { useNavigate } from '@/utils/reactRouterCompat';
import { 
  ArrowLeft, Save, Briefcase, Building, MapPin, 
  IndianRupee, Clock, Link2, Mail, Image, FileText,
  CheckCircle, AlertCircle, Loader2, Info, X
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { jobService } from '../../services/dataService';
import toast from 'react-hot-toast';
import CompanyAvatar from '../../components/common/CompanyAvatar';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    category: 'IT Job',
    experience: 'Fresher',
    salary: '',
    status: 'Open',
    companyLogo: '',
    applyLink: '',
    description: '',
  });

  const categories = [
    'IT Job', 'Non IT Job', 'Walk In Drive', 'Govt Job',
    'Internship', 'Part Time Job', 'Remote Job', 'Others'
  ];

  const experienceLevels = [
    'Fresher', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Check if applyLink is email or URL
  const isEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await jobService.create(formData);
      if (response.data.success) {
        toast.success('Job posted successfully!');
        // Navigate based on where user came from
        if (window.location.pathname.includes('contributor')) {
          navigate('/contributor/my-posts');
        } else if (window.location.pathname.includes('super-admin')) {
          navigate('/super-admin/jobs');
        } else {
          navigate('/dashboard/my-posts');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 lg:py-8">
      <div className="px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
                <p className="text-blue-100">Fill in the job details below</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Instruction Alert */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl hover:shadow-md transition-all duration-300 group animate-pulse hover:animate-none"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">
                    📋 Job Posting Instructions - Please Read First!
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                    Click here to view important guidelines for posting jobs
                  </p>
                </div>
              </button>
            </div>

            {/* Instruction Modal */}
            {showInstructions && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Job Posting Guidelines</h2>
                          <p className="text-blue-100 text-sm">Please read carefully before posting</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowInstructions(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="space-y-4">
                      {/* Eligibility */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          ✅ Job Quality Guidelines
                        </h3>
                        <p className="text-green-800 dark:text-green-200 text-sm">
                          You can post <strong>all experience levels</strong> (fresher to senior), but details must match the original source exactly.
                        </p>
                      </div>

                      {/* Rules */}
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          ⚠️ Important Rules
                        </h3>
                        <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>No Fake Jobs:</strong> Do not post fake or misleading job opportunities.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>No Fake Links:</strong> All links must be genuine and working.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>Official Links Only:</strong> Job application links must be from the company's official website or career page.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span><strong>Verify Before Posting:</strong> Double-check all information before submitting.</span>
                          </li>
                        </ul>
                      </div>

                      {/* Support */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          📧 Need Help?
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          If you have any issues or questions, please contact our support team at{' '}
                          <a href="mailto:edulumix@gmail.com" className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-400">
                            edulumix@gmail.com
                          </a>
                        </p>
                      </div>

                      {/* Warning Note */}
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <p className="text-amber-900 dark:text-amber-100 text-sm font-medium text-center">
                          ⚡ Violation of these guidelines may result in account suspension or removal of posting privileges.
                        </p>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    >
                      I Understand - Continue Posting
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Job Title & Company */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Job Title <span className="text-blue-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Software Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    Company Name <span className="text-blue-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., TCS, Infosys, Google"
                />
              </div>
            </div>

            {/* Location & Category */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Location <span className="text-blue-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Bangalore, Remote, Pan India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category <span className="text-blue-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience & Salary */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Experience Required
                  </span>
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {experienceLevels.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    Salary Range
                  </span>
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., 5-8 LPA, ₹30,000/month"
                />
              </div>
            </div>

            {/* Status & Company Logo */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Job Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-gray-400" />
                    Company Logo URL
                  </span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    name="companyLogo"
                    value={formData.companyLogo}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                  {(formData.company?.trim() || formData.companyLogo?.trim()) ? (
                    <CompanyAvatar
                      company={formData.company || ' '}
                      logoUrl={formData.companyLogo}
                      size="md"
                      rounded="xl"
                      className="flex-shrink-0"
                    />
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Paste any image URL from the internet
                </p>
              </div>
            </div>

            {/* Apply Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="flex items-center gap-2">
                  {isEmail(formData.applyLink) ? (
                    <Mail className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Link2 className="w-4 h-4 text-gray-400" />
                  )}
                  Apply Link or Email <span className="text-blue-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="applyLink"
                value={formData.applyLink}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://careers.company.com/apply or hr@company.com"
              />
              <div className="flex items-center gap-2 mt-2">
                {formData.applyLink && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    isEmail(formData.applyLink)
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {isEmail(formData.applyLink) ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Will open email client
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        Will redirect to URL
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Job Description <span className="text-blue-500">*</span>
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Enter detailed job description including:&#10;• Job responsibilities&#10;• Required skills & qualifications&#10;• Benefits & perks&#10;• How to apply"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting Job...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
