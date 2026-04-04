"use client";

import React from 'react';
import Link from 'next/link';
import '../terms/legal.css';

export default function PrivacyPolicy() {
    return (
        <div className="pb-5 relative z-10 w-full mb-10 mt-[-40px]">
            <div className="legal-container">
                <div className="legal-header">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/10 rounded-full p-3">
                                <i className="bi bi-shield-check text-3xl"></i>
                            </div>
                            <div>
                                <h1 className="mb-0 font-bold text-3xl">Privacy Policy</h1>
                                <p className="mb-0 opacity-75">How we protect and use your personal information</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="last-updated flex items-center">
                    <i className="bi bi-calendar-check mr-2"></i>
                    <strong>Last Updated:</strong> February 1, 2026
                </div>
                
                <div className="legal-content">
                    <div className="privacy-badge">
                        <i className="bi bi-lock-fill"></i>
                        GDPR & Kenya Data Protection Act Compliant
                    </div>
                    
                    <h2>1. Introduction</h2>
                    <p>
                        Umoja Drivers Sacco ("we," "us," or "the Sacco") is committed to protecting your privacy and personal data. 
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                        platform and services.
                    </p>
                    
                    <div className="highlight-box">
                        <strong><i className="bi bi-info-circle mr-2"></i>Your Rights:</strong><br />
                        Under the Kenya Data Protection Act, 2019, you have the right to access, correct, delete, and port your personal data. 
                        You also have the right to object to processing and withdraw consent at any time.
                    </div>
                    
                    <h2>2. Information We Collect</h2>
                    
                    <h3>2.1 Personal Information</h3>
                    <p>When you register as a member, we collect:</p>
                    <ul className="list-disc">
                        <li><strong>Identity Information:</strong> Full name, national ID/passport number, date of birth</li>
                        <li><strong>Contact Information:</strong> Phone number, email address, physical address</li>
                        <li><strong>Financial Information:</strong> Bank account details, M-Pesa number, transaction history</li>
                        <li><strong>Employment Information:</strong> Occupation, employer details (if applicable)</li>
                        <li><strong>Profile Information:</strong> Profile picture, gender, next of kin details</li>
                    </ul>
                    
                    <h3>2.2 Automatically Collected Information</h3>
                    <p>When you use our platform, we automatically collect:</p>
                    <ul className="list-disc">
                        <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                        <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                        <li><strong>Location Data:</strong> General location based on IP address (not precise GPS)</li>
                        <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
                    </ul>
                    
                    <h3>2.3 Financial Transaction Data</h3>
                    <p>We collect and maintain records of:</p>
                    <ul className="list-disc">
                        <li>Savings contributions and withdrawals</li>
                        <li>Share capital purchases</li>
                        <li>Loan applications, disbursements, and repayments</li>
                        <li>Welfare contributions and support received</li>
                        <li>M-Pesa and mobile money transactions</li>
                        <li>Dividend payments and distributions</li>
                    </ul>
                    
                    <h2>3. How We Use Your Information</h2>
                    
                    <h3>3.1 Primary Purposes</h3>
                    <p>We use your personal information to:</p>
                    <ul className="list-disc">
                        <li><strong>Account Management:</strong> Create and maintain your membership account</li>
                        <li><strong>Financial Services:</strong> Process contributions, loans, and withdrawals</li>
                        <li><strong>Communication:</strong> Send account statements, notifications, and updates</li>
                        <li><strong>Compliance:</strong> Meet legal and regulatory requirements (SASRA, KRA)</li>
                        <li><strong>Security:</strong> Prevent fraud, unauthorized access, and protect member funds</li>
                    </ul>
                    
                    <h3>3.2 Secondary Purposes</h3>
                    <p>With your consent, we may use your information for:</p>
                    <ul className="list-disc">
                        <li><strong>Sending promotional offers and Sacco news</strong></li>
                        <li>Conducting member surveys and feedback collection</li>
                        <li>Analyzing platform usage to improve services</li>
                        <li>Generating anonymized reports and statistics</li>
                    </ul>
                    
                    <h2>4. Legal Basis for Processing</h2>
                    <p>We process your personal data based on:</p>
                    <ul className="list-disc">
                        <li><strong>Contractual Necessity:</strong> To fulfill our membership agreement with you</li>
                        <li><strong>Legal Obligation:</strong> To comply with Kenyan laws and SASRA regulations</li>
                        <li><strong>Legitimate Interest:</strong> To prevent fraud and ensure platform security</li>
                        <li><strong>Consent:</strong> For marketing communications and optional features</li>
                    </ul>
                    
                    <h2>5. Information Sharing and Disclosure</h2>
                    
                    <h3>5.1 We Share Information With:</h3>
                    <ul className="list-disc">
                        <li><strong>Regulatory Authorities:</strong> SASRA, Kenya Revenue Authority (KRA), Central Bank of Kenya</li>
                        <li><strong>Payment Processors:</strong> Safaricom (M-Pesa), banks, and payment gateways</li>
                        <li><strong>Service Providers:</strong> IT support, cloud hosting, SMS providers (under strict NDAs)</li>
                        <li><strong>Auditors:</strong> External auditors for annual financial audits</li>
                        <li><strong>Legal Authorities:</strong> When required by court order or law enforcement</li>
                    </ul>
                    
                    <h3>5.2 We Do NOT:</h3>
                    <ul className="list-disc">
                        <li>Sell your personal information to third parties</li>
                        <li>Share your data for marketing purposes without consent</li>
                        <li>Transfer data outside Kenya without adequate safeguards</li>
                        <li>Use your information for purposes unrelated to Sacco operations</li>
                    </ul>
                    
                    <h2>6. Data Security</h2>
                    
                    <h3>6.1 Technical Measures</h3>
                    <p>We protect your data through:</p>
                    <ul className="list-disc">
                        <li><strong>Encryption:</strong> SSL/TLS encryption for data in transit, AES-256 for data at rest</li>
                        <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication for staff</li>
                        <li><strong>Firewalls:</strong> Network security and intrusion detection systems</li>
                        <li><strong>Regular Backups:</strong> Daily encrypted backups with secure off-site storage</li>
                        <li><strong>Security Audits:</strong> Regular penetration testing and vulnerability assessments</li>
                    </ul>
                    
                    <h3>6.2 Organizational Measures</h3>
                    <ul className="list-disc">
                        <li>Staff training on data protection and confidentiality</li>
                        <li>Strict access policies and audit logs</li>
                        <li>Confidentiality agreements with all employees and contractors</li>
                        <li>Incident response plan for data breaches</li>
                    </ul>
                    
                    <h2>7. Data Retention</h2>
                    <p>We retain your personal information for:</p>
                    <ul className="list-disc">
                        <li><strong>Active Membership:</strong> Duration of your membership plus 7 years (as required by law)</li>
                        <li><strong>Financial Records:</strong> 7 years from the date of transaction (tax and audit requirements)</li>
                        <li><strong>Loan Records:</strong> 7 years after full repayment</li>
                        <li><strong>Marketing Data:</strong> Until you withdraw consent or 2 years of inactivity</li>
                    </ul>
                    
                    <h2>8. Your Privacy Rights</h2>
                    
                    <h3>8.1 Right to Access</h3>
                    <p>You can request a copy of all personal data we hold about you.</p>
                    
                    <h3>8.2 Right to Rectification</h3>
                    <p>You can update or correct inaccurate information through your account settings or by contacting us.</p>
                    
                    <h3>8.3 Right to Erasure ("Right to be Forgotten")</h3>
                    <p>You can request deletion of your data, subject to legal retention requirements.</p>
                    
                    <h3>8.4 Right to Data Portability</h3>
                    <p>You can request your data in a structured, machine-readable format.</p>
                    
                    <h3>8.5 Right to Object</h3>
                    <p>You can object to processing of your data for marketing or profiling purposes.</p>
                    
                    <h3>8.6 Right to Withdraw Consent</h3>
                    <p>You can withdraw consent for optional processing at any time.</p>
                    
                    <div className="highlight-box">
                        <strong>How to Exercise Your Rights:</strong><br />
                        Email: <Link href="mailto:privacy@umojadriversacco.co.ke">privacy@umojadriversacco.co.ke</Link><br />
                        Phone: +254 700 000 000<br />
                        We will respond to your request within 30 days.
                    </div>
                    
                    <h2>9. Cookies and Tracking</h2>
                    
                    <h3>9.1 Essential Cookies</h3>
                    <p>We use session cookies to:</p>
                    <ul className="list-disc">
                        <li>Maintain your login session</li>
                        <li>Remember your preferences (theme, language)</li>
                        <li>Ensure platform security (CSRF protection)</li>
                    </ul>
                    
                    <h3>9.2 Analytics Cookies (Optional)</h3>
                    <p>With your consent, we may use analytics to improve user experience. You can opt out at any time.</p>
                    
                    <h2>10. Third-Party Services</h2>
                    
                    <h3>10.1 M-Pesa Integration</h3>
                    <p>
                        When you use M-Pesa for transactions, Safaricom's privacy policy also applies. 
                        We only receive transaction confirmation data, not your M-Pesa PIN or full account details.
                    </p>
                    
                    <h3>10.2 SMS Notifications</h3>
                    <p>
                        We use third-party SMS providers to send transaction alerts. These providers are bound by 
                        confidentiality agreements and only process data as instructed.
                    </p>
                    
                    <h2>11. Children's Privacy</h2>
                    <p>
                        Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
                        personal information from children. If you believe we have inadvertently collected such information, 
                        please contact us immediately.
                    </p>
                    
                    <h2>12. Data Breach Notification</h2>
                    <p>
                        In the event of a data breach that poses a risk to your rights and freedoms, we will:
                    </p>
                    <ul className="list-disc">
                        <li>Notify the Office of the Data Protection Commissioner within 72 hours</li>
                        <li>Inform affected members without undue delay</li>
                        <li>Provide details of the breach and remedial actions taken</li>
                        <li>Offer support and guidance to mitigate potential harm</li>
                    </ul>
                    
                    <h2>13. International Data Transfers</h2>
                    <p>
                        Your data is primarily stored and processed in Kenya. If we need to transfer data outside Kenya 
                        (e.g., for cloud backup), we ensure:
                    </p>
                    <ul className="list-disc">
                        <li>Adequate data protection safeguards are in place</li>
                        <li>Compliance with Kenya Data Protection Act requirements</li>
                        <li>Use of standard contractual clauses or equivalent mechanisms</li>
                    </ul>
                    
                    <h2>14. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                        We will notify you of significant changes via:
                    </p>
                    <ul className="list-disc">
                        <li>Email notification to your registered address</li>
                        <li>Platform notification upon login</li>
                        <li>Posting the updated policy with a new "Last Updated" date</li>
                    </ul>
                    
                    <h2>15. Contact Us</h2>
                    <p>
                        For questions, concerns, or to exercise your privacy rights, contact our Data Protection Officer:
                    </p>
                    <div className="highlight-box">
                        <strong>Data Protection Officer</strong><br />
                        Umoja Drivers Sacco<br />
                        Email: <Link href="mailto:privacy@umojadriversacco.co.ke">privacy@umojadriversacco.co.ke</Link><br />
                        Phone: +254 700 000 000<br />
                        Address: Nairobi, Kenya
                    </div>
                    
                    <h2>16. Complaints</h2>
                    <p>
                        If you believe we have not handled your personal data properly, you have the right to lodge a complaint with:
                    </p>
                    <div className="highlight-box">
                        <strong>Office of the Data Protection Commissioner</strong><br />
                        Email: <Link href="mailto:info@odpc.go.ke">info@odpc.go.ke</Link><br />
                        Website: <Link href="https://www.odpc.go.ke" target="_blank">www.odpc.go.ke</Link><br />
                        Phone: +254 20 2675000
                    </div>
                    
                    <div className="text-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-0">
                            By using our platform, you acknowledge that you have read and understood this Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
