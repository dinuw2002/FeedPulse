"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      // Requirement 3.3/3.4: Fetch with query params
      const query = new URLSearchParams({
        category: filterCategory,
        status: filterStatus,
      }).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback?${query}`);
      const data = await res.json();
      setFeedbackList(data);
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchFeedback();
  }, [filterCategory, filterStatus]);

  // Requirement 3.5: Update Status function
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchFeedback(); // Refresh the list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin FeedPulse</h1>
          
          <div className="flex gap-4">
            <select 
              className="p-2 border rounded-md text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Improvement">Improvement</option>
            </select>

            <select 
              className="p-2 border rounded-md text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium italic">Loading feedback...</div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
            No feedback found matching these filters.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Feedback & AI Summary</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sentiment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbackList.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.ai_summary || "Processing..."}</p>
                      <div className="flex gap-1 mt-2">
                        {item.ai_tags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.ai_sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                        item.ai_sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.ai_sentiment || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`font-mono font-bold ${item.ai_priority_score > 7 ? 'text-red-600' : 'text-indigo-600'}`}>
                        {item.ai_priority_score || 0}/10
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-gray-600 font-medium"
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