'use client'

import React, { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url }) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        })
        return
      } catch (err) {
        // Ignora se o usuário cancelou o compartilhamento
        if ((err as Error)?.name === 'AbortError') return
      }
    }

    // Fallback para cópia de URL na área de transferência
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      }
    } catch (clipboardErr) {
      console.error('Falha ao copiar link:', clipboardErr)
    }
  }

  return (
    <button
      onClick={handleShare}
      type="button"
      className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black transition-all cursor-pointer border ${
        copied
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : 'bg-white border-zinc-200 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/5'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 text-emerald-600" /> Link copiado!
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5" /> Compartilhar Pet
        </>
      )}
    </button>
  )
}
