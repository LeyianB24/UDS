"use client";

import React from 'react';
import { MemberSidebar } from "@/components/MemberSidebar";
import { MemberTopbar } from "@/components/MemberTopbar";
import './layout.css';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hd-layout w-full overscroll-none overflow-x-hidden min-h-screen relative text-[0.95rem]">
      <MemberSidebar />
      <div className="main-content">
        <MemberTopbar />
        
        {/* Content Wrapper */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
