import json
import os

def enrich_doppler():
    json_path = "/home/ubuntu/protocolos-app/client/src/data/protocols.json"
    
    if not os.path.exists(json_path):
        print(f"Erro: Arquivo {json_path} não encontrado!")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        protocols = json.load(f)
        
    # Encontrar o protocolo de Doppler Peniano (geralmente id correspondente a doppler)
    # Vamos varrer os protocolos e buscar por id contendo 'doppler'
    doppler_protocol = None
    for p in protocols:
        if "doppler" in p["id"].lower():
            doppler_protocol = p
            break
            
    if doppler_protocol:
        # Adicionar os laudos estruturados de Doppler Peniano
        doppler_protocol["atestados"] = [
            {
                "titulo": "Atestado de Repouso Pós-Doppler Dinâmico",
                "modelo": "Atesto, para os devidos fins, que o(a) Sr(a). {paciente} foi submetido(a) a exame de Ultrassonografia Doppler Peniano Dinâmico com Fármaco-Indução (Alprostadil 10mcg) nesta data. Por recomendação médica, necessita de repouso relativo e observação clínica nas próximas 4 (quatro) horas para prevenção e monitoramento de episódios de priapismo ou hipotensão pós-procedimento.\n\nCID-10: Z01.9 (Exame médico especial não especificado)."
            }
        ]
        
        doppler_protocol["laudos"] = [
            {
                "titulo": "Laudo de Doppler Peniano Dinâmico - Função Vascular Normal",
                "modelo": "Paciente: {paciente}\nData do Exame: {data}\n\nLAUDO DE ULTRASSONOGRAFIA DOPPLER PENIANO DINÂMICO COM FÁRMACO-INDUÇÃO\n\nTÉCNICA:\nExame realizado com transdutor linear de alta frequência (12 MHz). Avaliação morfológica em modo B seguida de fármaco-indução intracavernosa com Alprostadil (PGE1) na dose de 10 mcg. Avaliação dinâmica sequencial do fluxo das artérias cavernosas direita e esquerda aos 5, 10, 15 e 20 minutos pós-injeção.\n\nRESULTADOS:\n- Modo B: Tecido erétil homogêneo, sem placas fibróticas calcificadas ou desvios de septo. Espessura do envelope albugíneo preservada.\n- Resposta erétil: Erection Hardness Score (EHS) Grau 4 (ereção plena e rígida aos 15 minutos).\n\nPARÂMETROS HEMODINÂMICOS (Pós-injeção):\n- Artéria Cavernosa Direita: VPS pico: 38 cm/s | VDF final: 0 cm/s | IR (Índice de Resistência): 1.0\n- Artéria Cavernosa Esquerda: VPS pico: 41 cm/s | VDF final: 0 cm/s | IR (Índice de Resistência): 1.0\n\nCONCLUSÃO:\nEstudo hemodinâmico peniano dinâmico dentro dos limites da normalidade. Ausência de sinais de insuficiência arterial (VPS > 30 cm/s) ou de mecanismo de escape veno-oclusivo (VDF = 0 cm/s com IR = 1.0)."
            },
            {
                "titulo": "Laudo de Doppler Peniano Dinâmico - Insuficiência Arterial",
                "modelo": "Paciente: {paciente}\nData do Exame: {data}\n\nLAUDO DE ULTRASSONOGRAFIA DOPPLER PENIANO DINÂMICO COM FÁRMACO-INDUÇÃO\n\nTÉCNICA:\nExame realizado com transdutor linear de alta frequência (12 MHz). Avaliação morfológica em modo B seguida de fármaco-indução intracavernosa com Alprostadil (PGE1) na dose de 10 mcg. Avaliação dinâmica sequencial do fluxo das artérias cavernosas direita e esquerda aos 5, 10, 15 e 20 minutos pós-injeção.\n\nRESULTADOS:\n- Modo B: Ausência de placas fibróticas ou calcificações grosseiras.\n- Resposta erétil: Erection Hardness Score (EHS) Grau 2 (ereção insuficiente para penetração).\n\nPARÂMETROS HEMODINÂMICOS (Pós-injeção):\n- Artéria Cavernosa Direita: VPS pico: 18 cm/s | VDF final: 2 cm/s | IR: 0.88\n- Artéria Cavernosa Esquerda: VPS pico: 21 cm/s | VDF final: 1.5 cm/s | IR: 0.92\n\nCONCLUSÃO:\nEstudo hemodinâmico dinâmico compatível com Insuficiência Arterial Peniana Bilateral. Fluxo arterial cavernoso reduzido, com velocidades sistólicas de pico (VPS) abaixo do valor de referência de normalidade (VPS < 25 cm/s sugere disfunção arterial grave; entre 25 e 30 cm/s sugere disfunção limítrofe)."
            },
            {
                "titulo": "Laudo de Doppler Peniano Dinâmico - Escape Veno-Oclusivo",
                "modelo": "Paciente: {paciente}\nData do Exame: {data}\n\nLAUDO DE ULTRASSONOGRAFIA DOPPLER PENIANO DINÂMICO COM FÁRMACO-INDUÇÃO\n\nTÉCNICA:\nExame realizado com transdutor linear de alta frequência (12 MHz). Avaliação morfológica em modo B seguida de fármaco-indução intracavernosa com Alprostadil (PGE1) na dose de 10 mcg. Avaliação dinâmica sequencial do fluxo das artérias cavernosas direita e esquerda aos 5, 10, 15 e 20 minutos pós-injeção.\n\nRESULTADOS:\n- Modo B: Albugínea íntegra, corpos cavernosos simétricos.\n- Resposta erétil: Erection Hardness Score (EHS) Grau 3 (ereção suficiente para penetração, mas sem rigidez plena, com perda rápida de tumescência).\n\nPARÂMETROS HEMODINÂMICOS (Pós-injeção):\n- Artéria Cavernosa Direita: VPS pico: 36 cm/s | VDF final: 7 cm/s | IR: 0.80\n- Artéria Cavernosa Esquerda: VPS pico: 38 cm/s | VDF final: 6.5 cm/s | IR: 0.82\n\nCONCLUSÃO:\nEstudo hemodinâmico compatível com Disfunção Veno-Oclusiva Peniana (Escape Venoso). Embora haja bom aporte arterial (VPS > 30 cm/s), observa-se persistência de velocidades diastólicas finais elevadas (VDF > 5 cm/s) e queda do Índice de Resistência (IR < 0.85) na fase de rigidez máxima."
            }
        ]
        
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(protocols, f, ensure_ascii=False, indent=2)
            
        print("Laudos de Doppler Peniano integrados com sucesso!")
    else:
        print("Erro: Protocolo de Doppler Peniano não encontrado no JSON!")

if __name__ == "__main__":
    enrich_doppler()
