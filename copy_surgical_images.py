import os
import shutil

# Diretórios
src_dir = "/home/ubuntu/upload/search_images"
dest_dir = "/home/ubuntu/protocolos-app/client/public/images/surgical"

os.makedirs(dest_dir, exist_ok=True)

# Mapeamento de imagens de alta qualidade
# 1. Prótese Peniana Inflável: Index 4 (Wjj240CZYZVR.png) e Index 3 (vd6PLHxJDvmu.png)
# 2. Varicocelectomia: Index 1 (0yTLWBhhPHy8.jpg) e Index 7 (giuNT5S2RW5S.jpg)
# 3. RIRS: Index 5 (gNGov914MMRv.jpg) e Index 7 (vdnoa5PeGEQ9.webp)

surgical_images = [
    ("Wjj240CZYZVR.png", "protese_inflavel_passos.png"),
    ("vd6PLHxJDvmu.png", "protese_anatomia_posicionamento.png"),
    ("0yTLWBhhPHy8.jpg", "varicocelectomia_passos.jpg"),
    ("giuNT5S2RW5S.jpg", "varicocelectomia_microscopio.jpg"),
    ("gNGov914MMRv.jpg", "rirs_passos.jpg"),
    ("vdnoa5PeGEQ9.webp", "rirs_equipamento_laser.webp")
]

for src_name, dest_name in surgical_images:
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Copiado com sucesso: {src_name} -> {dest_path}")
    else:
        print(f"Aviso: Arquivo {src_path} não encontrado.")
