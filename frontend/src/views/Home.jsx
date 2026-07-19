'use client';
import { useState, useEffect, useRef } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Briefcase, FolderOpen, ShoppingBag, Users, 
  TrendingUp, Award, ArrowRight, Sparkles,
  BookOpen, Code, Laptop, Rocket, GraduationCap,
  FileText, ClipboardList, Star, Quote, CheckCircle,
  Target, Zap, Shield, Heart, ChevronLeft, ChevronRight, Pause, Play,
  Gift, Coins, Trophy, Wallet, IndianRupee, BadgeCheck
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import api from '../services/api';
import SEO from '../components/seo/SEO';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';
import { generateOrganizationSchema, generateWebsiteSchema, generateBreadcrumbSchema } from '../utils/seoSchemas';

// Contributor Card Component
const ContributorCard = ({ user }) => {
  const getRoleName = (role) => {
    const roles = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'job_poster': 'Job Contributor',
      'resource_poster': 'Resource Contributor',
      'tech_blog_poster': 'Blog Contributor',
      'course_poster': 'Course Contributor',
    };
    return roles[role] || 'Contributor';
  };

  return (
    <div className="flex-shrink-0 w-[200px] bg-white dark:bg-dark-100 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mx-2 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg group">
      {/* Avatar */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 group-hover:border-blue-400 transition-all"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-500">
            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Name with Blue Tick */}
      <div className="flex items-center justify-center gap-1 mb-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">
          {user.name}
        </h3>
        <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
      </div>
      
      {/* Role */}
      <p className="text-xs text-blue-600 dark:text-blue-400 text-center font-medium">
        {getRoleName(user.role)}
      </p>
    </div>
  );
};

// Contributors Carousel Component  
const ContributorsCarousel = ({ contributors }) => {
  const scrollRef = useRef(null);
  const cardWidth = 216; // card width + margin

  // Auto-scroll effect (right to left)
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const newScrollLeft = scrollRef.current.scrollLeft + 1;
        
        if (newScrollLeft >= maxScroll) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft = newScrollLeft;
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  if (!contributors || contributors.length === 0) {
    return null;
  }

  // Duplicate for infinite scroll
  const displayContributors = [...contributors, ...contributors, ...contributors];

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-hidden py-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {displayContributors.map((user, index) => (
        <ContributorCard key={`${user._id}-${index}`} user={user} />
      ))}
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }) => (
  <div className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white dark:bg-dark-100 rounded-xl p-5 border border-gray-200 dark:border-gray-800 mx-2">
    <div className="flex items-center gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < testimonial.rating ? 'text-blue-400 fill-blue-400' : 'text-gray-300 dark:text-gray-600'}`} 
        />
      ))}
    </div>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
      "{testimonial.comment}"
    </p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-medium">
        {testimonial.name.split(' ').map(n => n[0]).join('')}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{testimonial.name}</span>
    </div>
  </div>
);

