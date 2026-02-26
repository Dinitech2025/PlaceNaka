import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice } from '@/lib/utils'
import Link from 'next/link'

async function getUserReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
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
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' },
  CONFIRMED: { label: 'Confirmé', color: 'text-green-300 bg-green-500/20 border-green-500/30' },
  CANCELLED: { label: 'Annulé', color: 'text-red-300 bg-red-500/20 border-red-500/30' },
}

export default async function ReservationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const reservations = await getUserReservations(session.user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Mes billets</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">🎟️</div>
          <p className="text-lg mb-4">Aucune réservation pour le moment</p>
          <Link href="/events" className="text-blue-400 hover:underline">
            Voir les événements disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map(res => {
            const status = STATUS_LABELS[res.status] || STATUS_LABELS.PENDING
            return (
              <div key={res.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                      {res.payment?.status === 'COMPLETED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full border text-blue-300 bg-blue-500/20 border-blue-500/30">
                          Payé
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-lg">
                      {res.ticket.event.title}
                    </h3>
                    <div className="text-sm text-gray-400 mt-1 space-y-0.5">
                      <div>📍 {res.ticket.event.venue.name}, {res.ticket.event.venue.city}</div>
                      <div>📅 {formatDate(res.ticket.event.startDate)}</div>
                      <div>🎟️ {res.ticket.name} × {res.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">{formatPrice(res.totalPrice)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Réservé le {formatDate(res.createdAt)}
                    </div>
                  </div>
                </div>

                {res.status === 'PENDING' && res.payment?.status === 'PENDING' && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={async () => {
                        const r = await fetch('/api/payments/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reservationId: res.id }),
                        })
                        const d = await r.json()
                        if (d.url) window.location.href = d.url
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      Finaliser le paiement →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
