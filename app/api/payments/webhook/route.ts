import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const metadata = (session as any).metadata as { reservationId: string; paymentId: string }

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id: metadata.reservationId },
        data: { status: 'CONFIRMED' },
      }),
      prisma.payment.update({
        where: { id: metadata.paymentId },
        data: {
          status: 'COMPLETED',
          stripePaymentId: (session as any).payment_intent as string,
          paidAt: new Date(),
        },
      }),
    ])
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    const metadata = (session as any).metadata as { reservationId: string }

    const reservation = await prisma.reservation.findUnique({
      where: { id: metadata.reservationId },
      include: { ticket: true },
    })

    if (reservation && reservation.status === 'PENDING') {
      await prisma.$transaction([
        prisma.reservation.update({ where: { id: metadata.reservationId }, data: { status: 'CANCELLED' } }),
        prisma.ticket.update({
          where: { id: reservation.ticketId },
          data: { available: { increment: reservation.quantity } },
        }),
      ])
    }
  }

  return NextResponse.json({ received: true })
}
