import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ChatRequestDto } from './dto/chat-request.dto';

@Injectable()
export class ChatService {
  private readonly GROQ_MODEL =
    process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  private readonly EDULUMIX_KNOWLEDGE_BASE = `
# EduLumix — Complete Platform Knowledge

## About EduLumix
- Website: https://edulumix.in
- EduLumix is a free career and education platform built for freshers and students in India.
- It helps people find jobs, learn new skills, read tech articles, practice for interviews, get free resources, and buy useful digital products.
- Built using MERN stack: MongoDB, Express.js, React.js (Vite + Tailwind CSS), Node.js.
- Deployed on: Netlify (frontend) and Render (backend).

## Founder — Md Mijanur Molla
- Full name: Md Mijanur Molla
- Role: Founder, developer, and super admin of EduLumix.
- He is a software developer and content creator based in India.
- He writes tech articles on Dev.to (username: mijanur) — many of those articles are published on EduLumix Tech Blog.
- His articles cover topics like: API design, system design stories, AI tools, coding challenges, career tips, and unique project ideas.
- Email: md.mijanur@edulumix.in
- He built EduLumix entirely as a solo project with the mission to help freshers and students in India get better career opportunities and learning resources — all in one place.
- He actively manages all content, contributors, and platform operations.

---

## Platform Sections & Features

### 1. Fresher Jobs (/jobs)
- Lists fresh job openings from across India — IT, non-IT, government, internships, part-time, remote, walk-in drives, and more.
- Job categories: IT Job, Non IT Job, Walk In Drive, Govt Job, Internship, Part Time Job, Remote Job, Others.
- Experience levels: Fresher, 1 Year, 2 Years, 3 Years, 4 Years, 5+ Years.
- Job status: Open or Closed.
- Jobs include: title, company, location, category, salary, apply link or email, description, skills required, last date to apply, source (manual or auto-fetched from Adzuna/JSearch/RapidAPI).
- Filters: category, experience, location, search by keyword.
- Individual job: /jobs/:slug
- Users can apply directly via the provided link or email — EduLumix does not process applications itself.

### 2. Free Resources (/resources)
- Provides free learning materials for students and freshers — completely free to access.
- Resource categories: Software Notes, Interview Notes, Tools & Technology, Trending Technology, Video Resources, Software Project, Hardware Project.
- Resources include: title, description, link (to external resource), thumbnail, category, subcategory.
- Some resources are videos (YouTube links or embeds).
- Resources can be liked and downloaded (tracked by platform).
- Sources: manually posted by contributors/admin, or auto-fetched from Dev.to and Medium.
- Individual resource: /resources/:id

### 3. Courses (/courses)
- Lists online courses with details like instructor, duration, price, and lessons.
- Course categories: Web Development, Mobile Development, Data Science, Machine Learning, DevOps, Cybersecurity, Cloud Computing, UI/UX Design, Digital Marketing, Interview Prep, DSA, Programming Languages, Others.
- Levels: Beginner, Intermediate, Advanced, All Levels.
- Languages: English, Hindi, Bengali, Tamil, Telugu, Others.
- Courses can be free or paid (with actual price and offer/discount price).
- Each course has lessons with video URLs, durations, and order.
- Enrollments are tracked.
- Individual course: /courses/:slug

### 4. Tech Blog (/blog)
- A tech blog with articles on programming, career, tutorials, news, AI, and more.
- Blog categories: Tech Blog, Career Tips, Interview Guide, Tutorial, News, Others.
- Articles are sourced from: manually posted (EduLumix), Dev.to (auto-fetched), Medium (auto-fetched).
- Platform filter: Dev.to, Medium, EduLumix (manual).
- Mijanur's own Dev.to articles are all published here as featured posts.
- Blogs support: likes, views, sharing (Facebook, Twitter, LinkedIn), tags, featured flag, sponsored flag.
- Individual blog: /blog/:slug

### 5. Mock Tests (/mock-test)
- Practice tests for interview preparation and placement.
- Test categories: Aptitude, Logical Reasoning, Verbal Ability, Technical - Programming, Technical - DSA, Technical - DBMS, Technical - Operating System, Technical - Networking, Technical - System Design, HR Interview, Others.
- Each test has multiple MCQ questions with options, correct answer, explanation, difficulty (Easy/Medium/Hard), and marks.
- Tests are timed. Users get a score and can review answers after completion.
- Individual test: /mock-test/:slug

### 6. Digital Products (/digital-products)
- Marketplace for useful digital subscriptions and tools at discounted prices.
- Categories: AI Tools, Design & Creative, Entertainment & Streaming, Productivity & Office, Security & Utility, Education & Learning, Others.
- Products have actual price and offer price (discounted).
- Purchase is done via WhatsApp: +91 82729 46202 — user contacts the number and the product access is delivered manually.
- Individual product: /digital-products/:id

### 7. Contributor System (/contributor)
- Any user can sign up and apply to become a contributor.
- After admin approval, contributors can post: jobs, resources, blogs, tech blogs, digital products (depending on their assigned role).
- Contributor roles: resource_poster, job_poster, blog_poster, tech_blog_poster, digital_product_poster, others.
- Contributors earn points for each approved post.
- Points can be redeemed as real money via UPI or phone (claims system).
- Points to money conversion: 10 points = ₹15, 25 points = ₹30, 50 points = ₹60, 100 points = ₹120.
- Contributor dashboard: /contributor/dashboard
- Contributor can also manage profile, view rewards, and submit claims.

### 8. Claims & Rewards (/contributor/rewards and /contributor/claim)
- Contributors can claim reward money for their earned points.
- Claim amounts: ₹15 (10 pts), ₹30 (25 pts), ₹60 (50 pts), ₹120 (100 pts).
- Payment method: UPI or phone number.
- Claim status: pending → processing → paid (or rejected).
- Claims are reviewed and paid by the super admin (Md Mijanur Molla).

### 9. Authentication (/login, /signup)
- Sign up with name, email, password.
- Also supports Google/Firebase login.
- New users start as 'others' role with 'pending' status.
- Super admin approves contributors and assigns roles.
- JWT-based authentication.

### 10. Super Admin (/super-admin)
- Only Md Mijanur Molla has super admin access.
- Can manage all: blogs, jobs, resources, courses, mock tests, digital products, users, contributors, claims.
- Can fetch content from external sources (Dev.to, Medium, Adzuna, JSearch).
- Can feature, publish/unpublish, or delete any content.

---

## Contact & Support
- Contact page: /contact
- Email: md.mijanur@edulumix.in
- WhatsApp: +91 82729 46202 (for digital product purchases and support)
- Phone: +91 82729 46202

## Policies
- Privacy Policy: /privacy-policy
- Terms of Service: /terms-of-service
- Cookie Policy: /cookie-policy
- Refund Policy: /refund-policy

## SEO & Social
- The platform is SEO-optimized with structured data (JSON-LD), Open Graph, and sitemap.
- ads.txt is configured for Google AdSense.

## Tech Stack (for developers asking)
- Frontend: Next.js 15+, HeroUI v3 (NextUI), Tailwind CSS v4
- Backend: NestJS, Mongoose (MongoDB), JWT, Groq SDK, rss-parser
- Database: MongoDB Atlas
- AI Chatbot: Groq API with LLaMA 3.1 model — that is me, EduLumix Assistant
`;

