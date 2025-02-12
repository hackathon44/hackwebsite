'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { AuthError } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

interface FormData {
  email: string;
  password: string;
  name: string;
}

interface Status {
  loading: boolean;
  error: string | null;
}

export default function AuthForm({ view }: { view: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: ''
  });

  const [status, setStatus] = useState<Status>({
    loading: false,
    error: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const { error } = view === 'sign-up'
        ? await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name },
            emailRedirectTo: `${location.origin}/auth/callback`
          }
        })
        : await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

      if (error) throw error;
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      if (error instanceof AuthError) {
        setStatus({ loading: false, error: error.message });
      }
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full space-y-6"
    >
      <motion.header variants={itemVariants} className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
          {view === 'sign-in' ? 'Welcome back' : 'Create account'}
        </h2>
      </motion.header>

      {status.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 backdrop-blur-sm"
        >
          {status.error}
        </motion.div>
      )}

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants}>
        {view === 'sign-up' && (
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-white
                       placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/20 transition-all duration-300"
              placeholder="John Doe"
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-white
                     placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 
                     focus:ring-purple-500/20 transition-all duration-300"
            placeholder="you@example.com"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-white
                     placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 
                     focus:ring-purple-500/20 transition-all duration-300"
            placeholder="••••••••"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={status.loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-3 text-white
                     font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 
                     disabled:opacity-50 transition-all duration-300"
          >
            {status.loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              view === 'sign-in' ? 'Sign in' : 'Sign up'
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}