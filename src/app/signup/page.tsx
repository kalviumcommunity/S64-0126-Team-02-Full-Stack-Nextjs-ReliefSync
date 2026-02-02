'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/schemas/signupSchema';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components';
import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    console.log('[SignupForm] Form submitted with data:', {
      name: data.name,
      email: data.email,
      password: '***',
      confirmPassword: '***',
    });

    try {
      // Simulate form submission (replace with actual API call)
      setSubmitSuccess(true);
      console.log('[SignupForm] Signup successful');
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('[SignupForm] Signup failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-slate-900 dark:to-slate-800 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-slate-800">
        <div className="px-6 py-8 sm:px-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            Join ReliefSync to help coordinate disaster relief efforts
          </p>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              ✓ Signup form validated successfully! Check the console for details.
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <FormInput
              label="Full Name"
              name="name"
              placeholder="John Doe"
              register={register}
              error={errors.name}
            />

            {/* Email Input */}
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              register={register}
              error={errors.email}
            />

            {/* Password Input */}
            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.password}
            />

            {/* Confirm Password Input */}
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.confirmPassword}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Password Requirements Info */}
          <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
            <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password Requirements:
            </p>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>✓ At least 8 characters</li>
              <li>✓ One uppercase letter</li>
              <li>✓ One lowercase letter</li>
              <li>✓ One number</li>
            </ul>
          </div>

          {/* Login Link */}
          <div className="mt-6 border-t border-slate-200 pt-6 text-center dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
