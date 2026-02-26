'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface ReservationDetails {
  id: string
  quantity: number
  totalPrice: number
  ticket: {
    name: string
    price: number
    event: {
      title: string
      startDate: string
    }
  }
}

export default function TestPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reservationId = searchParams.get('reservationId')

  const [reservation, setReservation] = useState<ReservationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvc, setCvc] = useState('123')

  useEffect(() => {
    if (!reservationId) return
    fetch(`/api/reservations/${reservationId}`)
      .then(r => r.json())
      .then(data => {
        setReservation(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [reservationId])

  async function handleConfirm() {
    if (!reservationId) return
    setProcessing(true)

    // Simuler un délai de traitement
    await new Promise(r => setTimeout(r, 1500))

    const res = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, action: 'confirm' }),
    })

    if (res.ok) {
      router.push(`/reservations?success=1`)
    } else {
      setProcessing(false)
    }
  }

  async function handleCancel() {
    if (!reservationId) return
    await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, action: 'cancel' }),
    })
    router.push(`/events`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Badge mode test */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-sm px-4 py-2 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Mode TEST — Aucun vrai paiement
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🔒</span>
              <span className="text-white font-semibold text-lg">Paiement sécurisé</span>
            </div>
            <p className="text-blue-200 text-sm">PlaceNaka — Environnement de test</p>
          </div>

          <div className="p-6 space-y-5">

            {/* Récapitulatif commande */}
            {reservation && (
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Récapitulatif</p>
                <div className="font-semibold text-white mb-1">{reservation.ticket.event.title}</div>
                <div className="text-sm text-gray-400 mb-3">
                  {reservation.ticket.name} × {reservation.quantity}
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                  <span className="text-gray-300">Total à payer</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatPrice(reservation.totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Formulaire carte (simulé) */}
            <div className="space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Informations de carte</p>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Numéro de carte</label>
                <div className="relative">
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    maxLength={19}
                  />
                  <span className="absolute right-3 top-3 text-xl">💳</span>
                </div>
                <p className="text-xs text-yellow-400 mt-1">
                  Carte de test : 4242 4242 4242 4242 (toujours acceptée)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Expiration</label>
                  <input
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/AA"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">CVC</label>
                  <input
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                    maxLength={3}
                    type="password"
                  />
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg text-lg"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Traitement en cours...
                  </span>
                ) : (
                  `Payer ${reservation ? formatPrice(reservation.totalPrice) : ''}`
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={processing}
                className="w-full py-3 bg-transparent border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-all text-sm"
              >
                Annuler et retourner
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              🔒 Simulation de paiement — Aucune donnée bancaire réelle traitée
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
