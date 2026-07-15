import { Check } from 'lucide-react';

const VerifiedBadge = ({ user, size = 'sm' }) => {
  // Show verified badge only for super_admin
  if (user?.role !== 'super_admin') return null;

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };

  return (
    <span 
      className={`${sizeClasses[size]} rounded-full bg-blue-600 inline-flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20`}
      title="Verified Super Admin"
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
      }}
    >
      <Check 
        className={`${iconSizes[size]} text-white stroke-[4] font-bold`}
        strokeWidth={4}
      />
    </span>
  );
};

export default VerifiedBadge;
