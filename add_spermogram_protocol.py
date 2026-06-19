#!/usr/bin/env python3
"""Adiciona o protocolo de interpretação de espermograma ao protocols.json."""
import json

PROTOCOL = {
  "id": "espermograma_fertilidade",
  "filename": "espermograma_fertilidade.md",
  "title": "Interpretação do Espermograma — Protocolo de Fertilidade",
  "category": "Infertilidade & Microcirurgia",
  "icon": "Droplets",
  "intro": "---\nProtocolo passo a passo para interpretação do espermograma segundo a OMS 2021 (6ª edição), com fluxograma de conduta clínica baseado nas diretrizes EAU 2025 e AUA/ASRM 2024.\n---",
  "sections": [
    {
      "title": "1. VALORES DE REFERÊNCIA — OMS 2021 (6ª EDIÇÃO)",
      "content": """### Parâmetros Macroscópicos

| Parâmetro | Limite Inferior (P5) OMS 2021 | OMS 2010 |
|:---|:---|:---|
| Volume (mL) | **1,4** | 1,5 |
| pH | ≥ 7,2 | ≥ 7,2 |
| Viscosidade | Normal (< 2 cm) | Normal |
| Liquefação | ≤ 60 min | ≤ 60 min |
| Cor | Branco-acinzentado opalescente | — |

### Parâmetros Microscópicos

| Parâmetro | Limite Inferior (P5) OMS 2021 | OMS 2010 |
|:---|:---|:---|
| Concentração (10⁶/mL) | **16** | 15 |
| Número total (10⁶/ejaculado) | **39** | 39 |
| Motilidade total (%) | **42** | 40 |
| Motilidade progressiva (%) | **30** | 32 |
| Motilidade não-progressiva (%) | ≥ 1 | — |
| Vitalidade — espermatozoides vivos (%) | **54** | 58 |
| Morfologia normal — Critério Tygerberg (%) | **4** | 4 |

> **Nota clínica:** Os valores do P5 representam o limite inferior de homens em casais com concepção natural em < 12 meses. Valores abaixo do P5 **não definem infertilidade** — apenas indicam que o homem está abaixo de 95% dos homens férteis. A avaliação deve ser sempre contextualizada com o quadro clínico completo. [OMS 2021, PMC10929669]

### Exames Estendidos (quando indicados)

| Exame | Indicação |
|:---|:---|
| Fragmentação de DNA espermático (DFI) | Falhas de FIV/ICSI, abortos recorrentes, oligozoospermia grave |
| Leucócitos no sêmen | Suspeita de infecção/inflamação genital |
| Anticorpos antiespermatozóides | Vasectomia revertida, orquite prévia |
| Bioquímica seminal (frutose, zinco, α-glucosidase) | Azoospermia obstrutiva vs. secretora |"""
    },
    {
      "title": "2. NOMENCLATURA DAS ALTERAÇÕES",
      "content": """| Termo | Definição |
|:---|:---|
| **Normozoospermia** | Todos os parâmetros ≥ limite inferior OMS 2021 |
| **Oligozoospermia** | Concentração < 16 × 10⁶/mL |
| — Oligozoospermia leve | 10–15,9 × 10⁶/mL |
| — Oligozoospermia moderada | 5–9,9 × 10⁶/mL |
| — Oligozoospermia grave | < 5 × 10⁶/mL |
| **Criptozoospermia** | Espermatozoides raros (< 1 × 10⁶/mL), encontrados apenas após centrifugação |
| **Azoospermia** | Ausência de espermatozoides após centrifugação do ejaculado |
| **Asthenozoospermia** | Motilidade progressiva < 30% |
| **Teratozoospermia** | Morfologia normal < 4% (critério Tygerberg estrito) |
| **Necrozoospermia** | Vitalidade < 54% (> 46% de espermatozoides mortos) |
| **Hipospermia** | Volume < 1,4 mL |
| **Hiperspermia** | Volume > 6,0 mL |
| **Leucocitospermia** | Leucócitos > 1 × 10⁶/mL |
| **OAT** | Oligoastenoteratozoospermia (combinação das três alterações) |

> **Atenção:** Um único espermograma alterado **não fecha diagnóstico**. A EAU 2025 e AUA/ASRM 2024 recomendam repetir o exame após 2–3 meses (um ciclo espermatogênico completo = 74 dias) antes de qualquer decisão terapêutica. [EAU 2025, uroweb.org]"""
    },
    {
      "title": "3. INTERPRETAÇÃO PASSO A PASSO",
      "content": """### Passo 1 — Verificar a Coleta

*   Abstinência sexual: **2 a 7 dias** (ideal: 3–5 dias)
*   Coleta completa? (perda do primeiro jato invalida o exame)
*   Tempo até análise: ≤ 60 minutos, temperatura 20–37°C
*   Condições de estresse, febre, medicamentos nos últimos 3 meses?

> Se a coleta for inadequada → **repetir antes de qualquer interpretação**.

---

### Passo 2 — Avaliar o Volume

*   **< 1,4 mL (Hipospermia):**
    *   Ejaculação retrógrada? (checar urina pós-ejaculação)
    *   Obstrução dos ductos ejaculatórios? (USG transretal)
    *   Hipogonadismo hipogonadotrófico? (FSH, LH, testosterona)
    *   Ausência congênita dos vasos deferentes (CBAVD)? — associada a mutações CFTR
*   **> 6,0 mL (Hiperspermia):**
    *   Geralmente benigna; pode diluir a concentração espermática
    *   Investigar infecção/inflamação (leucocitospermia?)

---

### Passo 3 — Avaliar a Concentração e Número Total

*   **Concentração ≥ 16 × 10⁶/mL e número total ≥ 39 × 10⁶:** normal
*   **< 16 × 10⁶/mL:** Oligozoospermia — iniciar investigação hormonal e genética conforme gravidade
*   **Ausência de espermatozoides:** Azoospermia — ver Passo 6

---

### Passo 4 — Avaliar a Motilidade

*   **Motilidade progressiva ≥ 30%:** normal
*   **< 30%:** Asthenozoospermia
    *   Causas: varicocele, infecção genital, anticorpos antiespermatozóides, fragmentação de DNA, fatores ambientais (calor, tabaco, anabolizantes)
    *   Solicitar: vitalidade (se > 60% imóveis), fragmentação de DNA, leucocitospermia

---

### Passo 5 — Avaliar a Morfologia

*   **≥ 4% de formas normais (Tygerberg):** normal
*   **< 4%:** Teratozoospermia
    *   Teratozoospermia isolada raramente causa infertilidade absoluta
    *   Associada a falhas de FIV; ICSI apresenta melhores resultados
    *   Investigar: varicocele, exposição a toxinas, febre recente

---

### Passo 6 — Azoospermia (ausência de espermatozoides)

*   **Confirmar:** centrifugar e examinar o pellet
*   **Dosar FSH, LH, testosterona total, inibina B, AMH**
*   **Classificação:**
    *   FSH elevado + testículos pequenos → **Azoospermia Não-Obstrutiva (ANO)** (falência testicular)
    *   FSH normal + testículos normais → **Azoospermia Obstrutiva (AO)**
    *   FSH normal + ausência de vasos deferentes → CBAVD (mutação CFTR)
*   **Cariótipo + pesquisa de microdeleção do cromossomo Y** (obrigatório na ANO) [AUA/ASRM 2024]"""
    },
    {
      "title": "4. INVESTIGAÇÃO HORMONAL E GENÉTICA",
      "content": """### Quando Solicitar Hormônios

| Situação | Exames |
|:---|:---|
| Oligozoospermia grave (< 5 × 10⁶/mL) | FSH, LH, testosterona total, prolactina |
| Azoospermia | FSH, LH, testosterona total, inibina B, AMH |
| Suspeita de hipogonadismo | FSH, LH, testosterona total e livre, SHBG, prolactina |
| Ginecomastia + infertilidade | Estradiol, testosterona, FSH, LH, cariótipo |

### Interpretação Hormonal

| Padrão | Diagnóstico Provável |
|:---|:---|
| FSH ↑↑, testosterona ↓, LH ↑ | Hipogonadismo hipergonadotrófico (falência testicular primária) |
| FSH ↓ ou normal, LH ↓, testosterona ↓ | Hipogonadismo hipogonadotrófico (hipofisário/hipotalâmico) |
| FSH normal, testosterona normal | Azoospermia obstrutiva provável |
| FSH normal, testosterona normal, ausência VD | CBAVD — solicitar mutação CFTR |

### Investigação Genética

| Exame | Indicação | Guideline |
|:---|:---|:---|
| Cariótipo (bandamento G) | ANO, oligozoospermia grave (< 5 × 10⁶/mL) | EAU 2025, AUA 2024 |
| Microdeleção Y (AZFa, AZFb, AZFc) | ANO, oligozoospermia grave | EAU 2025, AUA 2024 |
| Mutação CFTR | CBAVD, hipospermia + ausência VD | EAU 2025 |
| Fragmentação de DNA (DFI) | Falhas de FIV/ICSI, abortos recorrentes | EAU 2025 |

> **Prognóstico genético:** Deleção AZFa ou AZFb → prognóstico ruim para recuperação espermática (micro-TESE improvável). Deleção AZFc → micro-TESE pode ser tentada (50% de sucesso). [EAU 2025]"""
    },
    {
      "title": "5. MEDICINA DE ESTILO DE VIDA (MEV) — PROTOCOLO ANTIOXIDANTE",
      "content": """### Fatores Modificáveis (Sempre Abordar)

*   **Tabagismo:** reduz concentração, motilidade e morfologia. Cessação melhora parâmetros em 3 meses.
*   **Álcool:** > 14 doses/semana associado a redução de testosterona e morfologia.
*   **Calor escrotal:** evitar banhos quentes, laptops no colo, roupas apertadas, trabalho sentado prolongado.
*   **Anabolizantes/testosterona exógena:** suprimem o eixo HPG → azoospermia. Suspender e aguardar 6–12 meses.
*   **Obesidade:** IMC > 30 associado a oligozoospermia. Perda de 5–10% do peso melhora parâmetros.
*   **Estresse oxidativo:** principal mecanismo de dano espermático em 30–80% dos homens inférteis.

### Protocolo Antioxidante (Fórmula Magistral) — 3 a 6 meses

| Componente | Dose Diária | Nível de Evidência |
|:---|:---|:---|
| Coenzima Q10 | 200–400 mg | Melhora motilidade e concentração [PMID: 23870423] |
| Vitamina E (tocoferol) | 400 UI | Reduz peroxidação lipídica espermática |
| Vitamina C (ácido ascórbico) | 500–1000 mg | Proteção antioxidante seminal |
| Zinco | 25–50 mg | Essencial para espermatogênese e morfologia |
| Selênio | 100–200 mcg | Cofator de glutationa peroxidase espermática |
| Ácido fólico | 400–800 mcg | Reduz aneuploidia espermática |
| L-carnitina | 2–3 g | Melhora motilidade (evidência moderada) |
| Licopeno | 10 mg | Antioxidante; estudos promissores em oligozoospermia |

> **Duração mínima:** 3 meses (1 ciclo espermatogênico). Reavaliar com novo espermograma após 3–6 meses."""
    },
    {
      "title": "6. CONDUTA TERAPÊUTICA ESTRATIFICADA",
      "content": """### Nível 1 — Oligozoospermia Leve-Moderada (5–15,9 × 10⁶/mL)

1.  MEV + protocolo antioxidante por 3–6 meses
2.  Correção de varicocele clínica (se presente) — melhora parâmetros em 60–70% dos casos [EAU 2025]
3.  Tratar infecção genital se leucocitospermia (doxiciclina 100 mg 2x/dia por 14 dias)
4.  Reavaliação com espermograma após 3 meses
5.  Se sem melhora → Inseminação Intrauterina (IIU) com sêmen preparado

---

### Nível 2 — Oligozoospermia Grave (< 5 × 10⁶/mL) ou OAT

1.  Investigação hormonal completa + cariótipo + microdeleção Y
2.  MEV + antioxidantes
3.  Correção de varicocele (se presente)
4.  Considerar: clomifeno 25–50 mg/dia ou anastrozol 1 mg/dia (se hipogonadismo hipogonadotrófico) [AUA/ASRM 2024]
5.  FIV + ICSI como opção de primeira linha em OAT grave

---

### Nível 3 — Azoospermia Obstrutiva (AO)

1.  Identificar e tratar causa obstrutiva (vasectomia, obstrução epidídimo, CBAVD)
2.  Reversão de vasectomia (vasovasostomia/vasoepididimostomia) — taxa de gravidez 30–75% dependendo do tempo
3.  Recuperação espermática cirúrgica: PESA/MESA/TESA + FIV/ICSI
4.  CBAVD: recuperação espermática + FIV/ICSI (aconselhamento genético obrigatório para parceira — mutação CFTR)

---

### Nível 4 — Azoospermia Não-Obstrutiva (ANO)

1.  Cariótipo + microdeleção Y (obrigatório antes de qualquer procedimento)
2.  Deleção AZFa ou AZFb → **não indicar micro-TESE** (prognóstico ruim)
3.  Deleção AZFc ou sem deleção → **micro-TESE** (taxa de recuperação 50–60%)
4.  Hipogonadismo hipogonadotrófico → FSH recombinante + hCG por 6–12 meses antes da micro-TESE
5.  Síndrome de Klinefelter (47,XXY) → micro-TESE com taxa de sucesso 40–50%

---

### Nível 5 — Asthenozoospermia Isolada

1.  Descartar necrozoospermia (vitalidade)
2.  Pesquisar: varicocele, leucocitospermia, anticorpos antiespermatozóides, síndrome dos cílios imóveis
3.  MEV + antioxidantes + L-carnitina
4.  Se DFI elevado (> 25%): antioxidantes intensivos, considerar ICSI com espermatozoides testiculares (menor DFI)"""
    },
    {
      "title": "7. REFERÊNCIAS",
      "content": """1.  WHO Laboratory Manual for the Examination and Processing of Human Semen, 6th ed. Geneva: WHO Press, 2021. ISBN 9789240030787. [who.int](https://www.who.int/publications/i/item/9789240030787)
2.  Chung E, et al. "Sixth edition of the World Health Organization laboratory manual of semen analysis: Updates and essential take away for busy clinicians." *Arab J Urol.* 2024;22(2):71–74. DOI: [10.1080/20905998.2023.2298048](https://doi.org/10.1080/20905998.2023.2298048) [PMC10929669]
3.  EAU Guidelines on Sexual and Reproductive Health — Chapter 11: Male Infertility. European Association of Urology, 2025. [uroweb.org](https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/male-infertility)
4.  Brannigan RE, et al. "Updates to Male Infertility: AUA/ASRM Guideline (2024)." *J Urol.* 2024;212(6). DOI: [10.1097/JU.0000000000004180](https://doi.org/10.1097/JU.0000000000004180)
5.  Aydın ME, et al. "The impact of the new 2021 reference limits of the World Health Organization criteria for semen analyses." *J Mens Health.* 2024;20(6):21–24. DOI: [10.22514/jomh.2024.086](https://doi.org/10.22514/jomh.2024.086)
6.  Pozzi E, et al. "Contemporary diagnostic work-up for male infertility: emphasizing comprehensive baseline assessment." *Asian J Androl.* 2024. [PMC11937355](https://pmc.ncbi.nlm.nih.gov/articles/PMC11937355/)
7.  Esteves SC, et al. "The 2025 WHO infertility guideline: value in focusing on clinical varicocele." *Hum Reprod.* 2026. DOI: [10.1093/humrep/deaf251](https://doi.org/10.1093/humrep/deaf251)"""
    },
    {
      "title": "Script da Secretaria & Contorno de Objeções (CPP)",
      "content": """### 📞 Script de Abordagem da Secretaria

**Agendamento de Consulta de Fertilidade:**

> Olá, Sr. [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. Estou entrando em contato porque o senhor solicitou informações sobre avaliação de fertilidade masculina.

> O Dr. Felipe é urologista especializado em andrologia e infertilidade masculina. Na primeira consulta, ele vai orientar sobre o espermograma — o exame principal para avaliar a fertilidade — e montar um plano personalizado para o senhor e sua parceira.

**Contorno de Objeções:**

*   *"Já fiz o espermograma e deu normal."* → "Ótimo! O Dr. Felipe vai interpretar o resultado com você em detalhes e avaliar se há outros fatores que podem estar influenciando. Muitas vezes, um espermograma 'normal' ainda tem pontos de melhora."
*   *"Minha esposa já está fazendo tratamento."* → "Perfeito que ela já está sendo acompanhada. O Dr. Felipe vai avaliar o fator masculino em paralelo — em 50% dos casos de infertilidade, o homem também contribui. Tratar os dois lados aumenta muito as chances."
*   *"É muito caro."* → "Entendo. A consulta com o Dr. Felipe inclui a interpretação completa dos exames e um plano de tratamento. Muitas vezes, medidas simples de estilo de vida já fazem grande diferença antes de qualquer procedimento mais complexo."

### 📋 Orientações para o Paciente (Pré-Consulta)

*   Trazer todos os espermogramas anteriores (mesmo de anos atrás)
*   Trazer exames hormonais se já realizados (FSH, LH, testosterona)
*   Informar uso de suplementos, anabolizantes ou medicamentos
*   Trazer a parceira se possível (avaliação do casal é mais eficiente)"""
    }
  ],
  "raw_content": "# PROTOCOLO — INTERPRETAÇÃO DO ESPERMOGRAMA E CONDUTA EM FERTILIDADE MASCULINA\n\nBaseado em: OMS 2021 (6ª ed.), EAU 2025, AUA/ASRM 2024.",
  "atestados": [
    {
      "titulo": "Atestado de Comparecimento — Consulta de Andrologia/Fertilidade",
      "modelo": "Atesto, para os devidos fins, que o Sr. [Nome do Paciente], portador do CPF [CPF], compareceu a consulta médica urológica especializada nesta data, [Data], no consultório do Dr. Felipe de Bulhões, CRM-SP [CRM].\n\nDr. Felipe de Bulhões\nUrologista — CRM-SP [CRM]"
    }
  ],
  "laudos": [
    {
      "titulo": "Laudo de Interpretação de Espermograma",
      "modelo": "Paciente: [Nome], [Idade] anos.\n\nAnálise do espermograma realizado em [Data], segundo os critérios da OMS 2021 (6ª edição):\n\n- Volume: [X] mL (ref. ≥ 1,4 mL)\n- Concentração: [X] × 10⁶/mL (ref. ≥ 16 × 10⁶/mL)\n- Motilidade progressiva: [X]% (ref. ≥ 30%)\n- Morfologia normal (Tygerberg): [X]% (ref. ≥ 4%)\n- Vitalidade: [X]% (ref. ≥ 54%)\n\nConclusão: [Normozoospermia / Oligozoospermia leve-moderada-grave / Asthenozoospermia / Teratozoospermia / OAT / Azoospermia]\n\nConduta proposta: [descrever]\n\nDr. Felipe de Bulhões\nUrologista — CRM-SP [CRM]"
    }
  ]
}

# Carregar o arquivo existente
with open('/home/ubuntu/protocolos-app/client/src/data/protocols.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Verificar se já existe
existing_ids = [p.get('id') for p in data]
if PROTOCOL['id'] in existing_ids:
    # Atualizar
    idx = existing_ids.index(PROTOCOL['id'])
    data[idx] = PROTOCOL
    print(f"Protocolo '{PROTOCOL['id']}' atualizado na posição {idx}.")
else:
    # Inserir após o protocolo 14_infertilidade_masculina
    try:
        insert_after = existing_ids.index('14_infertilidade_masculina')
        data.insert(insert_after + 1, PROTOCOL)
        print(f"Protocolo '{PROTOCOL['id']}' inserido após '14_infertilidade_masculina' (posição {insert_after + 1}).")
    except ValueError:
        data.append(PROTOCOL)
        print(f"Protocolo '{PROTOCOL['id']}' adicionado ao final.")

# Salvar
with open('/home/ubuntu/protocolos-app/client/src/data/protocols.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Total de protocolos agora: {len(data)}")
print("Arquivo salvo com sucesso.")
