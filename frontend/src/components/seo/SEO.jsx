'use client';

import { useEffect } from 'react';

const SEO = ({
  title = 'EduLumix - Your Complete Career Platform',
  description = 'EduLumix is your ultimate destination for fresher jobs, free resources, online courses, mock tests, and career guidance.',
  keywords = 'jobs for freshers, free resources, online courses, mock tests',
  noIndex = false,
  structuredData
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = title;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // Update meta keywords
      if (keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords);
      }

      // Update robots
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');

      // Inject structured data
      if (structuredData) {
        const id = 'seo-structured-data';
        let script = document.getElementById(id);
        if (!script) {
          script = document.createElement('script');
          script.id = id;
          script.type = 'application/ld+json';
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(structuredData);
      }
    }
  }, [title, description, keywords, noIndex, structuredData]);

  return null;
};

export default SEO;
