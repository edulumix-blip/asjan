'use client';
import { Link } from '@/utils/reactRouterCompat';
import { ArrowLeft, RefreshCcw, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import SEO from '../components/seo/SEO';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen py-12 lg:py-20">
      <SEO
        title="Refund Policy | EduLumix"
        description="EduLumix Refund Policy - Conditions for refunds on digital products and services. Customer satisfaction guaranteed."
        keywords="EduLumix refund policy, refunds"
        url="/refund-policy"
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
              <RefreshCcw className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Refund Policy</h1>
              <p className="text-gray-500 dark:text-gray-400">Last updated: January 2026</p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              At EduLumix, we strive to ensure customer satisfaction with all our digital products and 
              services. This Refund Policy outlines the conditions under which refunds may be issued for 
              purchases made on our platform.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 my-8">
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Eligible for Refund</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Within 7 days, unused products</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Not Eligible</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Downloaded or accessed products</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Processing Time</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">5-7 business days</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Original Method</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Refund to original payment source</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Digital Products</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              For digital products purchased through EduLumix:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Refunds are available within 7 days of purchase if the product has not been downloaded or accessed</li>
              <li>Once a digital product is downloaded or accessed, it is considered used and non-refundable</li>
              <li>If the product is defective or significantly different from the description, a full refund will be issued</li>
              <li>Technical issues preventing access will be resolved, or a refund will be provided</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Courses</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              For paid courses on EduLumix:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Full refund available within 7 days if less than 20% of the course content has been accessed</li>
              <li>Partial refunds may be considered on a case-by-case basis for courses with more than 20% progress</li>
              <li>No refunds after 30 days from the date of purchase</li>
              <li>Free courses and promotional content are non-refundable</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Free Services</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Most of EduLumix's services, including job listings, free resources, mock tests, and tech 
              blogs, are provided free of charge and do not involve any payments. This refund policy does 
              not apply to free services.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">How to Request a Refund</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Email us at <a href="mailto:refunds@edulumix.com" className="text-blue-600 dark:text-blue-400 hover:underline">refunds@edulumix.com</a></li>
              <li>Include your order ID or transaction reference</li>
              <li>Provide the reason for your refund request</li>
              <li>Our team will review your request within 2-3 business days</li>
              <li>If approved, refunds will be processed within 5-7 business days</li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Refund Method</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Refunds will be credited to the original payment method used during purchase. Depending on 
              your bank or payment provider, it may take an additional 5-10 business days for the refund 
              to reflect in your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Exceptions</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Refunds will not be issued in the following cases:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>Request made after the refund window has expired</li>
              <li>Product has been fully downloaded, accessed, or used</li>
              <li>Violation of our Terms of Service led to account termination</li>
              <li>Promotional or discounted purchases (unless defective)</li>
              <li>Change of mind after significant usage</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about our Refund Policy, please contact us at{' '}
              <a href="mailto:support@edulumix.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                support@edulumix.com
              </a>
              {' '}or reach us via WhatsApp for faster assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
