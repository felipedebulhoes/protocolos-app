import os
import shutil

def copy_gif():
    src = "/home/ubuntu/projects/site-14f1bf65/prostate-to-b.gif"
    dest_dir = "/home/ubuntu/protocolos-app/client/public/images/surgical"
    dest = os.path.join(dest_dir, "prostate-to-b.gif")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir, exist_ok=True)
        
    if os.path.exists(src):
        shutil.copy(src, dest)
        print(f"GIF copiado com sucesso para {dest}")
    else:
        print(f"Erro: GIF de origem {src} não encontrado!")

if __name__ == "__main__":
    copy_gif()
