'use client';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/utils/reactRouterCompat';
import Logo from '../../components/common/Logo';
import { 
  Button, 
  Card, 
  CardContent,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  TextField,
  Label,
  InputGroup
} from '@heroui/react';
import { 
  User, Mail, Lock, Eye, EyeOff, UserPlus, Shield,
  Gift, Trophy, Coins, TrendingUp, Sparkles, Home, CheckCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/seo/SEO';
import api from '../../services/api';

// Rewards Info Component
const RewardsSection = () => {
  const [activeReward, setActiveReward] = useState(0);
  
  const rewards = [
    { points: '10', action: 'Post a Job', icon: '💼' },
    { points: '10', action: 'Share Resource', icon: '📚' },
    { points: '10', action: 'Write Blog', icon: '✍️' },
    { points: '25', action: 'Create Course', icon: '🎓' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReward((prev) => (prev + 1) % rewards.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 lg:p-12">
      <div className="text-center max-w-md">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
          <Gift className="w-5 h-5 text-yellow-300" />
          <span className="text-white font-medium">Earn While You Contribute</span>
        </div>
        
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Turn Your <span className="text-yellow-300">Skills</span> Into <span className="text-green-300">Rewards</span>
        </h2>
        <p className="text-blue-100 text-lg mb-10">
          Every contribution you make earns you points. Redeem them for real money!
        </p>
        
        {/* Animated Points Display */}
        <div className="relative mb-10">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-pulse">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">
                +{rewards[activeReward].points}
              </p>
              <p className="text-white/80 text-xs font-medium">POINTS</p>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce">
            {rewards[activeReward].icon}
          </div>
        </div>
        
        {/* Current Action */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-white/20">
          <p className="text-white font-semibold text-lg">{rewards[activeReward].action}</p>
          <p className="text-blue-200 text-sm">and earn {rewards[activeReward].points} points instantly!</p>
        </div>
        
        {/* Points Value */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-white font-bold">10</p>
            <p className="text-blue-200 text-xs">= ₹10</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-white font-bold">Top</p>
            <p className="text-blue-200 text-xs">Contributors</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-white font-bold">Grow</p>
            <p className="text-blue-200 text-xs">Your Earnings</p>
          </div>
        </div>
        
        {/* CTA Text */}
        <p className="text-blue-100 text-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Join now and start earning from day one!
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </p>
      </div>
    </div>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'job_poster',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [emailError, setEmailError] = useState('');

  const navigate = useNavigate();
  const { signup } = useAuth();

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }
    setOtpLoading(true);
    setEmailError('');
    try {
      const response = await api.post('/auth/send-otp', { email: formData.email });
      if (response.data) {
        toast.success(response.data.message || 'OTP sent successfully!');
        setOtpSent(true);
        setOtpTimer(60);
      }
    } catch (error) {
      console.warn('Error sending OTP:', error);
      const msg = error.response?.data?.message;
      const parsedMsg = Array.isArray(msg) ? msg[0] : (msg || 'Failed to send verification OTP');
      if (parsedMsg.toLowerCase().includes('already exists') || parsedMsg.toLowerCase().includes('exist')) {
        setEmailError(parsedMsg);
      } else {
        toast.error(parsedMsg);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otpCode,
      });
      if (response.data) {
        toast.success(response.data.message || 'Email verified successfully!');
        setIsEmailVerified(true);
        setEmailError('');
      }
    } catch (error) {
      console.warn('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const roles = [
    { value: 'job_poster', label: 'Job Contributor' },
    { value: 'resource_poster', label: 'Resource Contributor' },
    { value: 'tech_blog_poster', label: 'Tech Blog/Event Contributor' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!/[a-zA-Z]/.test(formData.password)) {
      toast.error('Password must contain at least one letter');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error('Password must contain at least one number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      if (response.success) {
        setSubmitted(true);
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEO title="Request Admin Access | EduLumix" noIndex />
      {/* Left Side - Animated Services (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <RewardsSection />
      </div>

      {/* Right Side - Form or Pending Approval */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300">
        <div className="w-full max-w-md">
          {submitted ? (
            /* Pending Approval Message */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                Your contributor request has been submitted successfully. Please wait for admin approval.
              </p>

              {/* What happens next */}
              <Card className="border-none shadow-md bg-white dark:bg-dark-100 mb-5">
                <CardContent className="p-4 text-left">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    What happens next?
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-500 text-xs font-medium">1</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Admin reviews your request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-500 text-xs font-medium">2</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">You'll be notified via email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-500 text-xs font-medium">3</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Login & start earning rewards!</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button 
                  onPress={() => navigate('/')}
                  variant="primary"
                  className="flex-1 h-10 bg-blue-600 text-white font-medium rounded-lg shadow-lg"
                  startContent={<Home className="w-4 h-4" />}
                >
                  Go Home
                </Button>
                <Button 
                  onPress={() => navigate('/login')}
                  variant="outline"
                  className="flex-1 h-10 font-medium rounded-lg border-gray-200 dark:border-gray-700"
                >
                  Sign In
                </Button>
              </div>
            </div>
          ) : (
            /* Signup Form */
            <>
              {/* Header */}
              <div className="text-center mb-4">
                <div className="flex justify-center">
                  <Logo size="default" showText={true} linkTo="/" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-0.5">
                  Request Admin Access
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Sign up to become an admin contributor
                </p>
              </div>

              {/* Form wrapped in HeroUI Card */}
              <Card className="border-none shadow-xl bg-white dark:bg-dark-100">
                <CardContent className="p-4 sm:p-5">
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <TextField className="flex flex-col gap-1 text-left">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                      <InputGroup className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 px-3 flex items-center bg-white dark:bg-dark-100">
                        <InputGroup.Prefix className="mr-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </InputGroup.Prefix>
                        <InputGroup.Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                          className="bg-transparent outline-none w-full text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </InputGroup>
                    </TextField>

                    {/* Email */}
                    <TextField className="flex flex-col gap-1 text-left">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                      <InputGroup className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 px-3 flex items-center bg-white dark:bg-dark-100">
                        <InputGroup.Prefix className="mr-2">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </InputGroup.Prefix>
                        <InputGroup.Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={otpSent || isEmailVerified}
                          placeholder="Enter your email"
                          className="bg-transparent outline-none w-full text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-70"
                        />
                        {isEmailVerified && (
                          <InputGroup.Suffix className="ml-2 flex items-center text-green-600 dark:text-green-400 gap-1 text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </InputGroup.Suffix>
                        )}
                      </InputGroup>
                      {emailError && (
                        <p className="text-[11px] font-semibold text-red-500 mt-0.5 text-left">
                          {emailError}
                        </p>
                      )}

                      {/* OTP Controls */}
                      {!isEmailVerified && (
                        <div className="mt-1">
                          {!otpSent ? (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpLoading || !formData.email}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed hover:underline cursor-pointer"
                            >
                              {otpLoading ? 'Sending...' : 'Send Verification OTP'}
                            </button>
                          ) : (
                            <div className="space-y-1.5 mt-1.5 bg-gray-50 dark:bg-dark-200/50 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-left">
                              <Label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                Enter 6-Digit OTP sent to your email
                              </Label>
                              <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={otpCode}
                                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                  placeholder="000000"
                                  className="w-20 sm:w-24 h-8 rounded-md border border-gray-200 dark:border-gray-700 px-2 bg-white dark:bg-dark-200 text-xs sm:text-sm text-gray-900 dark:text-white text-center font-bold tracking-widest focus:outline-none focus:border-blue-500"
                                />
                                <Button
                                  type="button"
                                  onPress={handleVerifyOtp}
                                  isLoading={otpLoading}
                                  disabled={otpCode.length !== 6 || otpLoading}
                                  size="sm"
                                  className="h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs"
                                >
                                  Verify
                                </Button>
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={otpTimer > 0 || otpLoading}
                                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 disabled:text-gray-400 hover:underline cursor-pointer ml-1"
                                >
                                  {otpTimer > 0 ? `${otpTimer}s` : 'Resend'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOtpSent(false);
                                    setOtpCode('');
                                  }}
                                  className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer ml-auto"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TextField>

                    {/* Role Select */}
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Role</span>
                      <Select
                        selectedKey={formData.role}
                        onSelectionChange={(key) => setFormData({ ...formData, role: key })}
                        className="w-full"
                        aria-label="Select Role"
                      >
                        <SelectTrigger className="flex items-center justify-between w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-100 text-sm h-10 text-gray-900 dark:text-white">
                          <SelectValue />
                          <SelectIndicator />
                        </SelectTrigger>
                        <SelectPopover>
                          <ListBox className="p-1 bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                            {roles.map((role) => (
                              <ListBoxItem 
                                key={role.value} 
                                id={role.value}
                                className="px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-gray-100 dark:hover:bg-dark-200 cursor-pointer text-gray-900 dark:text-white"
                              >
                                {role.label}
                              </ListBoxItem>
                            ))}
                          </ListBox>
                        </SelectPopover>
                      </Select>
                    </div>

                    {/* Password */}
                    <TextField className="flex flex-col gap-1 text-left">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                      <InputGroup className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 px-3 flex items-center bg-white dark:bg-dark-100">
                        <InputGroup.Prefix className="mr-2">
                          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </InputGroup.Prefix>
                        <InputGroup.Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={8}
                          placeholder="Create password"
                          className="bg-transparent outline-none w-full text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        <InputGroup.Suffix className="ml-2">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </InputGroup.Suffix>
                      </InputGroup>
                      {formData.password && formData.password.length < 8 && (
                        <p className="text-[11px] text-red-500 mt-0.5">At least 8 characters</p>
                      )}
                      {formData.password && formData.password.length >= 8 && (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) && (
                        <p className="text-[11px] text-red-500 mt-0.5">Need letter & number</p>
                      )}
                    </TextField>

                    {/* Confirm Password */}
                    <TextField className="flex flex-col gap-1 text-left">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</Label>
                      <InputGroup className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 px-3 flex items-center bg-white dark:bg-dark-100">
                        <InputGroup.Prefix className="mr-2">
                          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </InputGroup.Prefix>
                        <InputGroup.Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Confirm password"
                          className="bg-transparent outline-none w-full text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        <InputGroup.Suffix className="ml-2">
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </InputGroup.Suffix>
                      </InputGroup>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-[11px] text-red-500 mt-0.5">Passwords mismatch</p>
                      )}
                    </TextField>

                    {/* Terms & Conditions Checkbox */}
                    <div className="flex items-start gap-2 px-1">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-200 dark:border-gray-700 rounded focus:ring-blue-500 cursor-pointer mt-0.5"
                      />
                      <label htmlFor="acceptTerms" className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                        I agree to the{' '}
                        <Link to="/terms-of-service" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Terms & Conditions
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={loading}
                      disabled={!isEmailVerified}
                      className="w-full h-10 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-blue-500/25 mt-1"
                      startContent={!loading && <UserPlus className="w-4 h-4" />}
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Login Link */}
              <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Sign in
                </Link>
              </p>

              {/* Contributor Benefits */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200">Contributor Account</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Contribute jobs, courses, blogs, or mock tests. Earn points and cash them out when approved.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
