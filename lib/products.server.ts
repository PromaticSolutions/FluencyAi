'use server'

import { createClient } from "./supabase/server"
import { PLANS, getPlanById } from "./products"

/**
 * Função de servidor para obter o plano do usuário autenticado.
 * DEVE ser usada apenas em Server Components ou Server Actions.
 * 
 * @returns {Promise<Plan>} O plano do usuário ou o plano gratuito como fallback
 */
export async function getUserPlan() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return PLANS[0] // Plano Gratuito para usuários não logados
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("plan_id")
    .eq("id", user.id)
    .single()

  const planId = userProfile?.plan_id || "free"
  const plan = getPlanById(planId)
  return plan || PLANS[0]
}