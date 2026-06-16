import { Badge } from "@/components/ui/badge";

export function PatientBrandHeader({ badge }: { badge: string }) {
  return (
    <div className="bg-[#1C3D5A] text-white py-5 px-4 sticky top-0 z-50 shadow-md border-b border-amber-600/30">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
            <svg width="22" height="18" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 20H50C65 20 75 30 75 45C75 60 65 70 50 70H35V90H20V20ZM35 32V58H50C58 58 62 53 62 45C62 37 58 32 50 32H35Z" fill="#FEFEFE" />
              <path d="M45 40H65C73 40 80 47 80 55C80 63 73 70 65 70H45V40Z" fill="#B87333" opacity="0.85" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide uppercase text-amber-500">
              Dr. Felipe de Bulhões Ojeda
            </h1>
            <p className="text-xs font-semibold text-slate-200">Urologia & Andrologia</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-bold uppercase py-1 border-amber-500/30 text-amber-500 bg-amber-500/5"
        >
          {badge}
        </Badge>
      </div>
    </div>
  );
}
