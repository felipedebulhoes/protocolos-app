#!/usr/bin/env python3
"""
Script para SUBSTITUIR (não inserir) o bloco de Acompanhamento Premium.
Remove o bloco antigo e insere o novo com estrutura extensa.
"""

import json
import re

# Protocolos cirúrgicos/procedimentos que receberão o novo bloco
SURGICAL_PROTOCOLS = {
    "1_implante_protese_peniana": {
        "procedure": "Implante de Prótese Peniana Inflável",
        "type": "cirurgia",
        "post_op_duration": "6 meses",
    },
    "1b_protese_semirrigida": {
        "procedure": "Implante de Prótese Peniana Semirrígida",
        "type": "cirurgia",
        "post_op_duration": "6 meses",
    },
    "2_varicocelectomia": {
        "procedure": "Varicocelectomia",
        "type": "cirurgia",
        "post_op_duration": "6 meses",
    },
    "5_micro_tese": {
        "procedure": "MicroTESE (Extração de Esperma)",
        "type": "procedimento",
        "post_op_duration": "3 meses",
    },
    "5b_reversao_vasectomia": {
        "procedure": "Reversão de Vasectomia",
        "type": "cirurgia",
        "post_op_duration": "6 meses",
    },
    "6_vasectomia_sem_bisturi": {
        "procedure": "Vasectomia sem Bisturi",
        "type": "cirurgia",
        "post_op_duration": "3 meses",
    },
    "11_circuncisao_frenuloplastia": {
        "procedure": "Circuncisão e Frenuloplastia",
        "type": "cirurgia",
        "post_op_duration": "2 meses",
    },
    "21_li_eswt_ondas_choque": {
        "procedure": "Li-ESWT (Ondas de Choque)",
        "type": "procedimento",
        "post_op_duration": "3 meses",
    },
    "23_prp_intracavernoso": {
        "procedure": "PRP Intracavernoso",
        "type": "procedimento",
        "post_op_duration": "3 meses",
    },
    "13_hpb_manejo_completo": {
        "procedure": "Cirurgia de HPB",
        "type": "cirurgia",
        "post_op_duration": "6 meses",
    },
}

