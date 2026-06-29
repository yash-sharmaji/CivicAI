'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  PlusCircle, 
  Trophy, 
  Bell, 
  User, 
  Settings, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { getStoredUser, UserStats } from '@/lib/mockData';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<UserStats | null>(null);

  useEffect(() => {
    // Initial fetch
    getStoredUser().then(setUser);

    // Listen for custom events or updates
    const handleStorage = () => {
      getStoredUser().then(setUser);
    };
    window.addEventListener('storage', handleStorage);
    // Interval update for points
    const interval = setInterval(handleStorage, 4000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Issue', href: '/report', icon: PlusCircle },
    { name: 'City Map', href: '/map', icon: Map },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Admin Portal', href: '/admin', icon: ShieldCheck, adminOnly: true }
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#030303] hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16 p-4 justify-between">
      {/* Upper Navigation Links */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-3 block mb-3">Navigation</span>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}>
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    Staff
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Citizen Info card */}
      {user && (
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-[#0c0c0e]">
              <img src={user.avatar} alt="Avatar" className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{user.rank}</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-gray-400">
            <span className="flex items-center gap-1 font-semibold text-indigo-400">
              <Award className="w-3.5 h-3.5" />
              {user.points} pts
            </span>
            <span>{user.issuesReported} reported</span>
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
