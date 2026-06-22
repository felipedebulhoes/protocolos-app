import os
import shutil

# Diretórios de origem e destino
src_dir = "/home/ubuntu/projects/site-14f1bf65"
dest_public_dir = "/home/ubuntu/protocolos-app/client/public"
dest_src_dir = "/home/ubuntu/protocolos-app/client/src"

# Criar pastas de destino se não existirem
os.makedirs(os.path.join(dest_public_dir, "fonts"), exist_ok=True)
os.makedirs(os.path.join(dest_public_dir, "images"), exist_ok=True)

# Copiar a fonte Callingstone.ttf
font_src = os.path.join(src_dir, "Callingstone.ttf")
font_dest = os.path.join(dest_public_dir, "fonts", "Callingstone.ttf")
if os.path.exists(font_src):
    shutil.copy(font_src, font_dest)
    print(f"Fonte copiada para: {font_dest}")

# Copiar os SVGs de Identidade Visual
assets_to_copy = [
    ("ISOTIPO @ DR FELIPE DE BULHÕES.svg", "isotipo.svg"),
    ("LOGO LANDSCAPE @ DR FELIPE DE BULHÕES.svg", "logo_landscape.svg"),
    ("LOGO PORTRAIT @ DR FELIPE DE BULHÕES.svg", "logo_portrait.svg"),
    ("PATTERN @ DR FELIPE DE BULHÕES.svg", "pattern.svg"),
    ("ISOTIPO @ DR FELIPE DE BULHÕES.png", "isotipo.png"),
    ("LOGO LANDSCAPE @ DR FELIPE DE BULHÕES.png", "logo_landscape.png"),
    ("PATTERN @ DR FELIPE DE BULHÕES.jpg", "pattern.jpg")
]

for src_name, dest_name in assets_to_copy:
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_public_dir, "images", dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Copiado: {src_name} -> {dest_path}")
    else:
        print(f"Não encontrado: {src_path}")