def create_acompanhamento_premium_v2(protocol_name, details):
    """Cria o novo bloco de Acompanhamento Premium com estrutura extensa."""
    
    procedure = details["procedure"]
    duration = details["post_op_duration"]
    
    content = f"""# Plano de Acompanhamento Premium — Jornada Completa de Transformação

## O Que Você Está Comprando: Não é Apenas uma {details['type'].capitalize()}, é uma Jornada

Você não está comprando uma {details['type']} isolada. Você está investindo em uma **jornada de transformação completa**, com suporte contínuo, otimização científica e acesso direto ao Dr. Felipe e sua equipe durante **{duration}** após o procedimento.

---

## FASE 1: PRÉ-OPERATÓRIO — Otimização Científica (2-4 semanas antes)

### Objetivo
Preparar seu corpo para o melhor resultado possível, com base em **evidência científica comprovada**. Cada vitamina, cada suplemento, cada recomendação tem uma razão científica.

### Protocolo de Otimização Pré-Operatória

#### Vitaminas e Suplementos Comprovados para Cicatrização e Recuperação

| Nutriente | Função | Dose | Duração | Por Quê? |
|---|---|---|---|---|
| **Vitamina C** | Síntese de colágeno, cicatrização | 500-1000 mg/dia | 4 semanas antes até 8 semanas depois | Aumenta resistência da cicatriz em até 84% (estudo PMC9405326) |
| **Zinco** | Cicatrização, imunidade, regeneração | 15-30 mg/dia | 2 semanas antes até 4 semanas depois | Essencial para síntese de colágeno; deficiência retarda cicatrização |
| **Vitamina D** | Imunidade, inflamação, osso | 2000 UI/dia | Contínuo | Melhora resposta imunológica pós-op; reduz complicações |
| **Selênio** | Antioxidante, proteção celular | 200 mcg/dia | 2 semanas antes até 4 semanas depois | Protege células do estresse oxidativo cirúrgico |
| **Proteína/Arginina** | Síntese proteica, cicatrização | 1.2-1.5 g/kg/dia | Contínuo | Bloco de construção para regeneração tecidual |
| **Ômega-3** | Anti-inflamação, vascularização | 2-3 g/dia | 2 semanas antes até 6 semanas depois | Reduz inflamação excessiva pós-op; melhora fluxo sanguíneo |
| **Vitamina E** | Antioxidante, cicatrização | 400 UI/dia | 2 semanas antes até 4 semanas depois | Protege novas células durante cicatrização |
| **Vitamina B12 + Ácido Fólico** | Energia, síntese de DNA | RDA | Contínuo | Essencial para divisão celular e recuperação |

**Fonte:** Bechara et al. (2022), Antioxidants; AUA Pre-Operative White Paper (2018); Chaudhary et al. (2025), Frontiers in Nutrition.

#### Outras Recomendações Pré-Operatórias

- **Sono:** 7-9 horas/noite (cicatrização ocorre durante o sono)
- **Exercício:** Caminhadas 30 min/dia (melhora circulação e imunidade)
- **Nutrição:** Dieta rica em proteína, frutas e vegetais
- **Hidratação:** 2-3 litros de água/dia
- **Cessação:** Álcool e tabaco (prejudicam cicatrização)
- **Medicações:** Ajustes conforme orientação (anticoagulantes, anti-inflamatórios)

---

## FASE 2: DURANTE O PROCEDIMENTO

### Segurança e Técnica

- Procedimento realizado com **técnica de mínima invasão** quando possível
- Anestesia segura com monitoramento contínuo
- Equipe experiente e certificada
- Instrumentação de última geração
- Protocolo de infecção zero

---

## FASE 3: PÓS-OPERATÓRIO — Recuperação Completa com Suporte 24/7 ({duration})

### 🔴 **DIFERENCIAL CRÍTICO: ACESSO DIRETO 24 HORAS**

**Você não fica sozinho após a cirurgia.** Você tem acesso direto ao **Dr. Felipe e sua equipe** durante **{duration}** completos:

- ✅ **Contato 24 horas** — número pessoal do Dr. Felipe
- ✅ **Resposta rápida** — para qualquer dúvida, dor, preocupação
- ✅ **Suporte contínuo** — você não é abandonado após a cirurgia
- ✅ **Equipe multidisciplinar** — fisioterapeuta, nutricionista, educador físico

**Isso é raro no mercado.** A maioria dos cirurgiões desaparece após a cirurgia. Aqui, você tem um relacionamento de longo prazo.

### Cronograma de Recuperação

#### Semana 1-2: Repouso Ativo
- Repouso relativo (sem atividade pesada)
- Cuidados com ferida operatória
- Suplementação contínua (vitaminas)
- Contato com Dr. Felipe: **check-in de 48 horas**

#### Semana 3-4: Retorno Gradual
- Retorno a atividades leves
- Fisioterapia iniciada (se aplicável)
- Primeira consulta de acompanhamento (presencial ou telemedicina)
- **Contato semanal com equipe**

#### Mês 2-3: Reabilitação Progressiva
- Exercícios supervisionados (educador físico)
- Orientação nutricional (nutricionista)
- Retorno gradual a atividades normais
- **Consulta de 1 mês**

#### Mês 4-6: Consolidação e Retorno Total
- Atividades normais retomadas
- Exercícios de manutenção
- Avaliação final de resultados
- **Consulta de 3 meses e 6 meses**

### Equipe Multidisciplinar Incluída

| Profissional | Função | Frequência |
|---|---|---|
| **Dr. Felipe** | Cirurgião, suporte 24/7, retornos | Sob demanda + programados |
| **Fisioterapeuta** | Reabilitação, mobilidade, dor | 2-3x/semana (primeiras 4 semanas) |
| **Nutricionista** | Otimização nutricional pós-op | 1-2x/mês |
| **Educador Físico** | Exercícios supervisionados, retorno | 1-2x/semana (após 4 semanas) |

### Suplementação Pós-Operatória Contínua

Mantém-se a suplementação com vitaminas (Vitamina C, Zinco, Selênio, Ômega-3) durante os primeiros 2-3 meses pós-op, com ajustes conforme evolução.

---

## O Que Você Recebe: Pacote Completo

✅ Cirurgia com técnica de mínima invasão  
✅ Protocolo pré-operatório com vitaminas comprovadas  
✅ Acesso 24/7 ao Dr. Felipe (diferencial raro)  
✅ Equipe multidisciplinar (fisio, nutrição, educação física)  
✅ Retornos programados em 1 semana, 1 mês, 3 meses, 6 meses  
✅ Suporte contínuo para qualquer dúvida ou complicação  
✅ Protocolo baseado em evidência científica  

---

## Resultado Esperado

Não é apenas uma {details['type']} bem-sucedida. É uma **transformação completa**, com recuperação otimizada, suporte contínuo e um relacionamento duradouro com seu cirurgião.

**Você não está sozinho nessa jornada.**
"""
    
    return content


