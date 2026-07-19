'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateBreadcrumbSchema } from '../utils/seoSchemas';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'edulumix@gmail.com',
      link: 'mailto:edulumix@gmail.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 82729 46202',
      link: 'tel:+918272946202',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+91 82729 46202',
      link: 'https://wa.me/918272946202',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Kolkata, West Bengal, India',
      link: null,
    },
  ];

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' }
  ];

  const structuredData = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen py-12 lg:py-20">
      <SEO
        title="Contact Us - Get in Touch with EduLumix | Support & Inquiries"
        description="Contact EduLumix for support, inquiries, or feedback. Reach us via email, phone, or contact form. We're here to help you with jobs, courses, and career guidance."
        keywords="contact edulumix, support, help, inquiries, feedback, contact us, customer support, get in touch"
        url="/contact"
        structuredData={structuredData}
      />
      
      <div className="w-full px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4 text-gray-900 dark:text-white">
            Get in <span className="text-blue-600 dark:text-blue-400">Touch</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-dark-100 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Write your message..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-all shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Message
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
            
            <div className="space-y-4 mb-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white dark:bg-dark-100 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{info.title}</p>
                    {info.link ? (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6" />
                <h3 className="text-lg font-bold">Business Hours</h3>
              </div>
              <div className="space-y-2 opacity-90">
                <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                <p>Saturday: 10:00 AM - 4:00 PM IST</p>
                <p>Sunday: Closed</p>
              </div>
              <p className="mt-4 text-sm opacity-75">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
