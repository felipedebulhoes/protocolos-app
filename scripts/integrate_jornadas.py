#!/usr/bin/env python3
"""Integra o cronograma/alertas das 12 jornadas nos protocolos existentes.

Idempotente: se a seção "Cronograma da Jornada" já existir, é substituída
(em vez de duplicada). Insere a seção logo antes das Referências (ou no fim,
antes da Secretaria) para manter a ordem clínica.
"""
import json

PROTOCOLS = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"
JORNADAS = "/home/ubuntu/jornadas_export.json"
SECTION_TITLE = "📅 Cronograma da Jornada (Resumo) & Sinais de Alerta"

# jornada_id -> [protocolo_ids]
MAP = {
    "protese-peniana": ["1_implante_protese_peniana", "1b_protese_semirrigida"],
    "varicocelectomia": ["2_varicocelectomia", "varicocele"],
    "vasectomia": ["6_vasectomia_sem_bisturi"],
    "reversao-vasectomia": ["5b_reversao_vasectomia"],
    "microtese": ["5_micro_tese"],
    "li-eswt-prp": ["21_li_eswt_ondas_choque", "23_prp_intracavernoso"],
    "postectomia-frenuloplastia": ["11_circuncisao_frenuloplastia"],
    "litiase": ["27_litiase_renal", "litiase_renal_ureteral"],
    "hpb": ["13_hpb_manejo_completo"],
    "trt": ["8_trt_performance"],
    "incontinencia": ["28_incontinencia_urinaria", "iue_feminina"],
    "itu-repeticao": ["29_itu_repeticao"],
}


def build_markdown(j):
    lines = []
    lines.append(f"> **{j['nome']}** — {j['resumo']}")
    lines.append("")
    lines.append("Esta é a linha do tempo objetiva do cuidado, do preparo à alta funcional. "
                 "Cada retorno tem um propósito clínico definido.")
    lines.append("")
    lines.append("| Momento | O que é avaliado/feito |")
    lines.append("|---|---|")
    for et in j["seguimento"]:
        quando = et["quando"].replace("|", "/")
        acao = et["acao"].replace("|", "/")
        lines.append(f"| **{quando}** | {acao} |")
    lines.append("")
    lines.append("**🚨 Sinais de alerta — contato imediato com a equipe:**")
    lines.append("")
    for a in j["alertas"]:
        lines.append(f"- {a}")
    lines.append("")
    lines.append("**Fontes:** " + " ".join(j["fontes"]))
    return "\n".join(lines)


def main():
    data = json.load(open(PROTOCOLS, encoding="utf-8"))
    jornadas = json.load(open(JORNADAS, encoding="utf-8"))
    by_id = {p["id"]: p for p in data}

    touched = []
    for jid, proto_ids in MAP.items():
        j = jornadas[jid]
        content = build_markdown(j)
        new_section = {
            "title": SECTION_TITLE,
            "content": content,
            "is_journey": True,
        }
        for pid in proto_ids:
            p = by_id.get(pid)
            if not p:
                print(f"  [SKIP] protocolo não encontrado: {pid}")
                continue
            secs = p.setdefault("sections", [])
            # remover seção anterior (idempotência)
            secs[:] = [s for s in secs if s.get("title") != SECTION_TITLE]
            # encontrar índice das Referências para inserir antes
            ref_idx = next((i for i, s in enumerate(secs)
                            if s.get("is_references") or "REFER" in s.get("title", "").upper()), None)
            sec_idx = next((i for i, s in enumerate(secs)
                            if s.get("is_secretary") or "SECRETARIA" in s.get("title", "").upper()), None)
            insert_at = ref_idx if ref_idx is not None else (sec_idx if sec_idx is not None else len(secs))
            secs.insert(insert_at, new_section)
            touched.append(pid)
            print(f"  [OK] {pid}: seção inserida na posição {insert_at} (total agora {len(secs)})")

    json.dump(data, open(PROTOCOLS, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\nTotal de protocolos atualizados: {len(touched)}")
    print("IDs:", ", ".join(touched))


if __name__ == "__main__":
    main()
