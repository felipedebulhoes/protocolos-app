import json
import os

def enrich_certificates():
    json_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"
    
    if not os.path.exists(json_path):
        print(f"Erro: Arquivo {json_path} não encontrado!")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        protocols = json.load(f)
        
    # Modelos de Atestados e Laudos por tipo de procedimento
    for p in protocols:
        p["atestados"] = []
        p["laudos"] = []
        
        # 1. Prótese Peniana Inflável / Semirrígida
        if "protese" in p["id"]:
            p["atestados"].append({
                "titulo": "Atestado de Afastamento Pós-Operatório - Implante de Prótese Peniana",
                "modelo": "Atesto, para os devidos fins de direito, que o(a) Sr(a). {paciente} esteve sob meus cuidados profissionais, tendo sido submetido(a) a procedimento cirúrgico urológico de alta complexidade (Implante de Prótese Peniana) na data de {data}. Por este motivo, necessita de afastamento total de suas atividades laborais por um período de 15 (quinze) dias a contar desta data, devendo evitar esforços físicos e atividades sexuais por 45 dias.\n\nCID-10: N48.4 (Disfunção erétil orgânica) / Z54.0 (Convalescença após cirurgia)."
            })
            p["laudos"].append({
                "titulo": "Laudo de Implante de Prótese Peniana",
                "modelo": "Paciente: {paciente}\nData do Procedimento: {data}\n\nLAUDO MÉDICO DE IMPLANTE DE PRÓTESE PENIANA\n\nDeclaro para os devidos fins que o paciente acima citado apresenta quadro de Disfunção Erétil Orgânica Refratária ao tratamento farmacológico oral e intracavernoso (CID-10 N48.4). Foi submetido a procedimento cirúrgico de Implante de Prótese Peniana sob anestesia raquidiana/geral, sem intercorrências. O dispositivo implantado encontra-se em perfeito posicionamento anatômico, apresentando excelente resultado estético e funcional imediato. Paciente recebe alta hospitalar em boas condições clínicas, com orientações de repouso, curativos locais e acompanhamento ambulatorial regular."
            })
            
        # 2. Varicocelectomia
        elif "varicocele" in p["id"]:
            p["atestados"].append({
                "titulo": "Atestado de Afastamento Pós-Operatório - Varicocelectomia Microcirúrgica",
                "modelo": "Atesto, para os devidos fins de direito, que o(a) Sr(a). {paciente} foi submetido(a) a procedimento cirúrgico urológico de Varicocelectomia Subinguinal Microcirúrgica Bilateral na data de {data}. Necessita de repouso absoluto e afastamento total de suas atividades profissionais por um período de 07 (sete) dias a contar desta data, devendo abster-se de carregar peso, realizar exercícios físicos intensos ou atividades de impacto por 30 dias.\n\nCID-10: I86.1 (Varizes escrotais / Varicocele) / Z54.0."
            })
            p["laudos"].append({
                "titulo": "Laudo de Varicocelectomia Microcirúrgica Bilateral",
                "modelo": "Paciente: {paciente}\nData do Procedimento: {data}\n\nLAUDO MÉDICO DE CIRURGIA DE VARICOCELE\n\nDeclaro que o paciente acima citado foi submetido a tratamento cirúrgico de Varicocelectomia Subinguinal Microcirúrgica Bilateral por indicação de infertilidade conjugal / dor testicular crônica (CID-10 I86.1). O procedimento foi realizado com auxílio de microscópio cirúrgico de alta resolução, permitindo a ligadura seletiva de todas as veias espermáticas ectasiadas, com preservação estrita da artéria testicular e dos vasos linfáticos espermáticos, reduzindo o risco de atrofia testicular ou hidrocele pós-operatória. O paciente apresenta excelente evolução pós-operatória imediata."
            })
            
        # 3. Litíase Renal (RIRS / URS / PCNL)
        elif "litiase" in p["id"]:
            p["atestados"].append({
                "titulo": "Atestado de Afastamento - Ureterorrenolitotripsia Flexível a Laser (RIRS)",
                "modelo": "Atesto, para os devidos fins de direito, que o(a) Sr(a). {paciente} foi submetido(a) a procedimento cirúrgico endourológico de Ureterorrenolitotripsia Flexível a Laser com implante de cateter duplo J na data de {data}. Necessita de afastamento total de suas atividades profissionais por um período de 03 (três) dias para recuperação clínica imediata e controle de sintomas urinários decorrentes da presença do cateter.\n\nCID-10: N20.0 (Calculose renal) / Z54.0."
            })
            p["laudos"].append({
                "titulo": "Laudo de Ureterorrenolitotripsia Flexível a Laser (RIRS)",
                "modelo": "Paciente: {paciente}\nData do Procedimento: {data}\n\nLAUDO MÉDICO DE CIRURGIA ENDOUROLÓGICA\n\nDeclaro que o paciente acima citado apresentava quadro de Litíase Renal sintomática (CID-10 N20.0), tendo sido submetido a tratamento cirúrgico por via endoscópica retrógrada (Ureterorrenolitotripsia Flexível com Laser de Holmium/Túlio). O procedimento obteve fragmentação completa e pulverização do cálculo renal. Ao término, foi posicionado cateter ureteral duplo J sob visão fluoroscópica direta para garantir a drenagem urinária e prevenir obstrução por fragmentos. O cateter deverá ser retirado em consultório sob anestesia local em aproximadamente 7 a 14 dias."
            })
            
        # 4. Incontinência Urinária (Sling / AUS)
        elif "incontinencia" in p["id"]:
            p["atestados"].append({
                "titulo": "Atestado de Afastamento - Correção Cirúrgica de Incontinência Urinária (Sling)",
                "modelo": "Atesto, para os devidos fins de direito, que o(a) Sr(a). {paciente} foi submetido(a) a procedimento cirúrgico urológico de Correção de Incontinência Urinária de Esforço com implante de Sling de Uretra Média na data de {data}. Necessita de afastamento total de suas atividades profissionais por um período de 14 (quatorze) dias a contar desta data, devendo evitar carregar qualquer peso acima de 5kg ou realizar atividades que aumentem a pressão intra-abdominal por 60 dias.\n\nCID-10: N39.3 (Incontinência urinária de esforço) / Z54.0."
            })
            p["laudos"].append({
                "titulo": "Laudo de Implante de Sling de Uretra Média",
                "modelo": "Paciente: {paciente}\nData do Procedimento: {data}\n\nLAUDO MÉDICO DE TRATAMENTO DE INCONTINÊNCIA URINÁRIA\n\nDeclaro que a paciente acima citada apresentava quadro clínico e urodinâmico de Incontinência Urinária de Esforço (CID-10 N39.3) com impacto significativo na qualidade de vida. Foi submetida a tratamento cirúrgico por meio de implante de Sling de Uretra Média por via transobturatória (TOT) / retropúbica (TVT), sem intercorrências. O procedimento obteve excelente suporte uretral imediato e teste de tosse negativo sob anestesia. A paciente recebe alta em excelentes condições clínicas, urinando espontaneamente e sem resíduo pós-miccional significativo."
            })
            
        # 5. Modelos Padrões para os demais protocolos clínicos
        if not p["atestados"]:
            p["atestados"].append({
                "titulo": "Atestado Médico de Comparecimento / Consulta",
                "modelo": "Atesto, para os devidos fins de direito, que o(a) Sr(a). {paciente} esteve sob cuidados médicos neste consultório na data de {data}, no período das 14:00 às 16:00 horas, para realização de consulta urológica especializada e exames de acompanhamento clínico, estando apto(a) a retornar às suas atividades normais após este período.\n\nCID-10: Z01.9 (Exame médico especial não especificado)."
            })
        if not p["laudos"]:
            p["laudos"].append({
                "titulo": "Laudo de Parecer Clínico Urológico Especializado",
                "modelo": "Paciente: {paciente}\nData da Avaliação: {data}\n\nLAUDO DE PARECER UROLÓGICO ESPECIALIZADO\n\nDeclaro que o(a) paciente acima citado(a) encontra-se em acompanhamento urológico ambulatorial regular neste serviço para investigação e controle clínico de {titulo} (CID-10: {cid}). Ao exame físico e laboratorial atual, apresenta-se estável, sem evidências de complicações agudas ou sinais de urgência cirúrgica. Segue em tratamento clínico otimizado conforme diretrizes científicas atuais da Sociedade Brasileira de Urologia (SBU) e Associação Europeia de Urologia (EAU). Recomenda-se retorno ambulatorial em 3 a 6 meses para reavaliação periódica."
            })

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(protocols, f, ensure_ascii=False, indent=2)
        
    print("Enriquecimento de Atestados e Laudos concluído com sucesso!")

if __name__ == "__main__":
    enrich_certificates()
