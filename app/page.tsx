import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl space-y-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
            PlaceNaka 🎫
          </h1>
          <p className="text-xl text-gray-600 sm:text-2xl">
            Réservez votre place pour les meilleurs événements
          </p>
          <p className="text-lg text-gray-500">
            Application de réservation de places avec plans interactifs
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/events"
              className="rounded-lg bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Voir les événements
            </Link>
            <Link
              href="/organizer/dashboard"
              className="rounded-lg border-2 border-blue-600 px-8 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            >
              Organiser un événement
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">🎯 Réservation facile</h3>
              <p className="text-gray-600">
                Sélectionnez visuellement votre place sur le plan interactif
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">🗺️ Plans interactifs</h3>
              <p className="text-gray-600">
                Visualisez le lieu avec tables, chaises et zones
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">💳 Paiement sécurisé</h3>
              <p className="text-gray-600">
                Paiement en ligne sécurisé avec Stripe
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
