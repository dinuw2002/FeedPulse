"use client";
import { useState } from "react";


const MOCK_FEEDBACK = [
  {
    _id: "1",
    title: "Dark mode is missing",
    category: "Improvement",
    status: "New",
    ai_sentiment: "Neutral",
    ai_priority: 7,
    ai_summary: "User suggests adding dark mode for better accessibility.",
    createdAt: "2026-03-28T10:00:00Z",
  },
  {
    _id: "2",
    title: "App crashes on login",
    category: "Bug",
    status: "In Review",
    ai_sentiment: "Negative",
    ai_priority: 10,
    ai_summary: "Critical bug reported during authentication flow.",
    createdAt: "2026-03-29T08:30:00Z",
  },
];

export default function AdminDashboard() {
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FeedPulse Admin</h1>
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Logout
          </button>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Feedback", value: "24" },
            { label: "Open Items", value: "18" },
            { label: "Avg Priority", value: "6.5" },
            { label: "Top Tag", value: "UI/UX" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
            </div>
          ))}
        </div>

        
        <div className="flex gap-4 mb-6">
          <select 
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Improvement">Improvement</option>
          </select>

          <select 
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

      
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Feedback</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Sentiment</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Priority</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_FEEDBACK.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{item.ai_summary}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      item.ai_sentiment === 'Positive' ? 'bg-green-50 text-green-700' : 
                      item.ai_sentiment === 'Negative' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.ai_sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 w-12">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${item.ai_priority * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{item.ai_priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={item.status}
                      className="text-sm border-none bg-transparent font-medium text-gray-600 focus:ring-0 cursor-pointer"
                      onChange={() => {}} 
                    >
                      <option>New</option>
                      <option>In Review</option>
                      <option>Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}