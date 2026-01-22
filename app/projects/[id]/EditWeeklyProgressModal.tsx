"use client";

import { useState } from "react";
import Toast from "@/components/Toast";

interface EditWeeklyProgressModalProps {
  progressId: string;
  initialData: {
    completedThisWeek: string[];
    plannedForNextWeek: string[];
    goalsAchieved: boolean;
    notes: string | null;
  };
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function EditWeeklyProgressModal({
  progressId,
  initialData,
  onClose,
  onSuccess,
}: EditWeeklyProgressModalProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>(initialData.completedThisWeek);
  const [plannedTasks, setPlannedTasks] = useState<string[]>(initialData.plannedForNextWeek);
  const [goalsAchieved, setGoalsAchieved] = useState(initialData.goalsAchieved);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const addCompletedTask = () => {
    setCompletedTasks([...completedTasks, ""]);
  };

  const removeCompletedTask = (index: number) => {
    setCompletedTasks(completedTasks.filter((_, i) => i !== index));
  };

  const updateCompletedTask = (index: number, value: string) => {
    const updated = [...completedTasks];
    updated[index] = value;
    setCompletedTasks(updated);
  };

  const addPlannedTask = () => {
    setPlannedTasks([...plannedTasks, ""]);
  };

  const removePlannedTask = (index: number) => {
    setPlannedTasks(plannedTasks.filter((_, i) => i !== index));
  };

  const updatePlannedTask = (index: number, value: string) => {
    const updated = [...plannedTasks];
    updated[index] = value;
    setPlannedTasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/weekly-progress/${progressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedThisWeek: JSON.stringify(completedTasks.filter((t) => t.trim() !== "")),
          plannedForNextWeek: JSON.stringify(plannedTasks.filter((t) => t.trim() !== "")),
          goalsAchieved,
          notes: notes.trim() || null,
        }),
      });

      if (response.ok) {
        showToast("Weekly progress updated successfully!", "success");
        setTimeout(() => {
          onSuccess("Weekly progress updated successfully!");
          onClose();
        }, 1000);
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to update weekly progress", "error");
      }
    } catch (error) {
      console.error("Error updating weekly progress:", error);
      showToast("Error updating weekly progress", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center pt-20 pb-8 px-4 relative z-[101]">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[100]"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[calc(100vh-8rem)] overflow-y-auto border border-slate-200 z-[102] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Weekly Progress</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completed This Week
              </label>
              <div className="space-y-2">
                {completedTasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateCompletedTask(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Task ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCompletedTask(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCompletedTask}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Task
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned For Next Week
              </label>
              <div className="space-y-2">
                {plannedTasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updatePlannedTask(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Task ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePlannedTask(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPlannedTask}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Task
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={goalsAchieved}
                  onChange={(e) => setGoalsAchieved(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Goals Achieved</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

