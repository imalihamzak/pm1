"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

interface MilestoneActionsProps {
  milestoneId: string;
  currentStatus: string;
  canEdit: boolean;
}

export default function MilestoneActions({
  milestoneId,
  currentStatus,
  canEdit,
}: MilestoneActionsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
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

  if (!canEdit || currentStatus === "completed") return null;

  return (
    <>
      <button
        onClick={handleMarkCompleted}
        disabled={updating}
        className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {updating ? "Updating..." : "Mark as Completed"}
      </button>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
}

