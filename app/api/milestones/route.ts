import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, title, description, status, isCurrent, targetDate } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
      );
    }

    // Verify user has access to the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role || "user";
    if (userRole !== "manager" && project.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: "Access denied. You can only create milestones for your own projects." },
        { status: 403 }
      );
    }

    // If setting this milestone as current, unset all other current milestones for this project
    if (isCurrent) {
      await prisma.milestone.updateMany({
        where: { projectId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        title,
        description: description || null,
        status: status || "pending",
        isCurrent: isCurrent || false,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
