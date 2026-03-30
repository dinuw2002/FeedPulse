"use client";
import { useState } from "react";
import Link from "next/link";


export default function SubmitFeedback() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Improvement",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (formData.title.trim() === "") return alert("Title is required");
    if (formData.description.length < 20) return alert("Description must be at least 20 chars");

    setLoading(true);
    try {
     
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Feedback submitted successfully!" });
        setFormData({ title: "", description: "", category: "Improvement", name: "", email: "" });
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl flex justify-end mb-4">
        <Link 
          href="/login" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.384-4.51m-11.94 0a10.005 10.005 0 0110.128-5.22" />
          </svg>
          Admin Portal
        </Link>
      </div>
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">FeedPulse</h1>
        <p className="text-gray-500 mb-6">Help us improve by sharing your thoughts.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title*</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Bug</option>
              <option>Feature Request</option>
              <option>Improvement</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">Description*</label>
              
              <span className={`text-xs ${formData.description.length < 20 ? 'text-red-500' : 'text-green-600'}`}>
                {formData.description.length}/20 min
              </span>
            </div>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

          
          {message.text && (
            <p className={`text-center text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </p>
          )}
        </form>
       
      </div>
    </main>
  );
}