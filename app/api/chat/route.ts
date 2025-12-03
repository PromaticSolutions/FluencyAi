import { generateText } from "ai"
import { trackMessage } from "@/lib/credits"
import { getPlanById, SCENARIO_DESCRIPTIONS } from "@/lib/products"

export async function POST(req: Request) {
  try {
    const { messages, scenarioId, language } = await req.json()

    const trackResult = await trackMessage()

    const userPlan = getPlanById(trackResult.planId)
    if (!userPlan) {
      // Isso não deve acontecer se o trackResult.planId for 'free' por padrão, mas garante a tipagem
      return Response.json(
        { error: "Erro interno: Plano do usuário não encontrado." },
        { status: 500 },
      )
    }

    // 1. Validação de Cenário
    if (!userPlan.scenarios.includes(scenarioId)) {
      return Response.json(
        { error: "Esse cenário não está disponível no seu plano. Faça upgrade para desbloquear." },
        { status: 403 },
      )
    }

    // 2. Validação de Idioma
    if (!userPlan.languages.includes(language)) {
      return Response.json(
        { error: "No plano gratuito você só pode usar inglês." },
        { status: 403 },
      )
    }

    if (!trackResult.success) {
      return Response.json(
        { error: "Você atingiu o limite do seu plano. Faça upgrade para continuar." },
        { status: 403 },
      )
    }

    const systemPrompt = `Você é um assistente de conversação para aprendizado de idiomas.
    Cenário: ${scenarioId} (${SCENARIO_DESCRIPTIONS[scenarioId] || "Cenário não definido"}).
    Idioma da Conversa: ${language}.
    Regras:
    1. Gere uma conversação realista com base no cenário.
    2. Sua resposta deve ser curta, natural e dentro do contexto do cenário.
    3. Sua resposta DEVE ser no formato: "${language.toUpperCase()}: [Resposta no idioma escolhido]\n\nFeedback: [Feedback em Português]".
    4. O Feedback em Português deve ser simpático, motivacional e didático. Deve incluir:
       - Pontos de acerto.
       - Erros de vocabulário ou gramática (se houver).
       - Sugestão de como melhorar.
       - Explicação clara.
    5. Nunca seja crítico ou ofensivo. Sempre elogie o esforço do aluno.
    6. Se o usuário tentar sair do cenário, gentilmente o traga de volta.
    7. Se o usuário tentar falar em outro idioma que não seja o escolhido, responda no idioma escolhido e dê um feedback sobre o uso do idioma incorreto.
    `

    const { text } = await generateText({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    return Response.json({
      message: text,
      remainingCredits: trackResult.remainingCredits,
      totalMessagesSent: trackResult.totalMessagesSent,
      planId: trackResult.planId,
    })
  } catch (error) {
    console.error("[v0] Error in chat API:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}