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
      <div className="group bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border-2 border-slate-200 hover:border-indigo-300 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg mb-0.5">
                  Week {weekNum}, {weekStart.getFullYear()}
                </div>
                <div className="text-sm text-slate-500">
                  {formatDate(weekStart)} - {formatDate(weekEnd)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              progress.goalsAchieved 
                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                : 'bg-red-100 text-red-700 border-2 border-red-300'
            }`}>
              {progress.goalsAchieved ? '✓ Achieved' : '✗ Not Achieved'}
            </div>
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:scale-105 border border-indigo-200"
                title="Edit Progress"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {completedTasks.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Completed</div>
              </div>
              <ul className="space-y-2">
                {completedTasks.map((task: string, idx: number) => (
                  <li key={idx} className="flex items-start text-sm text-slate-700">
                    <span className="text-emerald-600 mr-2 mt-0.5 font-bold">✓</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plannedTasks.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Planned</div>
              </div>
              <ul className="space-y-2">
                {plannedTasks.map((task: string, idx: number) => (
                  <li key={idx} className="flex items-start text-sm text-slate-700">
                    <span className="text-blue-600 mr-2 mt-0.5 font-bold">→</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {progress.notes && (
          <div className="mt-4 pt-4 border-t-2 border-slate-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-sm text-slate-600 italic leading-relaxed">{progress.notes}</p>
            </div>
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

