import json
import os

protocols_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"

with open(protocols_path, "r", encoding="utf-8") as f:
    protocols = json.load(f)

# 1. Scripts de Secretaria e Objeções para Procedimentos Chave
scripts_data = {
    "1_implante_protese_peniana": {
        "images": [
            {"path": "/images/surgical/protese_inflavel_passos.jpg", "caption": "Passo a passo cirúrgico do implante de prótese inflável de 3 volumes (Incisão penoescrotal, dilatação dos corpos cavernosos, medição e inserção dos cilindros, posicionamento do reservatório retropúbico e bomba escrotal)."},
            {"path": "/images/surgical/protese_anatomia_posicionamento.png", "caption": "Diagrama anatômico final demonstrando o correto posicionamento do reservatório no espaço pré-vesical (Retzius), bomba infladora no escroto médio e cilindros expandidos nos corpos cavernosos."}
        ],
        "secretary_script": {
            "reception": "Olá, Sr. [Nome do Paciente]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. O Dr. Felipe me pediu para entrar em contato para conversarmos sobre a cirurgia de Implante de Prótese Peniana Inflável que ele recomendou na sua consulta. Como o senhor está se sentindo em relação a isso?",
            "value_proposition": "Essa cirurgia é considerada o padrão-ouro mundial para pacientes que buscam recuperar a espontaneidade total em sua vida íntima. O Dr. Felipe é especialista nessa técnica minuciosa. O implante inflável de 3 volumes oferece o resultado mais natural possível, tanto em flacidez quanto em rigidez, sendo imperceptível externamente.",
            "objections": [
                {
                    "objection": "A cirurgia é muito cara / O plano de saúde não cobre o implante inflável.",
                    "response": "Entendo perfeitamente a sua preocupação financeira, Sr. [Nome]. Realmente, a prótese inflável de alta tecnologia tem um custo de importação. No entanto, nossa equipe oferece todo o suporte de assessoria jurídica e relatórios médicos detalhados baseados em guidelines para solicitar a cobertura integral do dispositivo pelo seu plano de saúde. Caso o plano negue inicialmente, nós conduzimos o recurso para garantir seu direito. Também dividimos os honorários da equipe cirúrgica em até X vezes para viabilizar o seu tratamento."
                },
                {
                    "objection": "Tenho medo de sentir dor ou de que fique artificial.",
                    "response": "Essa é uma dúvida muito comum! Em relação à dor, o Dr. Felipe utiliza um protocolo de anestesia multimodal moderno (bloqueio anestésico local + analgesia programada), o que reduz drasticamente o desconforto pós-operatório. Sobre a estética, o implante inflável fica totalmente interno. Ninguém saberá que o senhor tem a prótese, a menos que o senhor conte. O pênis fica completamente flácido quando desinflado e extremamente rígido para a relação, sem alterar a sensibilidade ou o orgasmo."
                },
                {
                    "objection": "Qual o tempo de recuperação? Vou precisar ficar muito tempo sem trabalhar?",
                    "response": "O procedimento é de rápida recuperação. Geralmente, o paciente recebe alta no mesmo dia ou na manhã seguinte. Recomendamos repouso relativo de 3 a 5 dias para atividades de escritório (trabalho em computador). Atividades físicas leves podem ser retomadas em 2 a 3 semanas, e a atividade sexual ativa é liberada após 6 semanas, que é o tempo necessário para a cicatrização interna completa e ativação da prótese em consultório pelo Dr. Felipe."
                }
            ]
        }
    },
    "1b_protese_semirrigida": {
        "secretary_script": {
            "reception": "Olá, Sr. [Nome]! Sou a [Nome da Secretária], assistente do Dr. Felipe de Bulhões. O Dr. Felipe me pediu para alinhar os detalhes da sua cirurgia de Implante de Prótese Peniana Semirrígida (Maleável). Como o senhor está?",
            "value_proposition": "A prótese semirrígida é uma excelente solução, extremamente segura e altamente eficaz. É uma cirurgia mais simples, com menor tempo cirúrgico e excelente índice de satisfação. Ela oferece uma rigidez constante e excelente facilidade de uso, ideal para quem busca uma solução definitiva e de alta durabilidade para a disfunção erétil.",
            "objections": [
                {
                    "objection": "O pênis vai ficar ereto o tempo todo? Vai marcar na roupa?",
                    "response": "Essa é uma excelente pergunta! A prótese semirrígida possui uma alma de metal (geralmente prata ou titânio) revestida de silicone medicinal de alta qualidade. Ela é altamente maleável. Isso significa que o senhor consegue posicionar o pênis facilmente para baixo ou rente ao corpo na cueca, ficando totalmente discreto sob qualquer tipo de roupa. O pênis só fica na posição de relação quando o senhor mesmo o direcionar para cima."
                },
                {
                    "objection": "O plano de saúde cobre essa prótese?",
                    "response": "Sim! A prótese semirrígida (maleável) está no rol de procedimentos obrigatórios da ANS. Isso significa que o seu plano de saúde tem a obrigação por lei de cobrir tanto a internação hospitalar quanto o dispositivo da prótese. Nós cuidamos de toda a documentação médica para que o senhor não precise se preocupar com burocracias junto ao convênio."
                }
            ]
        }
    },
    "2_varicocelectomia": {
        "images": [
            {"path": "/images/surgical/varicocelectomia_passos.jpg", "caption": "Passo a passo cirúrgico da Varicocelectomia Subinguinal (Incisão subinguinal de 2-3 cm, exteriorização do cordão espermático, abertura da fáscia cremastérica e isolamento sob microscópio cirúrgico)."},
            {"path": "/images/surgical/varicocelectomia_microscopio.jpg", "caption": "Visão microcirúrgica de alta magnificação demonstrando a preservação meticulosa da artéria testicular, vasos linfáticos e ducto deferente, com ligadura exclusiva das veias espermáticas dilatadas para minimizar riscos de hidrocele ou atrofia."}
        ],
        "secretary_script": {
            "reception": "Olá, Sr. [Nome]! Tudo bem? Sou a [Nome da Secretária] do consultório do Dr. Felipe de Bulhões. Estou entrando em contato para conversarmos sobre a Varicocelectomia Subinguinal Microcirúrgica que o Dr. Felipe indicou para o seu caso de [fertilidade / dor]. Como posso te ajudar hoje?",
            "value_proposition": "A técnica que o Dr. Felipe utiliza é a microcirurgia subinguinal, que é o padrão-ouro absoluto da urologia mundial. O uso do microscópio cirúrgico de alta definição permite identificar e preservar todas as pequenas artérias e vasos linfáticos, ligando apenas as veias doentes. Isso reduz a taxa de complicações a quase zero e oferece a melhor recuperação possível para a melhora do sêmen e alívio da dor.",
            "objections": [
                {
                    "objection": "Tenho medo de que a cirurgia cause impotência ou atrofia do testículo.",
                    "response": "Entendo a sua preocupação, mas na verdade é exatamente o oposto! A varicocele não tratada é que pode causar atrofia testicular devido ao superaquecimento do sangue acumulado. Na cirurgia com microscópio que o Dr. Felipe realiza, o risco de atrofia é praticamente inexistente (menor que 0.1%), pois a artéria testicular é identificada e preservada com total segurança. Além disso, a cirurgia não afeta em nada a ereção ou a parte nervosa do pênis."
                },
                {
                    "objection": "O pós-operatório é muito doloroso? Quanto tempo fico sem treinar?",
                    "response": "Por ser uma incisão muito pequena (cerca de 2 a 3 cm na região da virilha) e sem cortar músculos, a dor no pós-operatório é leve e perfeitamente controlada com analgésicos simples. O senhor poderá caminhar e trabalhar em escritório em 3 dias. Exercícios de musculação e esforços físicos pesados devem ser evitados por 3 a 4 semanas para garantir uma cicatrização segura da parede abdominal."
                }
            ]
        }
    },
    "27_litiase_renal": {
        "images": [
            {"path": "/images/surgical/rirs_passos.jpg", "caption": "Acesso retrógrado intrarrenal (RIRS) com ureteroscópio flexível passando pela uretra e bexiga até o rim, permitindo visualização direta do cálculo no cálice renal."},
            {"path": "/images/surgical/rirs_equipamento_laser.webp", "caption": "Fragmentação a laser de alta potência (Holmium ou Fiber Thulium) pulverizando o cálculo em poeira fina (dusting) ou fragmentos pequenos passíveis de extração com cesta de nitinol (basketing)."}
        ],
        "secretary_script": {
            "reception": "Olá, Sr(a). [Nome]! Sou a [Nome da Secretária] do Dr. Felipe de Bulhões. O Dr. Felipe me pediu para entrar em contato para agendarmos a sua Ureterolitotripsia Flexível a Laser (RIRS) para o tratamento dos cálculos renais. Como o(a) senhor(a) está se sentindo?",
            "value_proposition": "Esta é uma cirurgia de altíssima tecnologia, totalmente endoscópica (sem cortes externos). O Dr. Felipe utiliza um ureteroscópio flexível ultra-fino e fibra de laser de última geração para fragmentar e pulverizar a pedra diretamente dentro do rim. O procedimento é extremamente seguro, preciso e permite que o(a) senhor(a) volte para casa no mesmo dia, livre das dores e do risco de uma crise de cólica renal.",
            "objections": [
                {
                    "objection": "Tenho medo da anestesia e de sentir muita dor com o duplo J.",
                    "response": "A anestesia é geral ou raquianestesia com sedação profunda, conduzida por um anestesista especialista focado no seu conforto absoluto, fazendo com que o(a) senhor(a) durma e não sinta absolutamente nada durante o procedimento. Sobre o cateter duplo J, ele é essencial para garantir que o canal do rim não entupa com os fragmentos da pedra. O Dr. Felipe utiliza cateteres de material ultra-macio e prescreve medicamentos específicos que reduzem drasticamente qualquer incômodo urinário enquanto o cateter estiver posicionado."
                },
                {
                    "objection": "Posso apenas tomar remédio para dissolver a pedra em vez de operar?",
                    "response": "Entendo perfeitamente o desejo de evitar a cirurgia! No entanto, pedras maiores que 5-6 mm ou localizadas dentro do rim dificilmente saem sozinhas ou dissolvem com remédios (apenas pedras raras de ácido úrico podem responder, mas dependem de avaliação). Deixar a pedra no rim sem tratamento adequado é um risco, pois ela pode se mover a qualquer momento, obstruir o canal, causar infecções graves ou perda silenciosa da função do rim. A cirurgia a laser resolve o problema de forma definitiva e segura."
                }
            ]
        }
    }
}

