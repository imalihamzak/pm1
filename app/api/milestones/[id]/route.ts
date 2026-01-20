import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isCurrent, status } = body;

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Check access: manager can update all, others only their own project milestones
    const userRole = (session.user as any).role || "user";
    if (userRole !== "manager" && milestone.project.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: "Access denied. You can only update milestones for your own projects." },
        { status: 403 }
      );
    }

    // If setting this milestone as current, unset all other current milestones for this project
    if (isCurrent) {
      await prisma.milestone.updateMany({
        where: { 
          projectId: milestone.projectId,
          id: { not: params.id },
          isCurrent: true 
        },
        data: { isCurrent: false },
      });
    }

    const updated = await prisma.milestone.update({
      where: { id: params.id },
      data: {
        ...(isCurrent !== undefined && { isCurrent }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}
