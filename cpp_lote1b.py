#!/usr/bin/env python3
"""Lote 1B: câncer testicular, litíase renal/ureteral, ITU/prostatite aguda, IUE feminina."""
import sys
from cpp_lib import load, save, get, upsert, sec, acompanhamento, validate_protocol


def edit_cancer_testicular(data):
    p = get(data, "cancer_testicular"); secs = p["sections"]
    rx = sec("ESQUEMA DE TRATAMENTO (Referência — Manejo Multidisciplinar)",
        "> ⚠️ Esquema oncológico de referência (EAU Testicular Cancer Guidelines). A quimioterapia é conduzida em conjunto com a Oncologia; este bloco serve de referência de manejo e para alinhar o paciente, não como prescrição de consultório.\n\n"
        "### BEP (Bleomicina + Etoposídeo + Cisplatina) — padrão-ouro\n"
        "```\nBleomicina 30 UI ......... IV, D1, D8, D15\nEtoposídeo 100 mg/m² ..... IV, D1–D5\nCisplatina 20 mg/m² ...... IV, D1–D5 (hiper-hidratação)\nCiclos a cada 21 dias — BEP x3 (bom prognóstico) ou x4 (intermediário/mau)\n```\n"
        "Monitorar: função pulmonar pré-bleomicina (contraindicado se FEV1 <60%), clearance de creatinina, audiometria.\n\n"
        "### EP (se contraindicação à bleomicina)\n"
        "```\nEtoposídeo 100 mg/m² D1–D5 + Cisplatina 20 mg/m² D1–D5 — a cada 21 dias x4 ciclos\n```\n"
        "> 🧊 **Criopreservação de sêmen ANTES de qualquer quimioterapia/RT** — passo inegociável da jornada.",
        rx=True)
    acomp = acompanhamento(
        "- Diagnóstico ágil (USG, marcadores AFP/β-hCG/LDH, estadiamento por TC).\n- **Criopreservação de sêmen antes de qualquer tratamento.**\n- Explicação clara do estadiamento e do plano — câncer de testículo é dos tumores de maior curabilidade.",
        "- Orquiectomia radical inguinal com técnica adequada (e discussão de prótese testicular).\n- Coordenação com oncologia/radioterapia conforme histologia e estádio.",
        "- Vigilância ativa estruturada (marcadores + imagem) no cronograma do protocolo.\n- Atenção à fertilidade, saúde hormonal (testosterona pós-orquiectomia) e suporte psicológico.\n- Acompanhamento de longo prazo dos efeitos tardios do tratamento.",
        "você não está fazendo \"só uma cirurgia para retirar o testículo\"; está entrando em um programa completo de cura, preservação da fertilidade e vigilância que acompanha você por anos.")
    secr = sec("Script da Secretaria & Contorno de Objeções (CPP)",
        "### 📞 Script de Abordagem da Secretaria\n"
        "**Acolhimento (sensibilidade e agilidade — tempo importa):**\n> Olá, [Nome]. Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. Entendo a sua preocupação e quero que saiba que vamos agir com rapidez e cuidado. O Dr. Felipe é especialista em câncer urológico e vai conduzir cada etapa ao seu lado. Consigo uma avaliação prioritária para o senhor.\n\n"
        "**Proposta de valor:**\n> O câncer de testículo é um dos de maior chance de cura quando tratado corretamente. O Dr. Felipe coordena todo o cuidado — do diagnóstico e preservação da fertilidade à cirurgia e ao acompanhamento — com uma equipe integrada.\n\n"
        "### 🛡️ Contorno de Objeções Comuns\n"
        "- **Objeção:** *\"Vou perder minha fertilidade e minha masculinidade?\"*\n  - **Resposta:** Antes de qualquer tratamento, o Dr. Felipe orienta a congelar o sêmen, preservando a chance de ter filhos. E existe a opção de prótese testicular. A maioria dos homens mantém vida sexual e hormonal normal.\n\n"
        "- **Objeção:** *\"Posso esperar para decidir?\"*\n  - **Resposta:** Nesse caso o tempo faz diferença no resultado. Por isso oferecemos avaliação prioritária — para o senhor decidir com toda a informação, mas sem perder o melhor momento de tratar.",
        secretary=True)
    upsert(secs, rx); upsert(secs, acomp); upsert(secs, secr, force_last=True)
    return p["id"], len(secs)


