'use client';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from '@/utils/reactRouterCompat';
import { 
  ClipboardList, Clock, Users, Star, Target, ChevronRight, 
  Award, Brain, CheckCircle, ArrowLeft, Share2, Timer,
  AlertCircle, Play, BookOpen, HelpCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import { mockTestService } from '../services/dataService';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';
import { generateMockTestSchema, generateBreadcrumbSchema } from '../utils/seoSchemas';
import AdSlot from '../components/ads/AdSlot';
import { AD_SLOTS } from '../config/ads';

const MockTestDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    fetchTest();
  }, [slug]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0 && !testSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, testSubmitted]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await mockTestService.getBySlug(slug);
      if (response.data.success) {
        setTest(response.data.data);
        setTimeLeft((response.data.data.duration || 30) * 60);
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test');
      navigate('/mock-test');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (test?.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!test?.questions) return;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    test.questions.forEach((q, index) => {
      const marks = q.marks || 1;
      totalMarks += marks;
      
      if (answers[index] === undefined) {
        unanswered++;
      } else if (answers[index] === q.correctAnswer) {
        correct++;
        obtainedMarks += marks;
      } else {
        wrong++;
      }
    });

    const percentage = Math.round((obtainedMarks / totalMarks) * 100);
    const passed = test.passingMarks ? obtainedMarks >= test.passingMarks : percentage >= 40;

    setResult({
      correct,
      wrong,
      unanswered,
      totalMarks,
      obtainedMarks,
      percentage,
      passed
    });
    setTestSubmitted(true);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: test.title,
        text: `Take this mock test: ${test.title}`,
        url: url,
      });
    } catch (error) {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Medium': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Hard': 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    };
    return colors[difficulty] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="w-full px-8 lg:px-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded w-1/4 mb-4" />
            <div className="h-64 bg-gray-200 dark:bg-dark-100 rounded-2xl mb-8" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Test not found</h2>
          <Link to="/mock-test" className="text-blue-500 hover:underline">Back to mock tests</Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Mock Test', path: '/mock-test' },
    { name: test.title, path: `/mock-test/${test.slug}` }
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateMockTestSchema(test),
      generateBreadcrumbSchema(breadcrumbs)
    ]
  };
  const testDesc = (test.description || '').replace(/<[^>]*>/g, '').slice(0, 160);
  const testKeywords = `${test.title}, mock test, ${test.subject || 'exam'}, EduLumix, Edu Lumix, edulumix`;

  // Test Results View
  if (testSubmitted && result) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <SEO
          title={`${test.title} | Mock Test | EduLumix`}
          description={testDesc || `Take ${test.title} mock test on EduLumix. Free practice test for exam preparation.`}
          keywords={testKeywords}
          url={`/mock-test/${test.slug}`}
          type="article"
          structuredData={structuredData}
        />
        <div className="w-full px-8 lg:px-12">
          <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-100 overflow-hidden">
            {/* Result Header */}
            <div className={`p-8 text-center ${result.passed ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                {result.passed ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h1>
              <p className="text-white/80">
                {result.passed ? 'You passed the test!' : 'You can do better next time!'}
              </p>
            </div>

            {/* Score */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {result.percentage}%
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {result.obtainedMarks} / {result.totalMarks} marks
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{result.correct}</div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 text-center">
                  <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{result.wrong}</div>
                  <div className="text-sm text-gray-500">Wrong</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-500/10 rounded-xl p-4 text-center">
                  <HelpCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-600">{result.unanswered}</div>
                  <div className="text-sm text-gray-500">Skipped</div>
                </div>
              </div>

              {/* Review Answers */}
              <div className="border-t border-gray-200 dark:border-dark-100 pt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Review Answers</h2>
                <div className="space-y-6">
                  {test.questions?.map((q, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === q.correctAnswer;
                    const isUnanswered = userAnswer === undefined;

                    return (
                      <div key={index} className="bg-gray-50 dark:bg-dark-100 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isUnanswered ? 'bg-gray-200 text-gray-600' :
                            isCorrect ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {index + 1}
                          </span>
                          <p className="text-gray-900 dark:text-white font-medium">{q.question}</p>
                        </div>

                        <div className="space-y-2 ml-11">
                          {q.options?.map((option, optIndex) => {
                            const isUserAnswer = userAnswer === optIndex;
                            const isCorrectAnswer = q.correctAnswer === optIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectAnswer 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                                    : isUserAnswer && !isCorrectAnswer
                                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                                    : 'border-gray-200 dark:border-dark-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                  {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                                  <span className={`${
                                    isCorrectAnswer ? 'text-blue-700 dark:text-blue-300 font-medium' :
                                    isUserAnswer && !isCorrectAnswer ? 'text-red-700 dark:text-red-300' :
                                    'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-4 ml-11 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setTestStarted(false);
                    setTestSubmitted(false);
                    setAnswers({});
                    setCurrentQuestion(0);
                    setTimeLeft((test.duration || 30) * 60);
                  }}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                  Retake Test
                </button>
                <Link
                  to="/mock-test"
                  className="flex-1 py-3 border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors text-center"
                >
                  Browse More Tests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Taking View
  if (testStarted) {
    const question = test.questions?.[currentQuestion];
    const totalQuestions = test.questions?.length || 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <SEO
          title={`${test.title} | Mock Test | EduLumix`}
          description={testDesc || `Take ${test.title} mock test on EduLumix. Free practice test for exam preparation.`}
          keywords={testKeywords}
          url={`/mock-test/${test.slug}`}
          type="article"
          structuredData={structuredData}
        />
        {/* Sticky Header */}
        <div className="bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
          <div className="w-full px-8 lg:px-12 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <h1 className="font-semibold text-gray-900 dark:text-white truncate text-sm lg:text-base">{test.title}</h1>
              </div>
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm ${
                timeLeft < 300 
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30' 
                  : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
              }`}>
                <Timer className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mobile Timer */}
        <div className={`lg:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold shadow-xl transition-all border ${
          timeLeft < 300
            ? 'bg-red-500 text-white border-red-600 animate-pulse'
            : 'bg-blue-600 text-white border-blue-700'
        }`}>
          <Timer className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
        </div>

        <div className="w-full px-4 lg:px-12 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Question Panel */}
            <div className="lg:col-span-3">
              {/* Sleek Mobile Horizontal Question Palette */}
              <div className="lg:hidden mb-3 bg-white dark:bg-dark-200 p-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Question Palette</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{Object.keys(answers).length}/{totalQuestions} Answered</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {test.questions?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-9 h-9 rounded-md font-semibold text-xs flex-shrink-0 flex items-center justify-center snap-center transition-all ${
                        currentQuestion === index
                          ? 'bg-blue-600 text-white shadow-sm scale-105'
                          : answers[index] !== undefined
                          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                          : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden select-none"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-dark-100 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">
                      Q {currentQuestion + 1}/{totalQuestions}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {question?.marks || 1} {(question?.marks || 1) > 1 ? 'marks' : 'mark'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {Object.keys(answers).length} answered
                  </div>
                </div>

                {/* Question */}
                <div className="p-5 lg:p-6">
                  <h2 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-5 leading-relaxed">
                    {question?.question}
                  </h2>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {question?.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion, index)}
                        className={`w-full p-4 min-h-[52px] rounded-lg border text-left transition-all ${
                          answers[currentQuestion] === index
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm font-medium'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-dark-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                            answers[currentQuestion] === index
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white leading-relaxed">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-dark-100 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                    Swipe left/right to browse questions
                  </span>
                  
                  {currentQuestion === totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-sm text-sm"
                    >
                      Submit Test →
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-sm"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Navigator (Desktop only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 sticky top-16">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Question Palette
                  </h3>
                </div>
                
                <div className="p-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {test.questions?.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`aspect-square rounded-md font-medium text-xs transition-all ${
                          currentQuestion === index
                            ? 'bg-blue-600 text-white shadow-sm'
                            : answers[index] !== undefined
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                            : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-dark-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 rounded-md"></span>
                    <span className="text-gray-600 dark:text-gray-400">Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-gray-100 dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-md"></span>
                    <span className="text-gray-600 dark:text-gray-400">Not Answered ({totalQuestions - Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 bg-blue-600 rounded-md"></span>
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-100">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-sm text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Info View (before starting)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <SEO
        title={`${test.title} | Mock Test | EduLumix`}
        description={testDesc || `Take ${test.title} mock test on EduLumix. Free practice test for exam preparation.`}
        keywords={testKeywords}
        url={`/mock-test/${test.slug}`}
        type="article"
        structuredData={structuredData}
      />
      {/* Back Button */}
      <div className="bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="w-full px-8 lg:px-12 py-4">
          <Link
            to="/mock-test"
            className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Mock Tests
          </Link>
        </div>
      </div>

      <div className="w-full px-8 lg:px-12 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-6 lg:p-8 mb-6 text-white">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              {test.category}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
              {test.difficulty}
            </span>
            {test.isFeatured && (
              <span className="px-2.5 py-1 bg-yellow-500 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold mb-3">{test.title}</h1>
          <p className="text-white/90 mb-4 text-sm lg:text-base">{test.description}</p>

          <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span>{test.questions?.length || 0} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>{test.duration || 30} Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{test.totalMarks || test.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0} Marks</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{test.attempts || 0} Attempts</span>
            </div>
          </div>
        </div>

        {/* In-content Ad */}
        <AdSlot slotId={AD_SLOTS.IN_ARTICLE} className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Instructions */}
            {test.instructions?.length > 0 && (
              <div className="bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  Instructions
                </h2>
                <ul className="space-y-2.5">
                  {test.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-5 h-5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Test Rules */}
            <div className="bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Test Rules</h2>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  Each question has only one correct answer
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  You can navigate between questions freely
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  Test will auto-submit when time runs out
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  You can review your answers after submission
                </li>
                {test.passingMarks && (
                  <li className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    Passing marks: {test.passingMarks} out of {test.totalMarks || test.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-dark-200 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Ready to Start?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Make sure you have {test.duration || 30} minutes of uninterrupted time
                </p>
              </div>

              <button
                onClick={handleStartTest}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Test Now
              </button>

              <button
                onClick={handleShare}
                className="w-full mt-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share Test
              </button>

              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Questions</span>
                    <span className="font-medium text-gray-900 dark:text-white">{test.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Duration</span>
                    <span className="font-medium text-gray-900 dark:text-white">{test.duration || 30} mins</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Total Marks</span>
                    <span className="font-medium text-gray-900 dark:text-white">{test.totalMarks || test.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0}</span>
                  </div>
                  {test.passingMarks && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Passing Marks</span>
                      <span className="font-medium text-gray-900 dark:text-white">{test.passingMarks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestDetails;
