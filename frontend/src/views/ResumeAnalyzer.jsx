'use client';

import { useState } from 'react';
import { 
  FileText, Upload, Brain, CheckCircle, AlertTriangle, 
  ArrowRight, Search, Sparkles, MapPin, Briefcase, 
  Trash2, FileCheck, ArrowUpRight, Clock, Eye, Tag
} from 'lucide-react';
import { Card, CardContent, Button } from '@heroui/react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import SEO from '../components/seo/SEO';
import CompanyAvatar from '../components/common/CompanyAvatar';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState('feedback'); // 'feedback' or 'jobs'
  const [errorMsg, setErrorMsg] = useState('');

  // Handle file uploads (PDF, DOCX, TXT, Image)
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const allowedExtensions = /(\.pdf|\.docx|\.txt|\.png|\.jpg|\.jpeg|\.webp)$/i;
    if (!allowedExtensions.exec(uploadedFile.name)) {
      toast.error('Unsupported file format. Please upload PDF, DOCX, TXT, or Image (PNG/JPEG/WebP).');
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    // Create object URL for PDF or Image preview
    if (uploadedFile.type === 'application/pdf' || uploadedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload your resume file.');
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/resume-analyzer/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success || response.data?.score !== undefined) {
        setResult(response.data);
        toast.success('Resume analyzed successfully!');
      } else {
        setErrorMsg('Failed to parse analysis results. Please check your document and try again.');
        toast.error('Failed to parse analysis results.');
      }
    } catch (error) {
      console.warn('Resume analysis error:', error.message || error);
      const msg = error.response?.data?.message || 'Server error. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileName('');
    setPreviewUrl('');
    setResult(null);
    setActiveReportTab('feedback');
    setErrorMsg('');
  };

  // Create URL-friendly slug
  const createSlug = (job) => {
    const titleSlug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const companySlug = job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${titleSlug}-${companySlug}-${job._id}`;
  };

  // Get category color matching platform jobs list
  const getCategoryColor = (category) => {
    const colors = {
      'IT Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Non IT Job': 'bg-blue-200 dark:bg-blue-600/20 text-blue-800 dark:text-blue-200',
      'Walk In Drive': 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400',
      'Govt Job': 'bg-blue-300 dark:bg-blue-700/20 text-blue-900 dark:text-blue-100',
      'Internship': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'Part Time Job': 'bg-sky-200 dark:bg-sky-600/20 text-sky-800 dark:text-sky-200',
      'Remote Job': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Others': 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
    };
    return colors[category] || colors['Non IT Job'];
  };

  // Helper to color code the ATS score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 border-green-500 dark:text-green-400';
    if (score >= 60) return 'text-amber-500 border-amber-500 dark:text-amber-400';
    return 'text-red-500 border-red-500 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300 py-10">
      <SEO 
        title="AI Resume Analyzer & ATS Grader | EduLumix"
        description="Optimize your resume for applicant tracking systems (ATS). Upload or paste your resume text and get an instant ATS score, keyword audit, and matching fresher job listings."
        keywords="resume grader, ats score, resume builder, resume analyzer, cv grader, fresher resume, career guidance"
      />
      
      <div className="w-full px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 mb-3 border border-blue-100 dark:border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered ATS Optimization
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
            AI Resume Analyzer & Job Matcher
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
            Upload your resume or paste the content to receive an instant ATS score, expert structure analysis, missing keywords, and compatible fresher jobs tailored to your skills.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Upload / Paste Section */}
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Your Resume Details
                </h2>

                <div className="space-y-4">
                  {!fileName ? (
                    <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 dark:bg-dark-300/30">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Click to upload or drag files</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accepts PDF, DOCX, TXT, and Images</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">
                              {fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">File loaded successfully</p>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          onClick={handleReset}
                          className="rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Small Preview Box */}
                      {previewUrl && (
                        <div className="mt-4 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-dark-300">
                          <div className="px-3.5 py-2 bg-gray-100 dark:bg-dark-100 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Resume Preview</span>
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                              {file?.type === 'application/pdf' ? 'PDF' : 'IMAGE'}
                            </span>
                          </div>
                          {file?.type === 'application/pdf' ? (
                            <iframe 
                              src={`${previewUrl}#toolbar=0`} 
                              className="w-full h-80 border-none" 
                              title="PDF Preview"
                            />
                          ) : (
                            <div className="p-3 flex justify-center items-center">
                              <img 
                                src={previewUrl} 
                                alt="Image Preview" 
                                className="w-full max-h-80 object-contain rounded-lg" 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-950/30 rounded-xl flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      <strong>Tip:</strong> PDF, DOCX, TXT, and Image (JPEG/PNG/WebP) formats are fully supported. The AI will scan the file layout directly.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {result && (
                    <Button
                      variant="ghost"
                      color="secondary"
                      onClick={handleReset}
                      className="flex-1 font-semibold rounded-xl"
                    >
                      Clear Data
                    </Button>
                  )}
                  <Button
                    color="primary"
                    onClick={handleAnalyze}
                    isLoading={loading}
                    className="flex-1 font-semibold rounded-xl shadow-md bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Analyzing Structure...' : 'Analyze Resume'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Dynamic Analysis Report & Matched Jobs */}
          <div className="space-y-6">
            {/* 1. Loader State */}
            {loading && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full animate-pulse" />
                    <Brain className="w-8 h-8 text-blue-600 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI ATS Scanning in progress...</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Llama 3.1 is reading your resume structure, detecting matching keywords, identifying strengths, and looking up open positions...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. Idle / Error State */}
            {!loading && !result && (
              errorMsg ? (
                <Card className="border border-red-200 dark:border-red-950/30 bg-red-50/20 dark:bg-red-950/10 shadow-sm rounded-2xl">
                  <CardContent className="p-8 text-center py-12 space-y-4">
                    <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto animate-pulse" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Analysis Rejected</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed font-semibold">
                        {errorMsg}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        color="danger"
                        variant="flat"
                        onClick={() => {
                          setErrorMsg('');
                          handleReset();
                        }}
                        className="rounded-xl font-semibold text-xs"
                      >
                        Upload Another File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
                  <CardContent className="p-8 text-center py-16">
                    <Brain className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Analysis Done Yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Upload or paste your resume text on the left, then click "Analyze Resume" to view your ATS score and job matches.
                    </p>
                  </CardContent>
                </Card>
              )
            )}

            {/* 3. Output Analysis Result */}
            {!loading && result && (
              <div className="space-y-6">
                {/* Switcher Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-100 rounded-xl mb-4 border border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveReportTab('feedback')}
                    className={`flex-1 py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all ${
                      activeReportTab === 'feedback'
                        ? 'bg-white dark:bg-dark-200 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-800/50'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Resume Feedback
                  </button>
                  <button
                    onClick={() => setActiveReportTab('jobs')}
                    className={`flex-1 py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all ${
                      activeReportTab === 'jobs'
                        ? 'bg-white dark:bg-dark-200 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-800/50'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Matched Jobs ({result.matchingJobs?.length || 0})
                  </button>
                </div>

                {activeReportTab === 'feedback' ? (
                  <div className="space-y-6">
                    {/* ATS Score Header */}
                    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* Circle Score Gauge */}
                          <div className={`w-24 h-24 rounded-full border-[6px] flex flex-col items-center justify-center flex-shrink-0 ${getScoreColor(result.score)}`}>
                            <span className="text-2xl font-bold font-mono">{result.score}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Score</span>
                          </div>
                          
                          <div className="text-center sm:text-left space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resume Analysis Report</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Suggested Category: <span className="font-semibold text-blue-600 dark:text-blue-400">{result.suggestedCategory}</span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 pt-1 leading-relaxed">
                              {result.score >= 80 
                                ? 'Excellent! Your resume has a strong ATS profile and matches standard hiring criteria.' 
                                : result.score >= 60 
                                ? 'Good, but there is room for optimization. Focus on adding missing keywords and metrics.' 
                                : 'Improvement needed. Add critical keywords and details to improve your rating.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detected Skills */}
                    {result.skills?.length > 0 && (
                      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
                        <CardContent className="p-6">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Detected Skills & Technologies</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-500" /> Key Strengths
                          </h4>
                          <ul className="space-y-2">
                            {result.strengths?.map((str, idx) => (
                              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed flex gap-2">
                                <span className="text-green-500">•</span> {str}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Improvements */}
                      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
                        <CardContent className="p-5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Actions to Improve
                          </h4>
                          <ul className="space-y-2">
                            {result.improvements?.map((imp, idx) => (
                              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed flex gap-2">
                                <span className="text-amber-500">•</span> {imp}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Missing Keywords */}
                    {result.missingKeywords?.length > 0 && (
                      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 shadow-sm rounded-2xl">
                        <CardContent className="p-6">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Recommended Missing Keywords</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.missingKeywords.map((kw) => (
                              <span
                                key={kw}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                              >
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Call to Action Button */}
                    <div className="mt-2">
                      <Button
                        color="primary"
                        onClick={() => setActiveReportTab('jobs')}
                        className="w-full font-bold py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2"
                      >
                        Explore Matched Jobs <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                        Recommended Jobs matching your Resume
                      </h3>
                      <button 
                        onClick={() => setActiveReportTab('feedback')}
                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        ← Back to feedback
                      </button>
                    </div>
                    
                    {result.matchingJobs?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {result.matchingJobs.map((job) => {
                          const jobPath = `/jobs/${createSlug(job)}`;
                          return (
                            <div
                              key={job._id}
                              onClick={() => window.location.href = jobPath}
                              className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer group"
                            >
                              <div className="p-5">
                                <div className="flex items-start gap-4 mb-4">
                                  <CompanyAvatar
                                    company={job.company}
                                    logoUrl={job.companyLogo}
                                    size="lg"
                                    rounded="xl"
                                    className="flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-1 text-sm sm:text-base">
                                      {job.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                      {job.company}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate text-xs sm:text-sm">{job.location}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm">{job.experience}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getCategoryColor(job.category)}`}>
                                    <Tag className="w-3 h-3" />
                                    {job.category}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                                    job.status === 'Closed'
                                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                                      : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                                  }`}>
                                    {job.status === 'Closed' ? 'Closed' : 'Open'}
                                  </span>
                                </div>
                              </div>

                              <div className="px-5 py-3 bg-gray-50 dark:bg-dark-100 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    {job.views || 0}
                                  </span>
                                </div>
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                  Details →
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Card className="border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-200 rounded-2xl py-6 text-center">
                        <CardContent>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            No direct jobs matches found for category <strong>{result.suggestedCategory}</strong>. Browse other categories in Jobs section!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
