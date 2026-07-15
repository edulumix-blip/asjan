'use client';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from '@/utils/reactRouterCompat';
import { 
  GraduationCap, Clock, Users, Star, Play, BookOpen, 
  Globe, IndianRupee, ChevronRight, ChevronDown, ChevronUp,
  Award, Video, CheckCircle, ArrowLeft, Share2, Heart,
  User, Calendar, Eye, Lock, Unlock, ExternalLink, MessageCircle
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { courseService } from '../services/dataService';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateCourseSchema, generateBreadcrumbSchema } from '../utils/seoSchemas';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';

const CourseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState(new Set([0]));
  const [liked, setLiked] = useState(false);
  const [showRawDetails, setShowRawDetails] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getBySlug(slug);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (index) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLessons(newExpanded);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: course.title,
        text: `Check out this course: ${course.title}`,
        url: url,
      });
    } catch (error) {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleEnroll = () => {
    if (course.enrollmentLink) {
      window.open(course.enrollmentLink, '_blank');
    } else if (course.whatsappNumber) {
      const message = encodeURIComponent(`Hi, I'm interested in the course: ${course.title}`);
      window.open(`https://wa.me/${course.whatsappNumber}?text=${message}`, '_blank');
    } else {
      toast.error('Enrollment link not available');
    }
  };

  const formatPrice = () => {
    if (course.isFree && course.actualPrice > 0) {
      return { current: 'Free with coupon', original: `₹${course.actualPrice}`, discount: '100% OFF' };
    }
    if (course.isFree) return { current: 'Free', original: null, discount: null };
    if (course.offerPrice !== undefined && course.offerPrice < course.actualPrice) {
      const discount = Math.round(((course.actualPrice - course.offerPrice) / course.actualPrice) * 100);
      return { 
        current: `₹${course.offerPrice}`, 
        original: `₹${course.actualPrice}`,
        discount: `${discount}% OFF`
      };
    }
    return { current: `₹${course.actualPrice}`, original: null, discount: null };
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
      'Intermediate': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'Advanced': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
      'All Levels': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    };
    return colors[level] || colors['All Levels'];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="w-full px-8 lg:px-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded w-1/4 mb-4" />
            <div className="h-64 bg-gray-200 dark:bg-dark-100 rounded-2xl mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded w-5/6" />
              </div>
              <div className="h-96 bg-gray-200 dark:bg-dark-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <Link to="/courses" className="text-blue-500 hover:underline">Back to courses</Link>
        </div>
      </div>
    );
  }

  const price = formatPrice();

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: course.title, path: `/courses/${course.slug}` }
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateCourseSchema(course),
      generateBreadcrumbSchema(breadcrumbs)
    ]
  };
  const desc = (course.shortDescription || course.description || '').replace(/<[^>]*>/g, '').slice(0, 160);
  const courseKeywords = `${course.title}, ${course.category}, online course, EduLumix, Edu Lumix, edulumix`;

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${course.title} | Online Course | EduLumix`}
        description={desc || `Enroll in ${course.title} - ${course.level || 'All levels'} course by EduLumix. ${course.enrollments || 0}+ students enrolled.`}
        keywords={courseKeywords}
        url={`/courses/${course.slug}`}
        type="article"
        image={course.thumbnail}
        structuredData={structuredData}
      />
      <div className="w-full px-8 lg:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-500">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/courses" className="hover:text-blue-500">Courses</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white truncate">{course.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {course.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                {course.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              
              {/* Short Description */}
              <p className="text-white/90 text-lg mb-6">{course.shortDescription || course.description?.slice(0, 150)}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                    <span className="text-white/70">({course.ratingCount || 0} ratings)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5" />
                  <span>{course.enrollments || 0} enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="w-5 h-5" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-5 h-5" />
                  <span>{course.language || 'English'}</span>
                </div>
              </div>

              {/* Instructor */}
              {course.instructor?.name && (
                <div className="flex items-center gap-3">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white/70">Instructor</p>
                    <p className="font-medium">{course.instructor.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-56 bg-white/10 flex items-center justify-center">
                    <GraduationCap className="w-20 h-20 text-white/30" />
                  </div>
                )}
                {course.previewVideo && (
                  <a 
                    href={course.previewVideo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* In-content Ad */}
        <AdSlot slotId={AD_SLOTS.IN_ARTICLE} className="mb-8" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About This Course</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* Course Content */}
            {course.lessons?.length > 0 && (
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                  Course Content
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {course.lessons.length} lessons
                </p>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div key={index} className="border border-gray-200 dark:border-dark-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleLesson(index)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-medium text-sm">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white text-left">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {lesson.duration && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{lesson.duration}</span>
                          )}
                          {lesson.isFree ? (
                            <Unlock className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                          {expandedLessons.has(index) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      {expandedLessons.has(index) && lesson.description && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-gray-600 dark:text-gray-400 text-sm pl-11">
                            {lesson.description}
                          </p>
                          {lesson.isFree && lesson.videoUrl && (
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-2 ml-11 text-blue-500 hover:text-blue-600 text-sm"
                            >
                              <Play className="w-4 h-4" /> Watch Preview
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw API Details (for external/Udemy courses) */}
            {course.rawApiData && course.source === 'udemy' && (
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100">
                <button
                  onClick={() => setShowRawDetails(!showRawDetails)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Full Course Info (API)
                  </h2>
                  {showRawDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {showRawDetails && (
                  <pre className="mt-4 p-4 bg-gray-50 dark:bg-dark-100 rounded-lg text-sm overflow-x-auto text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto">
                    {JSON.stringify(course.rawApiData, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Instructor Bio */}
            {course.instructor && (
              <div className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Instructor</h2>
                <div className="flex items-start gap-4">
                  {course.instructor.avatar ? (
                    <img 
                      src={course.instructor.avatar} 
                      alt={course.instructor.name} 
                      className="w-16 h-16 rounded-full object-cover shadow-md" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{course.instructor.name || 'Md Mijanur Molla'}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {course.instructor.bio || 'Expert instructor with experience in teaching technology and programming. Passionate about making complex concepts simple and accessible.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-dark-100 shadow-lg">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{price.current}</span>
                  {price.original && (
                    <span className="text-xl text-gray-400 line-through">{price.original}</span>
                  )}
                </div>
                {price.discount && (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    {price.discount}
                  </span>
                )}
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl mb-4"
              >
                Enroll Now
              </button>

              {/* WhatsApp */}
              {course.whatsappNumber && (
                <a
                  href={`https://wa.me/${course.whatsappNumber}?text=${encodeURIComponent(`Hi, I have a question about: ${course.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border-2 border-green-500 text-green-600 dark:text-green-400 font-medium rounded-xl hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2 mb-6"
                >
                  <MessageCircle className="w-5 h-5" />
                  Ask on WhatsApp
                </a>
              )}

              {/* Course Features */}
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-dark-100">
                <h3 className="font-semibold text-gray-900 dark:text-white">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span>{course.lessons?.length || 0} video lessons</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span>{course.language || 'English'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Lifetime access</span>
                  </li>
                </ul>
              </div>

              {/* Share & Like */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-dark-100 mt-6">
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 border border-gray-200 dark:border-dark-100 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex-1 py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    liked 
                      ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500' 
                      : 'border-gray-200 dark:border-dark-100 hover:bg-gray-50 dark:hover:bg-dark-100 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Course Info */}
              <div className="pt-6 border-t border-gray-200 dark:border-dark-100 mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated: {formatDate(course.updatedAt || course.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{course.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {course.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Other Top Courses Section */}
        <OtherTopCourses currentCourseId={course._id} category={course.category} />
      </div>
    </div>
  );
};

