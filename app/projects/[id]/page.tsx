import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { getCurrentWeekSunday, getCurrentWeekSaturday, getWeekNumber, formatDate } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import ProjectActions from "./ProjectActions";
import MilestoneActions from "./MilestoneActions";
import WeeklyProgressItem from "./WeeklyProgressItem";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      milestones: {
        include: {
          weeklyProgress: {
            orderBy: { weekStartDate: "desc" },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Check access: manager can see all, others only their own
  const userRole = (session.user as any).role || "user";
  const projectCreatedBy = project.createdBy;
  const canEditProject: boolean = userRole === "manager" || (projectCreatedBy !== null && projectCreatedBy === session.user.email);
  
  if (!canEditProject && !projectCreatedBy) {
    // Legacy project with no creator - only manager can see
    if (userRole !== "manager") {
      redirect("/projects");
    }
  } else if (!canEditProject) {
    redirect("/projects");
  }

  // Sort milestones: current first, then by targetDate or createdAt
  const sortedMilestones = [...project.milestones].sort((a, b) => {
    // Current milestone first
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    
    // Then by targetDate if available
    if (a.targetDate && b.targetDate) {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;
    
    // Finally by createdAt
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const currentMilestone = project.milestones.find((m) => m.isCurrent);
  const isSunday = new Date().getDay() === 0;

  // Get all weekly progress for current milestone
  const allWeeklyProgress = currentMilestone?.weeklyProgress || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </Link>
          </div>

          {/* Project Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                    {project.name}
                  </h1>
                  <span
                    className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap self-start ${
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
                {project.description && (
                  <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed break-words">{project.description}</p>
                )}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Major Goal
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-900 font-semibold leading-relaxed break-words">{project.majorGoal}</p>
                </div>
                <ProjectActions
                  projectId={project.id}
                  projectName={project.name}
                  projectDescription={project.description}
                  projectMajorGoal={project.majorGoal}
                  projectStatus={project.status}
                  canEdit={canEditProject}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/projects/${project.id}/milestones/new`}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center justify-center sm:ml-6"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Milestone</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </div>
            </div>
          </div>

          {isSunday && currentMilestone && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">It's Sunday! Time to track weekly progress</h3>
                  <p className="text-blue-100 mb-4 text-sm sm:text-base">
                    Record what you completed last week and plan for next week.
                  </p>
                </div>
                <Link
                  href={`/weekly-progress/new?milestoneId=${currentMilestone.id}`}
                  className="w-full sm:w-auto bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-center sm:text-left"
                >
                  Create Weekly Report
                </Link>
              </div>
            </div>
          )}

          {/* Milestones Section */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Milestones
            </h2>

            {sortedMilestones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No milestones yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMilestones.map((milestone) => {
                  const progressCount = milestone.weeklyProgress.length;
                  return (
                    <div
                      key={milestone.id}
                      className={`rounded-xl p-4 sm:p-6 border-2 transition-all duration-200 ${
                        milestone.isCurrent
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                              {milestone.title}
                            </h3>
                            {milestone.isCurrent && (
                              <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full uppercase tracking-wide">
                                Current
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                milestone.status === "completed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : milestone.status === "in-progress"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {milestone.status}
                            </span>
                            <MilestoneActions
                              milestoneId={milestone.id}
                              currentStatus={milestone.status}
                              canEdit={canEditProject}
                            />
                          </div>
                          {milestone.description && (
                            <p className="text-gray-600 mb-3 leading-relaxed">{milestone.description}</p>
                          )}
                          {milestone.targetDate && (
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Target: {formatDate(milestone.targetDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {milestone.isCurrent && milestone.weeklyProgress.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                            Recent Weekly Progress ({progressCount} total)
                          </h4>
                          <div className="grid gap-3">
                            {milestone.weeklyProgress.slice(0, 3).map((progress) => (
                              <WeeklyProgressItem
                                key={progress.id}
                                progress={progress}
                                canEdit={canEditProject}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Progress History Section */}
          {currentMilestone && allWeeklyProgress.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Weekly Progress History
              </h2>
              <div className="grid gap-4">
                {allWeeklyProgress.map((progress) => (
                  <WeeklyProgressItem
                    key={progress.id}
                    progress={progress}
                    canEdit={canEditProject}
                  />
                ))}
              </div>
            </div>
          )}

          {currentMilestone && allWeeklyProgress.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Weekly Progress History</h2>
              <p className="text-gray-600 mb-4">No weekly progress reports yet for the current milestone.</p>
              <Link
                href={`/weekly-progress/new?milestoneId=${currentMilestone.id}`}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Create First Report
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
