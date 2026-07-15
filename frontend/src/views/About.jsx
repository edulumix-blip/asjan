'use client';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Users, Target, Award, Heart, Code, Briefcase, BookOpen, 
  Rocket, Shield, Zap, GraduationCap, FileText, ClipboardList,
  ArrowRight, CheckCircle, BadgeCheck
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';

const About = () => {
  const services = [
    {
      icon: Briefcase,
      title: 'Fresher Jobs',
      description: 'Curated job opportunities from top companies for freshers and entry-level professionals.',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      icon: BookOpen,
      title: 'Free Resources',
      description: 'Premium-quality study materials, notes, tutorials, and project ideas absolutely free.',
      gradient: 'from-blue-500 to-blue-400',
    },
    {
      icon: GraduationCap,
      title: 'Courses',
      description: 'Comprehensive courses from industry experts to boost your skills and career.',
      gradient: 'from-blue-600 to-blue-500',
    },
    {
      icon: FileText,
      title: 'Tech Blog',
      description: 'Stay updated with technology trends, tutorials, and career guidance articles.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Code,
      title: 'Digital Products',
      description: 'Premium digital products, templates, and tools at unbeatable prices.',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      icon: ClipboardList,
      title: 'Mock Tests',
      description: 'Comprehensive mock tests for interviews and competitive exam preparation.',
      gradient: 'from-blue-500 to-blue-400',
    },
  ];

  const values = [
    { icon: Heart, title: 'Accessibility', description: 'Making quality resources available to everyone, regardless of background' },
    { icon: Shield, title: 'Trust', description: 'Verified content and genuine job listings you can rely on' },
    { icon: Zap, title: 'Innovation', description: 'Constantly improving and adding new features for better experience' },
    { icon: Users, title: 'Community', description: 'Building a supportive community of learners and professionals' },
  ];

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' }
  ];

  const structuredData = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen py-12 lg:py-20">
      <SEO
        title="About EduLumix - Empowering Careers with Jobs, Resources & Courses"
        description="Learn about EduLumix - your complete career platform offering fresher jobs, free resources, courses, and career guidance. Empowering 50,000+ students to build successful careers."
        keywords="about edulumix, career platform, job portal for freshers, education platform, about us, company info"
        url="/about"
        structuredData={structuredData}
      />
      
      <div className="w-full px-8 lg:px-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4 text-gray-900 dark:text-white">
            About <span className="text-blue-600 dark:text-blue-400">EduLumix</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Empowering freshers and students with the resources, opportunities, and guidance 
            they need to build successful careers.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              At EduLumix, we believe every student and fresher deserves access to quality career 
              opportunities and learning resources. Our mission is to bridge the gap between talent 
              and opportunity by providing a comprehensive platform that caters to the unique needs 
              of those starting their professional journey.
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To become India's most trusted and comprehensive career platform for freshers, 
              helping students transition from academics to successful careers. 
              We envision a future where no talent goes unnoticed due to lack of resources or opportunities.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Our <span className="text-blue-600 dark:text-blue-400">Values</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-dark-100 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            What We <span className="text-blue-600 dark:text-blue-400">Offer</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Six specialized portals designed to support every aspect of your career journey
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white dark:bg-dark-100 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meet Community Admin */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Meet <span className="text-blue-600 dark:text-blue-400">Community Admin</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Driven by passion to empower freshers and students with the right resources and opportunities
          </p>
          <div className="w-full">
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img 
                    src="https://media.geeksforgeeks.org/auth/profile/fi1t8nnyh9spuyq9w9oy" 
                    alt="Md Mijanur Molla" 
                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      Md Mijanur Molla
                    </h3>
                    <BadgeCheck className="w-7 h-7 text-blue-500" fill="currentColor" />
                  </div>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-4">
                    Community Admin
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    With a deep understanding of the challenges faced by freshers and students in their career journey, 
                    Md Mijanur Molla founded EduLumix with a vision to bridge the gap between academic education and 
                    industry requirements. His passion for education technology and career development drives the platform's 
                    mission to empower thousands of students across India.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Vision Driven</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                      <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Tech Enthusiast</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the EduLumix Community</h2>
          <p className="opacity-90 mb-8 max-w-2xl mx-auto">
            Be part of a growing community of ambitious freshers and students who are building 
            successful careers with the help of EduLumix.
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
              to="/contact" 
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white border border-white/30 hover:bg-white/10 rounded-xl transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
