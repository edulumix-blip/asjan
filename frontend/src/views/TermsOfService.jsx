'use client';
import { Link } from '@/utils/reactRouterCompat';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import SEO from '../components/seo/SEO';

const TermsOfService = () => {
  return (
    <div className="min-h-screen py-12 lg:py-20">
      <SEO
        title="Terms of Service | EduLumix"
        description="EduLumix Terms of Service - Read our terms and conditions for using our career platform and services."
        keywords="EduLumix terms of service, terms and conditions"
        url="/terms-of-service"
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
              <Scale className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
              <p className="text-gray-500 dark:text-gray-400">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Welcome to EduLumix. By accessing or using our platform, you agree to be bound by these 
              Terms of Service ("Terms"). Please read them carefully before using our services.
            </p>

            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By using EduLumix, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms. If you do not agree, please do not use our services.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              By creating an account or using any part of EduLumix, you agree to these Terms of Service, 
              our Privacy Policy, and any other policies referenced herein. These Terms constitute a 
              legally binding agreement between you and EduLumix.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Eligibility</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              You must be at least 16 years old to use EduLumix. By using our platform, you represent 
              and warrant that you meet this age requirement and have the legal capacity to enter into 
              this agreement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Account Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to provide accurate and complete information during registration</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>One person may not maintain multiple accounts</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Violate any applicable laws or regulations</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malware, viruses, or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape or collect data without permission</li>
              <li>Use the platform for spam or unauthorized advertising</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Content and Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              All content on EduLumix, including text, graphics, logos, and software, is the property 
              of EduLumix or its content suppliers and is protected by intellectual property laws. 
              You may not reproduce, distribute, or create derivative works without our prior written consent.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. User-Generated Content</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              By submitting content to EduLumix (such as job posts, resources, or comments), you grant 
              us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that 
              content on our platform. You retain ownership of your content and are responsible for ensuring 
              it does not violate any third-party rights.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              EduLumix is provided "as is" without warranties of any kind. We do not guarantee the 
              accuracy, completeness, or reliability of any job listings, resources, or other content. 
              We are not responsible for the outcome of any job applications or career decisions made 
              based on information found on our platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              To the maximum extent permitted by law, EduLumix shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising out of your use of the 
              platform, even if we have been advised of the possibility of such damages.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Termination</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We reserve the right to suspend or terminate your account at any time for violations of 
              these Terms or for any other reason at our discretion. You may also delete your account 
              at any time through your account settings.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We may update these Terms from time to time. We will notify you of significant changes 
              via email or through the platform. Your continued use of EduLumix after changes become 
              effective constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">11. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising from these Terms shall be subject to the exclusive jurisdiction 
              of the courts in Kolkata, West Bengal.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@edulumix.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                legal@edulumix.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
