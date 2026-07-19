import { Link } from '@/utils/reactRouterCompat';
import { Clock, Home, Mail } from 'lucide-react';
import SEO from '../../components/seo/SEO';

const PendingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-dark-300">
      <SEO title="Pending Approval | EduLumix" noIndex />
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-6 border border-blue-100 dark:border-blue-500/30">
          <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pending Approval</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your admin request has been submitted successfully. Please wait for the 
          Super Admin to review and approve your account. You'll receive an email 
          notification once approved.
        </p>

        {/* Info Card */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What happens next?</h3>
          <ul className="text-left text-gray-600 dark:text-gray-400 space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">1</span>
              </span>
              <span>Super Admin reviews your request</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">2</span>
              </span>
              <span>You'll be notified of the decision</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">3</span>
              </span>
              <span>Once approved, login to access your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <a href="mailto:edulumix@gmail.com" className="btn-secondary">
            <Mail className="w-5 h-5 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
