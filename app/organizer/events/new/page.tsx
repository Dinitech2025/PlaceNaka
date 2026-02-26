'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Venue {
  id: string
  name: string
  city: string
  capacity: number
}

interface TicketForm {
  name: string
  price: number
  quantity: number
  color: string
}

const TICKET_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function NewEventPage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    venueId: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  })
  const [tickets, setTickets] = useState<TicketForm[]>([
    { name: 'Entrée standard', price: 1500, quantity: 50, color: '#3B82F6' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/venues').then(r => r.json()).then(setVenues).catch(() => {})
  }, [])

  function addTicket() {
    setTickets([...tickets, {
      name: `Catégorie ${tickets.length + 1}`,
      price: 2000,
      quantity: 20,
      color: TICKET_COLORS[tickets.length % TICKET_COLORS.length],
    }])
  }

  function removeTicket(i: number) {
    setTickets(tickets.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tickets }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Erreur lors de la création')
      setLoading(false)
    } else {
      router.push('/organizer')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Nouvel événement</h1>
        <p className="text-gray-400 mt-1">Créez votre événement et définissez les billets</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* Infos générales */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Informations</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Concert de jazz..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Décrivez votre événement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lieu *</label>
            <select
              value={form.venueId}
              onChange={e => setForm({ ...form, venueId: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un lieu</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name} — {v.city}</option>
              ))}
            </select>
            {venues.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                Aucun lieu disponible.{' '}
                <a href="/organizer/venues/new" className="underline">Créer un lieu d&apos;abord</a>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date de début *</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date de fin *</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
            <div className="flex gap-3">
              {(['DRAFT', 'PUBLISHED'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.status === s
                      ? s === 'PUBLISHED' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {s === 'DRAFT' ? '📝 Brouillon' : '✅ Publier'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Billets */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Billets & tarifs</h2>
            <button
              type="button"
              onClick={addTicket}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              + Ajouter un type
            </button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket, i) => (
              <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ticket.color }} />
                  <input
                    value={ticket.name}
                    onChange={e => setTickets(tickets.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t))}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nom du billet"
                  />
                  {tickets.length > 1 && (
                    <button type="button" onClick={() => removeTicket(i)} className="text-red-400 hover:text-red-300 text-sm">
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Prix (centimes)</label>
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={e => setTickets(tickets.map((t, idx) => idx === i ? { ...t, price: parseInt(e.target.value) } : t))}
                      min={0}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-0.5">{(ticket.price / 100).toFixed(2)} €</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                    <input
                      type="number"
                      value={ticket.quantity}
                      onChange={e => setTickets(tickets.map((t, idx) => idx === i ? { ...t, quantity: parseInt(e.target.value) } : t))}
                      min={1}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Couleur</label>
                    <div className="flex gap-1 flex-wrap">
                      {TICKET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTickets(tickets.map((t, idx) => idx === i ? { ...t, color: c } : t))}
                          className={`w-6 h-6 rounded-full transition-transform ${ticket.color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Création...' : form.status === 'PUBLISHED' ? 'Publier l\'événement' : 'Enregistrer le brouillon'}
          </button>
        </div>
      </form>
    </div>
  )
}
