"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const images = [
  '/assets/images/sacco1.jpg',
  '/assets/images/sacco2.jpg',
  '/assets/images/sacco3.jpg',
  '/assets/images/sacco4.jpg',
  '/assets/images/sacco5.jpg',
  '/assets/images/sacco6.jpg',
  '/assets/images/sacco7.jpg',
  '/assets/images/sacco8.jpg',
  '/assets/images/sacco9.jpg',
  '/assets/images/sacco10.jpg',
];

export function PokerSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-[1200px]">
      <div className="relative w-[300px] h-[420px]">
        <AnimatePresence mode="popLayout">
          {images.map((src, i) => {
            const isActive = i === index;
            const isLeft = i === (index - 1 + images.length) % images.length;
            const isRight = i === (index + 1) % images.length;

            if (!isActive && !isLeft && !isRight) return null;

            return (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.8, rotateY: 0 }}
                animate={{
                  opacity: isActive ? 1 : 0.45,
                  scale: isActive ? 1.1 : 0.88,
                  x: isActive ? 0 : isLeft ? -180 : 180,
                  z: isActive ? 0 : -100,
                  rotateY: isActive ? 0 : isLeft ? 25 : -25,
                  zIndex: isActive ? 10 : 5,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute inset-0 rounded-[28px] bg-white border-[6px] border-white shadow-[0_30px_70px_rgba(0,0,0,0.3)] overflow-hidden cursor-pointer origin-bottom"
              >
                <img 
                  src={src} 
                  alt={`Asset ${i}`} 
                  className="w-full h-full object-cover rounded-[22px]"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/400x600/0F392B/A3E635?text=Asset+${i+1}`;
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-[-20px] flex gap-4 z-20">
        <button 
          onClick={prev}
          title="Previous Image"
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-lime-400 flex items-center justify-center hover:bg-lime-400 hover:text-[#0b2419] transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={next}
          title="Next Image"
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-lime-400 flex items-center justify-center hover:bg-lime-400 hover:text-[#0b2419] transition-all active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
