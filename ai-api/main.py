
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, StreamingResponse
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from diffusers import StableDiffusionPipeline
from PIL import Image
import torch
import io
from googletrans import Translator
import base64

app = FastAPI(title="Image & Texture API", description="Describe imágenes y genera texturas usando AI.")

# Modelos para descripción de imágenes
model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
translator = Translator()

# Modelo ligero para generación de texturas
pipe = None  # Se carga bajo demanda para optimizar memoria

def get_texture_pipeline():
    """Carga el modelo de texturas solo cuando se necesita"""
    global pipe
    if pipe is None:
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        # Optimizaciones para usar menos memoria
        pipe.enable_attention_slicing()
        if torch.cuda.is_available():
            pipe = pipe.to("cuda")
    return pipe

def predict_step(image: Image.Image):
    if image.mode != "RGB":
        image = image.convert(mode="RGB")
    pixel_values = feature_extractor(images=[image], return_tensors="pt").pixel_values
    output_ids = model.generate(pixel_values, max_length=16, num_beams=4)
    preds = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    
    # Traducir al español
    try:
        translated = translator.translate(preds, src='en', dest='es')
        return translated.text
    except:
        return preds  # Si falla la traducción, devolver en inglés

@app.post("/caption")
async def caption_image(file: UploadFile = File(...)):
    """Genera una descripción en español de la imagen subida"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        caption = predict_step(image)
        return JSONResponse({"caption": caption, "idioma": "español"})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.post("/generate-texture")
async def generate_texture(prompt: str = Form(...), size: str = Form("512x512")):
    """Genera una textura a partir de un prompt de texto"""
    try:
        # Parsear tamaño
        width, height = map(int, size.split('x'))
        if width > 1024 or height > 1024:
            return JSONResponse({"error": "Tamaño máximo: 1024x1024"}, status_code=400)
        
        # Mejorar prompt para texturas
        texture_prompt = f"seamless tileable texture, {prompt}, pattern, material, high quality, detailed"
        
        # Generar textura
        pipeline = get_texture_pipeline()
        image = pipeline(
            texture_prompt,
            width=width,
            height=height,
            num_inference_steps=20,  # Menos pasos para ser más ligero
            guidance_scale=7.5
        ).images[0]
        
        # Convertir a base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return JSONResponse({
            "texture": img_str,
            "prompt": texture_prompt,
            "size": f"{width}x{height}",
            "format": "base64_png"
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
