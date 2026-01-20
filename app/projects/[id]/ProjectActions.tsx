"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import EditProjectModal from "./EditProjectModal";

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  projectMajorGoal: string;
  projectStatus: string;
  canEdit: boolean;
}

export default function ProjectActions({
  projectId,
  projectName,
  projectDescription,
  projectMajorGoal,
  projectStatus,
  canEdit,
}: ProjectActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Project deleted successfully!", "success");
        setTimeout(() => {
          router.push("/projects");
        }, 1000);
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to delete project", "error");
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Error deleting project", "error");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!canEdit) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm sm:text-base"
        >
          Edit Project
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors text-sm sm:text-base"
        >
          Delete Project
        </button>
      </div>

      {showEditModal && (
        <EditProjectModal
          projectId={projectId}
          initialData={{
            name: projectName,
            description: projectDescription || "",
            majorGoal: projectMajorGoal,
            status: projectStatus,
          }}
          onClose={() => {
            setShowEditModal(false);
            router.refresh();
          }}
          onSuccess={(message) => {
            showToast(message, "success");
            router.refresh();
          }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Project"
        message="Are you sure you want to delete this project? All milestones and related data will be deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
}

