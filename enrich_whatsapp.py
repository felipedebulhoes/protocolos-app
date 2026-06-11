import json
import os

protocols_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"

with open(protocols_path, "r", encoding="utf-8") as f:
    protocols = json.load(f)

# Mensagens prontas de WhatsApp para a secretaria
whatsapp_scripts = {
    "1_implante_protese_peniana": [
        {
            "trigger": "Acolhimento e Envio de Informações Iniciais",
            "message": "Olá, Sr. *[Nome]*, tudo bem? Sou a assistente do Dr. Felipe de Bulhões. Conforme conversamos, estou te enviando as informações sobre o *Implante de Prótese Peniana Inflável*. O Dr. Felipe é especialista nessa técnica padrão-ouro que devolve a espontaneidade total para sua vida íntima de forma 100% discreta. Caso queira, podemos agendar uma ligação para eu te explicar o passo a passo da liberação pelo seu plano de saúde. Um abraço!"
        },
        {
            "trigger": "Apoio no Processo de Reembolso / Autorização do Plano",
            "message": "Olá, Sr. *[Nome]*, sou a assistente do Dr. Felipe de Bulhões. Já preparamos todo o relatório médico detalhado e o laudo de indicação para o seu plano de saúde referente à prótese inflável. Estou te enviando os documentos em PDF. Basta anexar no aplicativo do seu convênio na opção de 'Solicitação de Cirurgia/Reembolso'. Qualquer dúvida ou se o plano solicitar algo a mais, me avise imediatamente que nossa equipe jurídica te auxilia!"
        }
    ],
    "1b_protese_semirrigida": [
        {
            "trigger": "Informações Iniciais e Cobertura do Convênio",
            "message": "Olá, Sr. *[Nome]*, tudo bem? Sou a assistente do Dr. Felipe de Bulhões. Estou te enviando as informações sobre a cirurgia de *Prótese Peniana Semirrígida (Maleável)*. Lembrando que este dispositivo está no rol obrigatório da ANS, ou seja, seu plano de saúde tem a obrigação de cobrir 100% da prótese e do hospital. Nós cuidamos de toda a papelada para você. Ficou alguma dúvida sobre o agendamento?"
        }
    ],
    "2_varicocelectomia": [
        {
            "trigger": "Orientações Pré-Operatórias e Cuidados",
            "message": "Olá, Sr. *[Nome]*, tudo bem? Sou a assistente do Dr. Felipe de Bulhões. Sua cirurgia de *Varicocelectomia Subinguinal Microcirúrgica* está confirmada! Seguem algumas orientações importantes:\n1. Jejum absoluto de 8 horas (inclusive água).\n2. Levar todos os exames pré-operatórios e o termo de consentimento assinado.\n3. Repouso relativo nos primeiros 3 dias pós-cirurgia.\nQualquer dúvida, estou à disposição!"
        }
    ],
    "27_litiase_renal": [
        {
            "trigger": "Confirmação de Cirurgia a Laser (RIRS)",
            "message": "Olá, Sr(a). *[Nome]*, tudo bem? Sou a assistente do Dr. Felipe de Bulhões. Passando para confirmar seu procedimento de *Ureterolitotripsia Flexível a Laser (RIRS)* para eliminação dos cálculos renais. O procedimento é totalmente sem cortes e você recebe alta no mesmo dia. Lembre-se do jejum de 8h e de levar seus exames de imagem (Uro-TC/Ultrassom). Nos vemos no hospital!"
        }
    ]
}

# Injetar os scripts de WhatsApp nas seções dos protocolos correspondentes
for p in protocols:
    p_id = p["id"]
    if p_id in whatsapp_scripts:
        p["whatsapp_scripts"] = whatsapp_scripts[p_id]
        print(f"Scripts de WhatsApp adicionados ao protocolo: {p_id}")

with open(protocols_path, "w", encoding="utf-8") as f:
    json.dump(protocols, f, ensure_ascii=False, indent=2)

print("Processo de enriquecimento de WhatsApp concluído!")
