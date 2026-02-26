import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { reservationId } = await req.json()

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        ticket: { include: { event: true } },
        payment: true,
        user: true,
      },
    })

    if (!reservation || reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (reservation.payment?.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Déjà payé' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: reservation.ticket.price,
            product_data: {
              name: `${reservation.ticket.name} - ${reservation.ticket.event.title}`,
              description: `${reservation.quantity} place(s)`,
            },
          },
          quantity: reservation.quantity,
        },
      ],
      metadata: {
        reservationId: reservation.id,
        paymentId: reservation.payment?.id || '',
      },
      success_url: `${process.env.NEXTAUTH_URL}/reservations/${reservation.id}?success=1`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${reservation.ticket.event.id}`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}
