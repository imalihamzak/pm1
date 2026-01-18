"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Softech Inc
            </span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link
              href="/projects"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                pathname?.startsWith("/projects")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Projects
            </Link>
            <Link
              href="/reminders"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                pathname?.startsWith("/reminders")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Reminders
            </Link>
            
            {session && (
              <div className="ml-4 flex items-center space-x-3 border-l border-gray-200 pl-4">
                <div className="hidden sm:block text-sm text-gray-600">
                  <div className="font-medium text-gray-900">{session.user?.email}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
