import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateCommission } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  ticketId: z.string(),
  quantity: z.number().int().positive().max(10),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: {
      ticket: {
        include: {
          event: {
            include: { venue: { select: { name: true, city: true } } },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reservations)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { ticketId, quantity } = schema.parse(body)

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    })

    if (!ticket) return NextResponse.json({ error: 'Billet introuvable' }, { status: 404 })
    if (ticket.available < quantity) {
      return NextResponse.json({ error: 'Places insuffisantes' }, { status: 400 })
    }

    const commissionRate = parseFloat(process.env.DEFAULT_COMMISSION_RATE || '0.05')
    const totalAmount = ticket.price * quantity
    const { commission, organizer } = calculateCommission(totalAmount, commissionRate)

    const reservation = await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { available: { decrement: quantity } },
      })

      const res = await tx.reservation.create({
        data: {
          userId: session.user.id,
          ticketId,
          eventId: ticket.eventId,
          quantity,
          totalPrice: totalAmount,
          status: 'PENDING',
        },
      })

      await tx.payment.create({
        data: {
          reservationId: res.id,
          amount: totalAmount,
          commission,
          organizerAmount: organizer,
          currency: 'EUR',
          status: 'PENDING',
        },
      })

      return res
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
