"use client";

import React from 'react';
import Navbar from '@/components/Navbar';

const HomePage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-96 text-center">
          <h1 className="text-2xl font-bold mb-4">DASS A1 Submission</h1>
          <p className="text-lg">by 2023113019 Raunak Seksaria</p>
        </div>
      </div>
    </>
  );
};

export default HomePage;