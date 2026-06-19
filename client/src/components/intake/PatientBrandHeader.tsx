import { Badge } from "@/components/ui/badge";

export function PatientBrandHeader({ badge }: { badge: string }) {
  return (
    <div className="brand-gradient text-white py-4 px-4 sticky top-0 z-50 shadow-md border-b border-[#B87333]/30">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/isotipo.svg"
            alt="Isotipo Dr. Felipe de Bulhões"
            className="h-9 w-auto invert opacity-90"
          />
          <div>
            <h1 className="font-serif text-base text-white tracking-wide leading-none">
              Dr. Felipe de Bulhões
            </h1>
            <p className="text-[10px] text-white/60 tracking-[0.15em] uppercase font-light">Urologia &amp; Cirurgia Geral</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-bold uppercase py-1 border-[#B87333]/40 text-[#B87333] bg-[#B87333]/10"
        >
          {badge}
        </Badge>
      </div>
    </div>
  );
}
