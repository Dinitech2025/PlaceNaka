import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/utils'

async function getOrganizerData(userId: string) {
  const [events, venues, payments] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: userId },
      include: {
        venue: { select: { name: true } },
        _count: { select: { reservations: true, tickets: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.venue.findMany({
      where: { organizerId: userId },
      include: { _count: { select: { events: true } } },
    }),
    prisma.payment.findMany({
      where: {
        reservation: { ticket: { event: { organizerId: userId } } },
        status: 'COMPLETED',
      },
      select: { organizerAmount: true, commission: true, paidAt: true },
    }),
  ])

  const totalRevenue = payments.reduce((sum, p) => sum + p.organizerAmount, 0)
  const totalCommission = payments.reduce((sum, p) => sum + p.commission, 0)

  return { events, venues, totalRevenue, totalCommission, paymentsCount: payments.length }
}

export default async function OrganizerPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ORGANIZER') redirect('/login')

  const { events, venues, totalRevenue, totalCommission, paymentsCount } = await getOrganizerData(session.user.id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Espace Organisateur</h1>
          <p className="text-gray-400 mt-1">Bienvenue, {session.user.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/organizer/venues/new"
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm"
          >
            + Nouveau lieu
          </Link>
          <Link
            href="/organizer/events/new"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium"
          >
            + Nouvel événement
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Événements', value: events.length, icon: '🎪', color: 'from-purple-500 to-purple-700' },
          { label: 'Lieux', value: venues.length, icon: '📍', color: 'from-blue-500 to-blue-700' },
          { label: 'Réservations', value: paymentsCount, icon: '🎟️', color: 'from-green-500 to-green-700' },
          { label: 'Revenus', value: formatPrice(totalRevenue), icon: '💰', color: 'from-yellow-500 to-orange-600' },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-white/70 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-3">
        Commission PlaceNaka : {formatPrice(totalCommission)} — Vos revenus nets : {formatPrice(totalRevenue)}
      </div>

      {/* Événements */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Mes événements</h2>
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500">
            <div className="text-4xl mb-3">🎪</div>
            <p>Aucun événement créé</p>
            <Link href="/organizer/events/new" className="mt-3 inline-block text-blue-400 hover:underline text-sm">
              Créer votre premier événement
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                <div>
                  <div className="font-medium text-white">{event.title}</div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {event.venue.name} • {formatDate(event.startDate)} • {event._count.reservations} réservations
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.status === 'PUBLISHED'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {event.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                  </span>
                  <Link href={`/organizer/events/${event.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                    Gérer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lieux */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Mes lieux</h2>
        {venues.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500">
            <div className="text-4xl mb-3">📍</div>
            <p>Aucun lieu créé</p>
            <Link href="/organizer/venues/new" className="mt-3 inline-block text-blue-400 hover:underline text-sm">
              Ajouter un lieu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map(venue => (
              <div key={venue.id} className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <div className="font-medium text-white mb-1">{venue.name}</div>
                <div className="text-sm text-gray-400">{venue.city} • {venue.capacity} places</div>
                <div className="text-xs text-gray-500 mt-1">{venue._count.events} événement(s)</div>
                <Link href={`/organizer/venues/${venue.id}`} className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm">
                  Modifier le plan →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
