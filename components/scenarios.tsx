"use client"

import { Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getPlanById, type Plan } from "@/lib/products"

const SCENARIOS = [
  { id: "meeting-friend", title: "Conhecendo Alguém", image: "/two-friends-meeting-and-talking-casually.jpg" },
  { id: "restaurant", title: "Restaurante", image: "/traditional-japanese-restaurant.jpg" },
  { id: "job-interview", title: "Entrevista de Emprego", image: "/professional-office-interview.jpg" },
  { id: "airport", title: "Aeroporto", image: "/modern-airport-terminal-with-passengers.jpg" },
  { id: "supermarket", title: "Mercado", image: "/supermarket-interior-with-shopping-aisles.jpg" },
  { id: "clothing-store", title: "Loja de Roupas", image: "/modern-clothing-store-interior.jpg" },
  { id: "pharmacy", title: "Farmácia", image: "/modern-medical-office.png" },
  { id: "office", title: "Escritório de Empresa", image: "/modern-conference-room.png" },
] as const

export function Scenarios() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [allowedScenarios, setAllowedScenarios] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadPlan() {
      try {
        const res = await fetch("/api/user/plan", { cache: "no-store" })
        const data = await res.json()

        const userPlan = getPlanById(data.plan) ?? getPlanById("free")
        if (!active) return

        setPlan(userPlan!)
        setAllowedScenarios(userPlan!.scenarios)
      } catch (err) {
        console.error("[scenarios] erro ao carregar plano:", err)
        const fallback = getPlanById("free")!
        setPlan(fallback)
        setAllowedScenarios(fallback.scenarios)
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
    return () => { active = false }
  }, [])

  if (loading || !plan) return null

  return (
    <section className="py-20 px-4 bg-muted/30" id="scenarios">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-bold mb-12">
          Pratique em Situações Reais
        </h2>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCENARIOS.map((scenario) => {
            const isAllowed = allowedScenarios.includes(scenario.id)

            return (
              <div
                key={scenario.id}
                className={`relative border rounded-xl overflow-hidden shadow-md transition ${
                  isAllowed
                    ? "hover:shadow-xl hover:scale-[1.02]"
                    : "opacity-60"
                }`}
              >
                <Link
                  href={
                    isAllowed
                      ? `/select-language/${scenario.id}`
                      : "/upgrade"
                  }
                  className="block"
                >
                  <div className="relative h-48">
                    <Image
                      src={scenario.image}
                      fill
                      alt={scenario.title}
                      className="object-cover"
                    />

                    {!isAllowed && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col gap-2 items-center justify-center">
                        <Lock className="text-white" size={38} />
                        <span className="text-white font-semibold text-lg">
                          Upgrade necessário
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{scenario.title}</h3>
                    {isAllowed ? (
                      <span className="text-green-600 font-medium">Liberado</span>
                    ) : (
                      <span className="text-red-500 font-medium">Bloqueado</span>
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* CTA Upgrade se realmente precisar */}
        {!plan.scenarios.includes("airport") && (
          <div className="text-center mt-12">
            <Link href="/upgrade">
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90">
                Desbloquear Todos os Cenários
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
