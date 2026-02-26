'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { VenueElement } from '@/components/venue/VenueEditor'

const VenueEditor = dynamic(() => import('@/components/venue/VenueEditor'), { ssr: false })

export default function NewVenuePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    capacity: 100,
  })
  const [layout, setLayout] = useState<VenueElement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, layout }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erreur lors de la création')
      setLoading(false)
    } else {
      router.push('/organizer')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Nouveau lieu</h1>
        <p className="text-gray-400 mt-1">Créez votre lieu et dessinez son plan interactif</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Informations générales</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom du lieu *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Salle des fêtes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ville *</label>
              <input
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paris"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Adresse *</label>
            <input
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12 rue de la Paix"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Capacité totale *</label>
              <input
                type="number"
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })}
                required
                min={1}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Description du lieu..."
            />
          </div>
        </div>

        {/* Éditeur de plan */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Plan du lieu</h2>
          <p className="text-sm text-gray-400 mb-4">
            Dessinez votre lieu : ajoutez des tables, chaises, scène, murs et entrées.
          </p>
          <VenueEditor onChange={setLayout} />
          <p className="text-xs text-gray-500 mt-2">{layout.length} élément(s) placé(s)</p>
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
            {loading ? 'Création...' : 'Créer le lieu'}
          </button>
        </div>
      </form>
    </div>
  )
}
