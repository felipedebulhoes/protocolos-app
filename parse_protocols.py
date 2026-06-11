import os
import json
import re

protocols_dir = "/home/ubuntu/protocolos_individuais"
output_file = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"

os.makedirs(os.path.dirname(output_file), exist_ok=True)

protocols = []

# Mapeamento de nomes amigáveis e ícones para cada protocolo
protocol_meta = {
    "1_implante_protese_peniana": {"title": "Implante de Prótese Peniana Inflável", "category": "Andrologia", "icon": "Activity"},
    "1b_protese_semirrigida": {"title": "Implante de Prótese Peniana Semirrigida", "category": "Andrologia", "icon": "Activity"},
    "2_varicocelectomia": {"title": "Varicocelectomia Subinguinal Microcirúrgica", "category": "Infertilidade & Microcirurgia", "icon": "Scissors"},
    "3_doenca_peyronie": {"title": "Doença de Peyronie - Abordagem Completa", "category": "Andrologia", "icon": "TrendingUp"},
    "4_disfuncao_eretil": {"title": "Disfunção Erétil - Abordagem Escalonada", "category": "Andrologia", "icon": "Zap"},
    "5_micro_tese": {"title": "Micro-TESE (Microdissecção Testicular)", "category": "Infertilidade & Microcirurgia", "icon": "Search"},
    "5b_reversao_vasectomia": {"title": "Reversão de Vasectomia Microcirúrgica", "category": "Infertilidade & Microcirurgia", "icon": "Link"},
    "6_vasectomia_sem_bisturi": {"title": "Vasectomia Sem Bisturi", "category": "Procedimentos de Consultório", "icon": "Scissors"},
    "7_engrossamento_peniano_ha": {"title": "Engrossamento Peniano com Ácido Hialurônico", "category": "Procedimentos de Consultório", "icon": "PlusCircle"},
    "8_trt_performance": {"title": "TRT e Otimização Hormonal Masculina", "category": "Hormônios & Performance", "icon": "Flame"},
    "9_trt_estetico_danos": {"title": "Manejo de Danos por Esteroides Anabolizantes", "category": "Hormônios & Performance", "icon": "ShieldAlert"},
    "10_terapia_pos_ciclo": {"title": "Terapia Pós-Ciclo (TPC) Baseada em Evidências", "category": "Hormônios & Performance", "icon": "RefreshCw"},
    "11_circuncisao_frenuloplastia": {"title": "Circuncisão e Frenuloplastia com Plastibell/Grampeador", "category": "Procedimentos de Consultório", "icon": "Layers"},
    "12_lipo_suprapubica_webbing": {"title": "Lipoaspiração Suprapúbica e Correção de Webbing Peniano", "category": "Procedimentos de Consultório", "icon": "Sparkles"},
    "13_hpb_manejo_completo": {"title": "Hiperplasia Prostática Benigna (HPB) - Manejo Clínico e Cirúrgico", "category": "Urologia Geral", "icon": "FileText"},
    "14_infertilidade_masculina": {"title": "Investigação e Manejo da Infertilidade Masculina", "category": "Infertilidade & Microcirurgia", "icon": "Users"},
    "15_ejaculacao_precoce": {"title": "Ejaculação Precoce - Abordagem Multimodal", "category": "Andrologia", "icon": "Clock"},
    "16_ejaculacao_retardada": {"title": "Ejaculação Retardada e Anorgasmia", "category": "Andrologia", "icon": "Hourglass"},
    "17_priapismo_emergencia": {"title": "Priapismo - Protocolo de Emergência", "category": "Urgências Urológicas", "icon": "AlertTriangle"},
    "18_dor_escrotal_cronica": {"title": "Dor Escrotal Crônica - Investigação e Manejo", "category": "Urologia Geral", "icon": "HeartCrack"},
    "19_preservacao_fertilidade_oncologica": {"title": "Preservação de Fertilidade Oncológica Masculina", "category": "Infertilidade & Microcirurgia", "icon": "FolderHeart"},
    "20_reabilitacao_peniana_pos_prostatectomia": {"title": "Reabilitação Peniana Pós-Prostatectomia Radical", "category": "Andrologia", "icon": "HeartPulse"},
    "21_li_eswt_ondas_choque": {"title": "Terapia por Ondas de Choque Extracorpóreas (Li-ESWT)", "category": "Procedimentos de Consultório", "icon": "ZapOff"},
    "22_checkup_performance": {"title": "Check-up de Performance e Longevidade Masculina", "category": "Hormônios & Performance", "icon": "CheckSquare"},
    "23_prp_intracavernoso": {"title": "Plasma Rico em Plaquetas (PRP) Intracavernoso", "category": "Procedimentos de Consultório", "icon": "Droplet"},
    "24_medicina_sexual_casal": {"title": "Medicina Sexual do Casal - Abordagem Integrada", "category": "Andrologia", "icon": "Heart"},
    "25_homem_trans": {"title": "Manejo de Saúde do Homem Transgênero", "category": "Hormônios & Performance", "icon": "UserCheck"},
    "26_anorgasmia_masculina": {"title": "Anorgasmia Masculina - Diagnóstico e Tratamento", "category": "Andrologia", "icon": "Moon"},
    "27_litiase_renal": {"title": "Litíase Renal Masculina e Feminina", "category": "Urologia Geral", "icon": "Gem"},
    "28_incontinencia_urinaria": {"title": "Incontinência Urinária Masculina e Feminina", "category": "Urologia Geral", "icon": "Droplets"},
    "29_itu_repeticao": {"title": "Infecção do Trato Urinário (ITU) de Repetição no Homem", "category": "Urologia Geral", "icon": "ShieldAlert"}
}

