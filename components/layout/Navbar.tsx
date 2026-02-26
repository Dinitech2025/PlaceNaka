'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎪</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PlaceNaka
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
              Événements
            </Link>
            {session?.user.role === 'ORGANIZER' && (
              <Link href="/organizer" className="text-gray-300 hover:text-white transition-colors">
                Mon espace
              </Link>
            )}
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/reservations" className="text-gray-300 hover:text-white transition-colors">
                  Mes billets
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 flex flex-col gap-3">
            <Link href="/events" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
              Événements
            </Link>
            {session ? (
              <>
                <Link href="/reservations" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                  Mes billets
                </Link>
                {session.user.role === 'ORGANIZER' && (
                  <Link href="/organizer" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                    Mon espace organisateur
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left text-red-400 hover:text-red-300 py-2">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Connexion</Link>
                <Link href="/register" className="text-blue-400 hover:text-blue-300 py-2" onClick={() => setMenuOpen(false)}>S&apos;inscrire</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
