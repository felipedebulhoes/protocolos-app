#!/usr/bin/env python3
"""
Script para gerar PDF de protocolos com identidade visual do Dr. Felipe de Bulhões.
Uso: python3 generate_pdf.py '<JSON_PROTOCOL>' '<OUTPUT_PATH>'
"""

import sys
import json
import base64
from datetime import datetime
from html import escape
from weasyprint import HTML
import os

def strip_html_tags(html_text):
    """Remove HTML tags from text"""
    import re
    clean = re.compile('<.*?>')
    return re.sub(clean, '', html_text)

def generate_protocol_pdf(protocol_data, output_path):
    """Generate PDF from protocol data with Dr. Felipe's visual identity"""
    
    # Extract protocol information
    title = escape(protocol_data.get('title', 'Protocolo'))
    description = strip_html_tags(protocol_data.get('description', ''))
    
    # Filter only clinical sections (exclude secretary and references)
    clinical_sections = [
        s for s in protocol_data.get('sections', [])
        if not s.get('is_secretary', False) and not s.get('is_references', False)
    ]
    
    # Build sections HTML
    sections_html = ""
    for section in clinical_sections:
        section_title = escape(section.get('title', ''))
        section_content = section.get('content', '')
        # Clean HTML but preserve basic formatting
        sections_html += f"""
        <div class="section">
            <h2>{section_title}</h2>
            <div class="content">
                {section_content}
            </div>
        </div>
        """
    
    # Premium follow-up section if available
    premium_html = ""
    if protocol_data.get('premium_follow_up'):
        premium_html = """
        <div class="premium-section">
            <h2 style="color: #c41e3a; border-bottom: 3px solid #c41e3a; padding-bottom: 10px;">
                ✓ Acompanhamento Premium — Jornada Completa
            </h2>
            <p style="font-weight: bold; color: #c41e3a; margin-top: 15px;">
                Você não estará sozinho(a)! Durante 6 meses após o procedimento, você terá acesso direto a mim e à minha equipe, 24 horas por dia, 7 dias por semana.
            </p>
            <p>Nosso acompanhamento inclui suporte de fisioterapeuta, nutricionista e educador físico para otimizar sua recuperação e bem-estar geral.</p>
        </div>
        """
    
    # Build HTML document with Dr. Felipe's visual identity
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
                padding: 40px;
                max-width: 900px;
                margin: 0 auto;
            }}
            
            /* Header with Dr. Felipe's branding */
            .header {{
                border-bottom: 3px solid #1C3D5A;
                padding-bottom: 20px;
                margin-bottom: 30px;
                text-align: center;
            }}
            
            .doctor-name {{
                font-size: 24px;
                font-weight: bold;
                color: #1C3D5A;
                margin-bottom: 5px;
            }}
            
            .doctor-title {{
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
            }}
            
            .protocol-title {{
                font-size: 28px;
                font-weight: bold;
                color: #1C3D5A;
                margin: 30px 0 20px 0;
                border-left: 5px solid #c41e3a;
                padding-left: 15px;
            }}
            
            .protocol-description {{
                font-size: 14px;
                color: #666;
                margin-bottom: 30px;
                font-style: italic;
            }}
            
            .section {{
                margin-bottom: 30px;
                page-break-inside: avoid;
            }}
            
            .section h2 {{
                font-size: 18px;
                color: #1C3D5A;
                border-bottom: 2px solid #1C3D5A;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }}
            
            .content {{
                font-size: 13px;
                line-height: 1.8;
                color: #444;
            }}
            
            .content p {{
                margin-bottom: 10px;
            }}
            
            .content ul, .content ol {{
                margin-left: 20px;
                margin-bottom: 10px;
            }}
            
            .content li {{
                margin-bottom: 8px;
            }}
            
            .premium-section {{
                background-color: #f5f5f5;
                border-left: 5px solid #c41e3a;
                padding: 20px;
                margin: 30px 0;
                page-break-inside: avoid;
            }}
            
            .premium-section h2 {{
                color: #c41e3a;
                border: none;
                padding: 0;
                margin-bottom: 15px;
            }}
            
            .footer {{
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #1C3D5A;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
            
            .generated-date {{
                font-size: 11px;
                color: #999;
                margin-top: 10px;
            }}
            
            @media print {{
                body {{
                    padding: 20px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="doctor-name">Dr. Felipe de Bulhões</div>
            <div class="doctor-title">Urologista | Formado Instituto D'Or</div>
            <div class="doctor-title">Membro AUA • EAU • SBU</div>
        </div>
        
        <h1 class="protocol-title">{title}</h1>
        <p class="protocol-description">{description}</p>
        
        {premium_html}
        
        <div class="sections">
            {sections_html}
        </div>
        
        <div class="footer">
            <p><strong>Atendimento Humanizado • Particular e Convênios • Cirurgia Minimamente Invasiva</strong></p>
            <p>Agendamento Online • Teleconsulta Disponível</p>
            <div class="generated-date">
                Documento gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        # Generate PDF using WeasyPrint
        HTML(string=html_content).write_pdf(output_path)
        
        # Read the PDF file and output as base64 to stdout
        with open(output_path, 'rb') as pdf_file:
            pdf_base64 = base64.b64encode(pdf_file.read()).decode('utf-8')
            sys.stdout.buffer.write(base64.b64decode(pdf_base64))
            sys.stdout.flush()
        
        return True
    except Exception as e:
        sys.stderr.write(f"Erro ao gerar PDF: {str(e)}\n")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.stderr.write("Uso: python3 generate_pdf.py '<JSON_PROTOCOL>' '<OUTPUT_PATH>'\n")
        sys.exit(1)
    
    try:
        protocol_json = sys.argv[1]
        output_path = sys.argv[2]
        
        protocol_data = json.loads(protocol_json)
        
        if generate_protocol_pdf(protocol_data, output_path):
            sys.exit(0)
        else:
            sys.exit(1)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Erro ao parsear JSON: {str(e)}\n")
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"Erro: {str(e)}\n")
        sys.exit(1)
