'use client';
import AuthForm from '../context/authcontext';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  // Animation variants for the floating elements
  const floatingElementVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-gray-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left decorative element */}
        <motion.div
          variants={floatingElementVariants}
          animate="animate"
          className="absolute top-10 left-10 w-24 h-24 rounded-full border border-zinc-700/50 hidden lg:block"
        />
        {/* Bottom right decorative element */}
        <motion.div
          variants={floatingElementVariants}
          animate="animate"
          initial={{ y: 20 }}
          className="absolute bottom-10 right-10 w-32 h-32 rounded-full border border-zinc-700/50 hidden lg:block"
        />
      </div>

      {/* Main content container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-zinc-900/90 backdrop-blur-xl p-8 shadow-2xl 
                     border border-zinc-800/50 transition-all duration-300
                     hover:shadow-purple-500/10 hover:border-purple-500/50"
        >
          {/* Logo or branding section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-center text-zinc-400 mt-2">
              Join our community and start creating amazing lessons
            </p>
          </motion.div>

          {/* Auth form */}
          <AuthForm view="sign-up" />

          {/* Additional information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-zinc-400"
          >
            By signing up, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 underline">
              Privacy Policy
            </a>
          </motion.div>
        </motion.div>

        {/* Back to login link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center"
        >
          <a
            href="/login"
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            Already have an account? Sign in
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}