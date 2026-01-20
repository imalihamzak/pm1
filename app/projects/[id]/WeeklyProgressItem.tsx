"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditWeeklyProgressModal from "./EditWeeklyProgressModal";
import { formatDate, getWeekNumber } from "@/lib/utils";

interface WeeklyProgressItemProps {
  progress: {
    id: string;
    weekStartDate: Date;
    weekEndDate: Date;
    completedThisWeek: string;
    plannedForNextWeek: string;
    goalsAchieved: boolean;
    notes: string | null;
  };
  canEdit: boolean;
}

export default function WeeklyProgressItem({ progress, canEdit }: WeeklyProgressItemProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const weekStart = new Date(progress.weekStartDate);
  const weekEnd = new Date(progress.weekEndDate);
  const weekNum = getWeekNumber(weekStart);
  const completedTasks = JSON.parse(progress.completedThisWeek || "[]");
  const plannedTasks = JSON.parse(progress.plannedForNextWeek || "[]");

  const handleSuccess = (message: string) => {
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-bold text-gray-900 mb-1">
              Week {weekNum}, {weekStart.getFullYear()}
            </div>
            <div className="text-sm text-gray-600">
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              progress.goalsAchieved 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {progress.goalsAchieved ? '✓ Achieved' : '✗ Not Achieved'}
            </div>
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        {completedTasks.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-500 mb-1">Completed:</div>
            <ul className="text-sm text-gray-700 space-y-1">
              {completedTasks.map((task: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {plannedTasks.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Planned:</div>
            <ul className="text-sm text-gray-700 space-y-1">
              {plannedTasks.map((task: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {progress.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">{progress.notes}</p>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditWeeklyProgressModal
          progressId={progress.id}
          initialData={{
            completedThisWeek: completedTasks,
            plannedForNextWeek: plannedTasks,
            goalsAchieved: progress.goalsAchieved,
            notes: progress.notes,
          }}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

