'use client';

export default function RefreshButton() {
  return (
    <button 
      onClick={() => window.location.reload()} 
      className="px-6 py-3 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors"
    >
      Refresh Task
    </button>
  );
}
