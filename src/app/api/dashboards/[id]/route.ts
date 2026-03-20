import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        widgets: true,
      },
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    if (dashboard.userId !== session.user.id && !dashboard.isPublic) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingDashboard = await prisma.dashboard.findUnique({
      where: { id },
    })

    if (!existingDashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    if (existingDashboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, config, isPublic } = body

    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        name: name || existingDashboard.name,
        description: description !== undefined ? description : existingDashboard.description,
        config: config !== undefined ? config : existingDashboard.config,
        isPublic: isPublic !== undefined ? isPublic : existingDashboard.isPublic,
      },
    })

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Error updating dashboard:", error)
    return NextResponse.json({ error: "Failed to update dashboard" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingDashboard = await prisma.dashboard.findUnique({
      where: { id },
    })

    if (!existingDashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    if (existingDashboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await prisma.dashboard.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Dashboard deleted" })
  } catch (error) {
    console.error("Error deleting dashboard:", error)
    return NextResponse.json({ error: "Failed to delete dashboard" }, { status: 500 })
  }
}
