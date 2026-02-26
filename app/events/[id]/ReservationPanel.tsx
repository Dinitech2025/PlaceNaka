'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Ticket {
  id: string
  name: string
  price: number
  quantity: number
  available: number
  color?: string | null
}

interface Event {
  id: string
  title: string
}

export default function ReservationPanel({ event, tickets }: { event: Event; tickets: Ticket[] }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReserve() {
    if (!session) {
      router.push('/login')
      return
    }
    if (!selectedTicket) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket.id, quantity }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la réservation')
        return
      }

      const payRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: data.id }),
      })

      const payData = await payRes.json()
      if (payData.url) {
        window.location.href = payData.url
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const total = selectedTicket ? selectedTicket.price * quantity : 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-20">
      <h2 className="text-lg font-semibold text-white mb-5">Réserver des places</h2>

      {tickets.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun billet disponible</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type de billet</label>
            <div className="space-y-2">
              {tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => ticket.available > 0 && setSelectedTicket(ticket)}
                  disabled={ticket.available === 0}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : ticket.available === 0
                      ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-white text-sm">{ticket.name}</div>
                    <div className="text-xs text-gray-400">{ticket.available} places restantes</div>
                  </div>
                  <div className="font-bold text-green-400">{formatPrice(ticket.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedTicket && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantité</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedTicket.available, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {selectedTicket && (
            <div className="border-t border-gray-800 pt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>{quantity} × {formatPrice(selectedTicket.price)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-lg mb-4">
                <span>Total</span>
                <span className="text-green-400">{formatPrice(total)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleReserve}
            disabled={!selectedTicket || loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Traitement...' : session ? 'Réserver et payer' : 'Se connecter pour réserver'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Paiement sécurisé par Stripe 🔒
          </p>
        </div>
      )}
    </div>
  )
}
