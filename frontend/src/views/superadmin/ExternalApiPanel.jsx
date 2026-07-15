'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  FileText,
  Newspaper,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  Database,
  Globe,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Server,
  Terminal,
  AlertTriangle,
  X,
  Play
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ExternalApiPanel() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'resources' | 'blogs'
  const [platformStats, setPlatformStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Syncing states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogId, setSyncLogId] = useState(null);
  const [syncStep, setSyncStep] = useState(0); // 0: Idle, 1: Initiating, 2: Fetching, 3: Parsing, 4: Storing
  const [syncStatus, setSyncStatus] = useState(null); // 'running' | 'completed' | 'failed'

  // Logs modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch Platform Counts
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/stats/platform');
      if (res.data?.success) {
        setPlatformStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Get Task Name from Active Tab
  const getTaskName = (tab) => {
    if (tab === 'jobs') return 'fetch-external-jobs';
    if (tab === 'resources') return 'fetch-external-resources';
    return 'fetch-external-blogs';
  };

  // Fetch Sync History
  const fetchHistory = useCallback(async (tab) => {
    setHistoryLoading(true);
    try {
      const taskName = getTaskName(tab);
      const res = await api.get(`/sync-logs/${taskName}`);
      if (res.data?.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load sync history.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab, fetchHistory]);

  // Tab Details Map
  const tabDetails = {
    jobs: {
      title: 'Fresher Jobs Sync',
      countKey: 'jobsPosted',
      countLabel: 'Total Jobs in DB',
      icon: Briefcase,
      sources: ['Adzuna API (India IT Jobs)', 'JSearch API (Google Talent Network)'],
      color: 'blue',
      apiEndpoint: '/jobs/fetch-external',
    },
    resources: {
      title: 'Learning Resources Sync',
      countKey: 'techResources',
      countLabel: 'Total Resources in DB',
      icon: FileText,
      sources: ['Dev.to Public API (JavaScript, React, Node, WebDev)', 'Medium RSS Feeds (Coding & Engineering)'],
      color: 'green',
      apiEndpoint: '/resources/fetch-external',
    },
    blogs: {
      title: 'Tech Blogs & Events Sync',
      countKey: 'techBlogs',
      countLabel: 'Total Blogs in DB',
      icon: Newspaper,
      sources: ['Dev.to Articles API (Programming & Tutorials)', 'Medium Blogs (Tech Trends & Career)'],
      color: 'purple',
      apiEndpoint: '/blogs/fetch-external',
    },
  };

  const currentTabInfo = tabDetails[activeTab];

  // Pipeline step descriptions
  const pipelineSteps = [
    { label: 'Connect Source', desc: 'Establishing connection to external REST APIs' },
    { label: 'Download Data', desc: 'Retrieving payload pages, caching raw results' },
    { label: 'Map Schema', desc: 'Parsing variables, checking duplicates' },
    { label: 'Commit DB', desc: 'Upserting new posts and flagging stale ones' }
  ];

  // Poll running sync status
  useEffect(() => {
    let pollInterval;
    if (isSyncing && syncLogId) {
      // Step simulation
      let stepCounter = 1;
      const stepTimer = setInterval(() => {
        setSyncStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 3000);

      // Status polling
      pollInterval = setInterval(async () => {
        try {
          const res = await api.get(`/sync-logs/status/${syncLogId}`);
          if (res.data?.success && res.data.data) {
            const log = res.data.data;
            if (log.status !== 'running') {
              // Sync finished
              clearInterval(pollInterval);
              clearInterval(stepTimer);
              setSyncStatus(log.status);
              setSyncStep(4);
              setIsSyncing(false);
              
              if (log.status === 'completed') {
                toast.success('Synchronization completed successfully!');
              } else {
                toast.error(`Sync failed: ${log.error || 'Check logs for details'}`);
              }
              // Refresh counts and history
              fetchStats();
              fetchHistory(activeTab);
            }
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 2000);

      return () => {
        clearInterval(pollInterval);
        clearInterval(stepTimer);
      };
    }
  }, [isSyncing, syncLogId, activeTab, fetchStats, fetchHistory]);

  // Handle Trigger Sync
  const handleTriggerSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStep(1);
    setSyncStatus('running');
    setSyncLogId(null);

    try {
      // Default configurations for fetching
      const body = activeTab === 'jobs' 
        ? { adzunaLimit: 20, jsearchPages: 2 } 
        : activeTab === 'resources'
        ? { devToLimit: 100, mediumLimit: 50 }
        : { devToPerPage: 20, mediumLimit: 20 };

      const res = await api.post(currentTabInfo.apiEndpoint, body);
      if (res.data?.success && res.data.logId) {
        setSyncLogId(res.data.logId);
        toast.loading('Synchronization triggered...', { id: 'sync-trigger' });
        setTimeout(() => toast.dismiss('sync-trigger'), 1500);
      } else {
        throw new Error('Failed to retrieve log configuration from backend.');
      }
    } catch (err) {
      setIsSyncing(false);
      setSyncStep(0);
      setSyncStatus('failed');
      toast.error(err.response?.data?.message || err.message || 'Trigger execution failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            External API Sync Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Centrally trigger, throttle, and monitor external data imports
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={statsLoading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:text-gray-300 dark:bg-dark-200 dark:hover:bg-dark-100 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-gray-200/60 dark:bg-dark-200 p-1.5 rounded-xl max-w-lg">
        {Object.entries(tabDetails).map(([key, value]) => {
          const TabIcon = value.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => {
                if (!isSyncing) setActiveTab(key);
              }}
              disabled={isSyncing}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base ${
                isActive
                  ? 'bg-white dark:bg-dark-100 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {key === 'jobs' ? 'Jobs' : key === 'resources' ? 'Resources' : 'Blogs'}
            </button>
          );
        })}
      </div>

      {/* Grid of details & trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info & Stats */}
        <div className="bg-white dark:bg-dark-200 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md">
              Configuration
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentTabInfo.title}
            </h2>
            
            {/* Total count card */}
            <div className="bg-gray-50 dark:bg-dark-100 p-4 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {currentTabInfo.countLabel}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                      platformStats?.[currentTabInfo.countKey] ?? 0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Target sources list */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                External Target Sources:
              </h3>
              <ul className="space-y-2">
                {currentTabInfo.sources.map((src, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className={`mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-white rounded-xl shadow-lg transition-all ${
              isSyncing
                ? 'bg-gray-400 cursor-not-allowed'
                : activeTab === 'jobs'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : activeTab === 'resources'
                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
            }`}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Syncing Active...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Fetch & Sync Now
              </>
            )}
          </button>
        </div>

        {/* Pipeline Animation Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-200 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md">
              Visual Execution pipeline
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Data Pipeline Status
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive timeline of request progression, schema validation, and storage.
            </p>
          </div>

          {/* Animation Steps wrapper */}
          <div className="my-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {pipelineSteps.map((step, idx) => {
              const stepNum = idx + 1;
              const isCompleted = !isSyncing && syncStatus === 'completed' || (isSyncing && syncStep > stepNum);
              const isActive = isSyncing && syncStep === stepNum;
              const isFailed = !isSyncing && syncStatus === 'failed' && syncStep === stepNum;
              
              let bubbleBg = 'bg-gray-100 dark:bg-dark-100 border-gray-200 dark:border-gray-800 text-gray-400';
              let lineBg = 'bg-gray-200 dark:bg-gray-800';

              if (isCompleted) {
                bubbleBg = 'bg-green-500 border-green-600 text-white';
                lineBg = 'bg-green-500';
              } else if (isActive) {
                bubbleBg = 'bg-blue-500 border-blue-600 text-white animate-pulse';
                lineBg = 'bg-blue-300 dark:bg-blue-900';
              } else if (isFailed) {
                bubbleBg = 'bg-red-500 border-red-600 text-white';
                lineBg = 'bg-red-300 dark:bg-red-950';
              }

              return (
                <div key={idx} className="flex md:flex-col items-center gap-4 md:text-center relative">
                  {/* Bubble */}
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg z-10 transition-all ${bubbleBg}`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isFailed ? <XCircle className="w-6 h-6" /> : stepNum}
                  </div>

                  {/* Horizontal line for desktop connecting bubbles */}
                  {idx < 3 && (
                    <div className={`hidden md:block absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 z-0 ${
                      isSyncing && syncStep > stepNum ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'
                    }`} />
                  )}

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm ${isActive ? 'text-blue-500' : 'text-gray-900 dark:text-white'}`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5 truncate md:whitespace-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running status summary footer */}
          <div className="bg-gray-50 dark:bg-dark-100 p-4 rounded-xl flex items-center justify-between text-sm border border-gray-100 dark:border-gray-800">
            <span className="font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-500" />
              Pipeline Engine:
            </span>
            <span className={`font-semibold ${
              isSyncing ? 'text-blue-500 animate-pulse' : syncStatus === 'completed' ? 'text-green-500' : syncStatus === 'failed' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {isSyncing ? `Running (Step ${syncStep}/4)` : syncStatus === 'completed' ? 'Idle - Last Run Succeeded' : syncStatus === 'failed' ? 'Idle - Last Run Failed' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Sync history table */}
      <div className="bg-white dark:bg-dark-200 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Sync Logs & Metrics History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Historical logs containing created, skipped, and errored document counts
            </p>
          </div>
          <span className="text-xs font-semibold bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800">
            Showing last {history.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-400">Loading sync history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-600">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
              No sync log history recorded. Trigger a sync to generate records.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-100 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">Trigger Date / Time</th>
                  <th className="px-6 py-4">Triggered By</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Created (New)</th>
                  <th className="px-6 py-4 text-center">Skipped</th>
                  <th className="px-6 py-4 text-center">Errors</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {history.map((log) => {
                  const dateStr = new Date(log.startTime).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = new Date(log.startTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });
                  const stats = log.results || {};
                  
                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-100/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {dateStr}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeStr}
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-400">
                        {log.triggeredBy === 'cron' ? (
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-100 border border-gray-200 dark:border-gray-800 text-xs">
                            Cron Scheduler
                          </span>
                        ) : (
                          'Super Admin'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'completed'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                            : log.status === 'failed'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 animate-pulse'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-green-600 dark:text-green-400">
                        {stats.created ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {stats.skipped ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-red-500">
                        {log.syncErrors?.length || (log.error ? 1 : 0)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Logs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Diagnostics Logs Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-dark-250 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-dark-200">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    Execution Log Diagnostics
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Sync Run ID: {selectedLog._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable logs contents */}
            <div className="p-6 overflow-y-auto space-y-5 bg-white dark:bg-dark-300">
              {/* Sync Metrics summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="text-xs text-gray-500">Execution Status</div>
                  <div className={`text-base font-bold capitalize mt-1 ${
                    selectedLog.status === 'completed' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {selectedLog.status}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    {selectedLog.durationMs ? `${(selectedLog.durationMs / 1000).toFixed(2)}s` : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="text-xs text-gray-500">Created Items</div>
                  <div className="text-base font-bold text-green-500 mt-1">
                    {selectedLog.results?.created ?? 0}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <div className="text-xs text-gray-500">Skipped (Duplicated)</div>
                  <div className="text-base font-bold text-gray-500 mt-1">
                    {selectedLog.results?.skipped ?? 0}
                  </div>
                </div>
              </div>

              {/* Raw JSON or trace block */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Engine Raw Metadata:
                </h4>
                <pre className="bg-gray-950 text-gray-300 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner border border-gray-900">
                  {JSON.stringify(
                    {
                      taskName: selectedLog.taskName,
                      startTime: selectedLog.startTime,
                      endTime: selectedLog.endTime,
                      triggeredBy: selectedLog.triggeredBy,
                      metrics: selectedLog.results,
                      fatalCrashError: selectedLog.error || null,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Detailed Processing Warnings/Errors */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  Process Errors/Warnings list
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    {selectedLog.syncErrors?.length || 0}
                  </span>
                </h4>
                {selectedLog.syncErrors && selectedLog.syncErrors.length > 0 ? (
                  <div className="border border-red-200/50 dark:border-red-900/30 rounded-xl overflow-hidden divide-y divide-red-100/50 dark:divide-red-950/20">
                    {selectedLog.syncErrors.map((err, idx) => (
                      <div key={idx} className="p-3.5 bg-red-50/20 dark:bg-red-950/10 text-xs flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-600 dark:text-red-400 capitalize">
                            Source: {err.source}
                          </span>
                          {err.externalId && (
                            <span className="text-gray-400 dark:text-gray-500 font-mono">
                              Ext ID: {err.externalId}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 font-mono mt-0.5 leading-relaxed">
                          {err.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedLog.error ? (
                  <div className="p-4 bg-red-50/20 dark:bg-red-950/10 text-xs text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-xl font-mono leading-relaxed">
                    {selectedLog.error}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    No process errors occurred. Synchronization completed cleanly.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 dark:bg-dark-100 dark:hover:bg-dark-50 rounded-xl transition-colors"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
