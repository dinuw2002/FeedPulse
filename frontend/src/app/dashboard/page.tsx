"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounting, setIsMounting] = useState(true); // Prevents UI "flashing"
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const router = useRouter();

  // Memoized fetch function so it can be reused safely in effects
  const fetchFeedback = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setLoading(true);
    try {
      const query = new URLSearchParams({
        category: filterCategory,
        status: filterStatus,
      }).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.replace("/login");
        return;
      }

      const data = await res.json();
      setFeedbackList(data);
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, router]);

  // Handle Authentication and initial load
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login");
    } else {
      setIsMounting(false); // Auth confirmed, show the UI
      fetchFeedback();
    }
  }, [fetchFeedback, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.replace("/login");
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) fetchFeedback(); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Prevent rendering if still checking auth to avoid UI flash
  if (isMounting) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center italic text-gray-400">Verifying session...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Admin FeedPulse</h1>
            <button 
              onClick={handleLogout}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition uppercase tracking-wider"
            >
              Logout Session
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              className="p-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Improvement">Improvement</option>
            </select>

            <select 
              className="p-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">Loading feedback...</div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            No feedback found matching these filters.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Feedback & AI Analysis</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Sentiment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {feedbackList.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900 leading-none mb-1">{item.title}</p>
                      <p className="text-gray-500 line-clamp-2 italic mb-2">"{item.ai_summary || "No AI summary available."}"</p>
                      <div className="flex flex-wrap gap-1">
                        {item.ai_tags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full font-medium text-indigo-600 border border-indigo-100">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${
                        item.ai_sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                        item.ai_sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.ai_sentiment || "Neutral"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${item.ai_priority_score > 7 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                               style={{ width: `${(item.ai_priority_score || 0) * 10}%` }}
                             />
                          </div>
                          <span className="font-mono font-bold text-gray-700">
                            {item.ai_priority_score || 0}/10
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}