# Enriquecer os protocolos no JSON
for p in protocols:
    p_id = p["id"]
    if p_id in scripts_data:
        # Adicionar imagens se houver
        if "images" in scripts_data[p_id]:
            p["images"] = scripts_data[p_id]["images"]
        
        # Adicionar script da secretaria e objeções como uma nova seção
        sec_data = scripts_data[p_id]
        
        # Criar texto em markdown para a nova seção
        markdown_content = "### 📞 Script de Abordagem da Secretaria\n\n"
        markdown_content += f"**Acolhimento e Contato Inicial:**\n> {sec_data['secretary_script']['reception']}\n\n"
        markdown_content += f"**Apresentação da Proposta de Valor:**\n{sec_data['secretary_script']['value_proposition']}\n\n"
        
        markdown_content += "### 🛡️ Contorno de Objeções Comuns\n\n"
        for obj in sec_data["secretary_script"]["objections"]:
            markdown_content += f"*   **Objeção:** *\"{obj['objection']}\"*\n"
            markdown_content += f"    *   **Resposta Recomendada:** {obj['response']}\n\n"
            
        # Adicionar nova seção ao protocolo
        p["sections"].append({
            "title": "Script da Secretaria & Contorno de Objeções",
            "content": markdown_content,
            "is_prescription": False,
            "is_mev": False,
            "is_references": False,
            "is_secretary": True # Flag para identificação no frontend
        })
        print(f"Protocolo {p_id} enriquecido com sucesso!")

# Salvar o JSON atualizado
with open(protocols_path, "w", encoding="utf-8") as f:
    json.dump(protocols, f, ensure_ascii=False, indent=2)

print("Processo de enriquecimento de protocolos concluído com sucesso!")
