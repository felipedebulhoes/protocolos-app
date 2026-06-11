import os
import shutil

src_video = "/home/ubuntu/projects/site-14f1bf65/prostate-to-b.mp4"
dest_dir = "/home/ubuntu/protocolos-app/client/public/videos"
dest_video = os.path.join(dest_dir, "prostate-to-b.mp4")

os.makedirs(dest_dir, exist_ok=True)

if os.path.exists(src_video):
    # Como o arquivo de vídeo já é uma animação otimizada, vamos apenas copiá-lo para a pasta de assets
    shutil.copy(src_video, dest_video)
    print(f"Vídeo copiado com sucesso: {src_video} -> {dest_video}")
else:
    print(f"Aviso: Vídeo original não encontrado em {src_video}")
