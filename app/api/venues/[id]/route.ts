import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      events: {
        where: { status: 'PUBLISHED' },
        orderBy: { startDate: 'asc' },
        take: 10,
      },
    },
  })

  if (!venue) return NextResponse.json({ error: 'Lieu introuvable' }, { status: 404 })
  return NextResponse.json(venue)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const venue = await prisma.venue.findUnique({ where: { id } })
  if (!venue || venue.organizerId !== session.user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.venue.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}
