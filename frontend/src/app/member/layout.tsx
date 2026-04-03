"use client";

import React from 'react';
import { MemberSidebar } from "@/components/MemberSidebar";
import { MemberTopbar } from "@/components/MemberTopbar";
import { MemberFooter } from "@/components/MemberFooter";
import './layout.css';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hd-layout w-full overscroll-none overflow-x-hidden min-h-screen relative text-[0.95rem] flex">
      <MemberSidebar />
      <div className="main-content flex-1 flex flex-col min-h-screen">
        <MemberTopbar />
        
        {/* Content Wrapper */}
        <div className="w-full flex-grow">
          {children}
        </div>

        <MemberFooter />
      </div>
    </div>
  );
}
