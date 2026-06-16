import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Eye, Clock, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import logo from '../assets/logo.png';

interface AnalyticsData {
  totalViews: number;
  activeUsers: number;
  avgTimeSpent: string;
  viewsOverTime: { date: string; views: number }[];
  topAIQueries: { query: string; count: number }[];
}

export function ManualAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/manuals/${id}/analytics`);
        if (!res.ok) throw new Error('Failed to fetch');
        setData(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading analytics...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load analytics.</div>;

  const kpis = [
    { label: 'Total Views', value: data.totalViews.toLocaleString(), icon: <Eye className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50' },
    { label: 'Active Users (30d)', value: data.activeUsers.toLocaleString(), icon: <Users className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Avg. Time Spent', value: data.avgTimeSpent, icon: <Clock className="w-5 h-5 text-violet-500" />, bg: 'bg-violet-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/manufacturer')}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img src={logo} alt="ClearGuide" className="h-8 w-auto" />
          <span className="text-slate-400 text-sm hidden md:block">/ Manual {id}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Views Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <h2 className="text-base font-semibold text-slate-900 mb-6">Views Over Time (Last 7 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dx={-8} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Queries Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Top AI Support Queries</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topAIQueries} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} width={120} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
