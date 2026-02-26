import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      ticket: {
        include: {
          event: {
            select: { title: true, startDate: true },
          },
        },
      },
      payment: true,
    },
  })

  if (!reservation || reservation.userId !== session.user.id) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  }

  return NextResponse.json(reservation)
}