// Testimonials Carousel Component
const TestimonialsCarousel = ({ testimonials }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const cardWidth = 356; // card width + margin

  // Auto-scroll effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const newScrollLeft = scrollRef.current.scrollLeft + cardWidth;
        
        if (newScrollLeft >= maxScroll) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Manual scroll handlers
  const scrollLeft = () => {
    if (scrollRef.current) {
      const newScrollLeft = scrollRef.current.scrollLeft - cardWidth;
      scrollRef.current.scrollTo({ left: Math.max(0, newScrollLeft), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      const newScrollLeft = scrollRef.current.scrollLeft + cardWidth;
      
      if (newScrollLeft >= maxScroll) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-6 lg:py-8 overflow-hidden">
      <div className="w-full px-8 lg:px-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-display mb-2 text-gray-900 dark:text-white">
            What Our <span className="text-blue-600 dark:text-blue-400">Users Say</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Real stories from real people who transformed their careers with EduLumix
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={scrollLeft}
            className="p-3 rounded-full bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all shadow-sm"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-full border transition-all shadow-sm ${
              isPlaying 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white dark:bg-dark-100 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500'
            }`}
            aria-label={isPlaying ? 'Pause auto-scroll' : 'Play auto-scroll'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={scrollRight}
            className="p-3 rounded-full bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all shadow-sm"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Duplicate testimonials for infinite scroll effect */}
          {[...testimonials, ...testimonials.slice(0, 10)].map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center mt-6 gap-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isPlaying ? '⏵ Auto-scrolling' : '⏸ Paused'} • {testimonials.length}+ reviews
          </span>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  // State for dynamic contributors
  const [contributors, setContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  
  // State for live stats
  const [liveStats, setLiveStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch all users from database
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await api.get('/users/all-public');
        if (response.data) {
          // All users returned are already approved from backend
          setContributors(response.data);
        }
      } catch (error) {
        console.error('Error fetching contributors:', error);
      } finally {
        setLoadingContributors(false);
      }
    };
    fetchContributors();
  }, []);
  
  // Fetch live platform stats
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const response = await api.get('/stats/platform');
        if (response.data?.success && response.data?.data) {
          setLiveStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchPlatformStats();
  }, []);

  // 6 Main Services/Portals
  const portals = [
    {
      title: 'Fresher Jobs',
      description: 'Discover curated job opportunities specifically for freshers. From IT to Non-IT, government jobs to internships - start your career journey with confidence.',
      icon: Briefcase,
      path: '/jobs',
      gradient: 'from-blue-600 to-blue-400',
      image:
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Professionals discussing career opportunities',
    },
    {
      title: 'Free Resources',
      description: 'Access premium-quality study materials, notes, tutorials, and project ideas absolutely free. Your one-stop destination for learning resources.',
      icon: FolderOpen,
      path: '/resources',
      gradient: 'from-blue-500 to-blue-400',
      image:
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Books and study materials for learning',
    },
    {
      title: 'Courses',
      description: 'Learn from industry experts with our comprehensive courses. From programming to soft skills, accelerate your career with structured learning.',
      icon: GraduationCap,
      path: '/courses',
      gradient: 'from-blue-600 to-blue-500',
      image:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Students learning together online',
    },
    {
      title: 'Tech Blog',
      description: 'Stay updated with latest technology trends, tutorials, and career guidance. Read insights from industry professionals and successful developers.',
      icon: FileText,
      path: '/blog',
      gradient: 'from-blue-500 to-blue-600',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Developer workspace with laptop and code',
    },
    {
      title: 'Digital Products',
      description: 'Get premium digital products at unbeatable prices. Templates, tools, software, and more with instant WhatsApp delivery support.',
      icon: ShoppingBag,
      path: '/digital-products',
      gradient: 'from-blue-600 to-blue-400',
      image:
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Digital shopping and online products',
    },
    {
      title: 'Mock Tests',
      description: 'Prepare for interviews and competitive exams with our comprehensive mock tests. Practice with real-world questions and track your progress.',
      icon: ClipboardList,
      path: '/mock-test',
      gradient: 'from-blue-500 to-blue-400',
      image:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Exam preparation and practice tests',
    },
  ];

  // What We Offer Features
  const features = [
    {
      icon: Code,
      title: 'For Developers',
      description: 'Tech resources, coding notes, DSA materials, and software projects to boost your skills',
    },
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Interview preparation kits, exam materials, and comprehensive study guides',
    },
    {
      icon: Laptop,
      title: 'Remote Opportunities',
      description: 'Work from home jobs, freelancing gigs, and remote career opportunities',
    },
    {
      icon: Rocket,
      title: 'Career Growth',
      description: 'Latest job updates, career guidance, and professional development resources',
    },
    {
      icon: Target,
      title: 'Skill Assessment',
      description: 'Mock tests and assessments to evaluate and improve your technical skills',
    },
    {
      icon: Shield,
      title: 'Trusted Platform',
      description: 'Verified job listings and quality resources from trusted contributors',
    },
  ];

  // Stats - target marketing numbers + live database counts
  const stats = liveStats ? [
    { value: '1000+', label: 'Happy Users', icon: Users },
    { value: '20+', label: 'Contributors', icon: Award },
    { value: `${liveStats.jobsPosted || 0}+`, label: 'Jobs Posted', icon: Briefcase },
    { value: `${liveStats.techResources || 0}+`, label: 'Tech Resources', icon: FolderOpen },
    { value: `${liveStats.courses || 0}+`, label: 'Courses', icon: GraduationCap },
    { value: `${liveStats.techBlogs || 0}+`, label: 'Tech Blogs', icon: FileText },
  ] : [
    { value: '1000+', label: 'Happy Users', icon: Users },
    { value: '20+', label: 'Contributors', icon: Award },
    { value: '200+', label: 'Jobs Posted', icon: Briefcase },
    { value: '250+', label: 'Tech Resources', icon: FolderOpen },
    { value: '50+', label: 'Courses', icon: GraduationCap },
    { value: '100+', label: 'Tech Blogs', icon: FileText },
  ];

  // 50 Testimonials with Indian names
  const testimonials = [
    { name: 'Aarav Sharma', comment: 'EduLumix helped me land my first job as a fresher! The resources are incredible.', rating: 5 },
    { name: 'Priya Patel', comment: 'Best platform for free study materials. Saved me thousands of rupees!', rating: 5 },
    { name: 'Rohit Kumar', comment: 'The mock tests really prepared me for my TCS interview. Highly recommended!', rating: 5 },
    { name: 'Sneha Gupta', comment: 'Found amazing digital products at great prices. Quick delivery via WhatsApp.', rating: 4 },
    { name: 'Vikram Singh', comment: 'The tech blogs are very informative. Keep up the great work!', rating: 5 },
    { name: 'Ananya Reddy', comment: 'Got my internship through EduLumix. Forever grateful!', rating: 5 },
    { name: 'Arjun Nair', comment: 'Courses are well-structured and easy to follow. Learned React in 2 weeks!', rating: 5 },
    { name: 'Divya Iyer', comment: 'The job alerts feature is super helpful. Never miss an opportunity now.', rating: 4 },
    { name: 'Karthik Menon', comment: 'Amazing platform for freshers. Everything you need in one place.', rating: 5 },
    { name: 'Meera Krishnan', comment: 'The DSA notes helped me crack my Infosys interview!', rating: 5 },
    { name: 'Saurabh Verma', comment: 'Been using EduLumix for 6 months. Best career platform!', rating: 5 },
    { name: 'Ritika Agarwal', comment: 'Free resources are actually premium quality. Unbelievable!', rating: 5 },
    { name: 'Aditya Joshi', comment: 'The contributor team is very responsive and helpful.', rating: 4 },
    { name: 'Pooja Saxena', comment: 'Mock tests with detailed solutions helped me improve a lot.', rating: 5 },
    { name: 'Nikhil Tiwari', comment: 'Got placed in Wipro thanks to the interview prep resources!', rating: 5 },
    { name: 'Shruti Mishra', comment: 'The courses are affordable and high quality. Love it!', rating: 4 },
    { name: 'Rajesh Yadav', comment: 'Government job notifications are always on time. Very reliable.', rating: 5 },
    { name: 'Kavitha Rao', comment: 'Digital products section has everything I needed for my projects.', rating: 5 },
    { name: 'Manish Chauhan', comment: 'The UI is clean and easy to navigate. Great user experience!', rating: 4 },
    { name: 'Deepika Pillai', comment: 'Tech blogs keep me updated with industry trends. Essential read!', rating: 5 },
    { name: 'Suresh Pandey', comment: 'From zero to hero in web development. Thanks EduLumix!', rating: 5 },
    { name: 'Anjali Dubey', comment: 'The community here is so supportive. Made many friends!', rating: 5 },
    { name: 'Vivek Malhotra', comment: 'Best investment for my career. Completely free and worth it!', rating: 5 },
    { name: 'Swati Kapoor', comment: 'Resume templates from digital products landed me interviews.', rating: 4 },
    { name: 'Gaurav Sharma', comment: 'The placement preparation kit is comprehensive and useful.', rating: 5 },
    { name: 'Nisha Singh', comment: 'Found remote job opportunities that I never knew existed!', rating: 5 },
    { name: 'Akash Mehta', comment: 'Mock tests simulate real exam environment. Very helpful!', rating: 4 },
    { name: 'Preeti Jain', comment: 'Courses have practical projects. Learned by doing!', rating: 5 },
    { name: 'Ramesh Sinha', comment: 'The job filters make it easy to find relevant opportunities.', rating: 5 },
    { name: 'Sunita Devi', comment: 'As a Tier-2 college student, this platform leveled the field for me.', rating: 5 },
    { name: 'Harsh Vardhan', comment: 'Quality content without any annoying ads. Refreshing!', rating: 4 },
    { name: 'Komal Thakur', comment: 'The notes are concise and exam-focused. Perfect for revision!', rating: 5 },
    { name: 'Deepak Chandra', comment: 'Got my first freelancing client through skills learned here.', rating: 5 },
    { name: 'Rekha Bansal', comment: 'Customer support is quick and helpful. 5 stars!', rating: 5 },
    { name: 'Santosh Kumar', comment: 'The aptitude test series is excellent for placement prep.', rating: 4 },
    { name: 'Pallavi Hegde', comment: 'Been recommending EduLumix to all my juniors!', rating: 5 },
    { name: 'Mohit Goyal', comment: 'Dark mode is a blessing for late night study sessions.', rating: 5 },
    { name: 'Ritu Sharma', comment: 'Walk-in drive updates helped me get my first interview call.', rating: 5 },
    { name: 'Ashish Rawat', comment: 'The platform keeps improving. New features every month!', rating: 4 },
    { name: 'Megha Kulkarni', comment: 'Java notes and projects helped me understand OOPs finally!', rating: 5 },
    { name: 'Pankaj Aggarwal', comment: 'Trustworthy platform. All job listings are genuine.', rating: 5 },
    { name: 'Tanvi Bhatia', comment: 'The career guidance blogs changed my perspective completely.', rating: 5 },
    { name: 'Siddharth Roy', comment: 'From confused graduate to confident professional. Thank you!', rating: 5 },
    { name: 'Jyoti Kumari', comment: 'The resources are organized so well. Easy to find what I need.', rating: 4 },
    { name: 'Prakash Rane', comment: 'Internship section helped me get experience before graduation.', rating: 5 },
    { name: 'Aparna Nair', comment: 'Mobile responsive design makes learning on-the-go easy.', rating: 5 },
    { name: 'Varun Sethi', comment: 'Best part is everything is free. No hidden charges!', rating: 5 },
    { name: 'Shikha Gupta', comment: 'The Python course is beginner-friendly and comprehensive.', rating: 4 },
    { name: 'Ravi Shankar', comment: 'EduLumix is my go-to platform for all career needs.', rating: 5 },
    { name: 'Neha Agrawal', comment: 'Cracked my Amazon interview with resources from here. Forever grateful!', rating: 5 },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateOrganizationSchema(),
      generateWebsiteSchema(),
      {
        '@type': 'WebPage',
        '@id': 'https://edulumix.in/',
        url: 'https://edulumix.in/',
        name: 'EduLumix - Complete Career Platform for Freshers | Jobs, Courses, Resources',
        description: 'Find fresher jobs, free resources, online courses, mock tests, and career guidance. Join 50,000+ students building successful careers with EduLumix.',
        isPartOf: {
          '@id': 'https://edulumix.in/#website'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="EduLumix - Complete Career Platform for Freshers | Jobs, Courses, Resources & More"
        description="Find latest fresher jobs, free resources, online courses, mock tests, tech blogs, and digital products. Join 50,000+ students building successful careers with EduLumix. Your one-stop platform for career growth."
        keywords="EduLumix, Edu Lumix, edulumix, EduLumix.in, fresher jobs, jobs for freshers, entry level jobs, graduate jobs, online courses, free resources, mock tests, interview preparation, tech blog, career guidance, digital products, job portal India, placement preparation, skill development, career platform"
        url="/"
        type="website"
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 lg:py-14 min-h-[360px] lg:min-h-[420px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=85"
            alt=""
            className="h-full w-full object-cover object-[center_35%] scale-105"
            decoding="async"
            fetchPriority="high"
          />
          {/* Dark scrim so white hero copy reads like Jobs / Resources hubs */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/50 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 100% 80% at 50% 45%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.45) 100%)',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden />
        </div>

        <div className="relative z-10 w-full w-full px-8 lg:px-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-md mb-6">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-sm font-medium text-white">Your Complete Career Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6 text-white leading-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              Unlock Your Potential with{' '}
              <span className="text-blue-400 [text-shadow:0_2px_20px_rgba(37,99,235,0.35)]">EduLumix</span>
            </h1>

            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto mb-10 leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
              Your ultimate destination for fresher jobs, free resources, courses, and career guidance.
              Join thousands of successful professionals who started their journey with us.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/jobs"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-black/30"
              >
                Explore Jobs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/resources"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/35 rounded-xl transition-all shadow-lg shadow-black/20"
              >
                Browse Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Homepage Ad */}
      <AdSlot slotId={AD_SLOTS.BANNER} className="py-6 w-full px-8 lg:px-12" />

      {/* Earn With Us Section */}
      <section className="py-6 lg:py-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="w-full px-8 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <Gift className="w-4 h-4 text-yellow-300" />
                <span className="font-medium text-xs">Contributor Rewards Program</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display mb-4">
                Share Knowledge, <span className="text-yellow-300">Earn Rewards</span>
              </h2>
              
              <p className="text-blue-100 text-sm mb-6 max-w-md">
                Join our community of contributors and get paid for every valuable post you share.
              </p>
              
              {/* How it works steps */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">1</span>
                  <p className="text-blue-100 text-sm">Sign up as a Contributor (Free)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">2</span>
                  <p className="text-blue-100 text-sm">Post Jobs, Resources & Blogs</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-sm text-green-300">3</span>
                  <p className="text-green-300 font-medium text-sm">Earn points & redeem for real money!</p>
                </div>
              </div>
              
              <Link 
                to="/signup" 
                className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:scale-105 text-sm"
              >
                Start Earning Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            {/* Right - Stats & Points */}
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-center mb-5">
                  <p className="text-blue-200 text-xs mb-1">Points Conversion Rate</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1 text-3xl font-bold text-white">
                      <Coins className="w-8 h-8 text-yellow-400" />
                      10
                    </div>
                    <span className="text-xl text-blue-300">=</span>
                    <div className="flex items-center gap-1 text-3xl font-bold text-green-400">
                      <IndianRupee className="w-6 h-6" />
                      10
                    </div>
                  </div>
                </div>
                
                {/* Points Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <Briefcase className="w-6 h-6 text-blue-300 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">+1</p>
                    <p className="text-blue-200 text-xs">Job</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <FolderOpen className="w-6 h-6 text-purple-300 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">+1</p>
                    <p className="text-blue-200 text-xs">Resource</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <FileText className="w-6 h-6 text-pink-300 mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">+1</p>
                    <p className="text-blue-200 text-xs">Blog</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">100+</p>
                    <p className="text-blue-200 text-xs">Contributors</p>
                  </div>
                  <div className="text-center">
                    <Wallet className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">₹20K+</p>
                    <p className="text-blue-200 text-xs">Paid Out</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">5K+</p>
                    <p className="text-blue-200 text-xs">Posts</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg animate-bounce">
                💰 Earn ₹1000+/month
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why NextKaptan Section */}
      <section className="py-6 lg:py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-dark-200 dark:via-dark-300 dark:to-dark-200 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
        
        <div className="w-full px-8 lg:px-12 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">WHY CHOOSE US</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gray-900 dark:text-white">
                Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">EduLumix</span>?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                We're not just another job portal. EduLumix is your complete career companion — 
                built by freshers, for freshers. Everything you need to land your dream job, absolutely free.
              </p>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Curated Jobs</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Top companies across India</p>
                </div>
                
                <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Free Resources</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium study materials</p>
                </div>
                
                <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-600 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Expert Courses</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Boost your skills fast</p>
                </div>
                
                <div className="bg-white dark:bg-dark-100 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-600 transition-all hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">100% Trusted</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verified & genuine only</p>
                </div>
              </div>
              
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all group"
              >
                Learn more about us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Right - Visual Card */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-blue-500/20 overflow-hidden">
                {/* Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-24 h-24 border-4 border-white rounded-full"></div>
                </div>
                
                <div className="relative text-center text-white py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Launch Your Career</h3>
                  <p className="opacity-80 mb-6">With the right resources and guidance</p>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-2xl font-bold">{liveStats?.jobsPosted || 0}+</p>
                      <p className="text-xs opacity-70">Jobs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{liveStats?.techResources || 0}+</p>
                      <p className="text-xs opacity-70">Resources</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{liveStats?.courses || 0}+</p>
                      <p className="text-xs opacity-70">Courses</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TechForDev Partner Section - Image as provided */}
      <section className="py-6 lg:py-8 bg-gray-100 dark:bg-dark-200 relative overflow-hidden">
        <div className="w-full px-8 lg:px-12 relative z-10">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl group">
            {/* Your image - displayed as is */}
            <a
              href="https://techfordev.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative"
            >
              <img
                src="/techfordev-hero.png"
                alt="TechForDev - The Dev Hub for AI Tools"
                className="w-full h-auto object-contain block"
              />
              {/* Hover overlay - Explore TechForDev */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
                  Explore TechForDev
                </span>
              </div>
            </a>
            {/* Visit button with wave - highlighted */}
            <div className="absolute top-4 right-4 z-20 inline-flex items-center justify-center">
              <span className="btn-wave-ring absolute inset-0 rounded-lg border-2 border-purple-400/50" style={{ animationDelay: '0s' }} />
              <span className="btn-wave-ring absolute inset-0 rounded-lg border-2 border-purple-400/40" style={{ animationDelay: '0.5s' }} />
              <span className="btn-wave-ring absolute inset-0 rounded-lg border-2 border-purple-300/30" style={{ animationDelay: '1s' }} />
              <a
                href="https://techfordev.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="relative px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50 transition-all hover:scale-105 flex items-center gap-2"
              >
                Visit TechForDev
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            Partner platform — AI tools, tech news, free APIs & remote jobs
          </p>
        </div>
      </section>

      {/* Explore Our Portals Section */}
      <section className="py-6 lg:py-8">
        <div className="w-full px-8 lg:px-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gray-900 dark:text-white">
              Explore Our <span className="text-blue-600 dark:text-blue-400">Portals</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Six specialized portals designed to help you succeed in your career journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal, index) => (
              <Link
                key={index}
                to={portal.path}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-100 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-dark-200">
                  <img
                    src={portal.image}
                    alt={portal.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                    aria-hidden
                  />
                  <div
                    className={`absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${portal.gradient} shadow-lg ring-2 ring-white/30`}
                  >
                    <portal.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                    {portal.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                    Explore Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 lg:py-8">
        <div className="w-full px-8 lg:px-12">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gray-900 dark:text-white">
              Our <span className="text-blue-600 dark:text-blue-400">Impact</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Numbers that reflect our commitment to your success
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loadingStats ? (
              // Loading skeleton
              [...Array(6)].map((_, i) => (
                <div key={i} className="text-center bg-white dark:bg-dark-100 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                  <div className="w-8 h-8 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
                </div>
              ))
            ) : (
              stats.map((stat, index) => (
                <div key={index} className="text-center bg-white dark:bg-dark-100 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="py-6 lg:py-8 bg-gradient-to-b from-gray-50 to-white dark:from-dark-200 dark:to-dark-300 overflow-hidden">
        <div className="w-full px-8 lg:px-12">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 mb-4">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">OUR TEAM</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 text-gray-900 dark:text-white">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Contributors</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Meet the amazing people powering EduLumix
            </p>
          </div>
          
          {loadingContributors ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : contributors.length > 0 ? (
            <ContributorsCarousel contributors={contributors} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No contributors found</p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* CTA Section */}
      <section className="py-6 lg:py-8 bg-gray-50 dark:bg-dark-200">
        <div className="w-full px-8 lg:px-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 md:p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of successful professionals who started their career with EduLumix. 
                It's completely free to get started.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-600 bg-white hover:bg-gray-100 rounded-xl transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link 
                  to="/about" 
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white border border-white/30 hover:bg-white/10 rounded-xl transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
