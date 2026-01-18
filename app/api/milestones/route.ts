import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, title, description, status, isCurrent, targetDate } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Project ID and title are required" },
        { status: 400 }
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