def edit_litiase(data):
    p = get(data, "litiase_renal_ureteral"); secs = p["sections"]
    rx = sec("MODELO DE PRESCRIÇÃO (Cólica e Terapia Expulsiva)",
        "> Doses reaproveitadas do manejo clínico deste protocolo (EAU Urolithiasis Guidelines). Para cálculos ≤6 mm, sem infecção/obstrução grave e dor controlável.\n\n"
        "### Analgesia da cólica renal\n"
        "```\n1) Cetorolaco 30 mg IV/IM (1ª linha)  OU  Diclofenaco 75 mg IM\n2) Dipirona 1–2 g IV (alternativa/complemento)\n3) Tramadol 100 mg IV (resgate — não 1ª linha)\n4) Metoclopramida 10 mg IV ou Ondansetrona 4 mg IV (se náusea)\n```\n\n"
        "### Terapia de facilitação expulsiva (TFE)\n"
        "```\nTansulosina 0,4 mg VO 1x/dia (à noite)  [OU Silodosina 8 mg/dia]\n  por até 4 semanas ou até a expulsão\n```\n\n"
        "### Orientações\n"
        "- Ingesta hídrica ≥2,5 L/dia; filtrar urina para capturar o cálculo (análise de composição).\n"
        "- **Retorno imediato se febre, piora da dor ou impossibilidade de hidratação oral** (sinais de urgência).",
        rx=True)
    acomp = acompanhamento(
        "- Diagnóstico por imagem (TC sem contraste) e avaliação de tamanho, localização e função renal.\n- Decisão compartilhada: tentativa expulsiva vs. tratamento ativo (LEOC/URS/NLPC).",
        "- Tratamento ativo com a técnica mais indicada para o seu cálculo, com analgesia adequada.\n- Em obstrução com infecção: drenagem de urgência.",
        "- **Investigação metabólica** para descobrir por que você forma cálculos — o diferencial que evita recidiva.\n- Plano individualizado de prevenção (hidratação, dieta, medicação) e acompanhamento.\n- Reavaliação por imagem programada.",
        "você não está só \"tirando uma pedra\"; está descobrindo por que ela se formou e prevenindo as próximas — cálculo renal sem investigação recidiva em mais da metade dos casos.")
    secr = sec("Script da Secretaria & Contorno de Objeções (CPP)",
        "### 📞 Script de Abordagem da Secretaria\n"
        "**Acolhimento:**\n> Olá, [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. Cálculo renal causa muita dor e costuma voltar quando não se investiga a causa. O Dr. Felipe trata o cálculo atual e monta um plano para evitar que se formem novos. Vamos agendar sua avaliação?\n\n"
        "**Proposta de valor:**\n> Mais do que resolver a crise, o foco do Dr. Felipe é a investigação metabólica e a prevenção — para o senhor não viver de cólica em cólica.\n\n"
        "### 🛡️ Contorno de Objeções Comuns\n"
        "- **Objeção:** *\"A pedra já saiu, preciso mesmo voltar?\"*\n  - **Resposta:** Sim — sem investigar a causa, mais da metade dos pacientes forma novos cálculos. A consulta de prevenção é justamente o que evita repetir toda essa dor.\n\n"
        "- **Objeção:** *\"Não é só beber água?\"*\n  - **Resposta:** Água ajuda, mas cada pessoa forma cálculo por um motivo diferente. Os exames metabólicos mostram o seu, e o tratamento é personalizado para o seu caso.",
        secretary=True)
    upsert(secs, rx); upsert(secs, acomp); upsert(secs, secr, force_last=True)
    return p["id"], len(secs)


def edit_itu_prostatite(data):
    p = get(data, "itu_masculina_prostatite_aguda"); secs = p["sections"]
    rx = sec("MODELO DE PRESCRIÇÃO (Prostatite Aguda)",
        "> Doses reaproveitadas do tratamento deste protocolo (EAU Urological Infections / AUA-CDC). Sempre guiar pela urocultura quando disponível.\n\n"
        "### Ambulatorial leve (sem febre alta, sintomas localizados)\n"
        "```\nCiprofloxacino 500 mg VO 12/12h  OU  Levofloxacino 500 mg VO 1x/dia\n  Duração: 4 semanas (penetração prostática superior das fluoroquinolonas)\nSe resistência/ECMR: Sulfametoxazol-Trimetoprim 800/160 mg VO 12/12h x 4 semanas\n```\n\n"
        "### Internação (moderado-grave / sepse)\n"
        "```\nCeftriaxona 2 g IV 24/24h ± Gentamicina 5 mg/kg/dia IV (até afebril 48–72h)\n  step-down: Ciprofloxacino 500 mg VO 12/12h — total 4 semanas\n```\n\n"
        "### Sintomáticos\n"
        "```\nIbuprofeno 600 mg VO 8/8h (5–7 dias) — disúria\nTansulosina 0,4 mg VO à noite — sintomas obstrutivos/esvaziamento\n```\n"
        "> ⚠️ Retenção urinária: cateter de alívio (≥18 Fr) ou cistostomia. NÃO operar HPB durante o episódio agudo.",
        rx=True)
    acomp = acompanhamento(
        "- Diagnóstico com exame, urina/urocultura e avaliação de gravidade (internação vs. ambulatorial).\n- Identificação de fatores como obstrução, cateterismo prévio ou imunossupressão.",
        "- Antibioticoterapia com penetração prostática adequada e duração correta (4 semanas), com manejo da dor e do esvaziamento.\n- Drenagem se abscesso/retenção.",
        "- Reavaliação clínica e laboratorial ao fim do tratamento.\n- Investigação de causa subjacente (HPB, estenose, cálculo) para evitar recorrência.\n- Orientação para não interromper o antibiótico antes do tempo.",
        "você não está \"só tomando um antibiótico\"; está tratando a infecção pelo tempo certo e investigando por que ela aconteceu, para não virar um problema crônico.")
    secr = sec("Script da Secretaria & Contorno de Objeções (CPP)",
        "### 📞 Script de Abordagem da Secretaria\n"
        "**Acolhimento:**\n> Olá, [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. Prostatite e infecção urinária no homem precisam de tratamento certo e pelo tempo adequado para não voltar. Vamos agendar sua avaliação?\n\n"
        "**Proposta de valor:**\n> O Dr. Felipe trata a infecção com o esquema correto e investiga a causa — muitas recidivas acontecem por tratamento curto demais ou por um problema de base não resolvido.\n\n"
        "### 🛡️ Contorno de Objeções Comuns\n"
        "- **Objeção:** *\"Melhorei em 3 dias, posso parar o antibiótico?\"*\n  - **Resposta:** Não. A próstata exige tratamento de cerca de 4 semanas; parar antes é a principal causa de a infecção voltar mais forte e resistente.\n\n"
        "- **Objeção:** *\"Já tive isso outras vezes, é normal?\"*\n  - **Resposta:** Repetir é sinal de que há algo a investigar (próstata, esvaziamento, cálculo). O Dr. Felipe avalia isso para quebrar o ciclo de recorrências.",
        secretary=True)
    upsert(secs, rx); upsert(secs, acomp); upsert(secs, secr, force_last=True)
    return p["id"], len(secs)


