'use client';
import { Link } from '@/utils/reactRouterCompat';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import SEO from '../components/seo/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-12 lg:py-20">
      <SEO
        title="Privacy Policy | EduLumix"
        description="EduLumix Privacy Policy - How we collect, use, store and protect your data. Your privacy matters to us."
        keywords="EduLumix privacy policy, data protection, user privacy"
        url="/privacy-policy"
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
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              <p className="text-gray-500 dark:text-gray-400">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              At EduLumix, we are committed to protecting your privacy and ensuring the security of your 
              personal information. This Privacy Policy outlines how we collect, use, store, and protect 
              your data when you use our platform and services.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 my-8">
              <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Secure Data</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Your data is encrypted and protected</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4 flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Transparency</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Clear information about data usage</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4 flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Minimal Collection</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">We only collect what's necessary</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4 flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Your Control</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Manage your data preferences</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (educational background, skills, resume)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Device information (browser type, operating system, IP address)</li>
              <li>Communication data (support queries, feedback)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>To provide and maintain our services</li>
              <li>To personalize your experience on the platform</li>
              <li>To send you job alerts, resource updates, and notifications</li>
              <li>To improve our platform and develop new features</li>
              <li>To communicate with you about your account or our services</li>
              <li>To ensure the security and integrity of our platform</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Data Sharing</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances: with your consent, to comply with 
              legal obligations, to protect our rights, or with service providers who assist us in 
              operating our platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We implement industry-standard security measures to protect your personal information, 
              including encryption, secure servers, and regular security audits. However, no method of 
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Access and download your personal data</li>
              <li>Correct or update your information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
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

export default PrivacyPolicy;
