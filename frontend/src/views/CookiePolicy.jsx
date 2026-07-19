'use client';
import { Link } from '@/utils/reactRouterCompat';
import { ArrowLeft, Cookie, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import SEO from '../components/seo/SEO';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen py-12 lg:py-20">
      <SEO
        title="Cookie Policy | EduLumix"
        description="EduLumix Cookie Policy - How we use cookies and similar technologies on our website."
        keywords="EduLumix cookie policy, cookies"
        url="/cookie-policy"
      />
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Cookie className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cookie Policy</h1>
              <p className="text-gray-500 dark:text-gray-400">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              This Cookie Policy explains how EduLumix ("we", "us", or "our") uses cookies and similar 
              technologies when you visit our website at edulumix.in. This policy provides you with 
              clear and comprehensive information about the cookies we use and the purposes for using them.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
              when you visit a website. They help websites remember your preferences and improve your 
              browsing experience. Cookies are widely used to make websites work more efficiently and 
              provide valuable information to website owners.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Essential Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    These cookies are necessary for the website to function properly. They enable basic 
                    features like page navigation, secure access to your account, and remembering your login status.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Preference Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    These cookies remember your preferences such as theme selection (dark/light mode), 
                    language preferences, and other customization options to provide a personalized experience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We use these cookies to understand how visitors interact with our website. This helps 
                    us improve our website's performance, content, and user experience.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              You can control and manage cookies through your browser settings. Most browsers allow you 
              to refuse or accept cookies, delete existing cookies, and set preferences for certain websites. 
              Please note that disabling cookies may affect the functionality of our website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about our Cookie Policy, please contact us at{' '}
              <a href="mailto:edulumix@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                edulumix@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
