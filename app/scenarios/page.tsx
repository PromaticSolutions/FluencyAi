import Link from "next/link"
import Image from "next/image"

const scenarios = [
  {
    id: "meeting-friend",
    title: "Conhecendo Alguém",
    image: "/two-friends-meeting-and-talking-casually.jpg",
  },
  {
    id: "restaurant",
    title: "Restaurante",
    image: "/traditional-japanese-restaurant.jpg",
  },
  {
    id: "job-interview",
    title: "Entrevista de Emprego",
    image: "/professional-office-interview.jpg",
  },
  {
    id: "airport",
    title: "Aeroporto",
    image: "/modern-airport-terminal-with-passengers.jpg",
  },
  {
    id: "supermarket",
    title: "Mercado",
    image: "/supermarket-interior-with-shopping-aisles.jpg",
  },
  {
    id: "clothing-store",
    title: "Loja de Roupa",
    image: "/modern-clothing-store-interior.jpg",
  },
  {
    id: "pharmacy",
    title: "Farmácia",
    image: "/modern-medical-office.png",
  },
  {
    id: "office",
    title: "Escritório de Empresa",
    image: "/modern-conference-room.png",
  },
]

export default function ScenariosPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Selecione um Cenário</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/select-language/${scenario.id}`}
            className="group border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            <div className="relative w-full h-40">
              <Image
                src={scenario.image}
                alt={scenario.title}
                fill
                className="object-cover group-hover:scale-105 transition"
              />
            </div>

            <div className="p-4">
              <h2 className="text-lg font-medium">{scenario.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
