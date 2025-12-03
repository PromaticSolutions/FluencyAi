"use client"
import type { KeyboardEvent } from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Mic, Volume2, Loader2, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const scenarioData: Record<string, any> = {
  "meeting-friend": {
    title: "Conhecendo Alguém",
    character: "Alex",
    characterRole: "Novo amigo/amiga",
  },
  restaurant: {
    title: "Restaurante",
    character: "Taylor",
    characterRole: "Garçom/Garçonete",
  },
  "job-interview": {
    title: "Entrevista de Emprego",
    character: "Jordan",
    characterRole: "Recrutador",
  },
  airport: {
    title: "Aeroporto",
    character: "Sam",
    characterRole: "Atendente do aeroporto",
  },
  supermarket: {
    title: "Mercado",
    character: "Chris",
    characterRole: "Funcionário do mercado",
  },
  "clothing-store": {
    title: "Loja de Roupa",
    character: "Morgan",
    characterRole: "Vendedor(a)",
  },
  pharmacy: {
    title: "Farmácia",
    character: "Dr. Lee",
    characterRole: "Farmacêutico",
  },
  office: {
    title: "Escritório de Empresa",
    character: "Pat",
    characterRole: "Colega de trabalho",
  },
}

const languageConfig: Record<string, any> = {
  english: { name: "Inglês", code: "en-US", nativeName: "English" },
  spanish: { name: "Espanhol", code: "es-ES", nativeName: "Español" },
  french: { name: "Francês", code: "fr-FR", nativeName: "Français" },
}

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export default function PracticePage() {
  // Simular params da URL com proteções robustas
  const [scenarioId, setScenarioId] = useState("")
  const [languageId, setLanguageId] = useState("english")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const pathname = window.location?.pathname || ""
        const pathParts = pathname.split('/').filter(Boolean)
        const lastPart = pathParts[pathParts.length - 1] || ""
        setScenarioId(lastPart)
        
        const searchParams = new URLSearchParams(window.location?.search || "")
        const lang = searchParams.get("language")
        if (lang && typeof lang === "string") {
          setLanguageId(lang)
        }
      } catch (error) {
        console.error("Error parsing URL:", error)
      }
    }
  }, [])

  const scenario = scenarioData[scenarioId]
  const language = languageConfig[languageId]

  // Proteção adicional para evitar undefined
  const systemPrompt = scenario && language ? `You are ${scenario.character}, a friendly ${scenario.characterRole} helping a Brazilian student practice ${language.nativeName} (${language.name}).

IMPORTANT INSTRUCTIONS:
- Respond naturally in ${language.nativeName} to the conversation
- After each of your ${language.nativeName} responses, add a feedback section in Portuguese starting with "💡 Feedback:"
- In the feedback, comment on: pronunciation hints, grammar corrections if needed, vocabulary suggestions, and encouragement
- Keep feedback brief (2-3 sentences) and positive
- If they make mistakes, correct them gently in the feedback section
- At the end of conversation (if they say goodbye), provide a performance summary in Portuguese` : ""

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [creditError, setCreditError] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messageCountInCredit, setMessageCountInCredit] = useState(0)
  const [showCreditWarning, setShowCreditWarning] = useState(false)

  useEffect(() => {
    async function fetchCreditsAndMessages() {
      try {
        const response = await fetch("/api/credits")
        if (!response.ok) {
          throw new Error("Failed to fetch credits")
        }
        const data = await response.json()
        setUserCredits(data.credits ?? 0)
        setMessageCountInCredit(data.message_count || 0)
      } catch (error) {
        console.error("[v0] Error fetching credits:", error)
        setUserCredits(0)
      }
    }
    fetchCreditsAndMessages()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
  if (typeof window === "undefined") return;
  if (!scenario || !language) return; // ✅ proteção extra

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  setSpeechSupported(true);
  const recognition = new SpeechRecognition();

  recognition.lang = language.code; // agora language é garantido
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    try {
      const result = event.results?.[0]?.[0];
      const transcript = result?.transcript;

      if (transcript && typeof transcript === "string" && transcript.trim().length > 0) {
        const cleanTranscript = transcript.trim();
        console.log("[v0] Audio transcribed:", cleanTranscript);
        setInput(cleanTranscript);
        setTimeout(() => {
          handleSendAfterTranscription(cleanTranscript);
        }, 100);
      } else {
        console.log("Invalid or empty transcript");
      }
    } catch (error) {
      console.error("Error processing speech result:", error);
      setIsRecording(false);
    }
  };

  recognition.onerror = (event: any) => {
    console.error("[v0] Speech recognition error:", event.error);
    setIsRecording(false);
  };

  recognition.onend = () => {
    console.log("[v0] Recording ended");
    setIsRecording(false);
  };

  recognitionRef.current = recognition;
}, [scenario, language]);

  const handleSendAfterTranscription = async (transcribedText: string) => {
    // Validação rigorosa do texto
    if (!transcribedText || 
        typeof transcribedText !== "string" || 
        transcribedText.trim().length === 0 || 
        isLoading) {
      console.log("Invalid transcription, skipping")
      return
    }

    const cleanText = String(transcribedText).trim()
    
    const userMessage: Message = {
      role: "user",
      content: cleanText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const conversationHistory = [
        { role: "system", content: String(systemPrompt || "") },
        ...messages.map((m) => ({ 
          role: m.role, 
          content: String(m.content || "") 
        })),
        { role: "user", content: cleanText },
      ]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory, scenarioId, language: languageId }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: String(data.message || ""),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    // Validação rigorosa do input
    if (!input || 
        typeof input !== "string" || 
        input.trim().length === 0 || 
        isLoading) {
      console.log("Invalid input, skipping")
      return
    }

    if (messageCountInCredit >= 20) {
      setShowCreditWarning(true)
      return
    }

    const cleanInput = String(input).trim()

    const userMessage: Message = {
      role: "user",
      content: cleanInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const conversationHistory = [
        { role: "system", content: String(systemPrompt || "") },
        ...messages.map((m) => ({ 
          role: m.role, 
          content: String(m.content || "") 
        })),
        { role: "user", content: cleanInput },
      ]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory, scenarioId, language: languageId }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: String(data.message || ""),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      setMessageCountInCredit((prev) => {
        const newCount = prev + 1
        if (newCount >= 18) {
          setShowCreditWarning(true)
        }
        return newCount
      })
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) return

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      setIsRecording(true)
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("[v0] Error starting recording:", error)
        setIsRecording(false)
      }
    }
  }

  const startConversation = async () => {
    if (conversationStarted) return

    if (userCredits === 0) {
      setCreditError(true)
      return
    }

    setIsLoading(true)
    setConversationStarted(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages, scenarioId, language: languageId }),
      })

      if (!response.ok) throw new Error("Failed to start conversation")

      const data = await response.json()
      setMessages([
        {
          role: "assistant",
          content: data.message || "",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("[v0] Error starting conversation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const speakMessage = (content: string) => {
    // Validação rigorosa antes de falar
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      console.log("Invalid content for speech")
      return
    }
    
    try {
      const cleanContent = String(content).trim()
      const utterance = new SpeechSynthesisUtterance(cleanContent)
      utterance.lang = language?.code || "en-US"
      
      // Adicionar handlers de erro
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
      }
      
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("[v0] Error speaking message:", error)
    }
  }

  if (!scenario || !language) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cenário não encontrado</h1>
          <Button onClick={() => window.location.href = '/scenarios'}>Voltar aos Cenários</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm sm:text-base text-white truncate">{scenario.title}</h1>
              <p className="text-xs text-zinc-400 truncate">
                {scenario.character} • {language.name}
              </p>
            </div>
          </div>
          {userCredits !== null && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-zinc-400">{messageCountInCredit}/20</div>
              <div className="px-2 sm:px-3 py-1 rounded-full bg-primary/20 border border-primary/30 flex items-center gap-1.5 flex-shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">{userCredits}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {!conversationStarted && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Mic className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">Pronto para começar?</h2>
                <p className="text-sm sm:text-base text-zinc-400 mb-4">
                  Cada crédito permite 20 mensagens. Você praticará {language.name} no cenário {scenario.title}.
                </p>
              </div>
              <Button
                size="lg"
                onClick={startConversation}
                disabled={isLoading || userCredits === 0}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  "Iniciar Conversa"
                )}
              </Button>
              {userCredits === 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium mb-2">Sem créditos disponíveis</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/buy-credits'}
                  >
                    Comprar Créditos
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {showCreditWarning && messageCountInCredit >= 18 && messageCountInCredit < 20 && (
              <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-3">
                <p className="text-sm text-orange-400 text-center">
                  Você tem {20 - messageCountInCredit} mensagem(ns) restantes neste crédito
                </p>
              </div>
            )}

            {messageCountInCredit >= 20 && (
              <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive text-center font-medium">
                  Limite de 20 mensagens atingido!
                  <button 
                    onClick={() => window.location.href = '/buy-credits'}
                    className="underline ml-1 hover:text-destructive/80"
                  >
                    Compre mais créditos
                  </button>
                </p>
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 space-y-3 bg-zinc-950"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgb(39 39 42 / 0.4) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            >
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-lg shadow-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-zinc-900 text-zinc-100 rounded-bl-sm"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-b border-zinc-800">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">{scenario.character?.[0] || "?"}</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-300">{scenario.character}</span>
                      </div>
                    )}
                    <div className="px-3 py-2">
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                        {message.content || ""}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 gap-2">
                        {message.role === "assistant" && (
                          <button
                            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                            onClick={() => speakMessage(message.content)}
                          >
                            <Volume2 className="h-3 w-3" />
                            Ouvir
                          </button>
                        )}
                        <span className="text-[10px] text-zinc-500 ml-auto">
                          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 rounded-lg rounded-bl-sm px-4 py-3 shadow-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="bg-zinc-900 border-t border-zinc-800 px-3 py-3 sm:px-4 sm:py-4">
              {isRecording && (
                <div className="mb-3 bg-red-500/10 rounded-xl px-4 py-3 flex items-center gap-3 border border-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm text-red-400 font-medium flex-1">Gravando áudio...</span>
                  <span className="text-xs text-red-400/70">Fale agora</span>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1 bg-zinc-800 rounded-full px-4 py-2.5 flex items-center gap-2 border border-zinc-700">
                  <input
                    type="text"
                    value={input || ""}
                    onChange={(e) => {
                      const value = e.target?.value
                      setInput(typeof value === "string" ? value : "")
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder={`Mensagem em ${language?.name || ""}...`}
                    className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 outline-none"
                    disabled={isLoading || isRecording || messageCountInCredit >= 20}
                  />

                  {speechSupported && !input.trim() && messageCountInCredit < 20 && (
                    <button
                      onClick={toggleRecording}
                      disabled={isLoading}
                      className={`flex-shrink-0 transition-all ${
                        isRecording ? "text-red-500 scale-110" : "text-primary hover:text-primary/80"
                      }`}
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <Button
                  id="send-message-btn"
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || isRecording || messageCountInCredit >= 20}
                  className="h-11 w-11 rounded-full flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}