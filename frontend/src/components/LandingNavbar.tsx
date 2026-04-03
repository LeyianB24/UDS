"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchApi } from '@/lib/api';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ authenticated: boolean; portal?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    fetchApi('auth_status').then(res => setUser(res));
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-[72px] flex items-center",
      isScrolled ? "bg-[#0b1e17]/95 backdrop-blur-md shadow-2xl border-b border-white/5" : "bg-transparent"
    )}>
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl border border-lime-400/30">
             <img src="/assets/images/people_logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} />
          </div>
          <div>
            <div className="text-[13px] font-black text-white leading-none tracking-tight">UMOJA SACCO</div>
            <div className="text-[9px] font-bold text-white/40 uppercase tracking-[1.5px] mt-1">Drivers Sacco Ltd.</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {['Home', 'About Us', 'Services', 'Contact'].map((item) => (
            <Link 
              key={item}
              href={`/#${item.toLowerCase().replace(' ', '-')}`}
              className="px-4 py-2 text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              {item}
            </Link>
          ))}
          <div className="w-px h-6 bg-white/10 mx-4" />
          
          {user?.authenticated ? (
            <Link 
              href={user.portal === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
              className="flex items-center gap-2 px-5 py-2.5 bg-lime-400/20 border border-lime-400/30 text-lime-400 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-lime-400 hover:text-[#0b2419] transition-all"
            >
              <LayoutDashboard size={14} /> My Portal
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-5 py-2.5 bg-transparent border border-white/20 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-lime-400 text-[#0b2419] rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-lime-300 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(163,230,53,0.3)]"
              >
                Join Us
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button 
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-xl border border-white/10"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-[84px] bg-[#0b1e17] border border-white/10 rounded-[32px] p-8 shadow-2xl z-[110] lg:hidden"
          >
            <div className="flex flex-col gap-4">
               {['Home', 'About Us', 'Services', 'Contact'].map((item) => (
                  <Link 
                    key={item}
                    onClick={() => setIsMobileMenuOpen(false)}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="p-4 text-sm font-bold text-white/50 border-b border-white/5"
                  >
                    {item}
                  </Link>
               ))}
               <div className="pt-4 flex flex-col gap-3">
                 <Link href="/login" className="w-full h-14 flex items-center justify-center bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Sign In</Link>
                 <Link href="/register" className="w-full h-14 flex items-center justify-center bg-lime-400 text-[#0b2419] rounded-2xl text-xs font-black uppercase tracking-widest">Join Community</Link>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
