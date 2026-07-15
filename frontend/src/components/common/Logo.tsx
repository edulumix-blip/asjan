import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'default' | 'large';
  showText?: boolean;
  linkTo?: string | null;
}

const Logo = ({ size = 'default', showText = true, linkTo = '/' }: LogoProps) => {
  const sizes = {
    small: { container: 'w-8 h-8', text: 'text-lg', letterSize: 'text-sm' },
    default: { container: 'w-10 h-10', text: 'text-xl', letterSize: 'text-lg' },
    large: { container: 'w-14 h-14', text: 'text-2xl', letterSize: 'text-xl' },
  };

  const currentSize = sizes[size] || sizes.default;

  const logoContent = (
    <div className="flex items-center gap-2">
      {/* Modern EL Logo with 3D effect and gradient */}
      <div className={`${currentSize.container} rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/30 relative overflow-hidden transform hover:scale-105 transition-transform duration-300 group`}>
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-3 h-3 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/10 rounded-full"></div>
        
        {/* 3D styled EL text */}
        <div className="relative z-10">
          <span className={`text-white font-black ${currentSize.letterSize} tracking-tighter relative`} style={{ 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.1)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.05em'
          }}>
            E<span className="text-blue-100">L</span>
          </span>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400"></div>
      </div>
      
      {showText && (
        <span className={`${currentSize.text} font-bold`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <span className="text-blue-600 dark:text-blue-400">Edu</span>
          <span className="text-gray-900 dark:text-white">Lumix</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
