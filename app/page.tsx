import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice } from '@/lib/utils'

async function getUpcomingEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: 'PUBLISHED', startDate: { gte: new Date() } },
      include: {
        venue: { select: { name: true, city: true } },
        organizer: { select: { name: true } },
        tickets: { orderBy: { price: 'asc' }, take: 1 },
      },
      orderBy: { startDate: 'asc' },
      take: 6,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const events = await getUpcomingEvents()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/30 to-blue-900/30 py-20 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Réservation en temps réel
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Réservez votre place{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              pour les meilleurs
            </span>{' '}
            événements
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Concerts, spectacles, conférences... Choisissez votre place sur le plan interactif et payez en toute sécurité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 text-lg"
            >
              Voir les événements
            </Link>
            <Link
              href="/register?role=ORGANIZER"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all text-lg"
            >
              Organiser un événement
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { label: 'Événements', value: '100+', icon: '🎪' },
            { label: 'Places vendues', value: '10K+', icon: '🎟️' },
            { label: 'Organisateurs', value: '50+', icon: '🎭' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Événements à venir */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Prochains événements</h2>
            <Link href="/events" className="text-blue-400 hover:text-blue-300 text-sm">
              Voir tout →
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🎪</div>
              <p>Aucun événement pour le moment</p>
              <Link href="/register?role=ORGANIZER" className="mt-4 inline-block text-blue-400 hover:underline">
                Organisez le premier !
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center text-5xl">
                    🎪
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
                      <span>📍 {event.venue.city}</span>
                      <span>•</span>
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{event.venue.name}</span>
                      {event.tickets[0] && (
                        <span className="text-sm font-semibold text-green-400">
                          À partir de {formatPrice(event.tickets[0].price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Pourquoi PlaceNaka ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🗺️', title: 'Plan interactif', desc: 'Visualisez le lieu et choisissez votre place exacte sur le plan' },
              { icon: '💳', title: 'Paiement sécurisé', desc: 'Paiement par carte via Stripe, 100% sécurisé' },
              { icon: '💰', title: 'Pour les organisateurs', desc: 'Créez vos événements, dessinez votre plan et recevez vos paiements' },
            ].map(f => (
              <div key={f.title} className="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
