'use client';

import Link from 'next/link';
import Logo from '../common/Logo';
import AdSlot from '../ads/AdSlot';
import { AD_SLOTS } from '../../config/ads';
import { 
  Github, Twitter, Linkedin, Instagram, Youtube, Facebook,
  Mail, MapPin, Phone
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: 'Fresher Jobs', path: '/jobs' },
    { name: 'Free Resources', path: '/resources' },
    { name: 'Courses', path: '/courses' },
    { name: 'Tech Blog', path: '/blog' },
    { name: 'Digital Products', path: '/digital-products' },
    { name: 'Mock Tests', path: '/mock-test' },
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
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 mb-6 leading-relaxed">
              Empowering freshers and students to build successful careers through quality resources, 
              job opportunities, and skill development.
            </p>
            
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
                  href="mailto:support@edulumix.in" 
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  support@edulumix.in
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
    </footer>
  );
};

export default Footer;