def edit_iue(data):
    p = get(data, "iue_feminina"); secs = p["sections"]
    rx = sec("MODELO DE PRESCRIÇÃO (Farmacoterapia e Terapia Local)",
        "> Doses reaproveitadas da farmacoterapia deste protocolo (EAU/AUA Female SUI). 1ª linha permanece conservadora (fisioterapia do assoalho pélvico).\n\n"
        "### Duloxetina (IUE moderada-grave, quando recusa/contraindica cirurgia)\n"
        "```\nDuloxetina 20–40 mg VO 12/12h (titular; alvo 40 mg 12/12h)\n  Eficácia: redução de 50–64% dos episódios vs. 39% placebo\n  Efeitos: náusea (transitória), tontura, constipação\n```\n\n"
        "### Terapia hormonal local (hipoestrogenismo / pós-menopausa)\n"
        "```\nEstriol creme vaginal 0,5–1 mg/g 3x/semana  (ou anel/estradiol vaginal)\n  Melhora trofismo uretral; associar antes da cirurgia em sinais de hipoestrogenismo\n```\n"
        "> A terapia local não trata a IUE isoladamente, mas melhora sintomas mistos e a resposta cirúrgica.",
        rx=True)
    acomp = acompanhamento(
        "- Avaliação detalhada (história, diário miccional, teste de esforço, avaliação do assoalho pélvico) e urodinâmica quando indicada.\n- Distinção entre esforço, urgência e mista — define o tratamento certo.",
        "- 1ª linha: fisioterapia do assoalho pélvico estruturada (± farmacoterapia).\n- Quando indicado: sling sintético suburetral, com técnica e indicação criteriosas.",
        "- Acompanhamento da resposta funcional e da qualidade de vida.\n- Manutenção dos exercícios e ajuste de terapia local na pós-menopausa.\n- Suporte para um tema sensível, com discrição e empatia.",
        "você não está \"só fazendo uma cirurgia para parar de perder urina\"; está recuperando a sua liberdade e confiança, com um plano que começa no conservador e só indica cirurgia quando é realmente o melhor para você.")
    secr = sec("Script da Secretaria & Contorno de Objeções (CPP)",
        "### 📞 Script de Abordagem da Secretaria\n"
        "**Acolhimento (tema sensível — empatia):**\n> Olá, [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. Perder urina ao tossir, rir ou se exercitar é mais comum do que se imagina e tem tratamento. Aqui você é atendida com total discrição e acolhimento. Vamos agendar sua avaliação?\n\n"
        "**Proposta de valor:**\n> O Dr. Felipe avalia a causa exata da perda e oferece desde o tratamento conservador (fisioterapia) até a cirurgia minimamente invasiva, sempre com a indicação mais adequada para o seu caso.\n\n"
        "### 🛡️ Contorno de Objeções Comuns\n"
        "- **Objeção:** *\"Isso é da idade, não tem o que fazer.\"*\n  - **Resposta:** É comum, mas não é normal nem inevitável. Existem tratamentos eficazes — muitas pacientes melhoram só com fisioterapia, e a cirurgia, quando indicada, tem ótimos resultados.\n\n"
        "- **Objeção:** *\"Tenho vergonha de falar sobre isso.\"*\n  - **Resposta:** Entendo perfeitamente. O atendimento é totalmente sigiloso e respeitoso. Dar esse passo é o que devolve a liberdade de viver sem se preocupar com perdas.",
        secretary=True)
    upsert(secs, rx); upsert(secs, acomp); upsert(secs, secr, force_last=True)
    return p["id"], len(secs)


EDITS = [edit_cancer_testicular, edit_litiase, edit_itu_prostatite, edit_iue]

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
