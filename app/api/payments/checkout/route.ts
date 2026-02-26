import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      },
    })

    if (!reservation || reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (reservation.payment?.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Déjà payé' }, { status: 400 })
    }

    // Mode test : rediriger vers la page de paiement simulé
    const testUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payments/test?reservationId=${reservationId}`
    return NextResponse.json({ url: testUrl })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
