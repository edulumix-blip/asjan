import type { Metadata } from 'next';
import { Suspense } from 'react';
import Contact from '@/views/Contact';

export const metadata: Metadata = {
  title: 'Contact Us - EduLumix | Get in Touch',
  description: 'Have a question or feedback? Contact the EduLumix team. We are here to help with your career and education queries.',
  keywords: 'contact EduLumix, support, feedback, help, career guidance',
  openGraph: {
    title: 'Contact Us - EduLumix',
    description: 'Have a question or feedback? Contact the EduLumix team.',
    url: 'https://edulumix.in/contact',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/contact' },
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Contact />
    </Suspense>
  );
}
