'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../common/Logo';
import AdSlot from '../ads/AdSlot';
import { AD_SLOTS } from '../../config/ads';
import { 
  Github, Twitter, Linkedin, Instagram, Youtube, Facebook,
  Mail, MapPin, Phone, Download, X, Smartphone
} from 'lucide-react';

const ApkDownloadBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('edulumix_apk_prompt_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('edulumix_apk_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-white/95 dark:bg-dark-100/95 backdrop-blur-md border border-gray-200 dark:border-dark-200/50 shadow-2xl rounded-3xl p-5 z-50 animate-slide-up flex flex-col gap-4 text-left">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-4">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
              Get the EduLumix App
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
              Download our official Android APK for a faster, smoother, and more rewarding experience!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/app/edulumix.apk"
            download="edulumix.apk"
            onClick={handleDismiss}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download APK
          </a>
          <button
            onClick={handleDismiss}
            className="px-4 h-10 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-200 text-gray-500 dark:text-gray-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: 'Fresher Jobs', path: '/jobs' },
    { name: 'Free Resources', path: '/resources' },
    { name: 'Courses', path: '/courses' },
    { name: 'Tech Blog', path: '/blog' },
    { name: 'Digital Products', path: '/digital-products' },
    { name: 'Mock Tests', path: '/mock-test' },
    { name: 'Interview Prep', path: '/interview-prep' },
    { name: 'AI Resume Analyzer', path: '/resume-analyzer' },
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/#services' },
    { name: 'Testimonials', path: '/#testimonials' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Cookie Policy', path: '/cookie-policy' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Refund Policy', path: '/refund-policy' },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/edulumix', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/edulumix', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/edulumix', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com/edulumix', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/@edulumix', label: 'YouTube' },
    { icon: Facebook, href: 'https://facebook.com/edulumix', label: 'Facebook' },
  ];

  return (
    <footer className="bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-gray-800">
      <div className="w-full px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Logo size="default" showText={true} linkTo="/" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 mb-4 leading-relaxed">
              Empowering freshers and students to build successful careers through quality resources, 
              job opportunities, and skill development.
            </p>
            
            <a
              href="/app/edulumix.apk"
              download="edulumix.apk"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all mb-6 mt-1"
            >
              <Smartphone className="w-4 h-4" /> Download Android APK
            </a>
            
            {/* Social Links */}
            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Our Services</h4>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:edulumix@gmail.com" 
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  edulumix@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:+918272946202" 
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  +91 82729 46202
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India - 700001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* AdSense - footer banner (all pages) */}
        <AdSlot slotId={AD_SLOTS.BANNER} className="py-6 border-t border-gray-200 dark:border-gray-800" />

        {/* Legal Links Bar */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-gray-500 dark:text-gray-500 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © {currentYear} EduLumix. All rights reserved
          </p>
        </div>
      </div>
      <ApkDownloadBanner />
    </footer>
  );
};

export default Footer;
