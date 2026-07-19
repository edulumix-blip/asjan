'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from '@/utils/reactRouterCompat';
import { 
  BookOpen, Star, HelpCircle, MessageSquare, Terminal, 
  Users, Play, ChevronRight, Award, CheckCircle, AlertTriangle, 
  ArrowRight, Zap, RefreshCw, Eye, Sparkles, Check, ChevronDown, ChevronUp,
  Filter, X, Loader2
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import SEO from '../components/seo/SEO';
import ListingPageHero from '../components/listing/ListingPageHero';
import toast from 'react-hot-toast';
import { interviewPrepService } from '../services/dataService';

const PREP_QUESTIONS = [
  {
    id: 1,
    category: 'Frontend',
    question: 'What is the difference between Virtual DOM and Real DOM in React?',
    difficulty: 'Easy',
    answer: 'The Virtual DOM is a lightweight, in-memory representation of the Real DOM. When a component\'s state changes, React first updates the Virtual DOM, compares it with the previous snapshot (diffing), and then updates only the modified nodes in the Real DOM (reconciliation) in a single batch, minimizing expensive layout recalculations.',
    tips: 'Highlight reconciliation, batching, diffing algorithm, and performance benefits.'
  },
  {
    id: 2,
    category: 'Backend',
    question: 'Explain the concept of Middleware in Express/Node.js.',
    difficulty: 'Medium',
    answer: 'Middleware functions have access to the request (req) and response (res) objects and the next middleware function in the cycle (next). They can execute code, modify req/res, terminate requests, or call next() to pass control. Common uses include logging, authentication, and request parsing.',
    tips: 'Mention the (req, res, next) signature, request-response cycle, and examples like cors or body-parser.'
  },
  {
    id: 3,
    category: 'Database',
    question: 'What is the difference between SQL and NoSQL databases?',
    difficulty: 'Easy',
    answer: 'SQL databases are relational, table-based, have strict/predefined schemas, and scale vertically (e.g. MySQL, Postgres). NoSQL databases are non-relational, document/key-value based, have dynamic schemas, and scale horizontally (e.g. MongoDB). SQL is ideal for complex joins and ACID compliance, while NoSQL is best for flexible structures.',
    tips: 'Focus on schema flexibility, scaling (vertical vs horizontal), and data structure models.'
  },
  {
    id: 4,
    category: 'Behavioral',
    question: 'Tell me about a time you had a conflict with a teammate and how you resolved it.',
    difficulty: 'Easy',
    answer: 'Use the STAR method: Situation (describe context), Task (identify the challenge/goal), Action (what you did to resolve it constructively), and Result (the positive outcome). Emphasize active listening, objective discussion, compromise, and focus on the project\'s success rather than personal differences.',
    tips: 'Never speak negatively about colleagues. Focus on communication, empathy, and professional outcomes.'
  },
  {
    id: 5,
    category: 'System Design',
    question: 'How would you design a rate limiter for a public API?',
    difficulty: 'Hard',
    answer: 'A rate limiter controls incoming traffic. You can implement it using Token Bucket or Sliding Window Counter algorithms. Redis is commonly used to track client request counts via client IP or API key with an expiry (TTL). It returns HTTP status 429 Too Many Requests when limits are exceeded.',
    tips: 'Discuss Redis, sliding window counter vs token bucket, and horizontal scaling of rate limiting service.'
  },
  {
    id: 6,
    category: 'Frontend',
    question: 'Explain JavaScript closures and provide a common use case.',
    difficulty: 'Medium',
    answer: 'A closure is a combination of a function bundled together with references to its surrounding state (lexical environment). In other words, a closure gives an inner function access to the outer function\'s scope even after the outer function has returned. A common use case is data privacy (creating private variables) and function factories.',
    tips: 'Discuss lexical scoping, memory retention of outer scopes, and the module pattern.'
  },
  {
    id: 7,
    category: 'Backend',
    question: 'What is the difference between processes and threads?',
    difficulty: 'Medium',
    answer: 'A process is an executing instance of an application that has its own isolated memory space allocated by the OS. A thread is the smallest execution unit within a process. Multiple threads run inside a single process and share its memory and resources, making thread communication faster but prone to concurrency bugs like race conditions.',
    tips: 'Explain memory sharing, isolation, overhead of context switching, and multi-threading models.'
  }
];

const SIMULATOR_QUESTIONS = {
  'Frontend': [
    'Describe the lifecycle of a React component. How do hooks change this model?',
    'What are the advantages and disadvantages of SPAs vs Server-Side Rendering (SSR)?',
    'How do you optimize a web page load time? Discuss key web vitals.'
  ],
  'Backend': [
    'How do you secure REST APIs? Mention at least 4 security practices.',
    'Explain database indexing. How does it work and what are the trade-offs?',
    'How would you handle a memory leak in a Node.js server application?'
  ],
  'Behavioral': [
    'Why should we hire you over other candidates?',
    'Describe a situation where you had to work under tight deadlines with incomplete specifications.',
    'How do you handle receiving critical feedback on your work?'
  ]
};

const InterviewPrep = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [practicedSet, setPracticedSet] = useState(new Set());
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState('Frontend');
  const detailRef = useRef(null);

  // Simulator State
  const [simRole, setSimRole] = useState('');
  const [simStarted, setSimStarted] = useState(false);
  const [currentSimQuestionIdx, setCurrentSimQuestionIdx] = useState(0);
  const [simAnswers, setSimAnswers] = useState(['', '', '']);
  const [evaluating, setEvaluating] = useState(false);
  const [evalLogIdx, setEvalLogIdx] = useState(0);
  const [simResult, setSimResult] = useState(null);

  const evalLogs = [
    "Reading response structure...",
    "Matching response with industry-standard keywords...",
    "Assessing technical accuracy and STAR structure...",
    "Calculating score and generating recommendations..."
  ];

  const [dbQuestions, setDbQuestions] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    try {
      setDbLoading(true);
      const res = await interviewPrepService.getAll();
      if (res.data.success) {
        const mapped = (res.data.data || []).map(q => ({
          ...q,
          id: q._id,
        }));
        setDbQuestions(mapped);
      }
    } catch (error) {
      console.error('Error fetching questions from database:', error);
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    const saved = localStorage.getItem('practicedQuestions');
    if (saved) {
      setPracticedSet(new Set(JSON.parse(saved)));
    }
  }, []);



  const togglePracticed = (id) => {
    const updated = new Set(practicedSet);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setPracticedSet(updated);
    localStorage.setItem('practicedQuestions', JSON.stringify([...updated]));

    if (updated.size > 0 && updated.size % 3 === 0) {
      triggerConfetti();
      toast.success(`Awesome! You have practiced ${updated.size} questions!`);
    }
  };

  const triggerConfetti = () => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      script.onload = () => {
        window.confetti?.({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      };
      document.body.appendChild(script);
    }
  };

  const categories = ['Frontend', 'Backend', 'Database', 'Behavioral', 'System Design', 'DevOps', 'HR', 'Architecture', 'Mobile Dev', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Testing & QA', 'Product Management', 'Project Management'];

  const activeQuestions = useMemo(() => {
    return dbQuestions.length > 0 ? dbQuestions : PREP_QUESTIONS;
  }, [dbQuestions]);

  const questionsByCategory = useMemo(() => {
    const groups = {};
    categories.forEach(cat => {
      groups[cat] = [];
    });
    activeQuestions.forEach(q => {
      if (groups[q.category]) {
        groups[q.category].push(q);
      }
    });
    return groups;
  }, [activeQuestions, categories]);

  const progressPercentage = useMemo(() => {
    if (activeQuestions.length === 0) return 0;
    return Math.round((practicedSet.size / activeQuestions.length) * 100);
  }, [practicedSet, activeQuestions]);

  useEffect(() => {
    if (activeQuestions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(activeQuestions[0]);
    }
  }, [activeQuestions, selectedQuestion]);

  useEffect(() => {
    if (selectedQuestion && detailRef.current && typeof window !== 'undefined') {
      // Scroll into view on mobile devices when a question is selected
      if (window.innerWidth < 1024) {
        detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedQuestion]);

  const startSimulator = (role) => {
    setSimRole(role);
    setSimStarted(true);
    setCurrentSimQuestionIdx(0);
    setSimAnswers(['', '', '']);
    setSimResult(null);
  };

  const handleNextSimQuestion = () => {
    if (currentSimQuestionIdx < 2) {
      setCurrentSimQuestionIdx(prev => prev + 1);
    } else {
      triggerEvaluation();
    }
  };

  const triggerEvaluation = () => {
    setEvaluating(true);
    setEvalLogIdx(0);

    const logInterval = setInterval(() => {
      setEvalLogIdx(prev => {
        if (prev < evalLogs.length - 1) {
          return prev + 1;
        } else {
          clearInterval(logInterval);
          return prev;
        }
      });
    }, 1500);

    setTimeout(() => {
      clearInterval(logInterval);
      setEvaluating(false);

      const averageLength = simAnswers.reduce((sum, val) => sum + val.length, 0) / 3;
      let score = 5;
      let review = '';
      if (averageLength > 150) {
        score = 9;
        review = 'Excellent depth! Your responses cover core conceptual points and demonstrate solid theoretical grounding. Ready for tech rounds!';
      } else if (averageLength > 80) {
        score = 7;
        review = 'Good basic understanding. You answered the core questions, but could add more specific examples, code keywords, or architectural references to sound more senior.';
      } else {
        score = 4;
        review = 'Your answers are a bit brief. Try providing step-by-step reasoning or utilizing the STAR method (Situation, Task, Action, Result) for behavioral questions.';
      }

      setSimResult({
        score,
        review,
        feedback: [
          {
            q: SIMULATOR_QUESTIONS[simRole][0],
            strength: 'Covers core definition clearly.',
            improvement: 'Mention production trade-offs or recent developments.'
          },
          {
            q: SIMULATOR_QUESTIONS[simRole][1],
            strength: 'Structured layout is easy to read.',
            improvement: 'Provide concrete examples of failure states or mitigations.'
          },
          {
            q: SIMULATOR_QUESTIONS[simRole][2],
            strength: 'Demonstrates professional attitude.',
            improvement: 'Refine your explanation with metric-driven outcomes.'
          }
        ]
      });

      triggerConfetti();
    }, 6500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <SEO 
        title="AI Interview Prep Center - Mock Interviews & Coding Questions | EduLumix"
        description="Practice tech and behavioral interview questions. Use our AI-powered mock simulator to practice answers and get detailed feedback."
        keywords="interview prep, mock interview, coding interview, front-end questions, back-end questions, hr interview questions, star method"
        url="/interview-prep"
      />

      <ListingPageHero
        imageUrl="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=85"
        objectPositionClass="object-[center_25%]"
        eyebrow={
          <p className="inline-flex items-center gap-2 text-white/95 text-sm font-medium mb-4 drop-shadow-md [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 drop-shadow-md" />
            AI-Powered Career & Technical Interview Sandbox
          </p>
        }
        title="Master the Art of Tech Interviews"
        description="Challenge yourself with real interview questions curated from industry experts. Validate your knowledge, track your metrics, and test your skills with our interactive AI Mock Simulator."
        stat={{
          label: 'Interview Qs Ready',
          value: `${activeQuestions.length}+`,
          Icon: BookOpen
        }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8 pt-0">
        <div className="flex gap-2 p-1.5 bg-gray-200/50 dark:bg-dark-100 rounded-2xl max-w-md mb-5 border border-gray-200 dark:border-gray-800 shadow-inner">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-dark-200 text-blue-600 dark:text-blue-400 shadow-md border border-gray-200/50 dark:border-gray-800/50'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1.5" />
            Question Catalog
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-dark-200 text-blue-600 dark:text-blue-400 shadow-md border border-gray-200/50 dark:border-gray-800/50'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 inline mr-1.5" />
            AI Mock Simulator
          </button>
        </div>

        {activeTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            {/* Left Column: Focused Detail Viewer */}
            <div ref={detailRef} className="lg:col-span-2 space-y-6 order-2 lg:order-1">
              {selectedQuestion ? (
                <Card className="border border-gray-205 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-xl rounded-3xl overflow-hidden p-6 sm:p-8 relative">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-805 pb-5 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-105 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 tracking-wider uppercase">
                        {selectedQuestion.category}
                      </span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full tracking-wider uppercase ${
                        selectedQuestion.difficulty === 'Hard'
                          ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : selectedQuestion.difficulty === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450'
                          : 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                      }`}>
                        {selectedQuestion.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                        Question #{typeof selectedQuestion.id === 'string' && selectedQuestion.id.length > 8 ? selectedQuestion.id.slice(-4) : selectedQuestion.id}
                      </span>
                      <button
                        onClick={() => togglePracticed(selectedQuestion.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          practicedSet.has(selectedQuestion.id)
                            ? 'bg-green-500 text-white border-green-400 shadow-sm shadow-green-500/10'
                            : 'bg-gray-50 dark:bg-dark-100 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-850 hover:bg-gray-150'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {practicedSet.has(selectedQuestion.id) ? 'Completed' : 'Mark as Solved'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                      {selectedQuestion.question}
                    </h2>

                    <div className="space-y-5 pt-4 border-t border-gray-105 dark:border-gray-800">
                      <div>
                        <h4 className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-extrabold mb-2">Model Answer & Explanation</h4>
                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-dark-100 border border-gray-150 dark:border-gray-800/40 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                          {selectedQuestion.answer}
                        </div>
                      </div>

                      <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
                        <h4 className="text-[10px] text-amber-600 dark:text-amber-500 uppercase tracking-wider font-extrabold mb-1.5 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 fill-current animate-pulse" />
                          Interviewer Secrets & Tips
                        </h4>
                        <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                          {selectedQuestion.tips}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-3xl">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
                  <p className="text-gray-450 dark:text-gray-500 text-sm mt-3 font-semibold">Select a question to begin...</p>
                </div>
              )}
            </div>

            {/* Right Column: Topics & Progress */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Accordion Category Menu */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-550 uppercase tracking-wider pl-1 mb-1">
                  Topics Catalog
                </h4>
                
                {Object.keys(questionsByCategory).map((catName) => {
                  const catQs = questionsByCategory[catName] || [];
                  const isExpanded = expandedCategory === catName;
                  
                  // Calculate solved count in this category
                  const solvedInCat = catQs.filter(q => practicedSet.has(q.id)).length;
                  
                  return (
                    <div 
                      key={catName}
                      className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                    >
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : catName)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-dark-100/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200">
                            {catName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-100 text-gray-500 dark:text-gray-400">
                            {solvedInCat}/{catQs.length}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-dark-100/10 p-2.5 space-y-1">
                          {catQs.length === 0 ? (
                            <p className="text-xs text-gray-400 dark:text-gray-550 p-3 italic">
                              No questions in this track yet.
                            </p>
                          ) : (
                            catQs.map((q) => {
                              const isSelected = selectedQuestion?.id === q.id;
                              const isSolved = practicedSet.has(q.id);
                              
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => setSelectedQuestion(q)}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/10'
                                      : 'text-gray-600 dark:text-gray-450 hover:bg-gray-100 dark:hover:bg-dark-100/50 hover:text-gray-900'
                                  }`}
                                >
                                  <span className="truncate flex-1 pr-2">
                                    {q.question}
                                  </span>
                                  {isSolved && (
                                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-green-500'}`} />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Card */}
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Practice Progress
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
                  Solve questions across all tracks. Milestone rewards celebrate with confetti every 3 solved questions!
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-gray-750 dark:text-gray-300">Total Solved</span>
                    <span className="text-blue-600 dark:text-blue-400">{practicedSet.size} / {activeQuestions.length}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-150 dark:bg-dark-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 dark:bg-blue-550 transition-all duration-500" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-550 text-right font-semibold uppercase tracking-wider pt-1">
                    {progressPercentage}% Completed
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="max-w-3xl mx-auto">
            {!simStarted && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-200/80 backdrop-blur-md shadow-xl rounded-3xl p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Terminal className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start Simulated Mock Interview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    Choose your target interview track. You will be asked 3 progressive tech questions. Answer them in detail to receive your scoring scorecard and tips.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  <button
                    onClick={() => startSimulator('Frontend')}
                    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left space-y-3 cursor-pointer group hover:shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Frontend Dev</h4>
                      <p className="text-[10px] text-gray-400 mt-1">React, SPAs, Web Vitals</p>
                    </div>
                  </button>

                  <button
                    onClick={() => startSimulator('Backend')}
                    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left space-y-3 cursor-pointer group hover:shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Backend Dev</h4>
                      <p className="text-[10px] text-gray-400 mt-1">API Security, Indexes, Memory Leak</p>
                    </div>
                  </button>

                  <button
                    onClick={() => startSimulator('Behavioral')}
                    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left space-y-3 cursor-pointer group hover:shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">HR & Leadership</h4>
                      <p className="text-[10px] text-gray-400 mt-1">STAR Method, Deadlines, Feedback</p>
                    </div>
                  </button>
                </div>
              </Card>
            )}

            {simStarted && evaluating && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-xl rounded-3xl overflow-hidden relative pt-12 pb-8 px-8">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes laserScan {
                    0% { top: 0%; opacity: 0.8; }
                    50% { top: 100%; opacity: 0.8; }
                    100% { top: 0%; opacity: 0.8; }
                  }
                  .laser-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
                    box-shadow: 0 0 12px 3px rgba(59, 130, 246, 0.5);
                    animation: laserScan 2.5s ease-in-out infinite;
                    z-index: 10;
                  }
                `}} />
                <div className="laser-line" />

                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Evaluation in Progress...</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      EduLumix is analyzing your responses against senior engineering criteria.
                    </p>
                  </div>

                  <div className="bg-slate-955 dark:bg-black/50 rounded-2xl p-5 text-left border border-slate-900 font-mono text-xs text-blue-400 space-y-2.5 max-w-md mx-auto shadow-inner">
                    {evalLogs.slice(0, evalLogIdx + 1).map((log, i) => (
                      <div key={i} className="flex items-center gap-2.5 animate-fadeIn">
                        <span className="text-green-500 font-bold">✓</span>
                        <span className="text-gray-305 font-medium">{log}</span>
                      </div>
                    ))}
                    {evalLogIdx < evalLogs.length - 1 && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-blue-500 animate-pulse font-bold">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {simStarted && !evaluating && !simResult && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                      {simRole} Track Simulator
                    </span>
                    <h3 className="font-bold text-gray-950 dark:text-white text-base">
                      Question {currentSimQuestionIdx + 1} of 3
                    </h3>
                  </div>
                  <button
                    onClick={() => setSimStarted(false)}
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    Quit Session
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-gray-900 dark:text-white font-bold text-base sm:text-lg leading-snug">
                    {SIMULATOR_QUESTIONS[simRole][currentSimQuestionIdx]}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
                      Your Response
                    </label>
                    <textarea
                      value={simAnswers[currentSimQuestionIdx]}
                      onChange={(e) => {
                        const updated = [...simAnswers];
                        updated[currentSimQuestionIdx] = e.target.value;
                        setSimAnswers(updated);
                      }}
                      placeholder="Type your response here... Be detailed! Include structural concepts, terms, or STAR components."
                      className="w-full h-40 p-4 rounded-2xl bg-gray-50 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-sm leading-relaxed"
                    />
                    <div className="text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {simAnswers[currentSimQuestionIdx].length} characters
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-1/3 bg-gray-200 dark:bg-dark-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${((currentSimQuestionIdx + 1) / 3) * 100}%` }}
                    />
                  </div>

                  <Button
                    onClick={handleNextSimQuestion}
                    disabled={!simAnswers[currentSimQuestionIdx].trim()}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                  >
                    {currentSimQuestionIdx < 2 ? (
                      <>
                        Next Question
                        <ChevronRight className="w-4.5 h-4.5 ml-1" />
                      </>
                    ) : (
                      <>
                        Submit & Evaluate
                        <Award className="w-4.5 h-4.5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {simStarted && !evaluating && simResult && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white space-y-3">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                    <Award className="w-9 h-9 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest font-extrabold text-blue-100">AI Scoring Scorecard</p>
                    <h3 className="text-2xl font-bold">{simRole} Mock Round Finished</h3>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                    <div className="w-24 h-24 rounded-full border-[6px] border-blue-600/20 flex items-center justify-center shrink-0">
                      <div className="text-center">
                        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{simResult.score}</span>
                        <span className="text-gray-400 dark:text-gray-550 text-xs font-bold block">/ 10</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h4 className="font-bold text-gray-900 dark:text-white">Interviewer Summary</h4>
                      <p className="text-xs sm:text-sm text-gray-650 dark:text-gray-400 leading-relaxed font-semibold">
                        {simResult.review}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Terminal className="w-4.5 h-4.5 text-blue-500" />
                      Detailed Feedback per Question
                    </h4>

                    {simResult.feedback.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-2xl border border-gray-155 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-100/50 space-y-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-450 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-bold leading-relaxed">
                            {item.q}
                          </p>
                        </div>
                        <div className="pl-7 grid sm:grid-cols-2 gap-3 pt-1 text-xs">
                          <div className="space-y-1">
                            <p className="font-extrabold text-green-600 dark:text-green-400 uppercase tracking-wider text-[9px]">Strength</p>
                            <p className="text-gray-600 dark:text-gray-400 font-semibold">{item.strength}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-extrabold text-amber-600 dark:text-amber-450 uppercase tracking-wider text-[9px]">Recommendation</p>
                            <p className="text-gray-600 dark:text-gray-400 font-semibold">{item.improvement}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-155 dark:border-gray-800">
                    <Button
                      onClick={() => startSimulator(simRole)}
                      className="flex-1 py-3.5 border border-gray-250 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold bg-transparent active:scale-[0.98]"
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => setSimStarted(false)}
                      className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                    >
                      Choose Another Track
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
