import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route de confirmation de paiement en mode test
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { reservationId, action } = await req.json()

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { payment: true, ticket: true },
    })

    if (!reservation || reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (action === 'confirm') {
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' },
        }),
        prisma.payment.update({
          where: { reservationId },
          data: {
            status: 'COMPLETED',
            stripePaymentId: `test_${Date.now()}`,
            paidAt: new Date(),
          },
        }),
      ])
      return NextResponse.json({ success: true, status: 'CONFIRMED' })
    }

    if (action === 'cancel') {
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id: reservationId },
          data: { status: 'CANCELLED' },
        }),
        prisma.payment.update({
          where: { reservationId },
          data: { status: 'FAILED' },
        }),
        prisma.ticket.update({
          where: { id: reservation.ticketId },
          data: { available: { increment: reservation.quantity } },
        }),
      ])
      return NextResponse.json({ success: true, status: 'CANCELLED' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
