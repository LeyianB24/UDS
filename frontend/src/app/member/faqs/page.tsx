"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function FaqsPage() {
    const [openIndex, setOpenIndex] = useState<string | null>('collapseOne');

    const toggleAccordion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="pb-5 relative z-10 w-full mb-10 mt-[-40px]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#0f2e25] to-[#1a4d3d] text-white py-12 px-4 rounded-b-[30px] mb-8 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(208,243,93,0.1)_0%,transparent_70%)] rounded-full z-0"></div>
                <div className="relative z-10">
                    <h1 className="font-bold text-3xl mb-2">How can we help you?</h1>
                    <p className="text-lg opacity-75">Find answers to common questions about your Sacco membership.</p>
                    <div className="mt-6">
                        <Link href="/member/support" className="inline-flex items-center bg-[#d0f35d] text-[#0f2e25] font-bold rounded-full px-6 py-3 transition-transform hover:scale-105 shadow-md">
                            <i className="bi bi-headset mr-2"></i>Contact Support
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4">
                {/* Membership & Account */}
                <h5 className="font-bold text-[#0f2e25] dark:text-[#a3e635] mb-3 mt-4 text-xl">
                    <i className="bi bi-person-badge mr-2"></i>Membership & Account
                </h5>
                <div className="bg-white dark:bg-[#0d1d14] dark:border dark:border-white/5 shadow-sm rounded-xl overflow-hidden mb-6">
                    <div className="border-b border-gray-100 dark:border-white/5">
                        <button 
                            className={`w-full text-left px-5 py-4 font-semibold flex justify-between items-center transition-colors ${openIndex === 'collapseOne' ? 'text-[#0f2e25] bg-[#d0f35d]/20 dark:bg-[#a3e635]/10 dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            onClick={() => toggleAccordion('collapseOne')}
                        >
                            How do I update my profile details?
                            <i className={`bi bi-chevron-down transition-transform ${openIndex === 'collapseOne' ? 'rotate-180 text-[#0f2e25] dark:text-[#a3e635]' : 'text-gray-400'}`}></i>
                        </button>
                        {openIndex === 'collapseOne' && (
                            <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0d1d14] border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                You can update your personal information, including phone number and email, directly from the <Link href="/member/profile" className="text-green-600 dark:text-green-400 font-bold">Profile Page</Link>. For sensitive changes like Name or ID number, please contact support with valid documentation.
                            </div>
                        )}
                    </div>
                    <div>
                        <button 
                            className={`w-full text-left px-5 py-4 font-semibold flex justify-between items-center transition-colors ${openIndex === 'collapseTwo' ? 'text-[#0f2e25] bg-[#d0f35d]/20 dark:bg-[#a3e635]/10 dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            onClick={() => toggleAccordion('collapseTwo')}
                        >
                            Is my data secure?
                            <i className={`bi bi-chevron-down transition-transform ${openIndex === 'collapseTwo' ? 'rotate-180 text-[#0f2e25] dark:text-[#a3e635]' : 'text-gray-400'}`}></i>
                        </button>
                        {openIndex === 'collapseTwo' && (
                            <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0d1d14] border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                Yes, absolutely. We use industry-standard encryption protocols (SSL) to protect your data in transit and at rest. Your password is hashed, and we never share your personal information with third parties without your consent.
                            </div>
                        )}
                    </div>
                </div>

                {/* Loans & Finance */}
                <h5 className="font-bold text-[#0f2e25] dark:text-[#a3e635] mb-3 mt-8 text-xl">
                    <i className="bi bi-cash-coin mr-2"></i>Loans & Finance
                </h5>
                <div className="bg-white dark:bg-[#0d1d14] dark:border dark:border-white/5 shadow-sm rounded-xl overflow-hidden mb-6">
                    <div className="border-b border-gray-100 dark:border-white/5">
                        <button 
                            className={`w-full text-left px-5 py-4 font-semibold flex justify-between items-center transition-colors ${openIndex === 'collapseLoan1' ? 'text-[#0f2e25] bg-[#d0f35d]/20 dark:bg-[#a3e635]/10 dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            onClick={() => toggleAccordion('collapseLoan1')}
                        >
                            How is my loan limit calculated?
                            <i className={`bi bi-chevron-down transition-transform ${openIndex === 'collapseLoan1' ? 'rotate-180 text-[#0f2e25] dark:text-[#a3e635]' : 'text-gray-400'}`}></i>
                        </button>
                        {openIndex === 'collapseLoan1' && (
                            <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0d1d14] border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                Your loan limit is primarily based on your <strong>Savings Balance</strong> (multiplied by 3 or 4 depending on the product) and your <strong>Share Capital</strong>. Consistent savings and a good repayment history can increase your eligibility.
                            </div>
                        )}
                    </div>
                    <div className="border-b border-gray-100 dark:border-white/5">
                        <button 
                            className={`w-full text-left px-5 py-4 font-semibold flex justify-between items-center transition-colors ${openIndex === 'collapseLoan2' ? 'text-[#0f2e25] bg-[#d0f35d]/20 dark:bg-[#a3e635]/10 dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            onClick={() => toggleAccordion('collapseLoan2')}
                        >
                            How long does loan processing take?
                            <i className={`bi bi-chevron-down transition-transform ${openIndex === 'collapseLoan2' ? 'rotate-180 text-[#0f2e25] dark:text-[#a3e635]' : 'text-gray-400'}`}></i>
                        </button>
                        {openIndex === 'collapseLoan2' && (
                            <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0d1d14] border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                Instant mobile loans are processed immediately. Development and emergency loans are typically reviewed and approved within <strong>24-48 hours</strong>, subject to guarantor confirmation.
                            </div>
                        )}
                    </div>
                    <div>
                        <button 
                            className={`w-full text-left px-5 py-4 font-semibold flex justify-between items-center transition-colors ${openIndex === 'collapseLoan3' ? 'text-[#0f2e25] bg-[#d0f35d]/20 dark:bg-[#a3e635]/10 dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            onClick={() => toggleAccordion('collapseLoan3')}
                        >
                            Can I pay via M-Pesa?
                            <i className={`bi bi-chevron-down transition-transform ${openIndex === 'collapseLoan3' ? 'rotate-180 text-[#0f2e25] dark:text-[#a3e635]' : 'text-gray-400'}`}></i>
                        </button>
                        {openIndex === 'collapseLoan3' && (
                            <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0d1d14] border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                Yes! All repayments and deposits can be made via our M-Pesa Paybill. The system automatically updates your statement once the transaction is received.
                            </div>
                        )}
                    </div>
                </div>

                {/* Welfare & Benevolence */}
                <h5 className="font-bold text-[#0f2e25] dark:text-[#a3e635] mb-3 mt-8 text-xl">
                    <i className="bi bi-heart-pulse mr-2"></i>Welfare & Benevolence
                </h5>
                <div className="bg-white dark:bg-[#0d1d14] dark:border dark:border-white/5 shadow-sm rounded-xl overflow-hidden mb-12">
                    <div>
                        <button 
                            className={`w-full text-left px-5 py-4 font-semibold flex justify-between items-center transition-colors ${openIndex === 'collapseWelfare1' ? 'text-[#0f2e25] bg-[#d0f35d]/20 dark:bg-[#a3e635]/10 dark:text-[#a3e635]' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            onClick={() => toggleAccordion('collapseWelfare1')}
                        >
                            What is covered under the Welfare Fund?
                            <i className={`bi bi-chevron-down transition-transform ${openIndex === 'collapseWelfare1' ? 'rotate-180 text-[#0f2e25] dark:text-[#a3e635]' : 'text-gray-400'}`}></i>
                        </button>
                        {openIndex === 'collapseWelfare1' && (
                            <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0d1d14] border-t border-gray-100 dark:border-white/5 leading-relaxed">
                                The Welfare Fund supports members during significant life events such as hospitalization, bereavement (member or immediate family), and other emergencies as defined in the Sacco by-laws. To claim, submit a request via the <Link href="/member/welfare" className="text-green-600 dark:text-green-400 font-bold">Welfare Page</Link>.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
