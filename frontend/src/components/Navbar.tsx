import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    (<nav className="bg-[var(--dracula-current-line)] p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[var(--dracula-foreground)] text-2xl font-bold">
          MyApp
        </div>
        <div className="space-x-4">
          <Link
            href="/"
            className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors">
            Home
          </Link>
          <Link
            href="/signup"
            className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors">
            Sign Up
          </Link>
          <Link
            href="/login"
            className="text-[var(--dracula-foreground)] hover:text-[var(--dracula-pink)] transition-colors">
            Login
          </Link>
        </div>
      </div>
    </nav>)
  );
};

export default Navbar;