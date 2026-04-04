"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import './faqs.css';

const FAQ_DATA = [
    {
        section: "Membership & Account",
        icon: "bi-person-badge",
        items: [
            {
                q: "How do I update my profile details?",
                a: <>You can update your personal information, including phone number and email, directly from the <Link href="/member/profile">Profile Page</Link>. For sensitive changes like Name or ID number, please contact support with valid documentation.</>
            },
            {
                q: "Is my data secure?",
                a: "Yes, absolutely. We use industry-standard encryption protocols (SSL) to protect your data in transit and at rest. Your password is hashed, and we never share your personal information with third parties without your consent."
            }
        ]
    },
    {
        section: "Loans & Finance",
        icon: "bi-cash-coin",
        items: [
            {
                q: "How is my loan limit calculated?",
                a: <>Your loan limit is primarily based on your <strong>Savings Balance</strong> (multiplied by 3 or 4 depending on the product) and your <strong>Share Capital</strong>. Consistent savings and a good repayment history can increase your eligibility.</>
            },
            {
                q: "How long does loan processing take?",
                a: <>Instant mobile loans are processed immediately. Development and emergency loans are typically reviewed and approved within <strong>24-48 hours</strong>, subject to guarantor confirmation.</>
            },
            {
                q: "Can I pay via M-Pesa?",
                a: "Yes! All repayments and deposits can be made via our M-Pesa Paybill. The system automatically updates your statement once the transaction is received."
            }
        ]
    },
    {
        section: "Welfare & Benevolence",
        icon: "bi-heart-pulse",
        items: [
            {
                q: "What is covered under the Welfare Fund?",
                a: <>The Welfare Fund supports members during significant life events such as hospitalization, bereavement (member or immediate family), and other emergencies as defined in the Sacco by-laws. To claim, submit a request via the <Link href="/member/welfare">Welfare Page</Link>.</>
            }
        ]
    }
];

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<string[]>(['Membership & Account-0']);

    const toggleItem = (id: string) => {
        setOpenItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="dash p-0">
            <div className="faq-header animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="fw-bold mb-2">How can we help you?</h1>
                <p className="lead opacity-75">Find answers to common questions about your Sacco membership.</p>
                <div className="mt-4">
                    <Link href="/member/support" className="btn-contact">
                        <i className="bi bi-headset me-2"></i>Contact Support
                    </Link>
                </div>
            </div>

            <div className="faq-container">
                {FAQ_DATA.map((section, sidx) => (
                    <div key={sidx} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{animationDelay: `${sidx * 0.1}s`}}>
                        <h5 className="faq-section-title">
                            <i className={`bi ${section.icon}`}></i>{section.section}
                        </h5>
                        <div className="faq-list">
                            {section.items.map((item, iidx) => {
                                const id = `${section.section}-${iidx}`;
                                const isOpen = openItems.includes(id);
                                return (
                                    <div key={id} className="faq-card">
                                        <button 
                                            className={`faq-question ${isOpen ? 'active' : ''}`}
                                            onClick={() => toggleItem(id)}
                                        >
                                            {item.q}
                                            <i className="bi bi-chevron-down"></i>
                                        </button>
                                        <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                                            <div className="faq-answer-inner">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="mt-12 text-center text-gray-400 text-xs py-8 border-t border-gray-100 dark:border-white/5">
                    &copy; {new Date().getFullYear()} Umoja Drivers Sacco. All Rights Reserved.
                </div>
            </div>
        </div>
    );
}
