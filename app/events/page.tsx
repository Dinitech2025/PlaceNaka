import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice } from '@/lib/utils'

async function getEvents(search?: string, city?: string) {
  try {
    return await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startDate: { gte: new Date() },
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
        ...(city ? { venue: { city: { contains: city, mode: 'insensitive' } } } : {}),
      },
      include: {
        venue: { select: { name: true, city: true } },
        tickets: { orderBy: { price: 'asc' }, take: 1 },
        _count: { select: { reservations: true } },
      },
      orderBy: { startDate: 'asc' },
    })
  } catch {
    return []
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { search?: string; city?: string }
}) {
  const events = await getEvents(searchParams.search, searchParams.city)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Tous les événements</h1>

      {/* Filtres */}
      <form className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Rechercher un événement..."
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="city"
          defaultValue={searchParams.city}
          placeholder="Ville..."
          className="w-full sm:w-48 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Rechercher
        </button>
      </form>

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg">Aucun événement trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="h-44 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center text-6xl relative">
                🎪
                <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 text-green-300 text-xs px-2 py-1 rounded-full">
                  {event._count.reservations} réservations
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
                  <span>📍 {event.venue.city}</span>
                  <span>•</span>
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{event.venue.name}</span>
                  {event.tickets[0] ? (
                    <span className="font-bold text-green-400">
                      À partir de {formatPrice(event.tickets[0].price)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Gratuit</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