// Other Top Courses Component
const OtherTopCourses = ({ currentCourseId, category }) => {
  const [otherCourses, setOtherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOtherCourses();
  }, [currentCourseId]);

  const fetchOtherCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAll({ category, limit: 6 });
      if (response.data.success) {
        // Filter out current course and limit to 6
        const filtered = response.data.data
          .filter(course => course._id !== currentCourseId)
          .slice(0, 6);
        setOtherCourses(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch other courses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    const slug = course.slug || `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${course._id}`;
    navigate(`/courses/${slug}`);
    window.scrollTo(0, 0);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
      'Intermediate': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'Advanced': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
      'All Levels': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    };
    return colors[level] || colors['All Levels'];
  };

  const formatPrice = (course) => {
    if (course.isFree) return 'Free';
    if (course.offerPrice && course.offerPrice < course.actualPrice) {
      return (
        <span className="flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400 font-bold">₹{course.offerPrice}</span>
          <span className="line-through text-gray-400 text-xs">₹{course.actualPrice}</span>
        </span>
      );
    }
    return `₹${course.actualPrice}`;
  };

  if (loading || otherCourses.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-dark-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Other Top Courses
        </h2>
        <Link 
          to="/courses"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center gap-1"
        >
          View All Courses
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherCourses.map((course) => (
          <div
            key={course._id}
            onClick={() => handleViewCourse(course)}
            className="group bg-white dark:bg-dark-200 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-dark-100 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-white/50" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-2">
                {course.isFree && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    FREE
                  </span>
                )}
                {course.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Level Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {course.title}
              </h3>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  {course.lessons?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {course.enrollments || 0}
                </span>
                {course.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {course.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-100">
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  {formatPrice(course)}
                </div>
                <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetails;
