'use client';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/utils/reactRouterCompat';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { 
  Button, 
  Card, 
  CardContent,
  TextField,
  Label,
  InputGroup
} from '@heroui/react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, Shield,
  Gift, Trophy, Coins, TrendingUp, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/seo/SEO';

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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.data?.role === 'super_admin') {
        navigate('/super-admin', { replace: true });
      } else {
        navigate('/contributor', { replace: true });
      }
    } else if (result.status === 'pending') {
      navigate('/pending-approval');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <SEO title="Login | EduLumix" noIndex />
      {/* Left Side - Animated Services (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        <RewardsSection />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center">
              <Logo size="default" showText={true} linkTo="/" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-0.5">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Login to access your admin dashboard
            </p>
          </div>

          {/* Form wrapped in HeroUI Card */}
          <Card className="border-none shadow-xl bg-white dark:bg-dark-100">
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleSubmit} className="space-y-3.5">
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
                      placeholder="Enter your email"
                      className="bg-transparent outline-none w-full text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </InputGroup>
                </TextField>

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
                      placeholder="Enter your password"
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
                </TextField>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-full h-10 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg shadow-blue-500/25 mt-1"
                  startContent={!loading && <LogIn className="w-4 h-4" />}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign Up Link */}
          <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>

          {/* Admin Only Notice */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This portal is for admins only. Normal users don't need an account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
