"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PLANS, Plan } from "@/lib/products"
import { Check } from "lucide-react"
import Link from "next/link"

const getPlanFeatures = (plan: Plan) => {
  const features: string[] = []

  // Créditos e Mensagens
  if (plan.credits !== null) {
    features.push(`${plan.credits} créditos`)
  } else {
    features.push("Créditos Ilimitados")
  }

  if (plan.messageLimit !== null) {
    features.push(`${plan.messageLimit} mensagens (1 por crédito)`)
  } else {
    features.push("Mensagens Ilimitadas")
  }

  // Idiomas
  const langMap: Record<string, string> = { en: "Inglês", es: "Espanhol", fr: "Francês" }
  const langs = plan.languages.map((l) => langMap[l]).join(", ")
  features.push(`Idiomas: ${langs}`)

  // Cenários (mensagens adaptadas conforme quantidade)
  if (plan.scenarios.length === 2) {
    features.push("2 cenários disponíveis")
  } else if (plan.scenarios.length === 4) {
    features.push("4 cenários disponíveis")
  } else if (plan.scenarios.length === 6) {
    features.push("6 cenários disponíveis")
  } else if (plan.scenarios.length >= 8) {
    features.push("Todos os 8 cenários")
  } else {
    features.push(`${plan.scenarios.length} cenários disponíveis`)
  }

  // Outras features
  features.push("Feedback em tempo real")
  if (plan.id !== "free") {
    features.push("Créditos nunca expiram")
  }
  if (plan.id === "premium" || plan.id === "vip") {
    features.push("Feedback avançado com gramática")
  }
  if (plan.id === "premium") {
    features.push("Melhor custo-benefício")
  }

  return features
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
            Comece de graça, cresça no seu ritmo
          </h2>
          <p className="text-base md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto px-4">
            Escolha o plano ideal para sua jornada de fluência
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 max-w-sm md:max-w-none mx-auto">
          {PLANS.filter((p) => p.id !== "test").map((plan, index) => {
            const features = getPlanFeatures(plan)

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-primary border-2 shadow-lg md:scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs md:text-sm">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 md:pb-8 pt-6 md:pt-6">
                  <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                  <div className="mt-3 md:mt-4">
                    <span className="text-4xl md:text-5xl font-bold">
                      {plan.priceInCents === null
                        ? "Grátis"
                        : `R$ ${(plan.priceInCents! / 100).toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                  <CardDescription className="text-sm md:text-base mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="px-4 md:px-6">
                  <ul className="space-y-2.5 md:space-y-3">
                    {features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2.5 md:gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-4 md:px-6 pb-6">
                  <Link href={plan.id === "free" ? "/register" : "/buy-credits"} className="w-full">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                      {plan.id === "free" ? "Começar Grátis" : "Comprar Plano"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
