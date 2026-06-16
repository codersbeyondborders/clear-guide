import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Settings, BarChart2, Trash2 } from 'lucide-react';
import logo from '../assets/logo.png';

interface Manual {
  id: string;
  productName: string;
  manufacturer: string;
  status: string;
  lastUpdated: string;
}

export function ManufacturerDashboard() {
  const navigate = useNavigate();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchManuals(); }, []);

  const fetchManuals = async () => {
    try {
      const res = await fetch('/api/manuals');
      const data = await res.json();
      setManuals(data);
    } catch (error) {
      console.error('Failed to fetch manuals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this manual?')) {
      try {
        await fetch(`/api/manuals/${id}`, { method: 'DELETE' });
        setManuals(manuals.filter(m => m.id !== id));
      } catch (error) {
        console.error('Failed to delete manual', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/manufacturer/login')}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img src={logo} alt="ClearGuide" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium hidden md:block">BrewTech Inc.</span>
            <div className="w-9 h-9 bg-emerald-100 rounded-full text-emerald-700 flex items-center justify-center font-bold text-sm">
              BT
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Page title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Manuals</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage and update your digital product guides.</p>
          </div>
          <button
            onClick={() => navigate('/manufacturer/new')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Manual
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading manuals...</div>
        ) : manuals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No manuals yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first accessible manual to get started.</p>
            <button
              onClick={() => navigate('/manufacturer/new')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Create Manual
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {manuals.map(manual => (
              <div key={manual.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    manual.status === 'Published'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {manual.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{manual.productName}</h3>
                <p className="text-xs text-slate-400 mb-5 flex-1">
                  Last updated: {new Date(manual.lastUpdated).toLocaleDateString()}
                </p>
                <div className="flex gap-2 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => navigate(`/manufacturer/edit/${manual.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 py-2 rounded-full transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/manufacturer/analytics/${manual.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 py-2 rounded-full transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5" /> Analytics
                  </button>
                  <button
                    onClick={() => handleDelete(manual.id)}
                    aria-label="Delete manual"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
