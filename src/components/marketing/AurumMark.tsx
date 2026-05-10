import { Link } from 'react-router-dom'

export function AurumMark() {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--gold),var(--gold2))] text-black shadow-[0_18px_40px_rgba(215,182,97,0.25)]">
        <div className="font-display text-sm font-bold tracking-tight">Au</div>
      </div>
      <div className="leading-tight">
        <div className="font-display text-sm font-semibold tracking-tight text-white/90">Aurum</div>
        <div className="text-xs text-white/55">Investment</div>
      </div>
    </Link>
  )
}

