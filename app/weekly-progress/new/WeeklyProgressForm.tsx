"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getCurrentWeekSunday, getCurrentWeekSaturday } from "@/lib/utils";

export default function WeeklyProgressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestoneId");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    milestoneId: milestoneId || "",
    weekStartDate: "",
    weekEndDate: "",
    completedThisWeek: [""],
    plannedForNextWeek: [""],
    goalsAchieved: false,
    notes: "",
  });

  useEffect(() => {
    const sunday = getCurrentWeekSunday();
    const saturday = getCurrentWeekSaturday();
    setFormData((prev) => ({
      ...prev,
      weekStartDate: sunday.toISOString().split("T")[0],
      weekEndDate: saturday.toISOString().split("T")[0],
    }));
  }, []);

  const addCompletedTask = () => {
    setFormData({
      ...formData,
      completedThisWeek: [...formData.completedThisWeek, ""],
    });
  };

  const updateCompletedTask = (index: number, value: string) => {
    const updated = [...formData.completedThisWeek];
    updated[index] = value;
    setFormData({ ...formData, completedThisWeek: updated });
  };

  const removeCompletedTask = (index: number) => {
    const updated = formData.completedThisWeek.filter((_, i) => i !== index);
    setFormData({ ...formData, completedThisWeek: updated });
  };

  const addPlannedTask = () => {
    setFormData({
      ...formData,
      plannedForNextWeek: [...formData.plannedForNextWeek, ""],
    });
  };

  const updatePlannedTask = (index: number, value: string) => {
    const updated = [...formData.plannedForNextWeek];
    updated[index] = value;
    setFormData({ ...formData, plannedForNextWeek: updated });
  };

  const removePlannedTask = (index: number) => {
    const updated = formData.plannedForNextWeek.filter((_, i) => i !== index);
    setFormData({ ...formData, plannedForNextWeek: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.milestoneId) {
      alert("Please select a milestone");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/weekly-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          completedThisWeek: JSON.stringify(
            formData.completedThisWeek.filter((t) => t.trim() !== "")
          ),
          plannedForNextWeek: JSON.stringify(
            formData.plannedForNextWeek.filter((t) => t.trim() !== "")
          ),
          weekStartDate: new Date(formData.weekStartDate),
          weekEndDate: new Date(formData.weekEndDate),
        }),
      });

      if (response.ok) {
        const progress = await response.json();
        // Navigate back to project page
        router.push(`/projects/${progress.projectId}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create weekly progress");
      }
    } catch (error) {
      console.error("Error creating weekly progress:", error);
      alert("Error creating weekly progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Weekly Progress Report
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Week Range *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Week Start (Sunday)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.weekStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, weekStartDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Week End (Saturday)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.weekEndDate}
                    onChange={(e) =>
                      setFormData({ ...formData, weekEndDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completed This Week *
              </label>
              {formData.completedThisWeek.map((task, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updateCompletedTask(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter completed task or achievement"
                  />
                  {formData.completedThisWeek.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCompletedTask(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCompletedTask}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Task
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned For Next Week *
              </label>
              {formData.plannedForNextWeek.map((task, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => updatePlannedTask(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter planned task for next week"
                  />
                  {formData.plannedForNextWeek.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlannedTask(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPlannedTask}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Task
              </button>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.goalsAchieved}
                  onChange={(e) =>
                    setFormData({ ...formData, goalsAchieved: e.target.checked })
                  }
                  className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Weekly goals achieved
                </span>
              </label>
            </div>

            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any additional notes or observations"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Progress Report"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
