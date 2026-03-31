"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, avgPriority: 0, topTag: "N/A" });
  const [loading, setLoading] = useState(true);
  const [isMounting, setIsMounting] = useState(true);
  
  
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();


  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("Stats fetch error", err);
    }
  };

  
  const fetchFeedback = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setLoading(true);
    try {
      const query = new URLSearchParams({
        category: filterCategory,
        status: filterStatus,
        search,
        sortBy,
        page: String(page),
        limit: "10"
      }).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.replace("/login");
        return;
      }

      const json = await res.json();
      setFeedbackList(json.data);
      setTotalPages(json.pagination.pages);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, search, sortBy, page, router]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login");
    } else {
      setIsMounting(false);
      fetchFeedback();
      fetchStats();
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
      if (res.ok) {
        fetchFeedback();
        fetchStats();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleGenerateReport = async () => {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/weekly-report`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  alert(data.summary);
};

  if (isMounting) return <div className="min-h-screen bg-gray-50 flex items-center justify-center italic text-gray-400">Verifying session...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Feedback", value: stats.total, color: "text-blue-600" },
            { label: "Open Items", value: stats.open, color: "text-orange-600" },
            { label: "Avg Priority", value: `${stats.avgPriority}/10`, color: "text-red-600" },
            { label: "Top Tag", value: `#${stats.topTag}`, color: "text-indigo-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <button 
            onClick={handleGenerateReport}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
             >
              📊 Generate Weekly AI Report
        </button>

        <header className="mb-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 transition uppercase">Sign Out</button>
            </div>

            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border text-sm font-bold text-gray-600">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="hover:text-indigo-600 disabled:opacity-20">Prev</button>
              <span className="text-gray-300">|</span>
              <span>Page {page} of {totalPages}</span>
              <span className="text-gray-300">|</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="hover:text-indigo-600 disabled:opacity-20">Next</button>
            </div>
          </div>
          
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1 relative">
              <input 
                type="text"
                placeholder="Search keywords..."
                className="w-full p-2.5 pl-4 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select 
              className="p-2.5 bg-white border rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Sort: Latest</option>
              <option value="ai_priority_score">Sort: Priority</option>
              <option value="ai_sentiment">Sort: Sentiment</option>
            </select>

            <select 
              className="p-2.5 bg-white border rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            >
              <option value="All">All Categories</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature</option>
              <option value="Improvement">Improvement</option>
            </select>

            <select 
              className="p-2.5 bg-white border rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-black tracking-widest uppercase">Syncing...</div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            No entries found.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Analysis</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Sentiment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {feedbackList.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{item.category}</span>
                        <p className="font-bold text-gray-900 leading-none">{item.title}</p>
                      </div>
                      <p className="text-gray-500 line-clamp-2 italic mb-2">"{item.ai_summary || "No summary."}"</p>
                      <div className="flex flex-wrap gap-1">
                        {item.ai_tags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full font-medium text-indigo-600 border border-indigo-100">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
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
                          <span className="font-mono font-bold text-gray-700">{item.ai_priority_score || 0}/10</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
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