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

  // Get all current milestones (up to 2)
  const currentMilestones = project.milestones.filter((m) => m.isCurrent);
  const isSunday = new Date().getDay() === 0;

  // Get all weekly progress for all current milestones
  const allWeeklyProgress = currentMilestones.flatMap((m) => m.weeklyProgress || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            href="/projects"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>

          {/* Project Header Card - Redesigned */}
          <div className="bg-white rounded-3xl border border-slate-200/50 mb-8 overflow-hidden">
            {/* Header Gradient Bar */}
            <div className={`h-2 ${
              project.status === "active"
                ? "bg-gradient-to-r from-emerald-500 to-green-500"
                : project.status === "completed"
                ? "bg-gradient-to-r from-slate-400 to-gray-500"
                : "bg-gradient-to-r from-amber-400 to-orange-500"
            }`}></div>
            
            <div className="p-6 lg:p-10">
              {/* Title and Actions Row */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                      {project.name}
                    </h1>
                    <span
                      className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                        project.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                          : project.status === "completed"
                          ? "bg-slate-100 text-slate-700 border-2 border-slate-300"
                          : "bg-amber-100 text-amber-700 border-2 border-amber-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-3xl">{project.description}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {canEditProject && (
                    <ProjectActions
                      projectId={project.id}
                      projectName={project.name}
                      projectDescription={project.description}
                      projectMajorGoal={project.majorGoal}
                      projectStatus={project.status}
                      canEdit={canEditProject}
                    />
                  )}
                  <Link
                    href={`/projects/${project.id}/milestones/new`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Milestone</span>
                  </Link>
                </div>
              </div>

              {/* Major Goal Card */}
              <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 lg:p-8 border-2 border-blue-100/50">
                <div className="absolute top-4 right-4">
                  <svg className="w-12 h-12 text-blue-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">
                      Major Goal
                    </h3>
                  </div>
                  <p className="text-xl lg:text-2xl text-slate-800 font-bold leading-relaxed pr-8">
                    {project.majorGoal}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isSunday && currentMilestones.length > 0 && (
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 lg:p-8 mb-8 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-7 h-7 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl lg:text-3xl font-extrabold">It's Sunday!</h3>
                  </div>
                  <p className="text-blue-50 text-lg">
                    Time to track your weekly progress and plan for the week ahead.
                    {currentMilestones.length > 1 && (
                      <span className="block mt-1 text-sm text-blue-100">You have {currentMilestones.length} active milestones.</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {currentMilestones.map((milestone) => (
                    <Link
                      key={milestone.id}
                      href={`/weekly-progress/new?milestoneId=${milestone.id}`}
                      className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all font-bold transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {currentMilestones.length > 1 ? `Report for ${milestone.title}` : "Create Report"}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Milestones Section */}
          <div className="bg-white rounded-3xl p-6 lg:p-10 mb-8 border border-slate-200/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Milestones</h2>
                <p className="text-slate-500 text-sm mt-1">Track your project progress</p>
              </div>
            </div>

            {sortedMilestones.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium">No milestones yet</p>
                <p className="text-slate-400 text-sm mt-1">Create your first milestone to get started</p>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {sortedMilestones.map((milestone) => {
                  const progressCount = milestone.weeklyProgress.length;
                  return (
                    <div
                      key={milestone.id}
                      className={`group relative rounded-2xl p-6 lg:p-8 border-2 transition-all duration-300 ${
                        milestone.isCurrent
                          ? "border-blue-400 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ring-2 ring-blue-200/50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      {/* Current Milestone Indicator */}
                      {milestone.isCurrent && (
                        <div className="absolute -top-3 -right-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-40"></div>
                            <span className="relative px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full uppercase tracking-wider">
                              Current
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 break-words">
                              {milestone.title}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                milestone.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                                  : milestone.status === "in-progress"
                                  ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                                  : "bg-slate-100 text-slate-700 border-2 border-slate-300"
                              }`}
                            >
                              {milestone.status}
                            </span>
                            <MilestoneActions
                              milestoneId={milestone.id}
                              currentStatus={milestone.status}
                              isCurrent={milestone.isCurrent}
                              canEdit={canEditProject}
                            />
                          </div>
                          {milestone.description && (
                            <p className="text-slate-600 mb-4 leading-relaxed text-base">{milestone.description}</p>
                          )}
                          {milestone.targetDate && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-semibold text-slate-700">Target: {formatDate(milestone.targetDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {milestone.isCurrent && milestone.weeklyProgress.length > 0 && (
                        <div className="mt-6 pt-6 border-t-2 border-slate-200">
                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                              Recent Weekly Progress
                            </h4>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                              {progressCount} total
                            </span>
                          </div>
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
          {currentMilestones.length > 0 && allWeeklyProgress.length > 0 && (
            <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Weekly Progress History</h2>
                  <p className="text-slate-500 text-sm mt-1">{allWeeklyProgress.length} reports tracked across {currentMilestones.length} {currentMilestones.length === 1 ? 'milestone' : 'milestones'}</p>
                </div>
              </div>
              <div className="grid gap-4 lg:gap-6">
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

          {currentMilestones.length > 0 && allWeeklyProgress.length === 0 && (
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/50 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">No Progress Reports Yet</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">Start tracking your weekly progress to see your journey here.</p>
              <div className="flex flex-wrap justify-center gap-3">
                {currentMilestones.map((milestone) => (
                  <Link
                    key={milestone.id}
                    href={`/weekly-progress/new?milestoneId=${milestone.id}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl transition-all font-semibold transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {currentMilestones.length > 1 ? `Report for ${milestone.title}` : "Create First Report"}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
