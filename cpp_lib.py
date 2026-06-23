#!/usr/bin/env python3
"""Biblioteca compartilhada para a revisão CPP dos protocolos."""
import json

PATH = "client/src/data/protocols.json"

def load():
    with open(PATH, encoding="utf-8") as f:
        return json.load(f)

def save(data):
    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get(data, pid):
    for p in data:
        if p["id"] == pid:
            return p
    raise KeyError(pid)

def references_idx(secs):
    for i, s in enumerate(secs):
        if s.get("is_references") or "REFERÊNCIA" in s.get("title", "").upper() or "REFERENCIA" in s.get("title", "").upper():
            return i
    return -1

def upsert(secs, new_sec, before_refs=True, force_last=False, match_len=15):
    """Insere ou substitui seção pelo prefixo do título. Antes das Referências, ou ao final."""
    prefix = new_sec["title"].upper()[:match_len]
    for i, s in enumerate(list(secs)):
        if s.get("title", "").upper().startswith(prefix):
            secs.pop(i)
            break
    if force_last:
        secs.append(new_sec)
        return
    ri = references_idx(secs)
    if before_refs and ri >= 0:
        secs.insert(ri, new_sec)
    else:
        secs.append(new_sec)

def sec(title, content, mev=False, rx=False, ref=False, secretary=False):
    d = {"title": title, "content": content,
         "is_prescription": rx, "is_mev": mev, "is_references": ref}
    if secretary:
        d["is_secretary"] = True
    return d

def acompanhamento(antes, durante, depois, ancora):
    """Bloco padrão 'Plano de Acompanhamento Premium' pronto para mostrar ao paciente."""
    return sec(
        "PLANO DE ACOMPANHAMENTO PREMIUM (Jornada Completa)",
        "> Material para apresentar ao paciente. Deixa explícito que ele não contrata um procedimento isolado, e sim um cuidado completo — **antes, durante e depois**.\n\n"
        "### 🟦 ANTES — Preparo e Investigação de Causa Raiz\n" + antes + "\n\n"
        "### 🟩 DURANTE — Execução com Excelência Técnica\n" + durante + "\n\n"
        "### 🟪 DEPOIS — Acompanhamento e Resultado Sustentável\n" + depois + "\n\n"
        "> 💎 **Ancoragem de valor:** " + ancora,
    )

def validate_protocol(p):
    for s in p["sections"]:
        assert isinstance(s, dict), f"{p['id']}: seção não-objeto"
        assert s.get("content", "").strip(), f"{p['id']}: conteúdo vazio em {s.get('title')}"
