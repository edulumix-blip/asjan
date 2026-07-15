'use client';
import { useNavigate } from '@/utils/reactRouterCompat';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@heroui/react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onPress={() => navigate('/')}
            className="btn-primary"
            startContent={<Home className="w-5 h-5" />}
          >
            Go Home
          </Button>
          <Button
            onPress={() => window.history.back()}
            className="btn-secondary"
            startContent={<ArrowLeft className="w-5 h-5" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
