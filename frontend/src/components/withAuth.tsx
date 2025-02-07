import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = (WrappedComponent: React.FC) => {
  const AuthComponent: React.FC = (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/'); // Redirect to landing page if not authenticated
      } else {
        setIsAuthenticated(true); // Set authenticated state to true
      }
    }, [router]);

    if (!isAuthenticated) {
      return null; // Prevent rendering if not authenticated
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;