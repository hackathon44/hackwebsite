'use client'

import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Layout, BookOpen, Brain } from 'lucide-react';
import Link from 'next/link';

const Navbar = ({ user, signOut }) => {
  // State for mobile menu and theme toggle
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Toggle functions
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTheme = () => setIsDark(!isDark);

  // Navigation items with their icons
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Layout },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'AI Recommendations', href: '/recommendations', icon: Brain },
  ];

  // Dynamic classes based on theme
  const bgClass = isDark ? 'bg-black/30 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md';
  const textClass = isDark ? 'text-purple-300' : 'text-purple-600';
  const hoverBgClass = isDark ? 'hover:bg-purple-500/10' : 'hover:bg-purple-100';
  const borderClass = isDark ? 'border-purple-500/30' : 'border-purple-300/30';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${bgClass} border-b ${borderClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              EduTech
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${textClass} ${hoverBgClass}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side items */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${textClass} ${hoverBgClass}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile and Sign Out */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`font-bold ${textClass}`}>{user?.full_name}</p>
                <p className={`text-sm ${isDark ? 'text-purple-400/80' : 'text-purple-500/80'}`}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-md transition-all duration-300 ${textClass} ${hoverBgClass}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 ${bgClass}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${textClass} ${hoverBgClass}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile Profile Section */}
          <div className={`pt-4 pb-3 border-t ${borderClass}`}>
            <div className="flex items-center px-3">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <span className="text-lg font-medium text-purple-600">
                    {user?.full_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className={`text-base font-medium ${textClass}`}>
                  {user?.full_name}
                </div>
                <div className={`text-sm ${isDark ? 'text-purple-400/80' : 'text-purple-500/80'}`}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`ml-auto p-2 rounded-full ${textClass} ${hoverBgClass}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;