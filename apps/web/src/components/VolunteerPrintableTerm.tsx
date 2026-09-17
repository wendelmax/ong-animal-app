type PrintableTermProps = {
  volunteer: { fullName: string; cpf: string }
  acceptance: { acceptedAt: string; ipAddress: string; userAgent: string; statement: string }
  renderedContent: string
  term: { version: string; contentHash: string }
  showFullCpf: boolean
  logoSrc: string
}

export function VolunteerPrintableTerm({ volunteer, acceptance, renderedContent, term, showFullCpf, logoSrc }: PrintableTermProps) {
  return (
    <main className="printable-term mx-auto max-w-4xl bg-white px-6 py-8 text-zinc-900 print:max-w-none print:px-0 print:py-0">
      <style>{`@media print { .print-controls { display: none !important; } .printable-term { margin: 0; } @page { margin: 16mm; } }`}</style>
      <div className="print-controls mb-6 flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <span className="text-sm text-zinc-700">Cópia local do termo — use “Imprimir” e escolha “Salvar como PDF”.</span>
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white">Imprimir</button>
      </div>
      <header className="border-b-2 border-zinc-800 pb-5 text-center">
        <img src={logoSrc} alt="Viralatinhas Sumaré" className="mx-auto mb-3 h-20 w-auto object-contain" />
        <h1 className="text-xl font-bold">ASSOCIAÇÃO VIRALATINHAS DE SUMARÉ</h1>
        <p className="text-sm">CNPJ 11.805.776/0001-03 · Rua Múcio de Souza Campos, 33 · Sumaré/SP</p>
      </header>
      <section className="mt-6 grid gap-2 border-b border-zinc-300 pb-5 text-sm sm:grid-cols-2">
        <p><strong>Voluntário:</strong> {volunteer.fullName}</p>
        <p><strong>CPF:</strong> {showFullCpf ? volunteer.cpf : volunteer.cpf.replace(/^\d{3}(\d{3})(\d{3})(\d{2})$/, '***.$1.$2-**')}</p>
        <p><strong>Versão:</strong> {term.version}</p>
        <p><strong>Código de referência:</strong> {term.contentHash}</p>
      </section>
      <article className="mt-6 whitespace-pre-wrap text-[0.95rem] leading-7">{renderedContent}</article>
      <footer className="mt-8 border-t border-zinc-300 pt-4 text-xs text-zinc-600">
        <p><strong>Registro do aceite eletrônico:</strong> {acceptance.statement}</p>
        <p>Data/hora UTC: {acceptance.acceptedAt} · IP: {acceptance.ipAddress}</p>
        <p>User-Agent: {acceptance.userAgent}</p>
        <p className="mt-3 text-center">Documento gerado para arquivo local · versão {term.version} · hash {term.contentHash}</p>
      </footer>
    </main>
  )
}
