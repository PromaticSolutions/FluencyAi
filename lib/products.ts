export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  credits: number
  popular?: boolean
}

// Source of truth for all credit packages
export const PRODUCTS: Product[] = [
  {
    id: "starter-pack",
    name: "Pacote Starter",
    description: "20 créditos = 400 mensagens (20 por crédito)",
    priceInCents: 2490, // R$ 24.90
    credits: 20,
  },
  {
    id: "premium-pack",
    name: "Premium Ilimitado",
    description: "120 créditos = 2.400 mensagens (20 por crédito)",
    priceInCents: 7990, // R$ 79.90
    credits: 120,
    popular: true,
  },
]

// Interface para planos com regras de negócio
export interface Plan {
  id: "free" | "test" | "basic" | "premium" | "vip"
  name: string
  description: string
  priceInCents: number | null
  credits: number | null
  messageLimit: number | null
  languages: ("en" | "es" | "fr")[]
  scenarios: string[]
  popular?: boolean
}

// Planos com regras de negócio (para validação e controle de acesso)
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Plano Gratuito",
    description: "Teste rapidamente o app.",
    priceInCents: 0,
    credits: 3,
    messageLimit: 60,
    languages: ["en"],
    scenarios: ["meeting-friend", "restaurant"],
  },
  {
    id: "test",
    name: "Plano Teste",
    description: "Ideal para experimentar mais idiomas e cenários.",
    priceInCents: 990,
    credits: 5,
    messageLimit: 100,
    languages: ["en", "es", "fr"],
    scenarios: ["meeting-friend", "restaurant", "job-interview", "airport"],
  },
  {
    id: "basic",
    name: "Plano Básico",
    description: "Para quem leva o aprendizado a sério.",
    priceInCents: 2490,
    credits: 20,
    messageLimit: 400,
    languages: ["en", "es", "fr"],
    scenarios: [
      "meeting-friend",
      "restaurant",
      "job-interview",
      "airport",
      "supermarket",
      "clothing-store",
    ],
  },
  {
    id: "premium",
    name: "Plano Premium",
    description: "Acesso total e feedback avançado.",
    priceInCents: 7990,
    credits: 120,
    messageLimit: 2400,
    languages: ["en", "es", "fr"],
    scenarios: [
      "meeting-friend",
      "restaurant",
      "job-interview",
      "airport",
      "supermarket",
      "clothing-store",
      "pharmacy",
      "office",
    ],
    popular: true,
  },
  {
    id: "vip",
    name: "Plano VIP / Ilimitado",
    description: "Fluência sem limites.",
    priceInCents: 19990,
    credits: null,
    messageLimit: null,
    languages: ["en", "es", "fr"],
    scenarios: [
      "meeting-friend",
      "restaurant",
      "job-interview",
      "airport",
      "supermarket",
      "clothing-store",
      "pharmacy",
      "office",
    ],
  },
]

// Mapeamento de cenários para descrições
export const SCENARIO_DESCRIPTIONS: Record<string, string> = {
  "meeting-friend": "conversa casual",
  "restaurant": "pedir comida, reserva, conta",
  "job-interview": "entrevista formal",
  "airport": "check-in, imigração",
  "supermarket": "compras",
  "clothing-store": "roupas, numeração",
  "pharmacy": "sintomas, medicamentos",
  "office": "ambiente de trabalho",
}

// Lista de todos os IDs de cenários
export const ALL_SCENARIO_IDS = Object.keys(SCENARIO_DESCRIPTIONS)

// Função auxiliar para obter um plano pelo ID
export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id)
}

// Mapeamento de IDs de planos pagos para Stripe
export const STRIPE_PRODUCT_MAP: Record<string, string> = {
  "test": "price_1SaFSiHBpM4SjtcoOPuSf2Du",
  "basic": "price_1SaFV5HBpM4Sjtco9xdwFSja",
  "premium": "price_1SaFWXHBpM4SjtcoFG78wo6f",
  "vip": "price_1SaFX9HBpM4SjtcordPTDlca2",
}