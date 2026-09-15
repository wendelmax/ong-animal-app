'use client'

import React, { useState } from 'react'
import { Copy, CheckCheck, QrCode } from 'lucide-react'

interface PixCopyButtonProps {
  pixKey?: string
  label?: string
}

export const PixCopyButton: React.FC<PixCopyButtonProps> = ({
  pixKey = 'viralatinhas@viralatinhas.com',
  label = 'Copiar chave PIX (E-mail)',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(pixKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      }
    } catch (err) {
      console.error('Falha ao copiar PIX:', err)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="px-5 py-3.5 bg-white border-2 border-zinc-200 rounded-2xl font-mono font-bold text-zinc-800 text-sm flex items-center gap-2 select-all shadow-sm">
        <QrCode className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>{pixKey}</span>
      </div>

      <button
        onClick={handleCopy}
        type="button"
        className={`px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
          copied
            ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-105'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:scale-102 active:scale-95'
        }`}
      >
        {copied ? (
          <>
            <CheckCheck className="w-4 h-4" /> Copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" /> {label}
          </>
        )}
      </button>
    </div>
  )
}
