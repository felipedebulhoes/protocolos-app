
import json

def generate_protocol_html(protocol_data, logo_path, font_path, colors):
    protocol_title = protocol_data.get("title", "Protocolo").upper()
    protocol_id = protocol_data.get("id", "").replace("_", " ").upper()
    
    # Filtrar apenas seções clínicas
    clinical_sections = [s for s in protocol_data.get("sections", []) if not s.get("is_secretary") and not s.get("is_references")]

    sections_html = ""
    for section in clinical_sections:
        sections_html += f"""
        <div class="section">
            <h2>{section.get("title", "")}</h2>
            <div class="content">{section.get("content", "")}</div>
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>{protocol_title}</title>
        <style>
            @page {{ size: A4; margin: 1cm; }}
            body {{
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 0;
                color: {colors['foreground']};
            }}
            @font-face {{
                font-family: 'Callingstone';
                src: url('{font_path}') format('truetype');
                font-weight: normal;
                font-style: normal;
            }}
            header {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10px;
                border-bottom: 1px solid {colors['border']};
                margin-bottom: 20px;
            }}
            header img {{
                height: 50px;
                width: auto;
            }}
            header h1 {{
                font-family: 'Callingstone', serif;
                color: {colors['primary']};
                font-size: 24px;
                margin: 0;
            }}
            .protocol-info {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .protocol-info h1 {{
                font-family: 'Callingstone', serif;
                color: {colors['primary']};
                font-size: 32px;
                margin-bottom: 5px;
            }}
            .protocol-info p {{
                font-size: 14px;
                color: {colors['muted-foreground']};
            }}
            .section {{
                margin-bottom: 20px;
            }}
            .section h2 {{
                font-family: 'Playfair Display', serif;
                color: {colors['primary']};
                font-size: 20px;
                border-bottom: 1px solid {colors['border']};
                padding-bottom: 5px;
                margin-bottom: 10px;
            }}
            .section .content {{
                font-size: 12px;
                line-height: 1.6;
            }}
            footer {{
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                border-top: 1px solid {colors['border']};
                padding-top: 10px;
                text-align: center;
                font-size: 10px;
                color: {colors['muted-foreground']};
            }}
        </style>
    </head>
    <body>
        <header>
            <img src="{logo_path}" alt="Dr. Felipe de Bulhões Logo">
            <h1>Dr. Felipe de Bulhões</h1>
        </header>
        <div class="protocol-info">
            <h1>{protocol_title}</h1>
            <p>ID: {protocol_id}</p>
        </div>
        {sections_html}
        <footer>
            Dr. Felipe de Bulhões | Urologista | Membro da AUA, EAU e SBU | Contato: (XX) XXXX-XXXX
        </footer>
    </body>
    </html>
    """
    return html_content

if __name__ == "__main__":
    # Exemplo de uso (apenas para teste)
    # Você precisará carregar um protocolo real do seu JSON
    sample_protocol = {
        "id": "1_implante_protese_peniana",
        "title": "Implante de Prótese Peniana Inflável",
        "sections": [
            {
                "title": "Introdução",
                "content": "<p>Este protocolo descreve o procedimento de implante de prótese peniana inflável.</p>",
                "is_secretary": False,
                "is_references": False
            },
            {
                "title": "Detalhes da Cirurgia",
                "content": "<p>Informações técnicas sobre a cirurgia...</p>",
                "is_secretary": False,
                "is_references": False
            },
            {
                "title": "Acompanhamento Premium — Jornada Completa",
                "content": "<p>Conteúdo do acompanhamento premium...</p>",
                "is_secretary": False,
                "is_references": False
            },
            {
                "title": "Referências Científicas",
                "content": "<p>Lista de referências...</p>",
                "is_secretary": False,
                "is_references": True
            },
            {
                "title": "Informações para a Secretária",
                "content": "<p>Instruções para a secretária...</p>",
                "is_secretary": True,
                "is_references": False
            }
        ]
    }

    # Cores e paths (ajustar conforme o projeto real)
    colors = {
        "primary": "#1C3D5A",
        "foreground": "#1C3D5A",
        "muted-foreground": "#5C768D",
        "border": "#E2E8F0"
    }
    logo_path = "/home/ubuntu/protocolos-app/client/public/images/logo_landscape.svg"
    font_path = "/home/ubuntu/protocolos-app/public/fonts/Callingstone.ttf" # Caminho da fonte no servidor

    html = generate_protocol_html(sample_protocol, logo_path, font_path, colors)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("HTML gerado em output.html")
