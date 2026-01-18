import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      milestoneId,
      weekStartDate,
      weekEndDate,
      completedThisWeek,
      plannedForNextWeek,
      goalsAchieved,
      notes,
    } = body;

    if (!milestoneId || !weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: "Milestone ID, week start, and week end dates are required" },
        { status: 400 }
      );
    }

    // Get the milestone to find project ID
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const weeklyProgress = await prisma.weeklyProgress.create({
      data: {
        milestoneId,
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        completedThisWeek,
        plannedForNextWeek,
        goalsAchieved: goalsAchieved || false,
        notes: notes || null,
      },
      include: {
        milestone: {
          include: {
            project: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...weeklyProgress,
      projectId: milestone.projectId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating weekly progress:", error);
    return NextResponse.json(
      { error: "Failed to create weekly progress" },
      { status: 500 }
    );
  }
}
