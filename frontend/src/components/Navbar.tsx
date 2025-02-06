import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in by checking the presence of a token in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="bg-[var(--dracula-current-line)] p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[var(--dracula-foreground)] text-2xl font-bold">
          MyApp
        </div>
        <div className="space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/profile" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Profile</span>
              </Link>
              <Link href="/search" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Search</span>
              </Link>
              <Link href="/orders" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Orders</span>
              </Link>
              <Link href="/cart" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Cart</span>
              </Link>
              <Link href="/sell" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Sell</span>
              </Link>
              <button onClick={handleLogout} className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Home</span>
              </Link>
              <Link href="/signup" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Sign Up</span>
              </Link>
              <Link href="/login" passHref>
                <span className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors cursor-pointer">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;