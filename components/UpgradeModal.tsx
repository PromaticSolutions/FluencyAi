"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recurso Premium 🚀</DialogTitle>
          <DialogDescription>
            Este cenário não está disponível no seu plano atual.
            Faça upgrade e desbloqueie:
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 mt-3 text-sm">
          <li>✔️ Cenários ilimitados</li>
          <li>✔️ Todos os idiomas liberados</li>
          <li>✔️ Mensagens ilimitadas</li>
          <li>⚡ Treinamento avançado</li>
        </ul>

        <Link href="/upgrade">
          <Button className="w-full mt-4">Fazer upgrade agora</Button>
        </Link>

        <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
          Continuar no plano atual
        </Button>
      </DialogContent>
    </Dialog>
  )
}
