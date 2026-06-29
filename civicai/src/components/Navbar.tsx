'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Bell, Menu, X, CheckSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { getStoredNotifications, getStoredUser } from '@/lib/mockData';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Jane');

  // Check if we are inside dashboard or app pages (vs landing/auth)
  const isAppView = pathname !== '/' && pathname !== '/login' && pathname !== '/signup';

  useEffect(() => {
    // Check notifications
    const checkNotifications = () => {
      getStoredNotifications()
        .then((notifs) => {
          setUnreadCount(notifs.filter(n => !n.read).length);
        })
        .catch((err) => console.warn('Failed to load notifications in Navbar:', err.message));
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);

    // Load active user avatar
    if (isAppView) {
      getStoredUser()
        .then((usr) => {
          if (usr?.avatar) {
            setAvatar(usr.avatar);
          }
        })
        .catch((err) => console.warn('Failed to fetch user in Navbar:', err.message));
    }

    return () => clearInterval(interval);
  }, [isAppView]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#030303]/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Civic<span className="text-indigo-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAppView ? (
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
              <Link href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How AI Works</Link>
              <Link href="/#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
              <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Enter App</Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className={`text-sm font-semibold transition-colors ${pathname === '/dashboard' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                Dashboard
              </Link>
              <Link href="/map" className={`text-sm font-semibold transition-colors ${pathname === '/map' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                City Map
              </Link>
              <Link href="/report" className={`text-sm font-semibold transition-colors ${pathname === '/report' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                Report Issue
              </Link>
            </nav>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {isAppView && (
              <Link href="/notifications" className="relative p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white ring-2 ring-[#030303]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {!isAppView ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            ) : (
              <Link href="/profile" className="hidden md:block">
                <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10 hover:border-indigo-500 transition-colors">
                  <img src={avatar} alt="Profile" className="w-full h-full" />
                </div>
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 md:hidden rounded-lg bg-white/5 text-gray-400 hover:text-white"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#030303] px-4 py-4 space-y-3">
          {!isAppView ? (
            <>
              <Link href="/#features" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Features</Link>
              <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">How AI Works</Link>
              <Link href="/#faq" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">FAQ</Link>
              <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full">Get Started</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Dashboard</Link>
              <Link href="/map" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">City Map</Link>
              <Link href="/report" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Report Issue</Link>
              <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Leaderboard</Link>
              <Link href="/notifications" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">Notifications</Link>
              <Link href="/profile" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white">My Profile</Link>
              <Link href="/admin" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-gray-400 hover:text-white text-indigo-400">Admin Panel</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
export default Navbar;
