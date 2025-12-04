import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"
import { getUserPlan } from "../../lib/products.server"
import { ALL_SCENARIO_IDS } from "../../lib/products"

// Mapeamento dos cenários com título e imagem
const scenarioDetails: Record<string, { title: string; image: string }> = {
  "meeting-friend": {
    title: "Conhecendo Alguém",
    image: "/two-friends-meeting-and-talking-casually.jpg",
  },
  "restaurant": {
    title: "Restaurante",
    image: "/traditional-japanese-restaurant.jpg",
  },
  "job-interview": {
    title: "Entrevista de Emprego",
    image: "/professional-office-interview.jpg",
  },
  "airport": {
    title: "Aeroporto",
    image: "/modern-airport-terminal-with-passengers.jpg",
  },
  "supermarket": {
    title: "Mercado",
    image: "/supermarket-interior-with-shopping-aisles.jpg",
  },
  "clothing-store": {
    title: "Loja de Roupa",
    image: "/modern-clothing-store-interior.jpg",
  },
  "pharmacy": {
    title: "Farmácia",
    image: "/modern-medical-office.png",
  },
  "office": {
    title: "Escritório de Empresa",
    image: "/modern-conference-room.png",
  },
}

export default async function ScenariosPage() {
  const userPlan = await getUserPlan() // Retorna o plano do usuário
  const allowedScenarios = userPlan.scenarios // Lista de cenários liberados

  const scenarios = ALL_SCENARIO_IDS.map((id) => ({
    id,
    ...scenarioDetails[id],
    isAvailable: allowedScenarios.includes(id), // verifica permissão
  }))

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Escolha seu Cenário</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={
              scenario.isAvailable
                ? `/select-language/${scenario.id}`
                : "/upgrade" // redireciona para upgrade
            }
            className={`group border rounded-lg overflow-hidden shadow transition ${
              scenario.isAvailable
                ? "hover:shadow-lg cursor-pointer"
                : "opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="relative w-full h-40">
              <Image
                src={scenario.image}
                alt={scenario.title}
                fill
                className={`object-cover transition ${
                  scenario.isAvailable ? "group-hover:scale-105" : "grayscale"
                }`}
              />
              {!scenario.isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">{scenario.title}</h2>
              {!scenario.isAvailable && (
                <span className="text-sm text-red-500 font-semibold">
                  Bloqueado
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
