import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dashboards = await prisma.dashboard.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { widgets: true },
        },
      },
    })

    return NextResponse.json(dashboards)
  } catch (error) {
    console.error("Error fetching dashboards:", error)
    return NextResponse.json({ error: "Failed to fetch dashboards" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, config } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        description: description || null,
        config: config || { widgets: [] },
        userId: session.user.id,
      },
    })

    return NextResponse.json(dashboard, { status: 201 })
  } catch (error) {
    console.error("Error creating dashboard:", error)
    return NextResponse.json({ error: "Failed to create dashboard" }, { status: 500 })
  }
}
