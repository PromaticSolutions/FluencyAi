import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"

// Importações corrigidas
import { getUserPlan } from "../../lib/products.server"
import { ALL_SCENARIO_IDS } from "../../lib/products"

// Mapeamento de IDs de cenário para títulos e imagens (mantido para referência)
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
  // O erro 'Cannot find name 'getUserPlan'' foi corrigido pela importação acima.
  const userPlan = await getUserPlan()
  const availableScenarios = userPlan.scenarios

  // Corrigido o erro 7006: Parameter 'id' implicitly has an 'any' type.
  const scenarios = ALL_SCENARIO_IDS.map((id: string) => ({
    id,
    ...scenarioDetails[id],
    isAvailable: availableScenarios.includes(id),
  }))

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Selecione um Cenário</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Corrigido o erro 7006: Parameter 'scenario' implicitly has an 'any' type. */}
        {scenarios.map((scenario: { id: string; title: string; image: string; isAvailable: boolean }) => (
          <Link
            key={scenario.id}
            href={scenario.isAvailable ? `/select-language/${scenario.id}` : "/buy-credits"}
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
                <span className="text-sm text-red-500 font-semibold">Bloqueado</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}