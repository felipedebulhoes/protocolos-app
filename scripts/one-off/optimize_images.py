import os
from PIL import Image

images_dir = "/home/ubuntu/protocolos-app/client/public/images/surgical"

for filename in os.listdir(images_dir):
    filepath = os.path.join(images_dir, filename)
    if os.path.isfile(filepath) and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        # Tamanho original
        orig_size = os.path.getsize(filepath) / (1024 * 1024)
        
        if orig_size > 0.1: # Otimizar se for maior que 100KB
            img = Image.open(filepath)
            
            # Converter RGBA para RGB se for salvar como JPEG
            if img.mode in ('RGBA', 'LA') and filename.lower().endswith(('.jpg', '.jpeg')):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            
            # Se for PNG muito grande, converter para JPEG de alta qualidade para economizar espaço
            new_filepath = filepath
            if filename.lower().endswith('.png') and orig_size > 0.5:
                # Renomear extensão no disco e no código
                new_filename = filename.rsplit('.', 1)[0] + '.jpg'
                new_filepath = os.path.join(images_dir, new_filename)
                img = img.convert('RGB')
                img.save(new_filepath, 'JPEG', quality=85, optimize=True)
                os.remove(filepath)
                print(f"Convertido PNG -> JPG: {filename} ({orig_size:.2f}MB) -> {new_filename} ({os.path.getsize(new_filepath)/(1024*1024):.2f}MB)")
            else:
                # Apenas otimizar mantendo o formato
                fmt = img.format
                if not fmt:
                    fmt = 'JPEG' if filename.lower().endswith(('.jpg', '.jpeg')) else 'PNG'
                
                if fmt == 'PNG':
                    img.save(filepath, format=fmt, optimize=True)
                else:
                    img.save(filepath, format=fmt, quality=85, optimize=True)
                print(f"Otimizado: {filename} ({orig_size:.2f}MB -> {os.path.getsize(filepath)/(1024*1024):.2f}MB)")
