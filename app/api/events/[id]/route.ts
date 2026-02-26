import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      venue: true,
      organizer: { select: { id: true, name: true, email: true } },
      tickets: {
        orderBy: { price: 'asc' },
      },
    },
  })

  if (!event) return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...body,
      ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
      ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
    },
    include: { tickets: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event || event.organizerId !== session.user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  await prisma.event.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
