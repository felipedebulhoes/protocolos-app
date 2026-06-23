#!/usr/bin/env python3
"""Lote 1A: Kallmann e DFI."""
import sys
from cpp_lib import load, save, get, upsert, sec, acompanhamento, validate_protocol


def edit_kallmann(data):
    p = get(data, "kallmann_hhg_congenito"); secs = p["sections"]
    rx = sec("MODELO DE PRESCRIÇÃO",
        "> Doses consolidadas do European Consensus Statement on Congenital Hypogonadotropic Hypogonadism e das EAU Guidelines on Male Hypogonadism (2025). Individualizar conforme objetivo, volume testicular e resposta laboratorial.\n\n"
        "### A) Indução de virilização — hCG monoterapia (preferida com volume testicular residual >2 mL)\n"
        "```\nGonadotrofina coriônica (hCG) 1.500–2.500 UI ... SC, 3x/semana\n  Alvo: testosterona total 400–600 ng/dL (reavaliar 8–12 sem)\n```\n\n"
        "### B) Indução de fertilidade — hCG + rFSH (evidência nível A para HH)\n"
        "```\nFase 1 (3–6 meses): hCG 1.500–2.500 UI ...... SC, 3x/semana\nFase 2 (manter 18–24 meses): FSH recombinante (Gonal-F/Puregon) 75–150 UI ... SC, 3x/semana\n```\n"
        "*Monitorização: espermograma mensal, inibina B e volume testicular.*\n\n"
        "### C) Reposição androgênica (quando fertilidade NÃO é objetivo)\n"
        "```\nTestosterona undecanoato 1.000 mg ... IM, a cada 10–12 sem\n  OU gel de testosterona 50 mg/dia ... transdérmico\n  OU cipionato/enantato 200 mg ... IM, a cada 2 sem\n```\n"
        "> ⚠️ A reposição androgênica suprime gonadotrofinas residuais e não induz espermatogênese. Ofertar criopreservação de sêmen antes de iniciar se fertilidade futura não descartada.",
        rx=True)
    mev = sec("MEDICINA DE ESTILO DE VIDA (MEV) APLICADA",
        "O HHC é condição endócrina genética — o estilo de vida não substitui o tratamento hormonal, mas otimiza resposta, saúde óssea e fertilidade.\n\n"
        "### Saúde óssea (risco de osteopenia precoce pelo hipogonadismo prolongado)\n"
        "- Vitamina D adequada + ingestão de cálcio; densitometria no diagnóstico e seguimento.\n"
        "- Treino resistido como estímulo osteogênico, associado à reposição androgênica.\n\n"
        "### Composição corporal e fertilidade\n"
        "- Controle de peso (excesso de gordura aumenta aromatização de T em estradiol).\n"
        "- Sono regular 7–8 h; cessação de tabagismo e moderação de álcool (prejudicam espermatogênese).\n\n"
        "### Suporte psicológico\n"
        "- O diagnóstico envolve imagem corporal, puberdade e fertilidade; acompanhamento melhora a adesão a um tratamento de 18–24 meses.",
        mev=True)
    acomp = acompanhamento(
        "- Avaliação hormonal completa (LH, FSH, testosterona, inibina B), genética e olfatória.\n- RNM de hipófise/bulbos olfatórios e USG testicular.\n- Definição conjunta do objetivo: virilização agora ou fertilidade — e criopreservação quando indicado.",
        "- Indução hormonal individualizada (hCG ± rFSH ou reposição androgênica), com ajuste fino de doses.\n- Coordenação com reprodução assistida quando a fertilidade é o alvo.",
        "- Monitorização laboratorial seriada (T, inibina B, espermograma) com metas a cada etapa.\n- Cuidado da saúde óssea, muscular e sexual de longo prazo.\n- Canal de contato direto durante todo o tratamento (18–24 meses).",
        "você não está fazendo \"reposição de hormônio\"; está construindo, com acompanhamento contínuo, a sua virilização, a sua fertilidade e a sua saúde para a vida toda.")
    secr = sec("Script da Secretaria & Contorno de Objeções (CPP)",
        "### 📞 Script de Abordagem da Secretaria\n"
        "**Acolhimento:**\n> Olá, [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões, especialista em hormônios masculinos e fertilidade. Atendemos casos de hipogonadismo congênito com total discrição. Vamos agendar sua avaliação em sigilo absoluto?\n\n"
        "**Proposta de valor:**\n> A síndrome de Kallmann e o hipogonadismo congênito têm tratamento — e, na maioria dos casos, é possível restaurar a testosterona e também conquistar a fertilidade. O Dr. Felipe conduz um protocolo individualizado, com monitorização rigorosa e acompanhamento do início ao fim.\n\n"
        "### 🛡️ Contorno de Objeções Comuns\n"
        "- **Objeção:** *\"Nunca vou poder ter filhos, certo?\"*\n  - **Resposta:** Pelo contrário. Em geral os testículos são funcionais — falta o estímulo da hipófise. Com hCG e FSH, a maioria dos pacientes produz espermatozoides ao longo do tratamento.\n\n"
        "- **Objeção:** *\"Já tomo testosterona, não basta?\"*\n  - **Resposta:** A testosterona resolve energia e virilização, mas desliga o sinal que produz espermatozoides. Se a fertilidade importa, o Dr. Felipe ajusta a estratégia para preservá-la.\n\n"
        "- **Objeção:** *\"O tratamento é muito longo.\"*\n  - **Resposta:** É um investimento na sua saúde de longo prazo — fertilidade, ossos, músculos, disposição e vida sexual — com acompanhamento próximo e metas claras a cada etapa.",
        secretary=True)
    upsert(secs, rx); upsert(secs, mev); upsert(secs, acomp); upsert(secs, secr, force_last=True)
    return p["id"], len(secs)


