import json
import os

def enrich_all_images_v2():
    json_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"
    
    if not os.path.exists(json_path):
        print(f"Erro: {json_path} não encontrado.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        protocols = json.load(f)
        
    # Mapeamento de imagens para múltiplos protocolos adicionais com IDs reais
    images_mapping = {
        # Esfíncter Urinário Artificial (HPB ou Reabilitação pós-Prostatectomia ou Incontinência)
        "28_incontinencia_urinaria": [
            {
                "url": "/images/surgical/sling_feminino.jpg",
                "legend": "Técnica de Sling de Uretra Média (Mid-Urethral Sling - TVT/TOT) para correção de hipermobilidade uretral feminina."
            },
            {
                "url": "/images/surgical/esfincter_artificial.jpg",
                "legend": "Componentes e posicionamento anatômico do Esfíncter Urinário Artificial (manguito uretral, balão regulador de pressão e bomba escrotal) para tratamento de incontinência urinária pós-prostatectomia."
            }
        ],
        # Vasectomia Sem Bisturi
        "6_vasectomia_sem_bisturi": [
            {
                "url": "/images/surgical/vasectomia.jpg",
                "legend": "Técnica de vasectomia sem bisturi: isolamento do ducto deferente, ressecção de segmento, cauterização e interposição fascial."
            }
        ],
        # Circuncisão e Frenuloplastia
        "11_circuncisao_frenuloplastia": [
            {
                "url": "/images/surgical/postectomia.jpg",
                "legend": "Técnica de postectomia clássica com ressecção de excesso de prepúcio e sutura com pontos simples absorvíveis."
            }
        ],
        # Cistoscopia Diagnóstica (ITU de Repetição)
        "29_itu_repeticao": [
            {
                "url": "/images/surgical/cistoscopia.jpg",
                "legend": "Avaliação endoscópica da uretra e bexiga por cistoscopia flexível diagnóstica."
            }
        ]
    }
    
    # Aplicar mapeamento
    enriched_count = 0
    for p in protocols:
        p_id = p.get("id")
        if p_id in images_mapping:
            p["images"] = images_mapping[p_id]
            enriched_count += 1
            print(f"Protocolo '{p_id}' enriquecido com {len(images_mapping[p_id])} imagens.")
            
    # Salvar de volta
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(protocols, f, ensure_ascii=False, indent=2)
        
    print(f"Sucesso: {enriched_count} protocolos enriquecidos com novas imagens de atlas cirúrgicos.")

if __name__ == "__main__":
    enrich_all_images_v2()