def load_protocols_json(filepath):
    """Carrega o JSON de protocolos."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_protocols_json(protocols, filepath):
    """Salva o JSON de protocolos."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(protocols, f, ensure_ascii=False, indent=2)


def replace_acompanhamento_premium(protocols_json_path, dry_run=True):
    """Substitui (não insere) o bloco de Acompanhamento Premium."""
    
    protocols_list = load_protocols_json(protocols_json_path)
    
    # Converter lista em dicionário por ID
    protocols_dict = {p['id']: p for p in protocols_list}
    
    changes = []
    
    for protocol_id, details in SURGICAL_PROTOCOLS.items():
        if protocol_id not in protocols_dict:
            print(f"⚠️  Protocolo {protocol_id} não encontrado")
            continue
        
        protocol = protocols_dict[protocol_id]
        
        # Criar novo bloco
        new_content = create_acompanhamento_premium_v2(protocol_id, details)
        
        # Encontrar e REMOVER o bloco antigo de Acompanhamento Premium
        sections = protocol.get("sections", [])
        sections_before = len(sections)
        
        # Remover seções que contêm "Acompanhamento Premium" no título
        sections = [s for s in sections if "Acompanhamento Premium" not in s.get("title", "")]
        
        # Encontrar a seção de Referências para inserir antes dela
        ref_index = None
        for i, section in enumerate(sections):
            if section.get("is_references"):
                ref_index = i
                break
        
        # Criar nova seção
        new_section = {
            "title": "Plano de Acompanhamento Premium — Jornada Completa",
            "content": new_content,
            "is_prescription": False,
            "is_mev": False,
            "is_references": False,
            "is_secretary": False,
        }
        
        # Inserir antes das Referências
        if ref_index is not None:
            sections.insert(ref_index, new_section)
        else:
            sections.append(new_section)
        
        protocol["sections"] = sections
        
        changes.append({
            "protocol": protocol_id,
            "procedure": details["procedure"],
            "sections_before": sections_before,
            "sections_after": len(sections),
            "removed_old": sections_before - len([s for s in sections if "Acompanhamento Premium" not in s.get("title", "")]),
        })
    
    if not dry_run:
        # Converter dicionário de volta para lista
        protocols_list = list(protocols_dict.values())
        save_protocols_json(protocols_list, protocols_json_path)
        print(f"✅ {len(changes)} protocolos atualizados (blocos antigos removidos, novos inseridos)")
    
    return changes, protocols_dict if dry_run else None


if __name__ == "__main__":
    import sys
    
    protocols_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"
    dry_run = not (len(sys.argv) > 1 and sys.argv[1] == "--apply")
    
    print("=" * 80)
    print("SUBSTITUIÇÃO: Acompanhamento Premium v2 com Acesso 24/7 (Remove Antigos)")
    print("=" * 80)
    print()
    
    changes, _ = replace_acompanhamento_premium(protocols_path, dry_run=dry_run)
    
    print(f"Protocolos a atualizar: {len(changes)}")
    for change in changes:
        print(f"  ✓ {change['procedure']} ({change['protocol']})")
        print(f"    Seções: {change['sections_before']} → {change['sections_after']} (removidos: {change['removed_old']})")
    
    if dry_run:
        print()
        print("🔍 DRY-RUN MODE — nenhuma mudança aplicada")
        print("Execute com --apply para aplicar as mudanças")
    else:
        print()
        print("✅ Mudanças aplicadas ao protocols.json")
