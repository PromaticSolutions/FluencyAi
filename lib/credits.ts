"use server"

import { createClient } from "@/lib/supabase/server"
import { PLANS, getPlanById } from "./products" // Importar a nova estrutura de planos

export async function getCredits(): Promise<{ credits: number; total_messages_sent: number }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { credits: 0, total_messages_sent: 0 }
  }

  const { data: userProfile } = await supabase.from("users").select("credits, total_messages_sent").eq("id", user.id).single()

  return {
    credits: userProfile?.credits || 0,
    total_messages_sent: userProfile?.total_messages_sent || 0,
  }
}

export async function addCredits(amount: number): Promise<number> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { credits } = await getCredits()
  const newCredits = credits + amount

  await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)

  return newCredits
}

export async function trackMessage(): Promise<{
  success: boolean
  remainingCredits: number
  totalMessagesSent: number
  planId: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, remainingCredits: 0, totalMessagesSent: 0, planId: "free" }
  }

  const { data: userProfile } = await supabase.from("users").select("credits, total_messages_sent, plan_id").eq("id", user.id).single()

  if (!userProfile) {
    return { success: false, remainingCredits: 0, totalMessagesSent: 0, planId: "free" }
  }

  const currentCredits = userProfile.credits || 0
  const totalMessagesSent = userProfile.total_messages_sent || 0
  const planId = userProfile.plan_id || "free"
  const userPlan = getPlanById(planId) || PLANS[0] // Assume PLANS[0] é o plano gratuito

  // 1. Verificar limite de mensagens do plano (se não for ilimitado)
  if (userPlan.messageLimit !== null && totalMessagesSent >= userPlan.messageLimit) {
    return {
      success: false,
      remainingCredits: currentCredits,
      totalMessagesSent: totalMessagesSent,
      planId,
    }
  }

  // 2. Incrementar total de mensagens enviadas
  const newTotalMessagesSent = totalMessagesSent + 1

  // 3. Atualizar o perfil do usuário
  await supabase
    .from("users")
    .update({
      // Créditos não são deduzidos aqui, apenas o contador de mensagens é atualizado
      total_messages_sent: userPlan.messageLimit !== null ? newTotalMessagesSent : null, // Se ilimitado, mantém null
    })
    .eq("id", user.id)

  // 4. Verificar se o novo total atingiu o limite (para a próxima requisição)
  const isLimitReached = userPlan.messageLimit !== null && newTotalMessagesSent >= userPlan.messageLimit

  return {
    success: !isLimitReached,
    remainingCredits: userPlan.credits !== null ? currentCredits : 0, // Retorna 0 se ilimitado
    totalMessagesSent: userPlan.messageLimit !== null ? newTotalMessagesSent : 0, // Retorna 0 se ilimitado
    planId,
  }
}

export async function deductCredit(): Promise<{ success: boolean; remainingCredits: number }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, remainingCredits: 0 }
  }

  const { credits } = await getCredits()
  const { data: userProfile } = await supabase.from("users").select("plan_id").eq("id", user.id).single()
  const planId = userProfile?.plan_id || "free"
  const userPlan = getPlanById(planId) || PLANS[0]

  if (userPlan.credits === null) {
    // Plano ilimitado, não deduz crédito
    return { success: true, remainingCredits: 0 }
  }

  if (credits <= 0) {
    return { success: false, remainingCredits: 0 }
  }

  const newCredits = credits - 1

  await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)

  return { success: true, remainingCredits: newCredits }
}