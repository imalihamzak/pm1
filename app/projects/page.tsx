import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      milestones: {
        where: { isCurrent: true },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-gray-600">Manage all your projects and track their progress</p>
            </div>
            <Link
              href="/projects/new"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg mb-4">No projects yet.</p>
              <Link
                href="/projects/new"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
              >
                Create your first project
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-2 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                      {project.name}
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ml-2 ${
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
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-blue-600 font-medium">Current: {project.milestones[0].title}</span>
                    </div>
                  )}
                  {project.milestones.length === 0 && (
                    <div className="flex items-center text-sm text-gray-400">
                      <span>No current milestone</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
