"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

interface MilestoneActionsProps {
  milestoneId: string;
  currentStatus: string;
  isCurrent: boolean;
  canEdit: boolean;
}

export default function MilestoneActions({
  milestoneId,
  currentStatus,
  isCurrent,
  canEdit,
}: MilestoneActionsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [updatingCurrent, setUpdatingCurrent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const handleMarkCompleted = async () => {
    if (currentStatus === "completed") {
      showToast("Milestone is already completed", "info");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        showToast("Milestone marked as completed!", "success");
        router.refresh();
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to update milestone", "error");
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      showToast("Error updating milestone", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleCurrent = async () => {
    setUpdatingCurrent(true);
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCurrent: !isCurrent }),
      });

      if (response.ok) {
        showToast(
          isCurrent 
            ? "Milestone removed from current milestones" 
            : "Milestone marked as current!",
          "success"
        );
        router.refresh();
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to update milestone", "error");
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      showToast("Error updating milestone", "error");
    } finally {
      setUpdatingCurrent(false);
    }
  };

  if (!canEdit) return null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {currentStatus !== "completed" && (
          <button
            onClick={handleMarkCompleted}
            disabled={updating || updatingCurrent}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {updating ? "Updating..." : "Mark as Completed"}
          </button>
        )}
        <button
          onClick={handleToggleCurrent}
          disabled={updating || updatingCurrent}
          className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${
            isCurrent
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-slate-600 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          {updatingCurrent ? "Updating..." : isCurrent ? "Remove from Current" : "Set as Current"}
        </button>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
}

