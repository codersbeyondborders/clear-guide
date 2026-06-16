import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AccessibleManualViewer } from '../components/viewer/AccessibleManualViewer';

export function ManualView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 font-sans">
        <p className="text-slate-500 text-sm">No manual ID provided.</p>
        <button
          onClick={() => navigate('/user')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <AccessibleManualViewer manualId={id} />
    </div>
  );
}