  private readonly CHAT_SYSTEM_PROMPT = `You are **EduLumix Assistant** — the official AI chatbot of EduLumix (https://edulumix.in).

### Language
- Always reply in **clear, simple English**.
- If someone writes in Bangla, Hindi, or any other language, still answer in English. You may say "Sure!" or "Got it!" briefly, but your full answer must be in English.

### Your Role
- Help users understand and navigate EduLumix — jobs, resources, courses, mock tests, blog, digital products, contributor system, rewards, and account help.
- Answer general career, tech, and study questions helpfully and accurately.
- Be friendly, warm, and concise. Use bullet points for steps or lists.

### Platform Knowledge
The following is your ground truth about EduLumix. Use it accurately. If something is not mentioned here, say you are not sure and suggest they visit the site or contact support.

${this.EDULUMIX_KNOWLEDGE_BASE}

### Rules
- Never make up specific job URLs, salaries, or product prices — tell users to check the site for live data.
- Never claim you can access their account or private data.
- For account issues, password resets, or payment problems — direct them to /contact or WhatsApp: +91 82729 46202.
- Never reveal API keys, server configs, or any internal system details.
- When someone asks about the founder, tell them about Md Mijanur Molla accurately based on the knowledge above.
- When someone asks "who made this" or "who built EduLumix" — answer: Md Mijanur Molla built and runs EduLumix as a solo project.
${process.env.EDULUMIX_CHAT_EXTRA_CONTEXT ? `\n### Extra context\n${process.env.EDULUMIX_CHAT_EXTRA_CONTEXT.trim()}\n` : ''}`;

