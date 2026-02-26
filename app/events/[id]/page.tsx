import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice } from '@/lib/utils'
import { notFound } from 'next/navigation'
import ReservationPanel from './ReservationPanel'

async function getEvent(id: string) {
  try {
    return await prisma.event.findUnique({
      where: { id, status: 'PUBLISHED' },
      include: {
        venue: true,
        organizer: { select: { name: true } },
        tickets: { orderBy: { price: 'asc' } },
      },
    })
  } catch {
    return null
  }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Infos événement */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center text-8xl">
            🎪
          </div>

          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm mb-3">
              <span>📍 {event.venue.city} — {event.venue.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
              <span>📅 {formatDate(event.startDate)}</span>
              <span>🕐 Fin : {formatDate(event.endDate)}</span>
              <span>👤 Par {event.organizer.name}</span>
            </div>
            {event.description && (
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            )}
          </div>

          {/* Plan du lieu */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Plan du lieu</h2>
            {event.venue.layout ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Plan interactif disponible</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Plan non disponible pour cet événement</p>
              </div>
            )}
          </div>
        </div>

        {/* Panneau de réservation */}
        <div className="lg:col-span-1">
          <ReservationPanel event={event} tickets={event.tickets} />
        </div>
      </div>
    </div>
  )
}
