'use client';
import AuthForm from '../context/authcontext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-gray-900 px-6 relative overflow-hidden">
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
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"
        />
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl bg-zinc-900/90 backdrop-blur-xl p-8 shadow-2xl 
                     border border-zinc-800/50 transition-all duration-300
                     hover:shadow-purple-500/10 hover:border-purple-500/50"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              LessonPlannerAI
            </h1>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="mt-2 text-center text-zinc-400"
          >
            Enter your login credentials
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="mt-6"
          >
            <AuthForm />
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p className="text-zinc-400">Not registered?</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 text-white font-medium relative group"
            >
              <span className="relative z-10">Create an account</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}