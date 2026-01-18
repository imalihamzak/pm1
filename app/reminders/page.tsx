"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";

interface Reminder {
  id: string;
  subject: string;
  message: string;
  recipientEmail: string;
  reminderDate: string;
  status: string;
  project: {
    id: string;
    name: string;
  };
}

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    subject: "",
    message: "",
    recipientEmail: "",
    reminderDate: "",
  });
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchReminders();
    fetchProjects();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders");
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          projectId: "",
          subject: "",
          message: "",
          recipientEmail: "",
          reminderDate: "",
        });
        fetchReminders();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create reminder");
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      alert("Error creating reminder");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchReminders();
      } else {
        alert("Failed to delete reminder");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Error deleting reminder");
    }
  };

  const scheduledReminders = reminders.filter((r) => r.status === "scheduled");
  const sentReminders = reminders.filter((r) => r.status === "sent");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-sm text-gray-600">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Email Reminders</h1>
              <p className="text-sm text-gray-600">Schedule and manage email reminders for projects</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm"
            >
              {showForm ? "Cancel" : "+ New Reminder"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Email Reminder</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Project *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Subject / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reminder subject"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Message / Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter detailed reminder message"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.recipientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, recipientEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                      Reminder Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.reminderDate}
                      onChange={(e) =>
                        setFormData({ ...formData, reminderDate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-sm"
                  >
                    Schedule Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {scheduledReminders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Scheduled Reminders ({scheduledReminders.length})
                </h2>
                <div className="grid gap-4">
                  {scheduledReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-2">
                            {reminder.subject}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                            <div>
                              <span className="font-semibold">Project: </span>
                              <Link
                                href={`/projects/${reminder.project.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {reminder.project.name}
                              </Link>
                            </div>
                            <div>
                              <span className="font-semibold">To: </span>
                              <span className="text-gray-700">{reminder.recipientEmail}</span>
                            </div>
                            <div>
                              <span className="font-semibold">When: </span>
                              <span className="text-gray-700">
                                {new Date(reminder.reminderDate).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {reminder.message}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="ml-4 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sentReminders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sent Reminders ({sentReminders.length})
                </h2>
                <div className="grid gap-4">
                  {sentReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="bg-gray-50 rounded-xl shadow p-5 border border-gray-200 opacity-75"
                    >
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2">
                          {reminder.subject}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold">Project: </span>
                            <span className="text-gray-700">{reminder.project.name}</span>
                          </div>
                          <div>
                            <span className="font-semibold">To: </span>
                            <span className="text-gray-700">{reminder.recipientEmail}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Sent: </span>
                            <span className="text-gray-700">
                              {new Date(reminder.reminderDate).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {reminder.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reminders.length === 0 && !showForm && (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-3">No reminders yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Create your first reminder
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