# Listar e ordenar arquivos de forma numérica inteligente
files = [f for f in os.listdir(protocols_dir) if f.endswith(".md")]

def get_file_num(filename):
    match = re.match(r"(\d+)", filename)
    if match:
        return int(match.group(1))
    return 999

files.sort(key=get_file_num)

for filename in files:
    base_name = filename.replace(".md", "")
    filepath = os.path.join(protocols_dir, filename)
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extrair título principal
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1) if title_match else base_name
    
    # Limpar título para tirar prefixos longos
    title = re.sub(r"PROTOCOLO CLÍNICO E DE EXPERIÊNCIA PREMIUM \(CPP \+ MEV\) —\s*", "", title)
    title = re.sub(r"PROTOCOLO CLÍNICO E DE EXPERIÊNCIA PREMIUM —\s*", "", title)
    title = re.sub(r"PROTOCOLO CLÍNICO PREMIUM —\s*", "", title)
    
    # Buscar metadados customizados ou usar padrão
    meta = protocol_meta.get(base_name, {"title": title, "category": "Urologia Geral", "icon": "FileText"})
    
    # Dividir em seções baseado em cabeçalhos Markdown (##)
    sections = []
    # Encontrar todas as seções que começam com ##
    raw_sections = re.split(r"^##\s+", content, flags=re.MULTILINE)
    
    # A primeira parte é a introdução (antes do primeiro ##)
    intro = raw_sections[0].strip() if raw_sections else ""
    # Remover o título principal da introdução
    intro = re.sub(r"^#\s+.+$", "", intro, flags=re.MULTILINE).strip()
    
    for rs in raw_sections[1:]:
        lines = rs.strip().split("\n")
        sec_title = lines[0].strip()
        sec_content = "\n".join(lines[1:]).strip()
        
        # Identificar se é uma seção de prescrição
        is_prescription = "PRESCRIÇÃO" in sec_title.upper() or "RECEITUÁRIO" in sec_title.upper()
        
        # Identificar se é uma seção de MEV
        is_mev = "MEV" in sec_title.upper() or "ESTILO DE VIDA" in sec_title.upper()
        
        # Identificar se é uma seção de referências
        is_references = "REFERÊNCIAS" in sec_title.upper()
        
        sections.append({
            "title": sec_title,
            "content": sec_content,
            "is_prescription": is_prescription,
            "is_mev": is_mev,
            "is_references": is_references
        })
        
    protocols.append({
        "id": base_name,
        "filename": filename,
        "title": meta["title"],
        "category": meta["category"],
        "icon": meta["icon"],
        "intro": intro,
        "sections": sections,
        "raw_content": content
    })

# Salvar como JSON estruturado
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(protocols, f, ensure_ascii=False, indent=2)

print(f"Sucesso! {len(protocols)} protocolos parseados e salvos em {output_file}")
