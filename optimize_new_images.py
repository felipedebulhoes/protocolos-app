import os
from PIL import Image

def optimize_image(image_path, max_width=800, quality=80):
    try:
        img = Image.open(image_path)
        # Converter RGBA para RGB se necessário
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Redimensionar mantendo proporção
        if img.width > max_width:
            ratio = max_width / float(img.width)
            new_height = int(float(img.height) * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Salvar otimizada
        target_path = os.path.splitext(image_path)[0] + '.jpg'
        img.save(target_path, 'JPEG', quality=quality, optimize=True)
        print(f"Otimizado: {image_path} -> {target_path} ({os.path.getsize(target_path)/1024:.1f} KB)")
        
        # Remover o arquivo original se for .png ou se for diferente do destino
        if image_path != target_path:
            os.remove(image_path)
    except Exception as e:
        print(f"Erro ao otimizar {image_path}: {e}")

directory = "/home/ubuntu/protocolos-app/client/src/assets/surgical_images"
for filename in os.listdir(directory):
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        full_path = os.path.join(directory, filename)
        optimize_image(full_path)