def edit_dfi(data):
    p = get(data, "dfi_fragmentacao_dna"); secs = p["sections"]
    rx = sec("MODELO DE PRESCRIÇÃO (Protocolo Antioxidante)",
        "> Protocolo antioxidante combinado (evidência B–C, amplamente recomendado nas EAU Guidelines on Sexual and Reproductive Health). Doses reaproveitadas do conteúdo clínico deste protocolo. Manter por no mínimo 90 dias (1 ciclo de espermatogênese) antes de reavaliar o DFI.\n\n"
        "```\n1) Coenzima Q10 200–400 mg/dia\n2) Vitamina C 500–1.000 mg/dia\n3) Vitamina E 400 UI/dia\n4) Zinco 25–50 mg/dia\n5) Selênio 100–200 mcg/dia\n6) Ácido fólico 5 mg/dia\n7) L-Carnitina 2–3 g/dia\n8) Ômega-3 (DHA/EPA) 2–4 g/dia\n```\n"
        "> Tratar SEMPRE a causa em paralelo: varicocelectomia se varicocele palpável, erradicar infecção seminal (leucospermia ≥1 mi/mL), suspender tabaco/álcool/anabolizantes/maconha.\n"
        "> Para coleta em reprodução assistida: abstinência curta (2–3 dias).",
        rx=True)
    mev = sec("MEDICINA DE ESTILO DE VIDA (MEV) APLICADA",
        "No DFI, o estilo de vida **é** boa parte do tratamento — a integridade do DNA espermático responde diretamente a hábitos.\n\n"
        "### Reduzir o estresse oxidativo (causa central)\n"
        "- Cessação de tabagismo (eleva diretamente a fragmentação) e moderação de álcool.\n"
        "- Suspender anabolizantes e cannabis.\n"
        "- Controle de peso e dieta anti-inflamatória rica em antioxidantes naturais.\n\n"
        "### Calor e exposições\n"
        "- Evitar calor escrotal (sauna, banhos muito quentes, notebook no colo, longos períodos sentado).\n"
        "- Reduzir exposição a poluentes/pesticidas quando possível.\n\n"
        "### Sono e exercício\n"
        "- Sono regular de 7–8 h e atividade física moderada regular; evitar overtraining.",
        mev=True)
    acomp = acompanhamento(
        "- Confirmação do DFI por teste validado e investigação da causa (varicocele, infecção, hábitos, idade, calor).\n- Avaliação do casal e do contexto reprodutivo (tentativa natural vs. reprodução assistida).",
        "- Tratamento direcionado à causa (ex.: varicocelectomia microcirúrgica) + protocolo antioxidante por ≥90 dias.\n- Quando indicado, seleção espermática avançada (MACS/gradientes) ou coleta testicular para ICSI.",
        "- Reavaliação do DFI após 1 ciclo de espermatogênese (90 dias) com metas objetivas.\n- Ajuste de conduta e coordenação com reprodução assistida.\n- Acompanhamento do casal até o resultado reprodutivo.",
        "você não está \"comprando um exame ou um suplemento\"; está conduzindo, com método e acompanhamento, um plano para melhorar a qualidade do seu DNA espermático e as chances reais de gravidez.")
    secr = sec("Script da Secretaria & Contorno de Objeções (CPP)",
        "### 📞 Script de Abordagem da Secretaria\n"
        "**Acolhimento:**\n> Olá, [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões, especialista em fertilidade masculina. Ele investiga a fundo a causa da dificuldade para engravidar — inclusive a qualidade do DNA dos espermatozoides, que exames comuns não avaliam. Posso agendar sua avaliação?\n\n"
        "**Proposta de valor:**\n> Um espermograma \"normal\" não garante DNA íntegro. O Dr. Felipe avalia a fragmentação do DNA espermático e monta um plano para tratar a causa — aumentando as chances de gravidez natural e o sucesso da fertilização assistida.\n\n"
        "### 🛡️ Contorno de Objeções Comuns\n"
        "- **Objeção:** *\"Meu espermograma deu normal, por que investigar mais?\"*\n  - **Resposta:** O espermograma conta quantos e como se movem os espermatozoides, mas não avalia a integridade do DNA dentro deles. É essa fragmentação que pode explicar abortos de repetição e falhas de FIV mesmo com espermograma normal.\n\n"
        "- **Objeção:** *\"Só tomar vitamina resolve?\"*\n  - **Resposta:** Os antioxidantes ajudam, mas o Dr. Felipe trata a causa — varicocele, infecção, hábitos — e reavalia objetivamente em 90 dias. É um plano completo, não um suplemento isolado.\n\n"
        "- **Objeção:** *\"Já estou fazendo FIV, adianta?\"*\n  - **Resposta:** Sim. Reduzir a fragmentação antes do ciclo e usar seleção espermática melhora as taxas de sucesso. Vale a avaliação antes do próximo ciclo.",
        secretary=True)
    upsert(secs, rx); upsert(secs, mev); upsert(secs, acomp); upsert(secs, secr, force_last=True)
    return p["id"], len(secs)


EDITS = [edit_kallmann, edit_dfi]

if __name__ == "__main__":
    dry = "--apply" not in sys.argv
    data = load()
    for fn in EDITS:
        pid, n = fn(data)
        validate_protocol(get(data, pid))
        print(f"  {pid}: {n} seções")
    if dry:
        print("[DRY-RUN] use --apply para gravar")
    else:
        save(data); print("[APPLIED]")
