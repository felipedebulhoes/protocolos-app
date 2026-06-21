import json
import os

json_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"

if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        protocols = json.load(f)
    
    # TCLE Prótese Peniana
    tcle_protese = {
        "title": "TCLE - Implante de Prótese Peniana",
        "type": "tcle",
        "content": """TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
PROCEDIMENTO: IMPLANTE DE PRÓTESE PENIANA (INFLÁVEL / SEMIRRÍGIDA)

Paciente: [Nome]
Médico Responsável: Dr. Felipe de Bulhões Ojeda | CRM-SP 241.135

Por este instrumento, eu, acima identificado, declaro que fui devidamente informado(a) pelo Dr. Felipe de Bulhões Ojeda sobre a indicação, riscos, benefícios e alternativas ao tratamento cirúrgico da Disfunção Erétil refratária mediante o implante de prótese peniana.

1. DO PROCEDIMENTO:
Compreendo que a cirurgia consiste na introdução de cilindros sintéticos no interior dos corpos cavernosos do pênis para permitir a rigidez necessária para a atividade sexual. No caso da prótese inflável, haverá também a implantação de uma bomba (pump) no escroto e um reservatório de líquido no abdômen. No caso da semirrígida, o pênis permanecerá em estado de rigidez constante, porém maleável.

2. DOS RISCOS E COMPLICAÇÕES:
Fui alertado de que, como qualquer ato cirúrgico, existem riscos gerais (sangramento, hematoma, infecção, riscos anestésicos) e riscos específicos do implante, tais como:
a) INFECÇÃO DA PRÓTESE (risco aproximado de 1-3% em pacientes não-diabéticos, podendo ser maior em diabéticos ou reoperações), o que exige a remoção completa do implante e nova cirurgia futura;
b) Erosão ou extrusão de componentes da prótese através da pele ou uretra;
c) Falha mecânica do dispositivo (especialmente no modelo inflável), podendo necessitar de cirurgia de revisão no futuro;
d) Redução subjetiva do comprimento peniano (decorrente da própria disfunção erétil prévia e retração cicatricial, e não diretamente causada pela prótese);
e) Dor pós-operatória prolongada, dormência temporária ou permanente na glande;
f) Lesão de estruturas adjacentes (uretra, corpos cavernosos, bexiga).

3. DOS RESULTADOS E EXPECTATIVAS:
Compreendo que a prótese peniana restaura a rigidez para penetração, mas não altera o desejo sexual (libido), a sensibilidade ou o orgasmo, que permanecerão semelhantes aos níveis pré-operatórios. Entendo que o implante destrói irreversivelmente o mecanismo natural de ereção, tornando o paciente dependente da prótese para ereções futuras.

4. DECLARAÇÃO DO PACIENTE:
Confirmo que tive a oportunidade de fazer perguntas, as quais foram respondidas de forma clara e compreensível. Declaro estar satisfeito com as explicações recebidas e dou meu consentimento livre e voluntário para a realização da cirurgia.

Campinas, [Data]

_________________________________________
Assinatura do Paciente / Responsável Legal

_________________________________________
Dr. Felipe de Bulhões Ojeda | CRM-SP 241.135"""
    }

    # TCLE Varicocelectomia
    tcle_varicocelectomia = {
        "title": "TCLE - Varicocelectomia Subinguinal Microcirúrgica",
        "type": "tcle",
        "content": """TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
PROCEDIMENTO: VARICOCELECTOMIA SUBINGUINAL MICROCIRÚRGICA

Paciente: [Nome]
Médico Responsável: Dr. Felipe de Bulhões Ojeda | CRM-SP 241.135

Por este instrumento, eu, acima identificado, declaro que fui devidamente informado(a) pelo Dr. Felipe de Bulhões Ojeda sobre a indicação, riscos, benefícios e alternativas ao tratamento cirúrgico da varicocele (dilatação das veias do cordão espermático) por via subinguinal com auxílio de microscópio cirúrgico.

1. DO PROCEDIMENTO:
Compreendo que a cirurgia visa ligar individualmente as veias espermáticas dilatadas, preservando as artérias testiculares, os canais deferentes e os vasos linfáticos, com o objetivo de melhorar os parâmetros do sêmen (fertilidade) e/ou aliviar a dor testicular crônica decorrente da varicocele.

2. DOS RISCOS E COMPLICAÇÕES:
Fui alertado de que, embora o uso do microscópio cirúrgico reduza drasticamente as complicações, ainda existem riscos específicos, tais como:
a) HIDROCELE (acúmulo de líquido ao redor do testículo) devido à ligadura inadvertida de vasos linfáticos (risco < 1% na técnica microcirúrgica);
b) Recorrência ou persistência da varicocele (risco aproximado de 1-2%);
c) Atrofia testicular decorrente de lesão acidental da artéria testicular (risco extremamente raro, < 0.5% com microscópio);
d) Hematoma escrotal ou inguinal, infecção da ferida operatória, dor testicular crônica persistente ou nova dor residual;
e) Parestesia (dormência) temporária ou permanente na região inguinal ou escrotal.

3. DOS RESULTADOS E EXPECTATIVAS:
Compreendo que a melhora nos parâmetros do espermograma ocorre em cerca de 60-80% dos pacientes operados por infertilidade, mas a cirurgia não garante a ocorrência de gravidez. No caso de indicação por dor, o alívio completo ocorre em cerca de 70-80% dos casos.

4. DECLARAÇÃO DO PACIENTE:
Confirmo que tive a oportunidade de fazer perguntas, as quais foram respondidas de forma clara e compreensível. Declaro estar satisfeito com as explicações recebidas e dou meu consentimento livre e voluntário para a realização da cirurgia.

Campinas, [Data]

_________________________________________
Assinatura do Paciente / Responsável Legal

_________________________________________
Dr. Felipe de Bulhões Ojeda | CRM-SP 241.135"""
    }

    for p in protocols:
        if p["id"] in ["1_implante_protese_peniana", "1b_protese_semirrigida"]:
            # Adicionar campo "tcle" ou estender os certificados/laudos existentes
            if "certificates" not in p:
                p["certificates"] = []
            
            # Verificar se já existe
            exists = any(c["title"] == tcle_protese["title"] for c in p["certificates"])
            if not exists:
                p["certificates"].append(tcle_protese)
                print(f"Adicionado TCLE Prótese ao protocolo {p['id']}")
                
        elif p["id"] == "2_varicocelectomia_subinguinal_microcirurgica":
            if "certificates" not in p:
                p["certificates"] = []
            
            exists = any(c["title"] == tcle_varicocelectomia["title"] for c in p["certificates"])
            if not exists:
                p["certificates"].append(tcle_varicocelectomia)
                print(f"Adicionado TCLE Varicocelectomia ao protocolo {p['id']}")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(protocols, f, indent=2, ensure_ascii=False)
    print("protocols.json enriquecido com TCLEs com sucesso!")
else:
    print("protocols.json não encontrado!")
