"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

interface Project {
  id: string;
  name: string;
  description: string | null;
  majorGoal: string;
  status: string;
  createdBy: string | null;
  milestones: Array<{ id: string; title: string }>;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatorFilter, setCreatorFilter] = useState<string>("all"); // For managers to filter by creator
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    majorGoal: "",
    status: "active",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null }>({
    isOpen: false,
    projectId: null,
  });
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Check if user is manager
  const isManager = (session?.user as any)?.role === "manager";
  const currentUserEmail = session?.user?.email || "";

  // Get display name for project creator
  const getCreatorName = (email: string | null) => {
    if (!email) return "Unknown";
    if (email === "manager@softechinc.ai") return "Manager";
    if (email === "nazish@softechinc.ai") return "Nazish";
    if (email === "soban@softechinc.ai") return "Soban";
    return email;
  };

  // Get color for creator badge
  const getCreatorBadgeColor = (email: string | null) => {
    if (!email) return "bg-gray-100 text-gray-700 border-gray-200";
    if (email === "manager@softechinc.ai") return "bg-blue-100 text-blue-700 border-blue-200";
    if (email === "nazish@softechinc.ai") return "bg-purple-100 text-purple-700 border-purple-200";
    if (email === "soban@softechinc.ai") return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Apply creator filter (for managers only)
    if (isManager && creatorFilter !== "all") {
      filtered = filtered.filter((project) => project.createdBy === creatorFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.majorGoal.toLowerCase().includes(query) ||
          project.status.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, creatorFilter, projects, isManager]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched projects:", data);
        console.log("Number of projects:", data.length);
        setProjects(data);
        setFilteredProjects(data);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditForm({
      name: project.name,
      description: project.description || "",
      majorGoal: project.majorGoal,
      status: project.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/projects/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingId(null);
        fetchProjects();
        showToast("Project updated successfully!", "success");
      } else {
        showToast("Failed to update project", "error");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast("Error updating project", "error");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, projectId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.projectId) return;

    setDeletingProjectId(deleteModal.projectId);

    try {
      const response = await fetch(`/api/projects/${deleteModal.projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
        setDeleteModal({ isOpen: false, projectId: null });
        showToast("Project deleted successfully!", "success");
      } else {
        showToast("Failed to delete project", "error");
        setDeleteModal({ isOpen: false, projectId: null });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Error deleting project", "error");
      setDeleteModal({ isOpen: false, projectId: null });
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-gray-600">Manage all your projects and track their progress</p>
            </div>
            <Link
              href="/projects/new"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center whitespace-nowrap"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            {/* Creator Filter (for managers only) */}
            {isManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Creator
                </label>
                <select
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  <option value="all">All Projects</option>
                  <option value="manager@softechinc.ai">My Projects</option>
                  <option value="nazish@softechinc.ai">Nazish's Projects</option>
                  <option value="soban@softechinc.ai">Soban's Projects</option>
                </select>
              </div>
            )}
            
            {/* Search Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {(searchQuery || (isManager && creatorFilter !== "all")) && (
              <p className="text-sm text-gray-600">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg mb-4">
                {searchQuery ? "No projects found matching your search." : "No projects yet."}
              </p>
              {!searchQuery && (
                <Link
                  href="/projects/new"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Create your first project
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 transform hover:-translate-y-1 sm:hover:-translate-y-2 group"
                >
                  {editingId === project.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold"
                        placeholder="Project name"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Description"
                        rows={2}
                      />
                      <input
                        type="text"
                        value={editForm.majorGoal}
                        onChange={(e) => setEditForm({ ...editForm, majorGoal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Major Goal"
                      />
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex-1 min-w-0 group-hover:text-blue-600 transition-colors"
                        >
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {project.name}
                          </h2>
                        </Link>
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                            project.status === "active"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : project.status === "completed"
                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      {/* Show creator badge for managers */}
                      {isManager && project.createdBy && (
                        <div className="mb-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getCreatorBadgeColor(project.createdBy)}`}
                          >
                            Created by: {getCreatorName(project.createdBy)}
                          </span>
                        </div>
                      )}
                      {/* Show "My Project" badge for non-managers */}
                      {!isManager && project.createdBy === currentUserEmail && (
                        <div className="mb-3">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-blue-100 text-blue-700 border-blue-200">
                            My Project
                          </span>
                        </div>
                      )}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {project.description || "No description"}
                      </p>
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Major Goal</p>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {project.majorGoal}
                        </p>
                      </div>
                      {project.milestones.length > 0 && (
                        <div className="flex items-center text-sm mb-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-blue-600 font-medium">Current: {project.milestones[0].title}</span>
                        </div>
                      )}
                      {project.milestones.length === 0 && (
                        <div className="flex items-center text-sm text-gray-400 mb-4">
                          <span>No current milestone</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex-1 text-center bg-blue-50 text-blue-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-100 font-semibold text-sm sm:text-base transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(project)}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold text-sm sm:text-base transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(project.id)}
                          disabled={deletingProjectId === project.id}
                          className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                            deletingProjectId === project.id
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? All milestones and related data will be deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deletingProjectId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, projectId: null })}
      />
    </div>
  );
}
