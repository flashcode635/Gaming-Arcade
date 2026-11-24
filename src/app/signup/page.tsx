'use client';

import AuthCard from '@/components/auth/AuthCard';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8">
      <AuthCard initialMode="signup" />
    </div>
  );
}