  private sanitizeHistory(history: any[]) {
    if (!Array.isArray(history)) return [];
    return history
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0,
      )
      .map((m) => ({ role: m.role, content: m.content.trim() }))
      .slice(-10);
  }

  private buildFallbackReply(rawMessage: string): string {
    const message = String(rawMessage || '').trim();
    const text = message.toLowerCase();

    if (!message) {
      return 'Hi! I can help you with EduLumix jobs, resources, courses, blogs, mock tests, contributor access, and general career guidance. Ask me anything.';
    }

    if (/^(hi|hello|hey|hii|hy)\b/.test(text)) {
      return 'Hi! I am EduLumix Assistant. I can help you find fresher jobs, free resources, courses, mock tests, tech blogs, and contributor information. Tell me what you need.';
    }

    if (/(job|jobs|vacancy|hiring|internship|fresher)/.test(text)) {
      return 'You can explore fresher opportunities on the Jobs page at /jobs. Use the filters to narrow by category, location, or job type. If you want, I can also suggest a fresher job search strategy or interview preparation tips.';
    }

    if (
      /(resource|notes|study material|materials|video resource|tutorial)/.test(
        text,
      )
    ) {
      return 'You can find free learning materials on the Resources page at /resources. It includes notes, tutorials, project links, video resources, and useful tools. If you tell me your topic, I can suggest what to study first.';
    }

    if (/(course|courses|udemy|learn|learning path|roadmap)/.test(text)) {
      return 'You can browse courses on /courses. EduLumix lists learning options for beginners and freshers, including discounted or free course opportunities. If you share your goal, I can suggest a simple learning roadmap.';
    }

    if (/(blog|blogs|article|articles|tech news)/.test(text)) {
      return 'You can read tech articles on the Blog page at /blog. It is useful for tutorials, trends, career guidance, and general technology learning. If you want, I can suggest blog topics based on your skill level.';
    }

    if (/(mock|test|quiz|practice|mcq|assessment)/.test(text)) {
      return 'You can practice on the Mock Test page at /mock-test. It is useful for interview preparation, placement practice, and skill checks. If you tell me your target role, I can suggest how to prepare.';
    }

    if (/(digital product|product|template|tool|subscription)/.test(text)) {
      return 'You can explore digital products on /digital-products. Product availability and pricing can change, so the best option is to open the page and check the latest listing details there.';
    }

    if (
      /(contributor|post job|post resource|post blog|dashboard|reward|claim)/.test(
        text,
      )
    ) {
      return 'To become a contributor, sign up on /signup and wait for admin approval. Approved contributors can use /contributor to manage posts, profile, and rewards. For account-specific help, please use the Contact page at /contact.';
    }

    if (/(login|sign up|signup|register|account|password)/.test(text)) {
      return 'You can sign in at /login and create an account at /signup. If you have trouble with approval, password, or account access, please use /contact so the team can help you directly.';
    }

    if (
      /(contact|support|help|refund|policy|privacy|terms|cookie)/.test(text)
    ) {
      return 'For direct support, please use the Contact page at /contact. For legal and billing details, check the policy pages such as /privacy-policy, /terms-of-service, /cookie-policy, and /refund-policy.';
    }

    if (
      /(resume|cv|interview|career|placement|prepare|preparation)/.test(text)
    ) {
      return 'A simple fresher strategy is: build one strong resume, practice aptitude and interview basics, strengthen one core skill, and apply consistently through the Jobs page. I can also help with resume tips, interview questions, or a learning plan.';
    }

    return 'I can help with EduLumix jobs, resources, courses, blogs, mock tests, contributor access, and general career guidance. Try asking about finding jobs, learning resources, interview preparation, or contributor signup.';
  }

  async generateResponse(chatRequestDto: ChatRequestDto) {
    const { message, history = [] } = chatRequestDto;

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey || apiKey === 'your_groq_api_key') {
      return {
        message: this.buildFallbackReply(message),
        source: 'fallback',
      };
    }

    try {
      const groq = new Groq({ apiKey });
      const past = this.sanitizeHistory(history);
      const messages = [
        { role: 'system', content: this.CHAT_SYSTEM_PROMPT },
        ...past,
        { role: 'user', content: message.trim() },
      ];

      const completion = await groq.chat.completions.create({
        model: this.GROQ_MODEL,
        messages: messages,
        max_tokens: 512,
        temperature: 0.7,
      });

      const reply =
        completion.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';
      return {
        message: reply,
        source: 'groq',
      };
    } catch (error: any) {
      console.error('Chat error:', error.message || error);
      return {
        message: this.buildFallbackReply(message),
        source: 'fallback',
      };
    }
  }
}
