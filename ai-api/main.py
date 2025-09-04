
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, StreamingResponse
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from diffusers import StableDiffusionPipeline
from PIL import Image
import torch
import io
from googletrans import Translator
import base64
import cv2
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

app = FastAPI(title="Image & Texture API", description="Describe imágenes y genera texturas usando AI.")

# Modelos para descripción de imágenes
model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
translator = Translator()

# Modelo ligero para generación de texturas
pipe = None  # Se carga bajo demanda para optimizar memoria

def extract_dominant_colors(image):
    """Extrae los colores dominantes de una imagen"""
    # Convertir a RGB si es necesario
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Redimensionar para acelerar el procesamiento
    image = image.resize((100, 100))
    
    # Obtener píxeles y encontrar colores más comunes
    pixels = list(image.getdata())
    from collections import Counter
    color_counts = Counter(pixels)
    dominant = color_counts.most_common(5)
    
    # Convertir a formato hex
    colors = []
    for color, count in dominant:
        hex_color = "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
        colors.append({"color": hex_color, "porcentaje": round(count/len(pixels)*100, 1)})
    
    return colors

def classify_art_style(description):
    """Clasifica el estilo artístico basado en la descripción"""
    styles = {
        "realista": ["realistic", "detailed", "precise", "accurate"],
        "impresionista": ["impressionist", "light", "brush", "outdoor"],
        "abstracto": ["abstract", "geometric", "pattern", "modern"],
        "surrealista": ["surreal", "dream", "fantasy", "unusual"],
        "contemporaneo": ["contemporary", "modern", "urban", "street"],
        "clasico": ["classical", "traditional", "ancient", "historical"]
    }
    
    description_lower = description.lower()
    for style, keywords in styles.items():
        if any(keyword in description_lower for keyword in keywords):
            return style
    
    return "contemporaneo"

def extract_elements(description):
    """Extrae elementos identificados en el mural"""
    elements = []
    keywords = {
        "figuras_humanas": ["person", "people", "man", "woman", "figure"],
        "animales": ["animal", "bird", "dog", "cat", "horse"],
        "naturaleza": ["tree", "flower", "plant", "landscape", "nature"],
        "arquitectura": ["building", "house", "structure", "wall"],
        "objetos": ["object", "tool", "instrument", "vehicle"]
    }
    
    description_lower = description.lower()
    for category, words in keywords.items():
        if any(word in description_lower for word in words):
            elements.append(category.replace("_", " "))
    
    return elements

def generate_recommendations(style):
    """Genera recomendaciones basadas en el estilo"""
    recommendations = {
        "realista": ["Técnica de sfumato", "Uso de perspectiva lineal", "Estudio anatómico detallado"],
        "impresionista": ["Pinceladas sueltas", "Captura de luz natural", "Trabajo al aire libre"],
        "abstracto": ["Composición geométrica", "Color como elemento principal", "Simplificación de formas"],
        "contemporaneo": ["Técnicas mixtas", "Referencias culturales actuales", "Interactividad con el espectador"]
    }
    
    return recommendations.get(style, ["Estudio del contexto histórico", "Selección cuidadosa de materiales"])

# ========== FUNCIONES DE DETECCIÓN DE ELEMENTOS ==========

def detect_figures(cv_image):
    """Detecta figuras y contornos en la imagen"""
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    figures = []
    for i, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        if area > 1000:  # Filtrar contornos pequeños
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / h
            
            # Clasificación básica por forma
            figure_type = "figura_compleja"
            if 0.8 <= aspect_ratio <= 1.2:
                figure_type = "figura_cuadrada"
            elif aspect_ratio > 2:
                figure_type = "figura_horizontal"
            elif aspect_ratio < 0.5:
                figure_type = "figura_vertical"
            
            figures.append({
                "id": i,
                "tipo": figure_type,
                "area": int(area),
                "posicion": {"x": int(x), "y": int(y), "ancho": int(w), "alto": int(h)},
                "aspecto": round(aspect_ratio, 2)
            })
    
    return figures[:10]  # Limitar a 10 figuras principales

def detect_symbols(cv_image):
    """Detecta formas geométricas que podrían ser símbolos"""
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Detectar círculos
    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, minRadius=10, maxRadius=100)
    
    # Detectar líneas
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=50, maxLineGap=10)
    
    symbols = []
    
    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        for (x, y, r) in circles[:5]:  # Máximo 5 círculos
            symbols.append({
                "tipo": "circulo",
                "posicion": {"x": int(x), "y": int(y)},
                "radio": int(r),
                "simbolismo": "posible_simbolo_solar_o_divino"
            })
    
    if lines is not None:
        line_count = min(len(lines), 10)
        symbols.append({
            "tipo": "lineas_geometricas",
            "cantidad": line_count,
            "simbolismo": "estructura_arquitectonica_o_patron"
        })
    
    return symbols

def analyze_composition(cv_image):
    """Analiza la composición de la imagen"""
    height, width = cv_image.shape[:2]
    
    # Dividir en tercios (regla de los tercios)
    third_w = width // 3
    third_h = height // 3
    
    # Analizar distribución de intensidad
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    
    # Puntos de interés en tercios
    points_of_interest = []
    for i in range(1, 3):
        for j in range(1, 3):
            x, y = third_w * i, third_h * j
            intensity = gray[y, x]
            points_of_interest.append({
                "posicion": f"tercio_{i}_{j}",
                "intensidad": int(intensity),
                "coordenadas": {"x": x, "y": y}
            })
    
    # Análisis de simetría
    left_half = gray[:, :width//2]
    right_half = cv2.flip(gray[:, width//2:], 1)
    
    # Redimensionar para comparar
    min_width = min(left_half.shape[1], right_half.shape[1])
    left_resized = cv2.resize(left_half, (min_width, height))
    right_resized = cv2.resize(right_half, (min_width, height))
    
    symmetry_score = cv2.matchTemplate(left_resized, right_resized, cv2.TM_CCOEFF_NORMED)[0][0]
    
    return {
        "puntos_interes": points_of_interest,
        "simetria": round(float(symmetry_score), 3),
        "tipo_composicion": "simetrica" if symmetry_score > 0.7 else "asimetrica",
        "dimensiones": {"ancho": width, "alto": height}
    }

def identify_cultural_elements(description):
    """Identifica elementos culturales en la descripción"""
    cultural_keywords = {
        "prehispanico": ["aztec", "maya", "inca", "temple", "pyramid", "feather", "jade"],
        "colonial": ["cross", "church", "spanish", "colonial", "baroque", "saint"],
        "indigena": ["native", "tribal", "traditional", "ceremonial", "ritual"],
        "contemporaneo": ["modern", "urban", "street", "graffiti", "contemporary"],
        "religioso": ["god", "divine", "sacred", "prayer", "ceremony", "spiritual"]
    }
    
    elements = []
    description_lower = description.lower()
    
    for culture, keywords in cultural_keywords.items():
        matches = [kw for kw in keywords if kw in description_lower]
        if matches:
            elements.append({
                "cultura": culture,
                "elementos_encontrados": matches,
                "relevancia": len(matches)
            })
    
    return elements

def count_human_figures(figures):
    """Estima el número de figuras humanas"""
    human_figures = 0
    for figure in figures:
        # Figuras verticales con cierta proporción podrían ser humanas
        if figure["tipo"] == "figura_vertical" and 1.5 <= figure["aspecto"] <= 3:
            human_figures += 1
    
    return {
        "estimacion": human_figures,
        "metodo": "analisis_proporciones_verticales",
        "confianza": "media"
    }

# ========== FUNCIONES DE ANÁLISIS DE COLORES ==========

def advanced_color_analysis(image):
    """Análisis avanzado de colores usando clustering"""
    # Convertir a array numpy
    img_array = np.array(image)
    img_reshaped = img_array.reshape((-1, 3))
    
    # K-means clustering para encontrar colores dominantes
    kmeans = KMeans(n_clusters=8, random_state=42, n_init=10)
    kmeans.fit(img_reshaped)
    
    colors = kmeans.cluster_centers_
    labels = kmeans.labels_
    
    # Calcular porcentajes
    unique, counts = np.unique(labels, return_counts=True)
    percentages = counts / len(labels) * 100
    
    color_palette = []
    for i, (color, percentage) in enumerate(zip(colors, percentages)):
        rgb = [int(c) for c in color]
        hex_color = "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])
        
        color_palette.append({
            "color_rgb": rgb,
            "color_hex": hex_color,
            "porcentaje": round(percentage, 2),
            "nombre_color": get_color_name(rgb)
        })
    
    return sorted(color_palette, key=lambda x: x["porcentaje"], reverse=True)

def identify_historical_pigments(color_palette):
    """Identifica posibles pigmentos históricos"""
    historical_pigments = {
        "ocre_rojo": {"rgb_range": ([150, 50, 30], [200, 100, 80]), "epoca": "prehistorico", "origen": "oxido_hierro"},
        "azul_ultramar": {"rgb_range": ([20, 50, 150], [80, 120, 255]), "epoca": "medieval", "origen": "lapislazuli"},
        "verde_malaquita": {"rgb_range": ([50, 150, 100], [120, 200, 150]), "epoca": "antiguo", "origen": "carbonato_cobre"},
        "blanco_plomo": {"rgb_range": ([240, 240, 240], [255, 255, 255]), "epoca": "clasico", "origen": "carbonato_plomo"},
        "negro_carbon": {"rgb_range": ([0, 0, 0], [50, 50, 50]), "epoca": "universal", "origen": "carbon_vegetal"}
    }
    
    identified_pigments = []
    
    for color in color_palette:
        rgb = color["color_rgb"]
        for pigment_name, pigment_data in historical_pigments.items():
            min_rgb, max_rgb = pigment_data["rgb_range"]
            
            if (min_rgb[0] <= rgb[0] <= max_rgb[0] and 
                min_rgb[1] <= rgb[1] <= max_rgb[1] and 
                min_rgb[2] <= rgb[2] <= max_rgb[2]):
                
                identified_pigments.append({
                    "pigmento": pigment_name.replace("_", " "),
                    "epoca": pigment_data["epoca"],
                    "origen": pigment_data["origen"],
                    "color_detectado": color["color_hex"],
                    "porcentaje_uso": color["porcentaje"]
                })
    
    return identified_pigments

def analyze_color_temperature(image):
    """Analiza la temperatura de color de la imagen"""
    img_array = np.array(image)
    
    # Calcular promedio de canales RGB
    avg_r = np.mean(img_array[:, :, 0])
    avg_g = np.mean(img_array[:, :, 1])
    avg_b = np.mean(img_array[:, :, 2])
    
    # Calcular temperatura
    if avg_r > avg_b:
        temperature = "calida"
        warmth_score = (avg_r - avg_b) / 255
    else:
        temperature = "fria"
        warmth_score = (avg_b - avg_r) / 255
    
    return {
        "temperatura": temperature,
        "intensidad": round(warmth_score, 3),
        "promedios_rgb": {"r": round(avg_r, 1), "g": round(avg_g, 1), "b": round(avg_b, 1)},
        "descripcion": get_temperature_description(temperature, warmth_score)
    }

def get_color_name(rgb):
    """Obtiene el nombre aproximado del color"""
    r, g, b = rgb
    
    if r > 200 and g > 200 and b > 200:
        return "blanco"
    elif r < 50 and g < 50 and b < 50:
        return "negro"
    elif r > 150 and g < 100 and b < 100:
        return "rojo"
    elif r < 100 and g > 150 and b < 100:
        return "verde"
    elif r < 100 and g < 100 and b > 150:
        return "azul"
    elif r > 150 and g > 150 and b < 100:
        return "amarillo"
    elif r > 150 and g < 150 and b > 150:
        return "magenta"
    elif r < 150 and g > 150 and b > 150:
        return "cian"
    elif r > 100 and g > 50 and b < 50:
        return "naranja"
    elif r > 150 and g > 100 and b < 100:
        return "rosa"
    else:
        return "mixto"

def analyze_color_harmony(color_palette):
    """Analiza la armonía cromática"""
    if len(color_palette) < 2:
        return {"tipo": "monocromatica", "descripcion": "Paleta de un solo color"}
    
    # Convertir colores a HSV para análisis
    colors_hsv = []
    for color in color_palette[:5]:  # Analizar top 5 colores
        rgb = color["color_rgb"]
        hsv = cv2.cvtColor(np.uint8([[rgb]]), cv2.COLOR_RGB2HSV)[0][0]
        colors_hsv.append(hsv[0])  # Solo el hue
    
    # Analizar diferencias de matiz
    hue_differences = []
    for i in range(len(colors_hsv)):
        for j in range(i+1, len(colors_hsv)):
            diff = abs(colors_hsv[i] - colors_hsv[j])
            # Considerar la naturaleza circular del hue
            diff = min(diff, 180 - diff)
            hue_differences.append(diff)
    
    avg_diff = np.mean(hue_differences) if hue_differences else 0
    
    if avg_diff < 30:
        harmony_type = "analogos"
    elif 60 <= avg_diff <= 120:
        harmony_type = "complementarios"
    elif avg_diff > 120:
        harmony_type = "triadicos"
    else:
        harmony_type = "diversos"
    
    return {
        "tipo_armonia": harmony_type,
        "diferencia_promedio": round(avg_diff, 1),
        "descripcion": get_harmony_description(harmony_type)
    }

def estimate_period_by_colors(pigments):
    """Estima la época basada en los pigmentos identificados"""
    if not pigments:
        return {"epoca": "indeterminada", "confianza": "baja"}
    
    epoch_scores = {}
    for pigment in pigments:
        epoch = pigment["epoca"]
        percentage = pigment["porcentaje_uso"]
        epoch_scores[epoch] = epoch_scores.get(epoch, 0) + percentage
    
    if epoch_scores:
        dominant_epoch = max(epoch_scores, key=epoch_scores.get)
        confidence = "alta" if epoch_scores[dominant_epoch] > 30 else "media"
        
        return {
            "epoca": dominant_epoch,
            "confianza": confidence,
            "distribucion": epoch_scores
        }
    
    return {"epoca": "contemporaneo", "confianza": "baja"}

def suggest_painting_technique(color_palette):
    """Sugiere técnica pictórica basada en colores"""
    total_colors = len(color_palette)
    vivid_colors = sum(1 for c in color_palette if max(c["color_rgb"]) > 200)
    
    if vivid_colors / total_colors > 0.6:
        return {
            "tecnica": "acrilico_o_tempera",
            "razon": "colores_vibrantes_alta_saturacion"
        }
    elif total_colors > 15:
        return {
            "tecnica": "oleo_sobre_lienzo",
            "razon": "paleta_compleja_muchos_matices"
        }
    else:
        return {
            "tecnica": "fresco_o_mural",
            "razon": "paleta_limitada_colores_terrosos"
        }

# ========== FUNCIONES DE RECONOCIMIENTO DE ESTILO ==========

def identify_art_movement(image, description):
    """Identifica el movimiento artístico"""
    movements = {
        "realismo": {
            "keywords": ["realistic", "detailed", "precise", "accurate", "lifelike"],
            "epoca": "siglo_19",
            "caracteristicas": ["representacion_fiel", "detalles_anatomicos", "perspectiva_clasica"]
        },
        "impresionismo": {
            "keywords": ["light", "brush", "outdoor", "impressionist", "loose"],
            "epoca": "siglo_19_tardio",
            "caracteristicas": ["pinceladas_sueltas", "captura_luz", "colores_puros"]
        },
        "expresionismo": {
            "keywords": ["bold", "emotional", "intense", "dramatic", "expressionist"],
            "epoca": "siglo_20_temprano",
            "caracteristicas": ["colores_intensos", "distorsion_expresiva", "emotividad"]
        },
        "surrealismo": {
            "keywords": ["surreal", "dream", "fantasy", "unusual", "abstract"],
            "epoca": "siglo_20",
            "caracteristicas": ["elementos_oniricos", "yuxtaposiciones_inusuales", "simbolismo"]
        },
        "muralismo": {
            "keywords": ["mural", "wall", "large", "social", "political", "public"],
            "epoca": "siglo_20",
            "caracteristicas": ["gran_escala", "contenido_social", "tecnica_fresco"]
        }
    }
    
    description_lower = description.lower()
    
    # Analizar coincidencias
    movement_scores = {}
    for movement, data in movements.items():
        score = sum(1 for keyword in data["keywords"] if keyword in description_lower)
        if score > 0:
            movement_scores[movement] = score
    
    if movement_scores:
        identified_movement = max(movement_scores, key=movement_scores.get)
        return {
            "movimiento": identified_movement,
            "epoca": movements[identified_movement]["epoca"],
            "caracteristicas": movements[identified_movement]["caracteristicas"],
            "confianza": "alta" if movement_scores[identified_movement] > 2 else "media"
        }
    
    return {
        "movimiento": "contemporaneo",
        "epoca": "siglo_21",
        "caracteristicas": ["tecnicas_mixtas", "influencias_multiples"],
        "confianza": "baja"
    }

def estimate_historical_period(image, description):
    """Estima el período histórico"""
    periods = {
        "prehispanico": {
            "keywords": ["aztec", "maya", "inca", "pre-hispanic", "indigenous", "temple"],
            "rango": "antes_1500",
            "caracteristicas": ["simbolismo_religioso", "geometria_sagrada", "colores_naturales"]
        },
        "colonial": {
            "keywords": ["colonial", "spanish", "church", "cross", "baroque", "saint"],
            "rango": "1500_1800",
            "caracteristicas": ["influencia_europea", "temas_religiosos", "tecnica_europea"]
        },
        "independencia": {
            "keywords": ["independence", "patriotic", "national", "hero", "flag"],
            "rango": "1800_1900",
            "caracteristicas": ["temas_patrioticos", "heroes_nacionales", "simbolos_patrios"]
        },
        "revolucion": {
            "keywords": ["revolution", "social", "worker", "peasant", "struggle"],
            "rango": "1900_1950",
            "caracteristicas": ["contenido_social", "lucha_clases", "ideologia_revolucionaria"]
        },
        "contemporaneo": {
            "keywords": ["modern", "contemporary", "urban", "digital", "global"],
            "rango": "1950_presente",
            "caracteristicas": ["temas_actuales", "tecnicas_mixtas", "influencias_globales"]
        }
    }
    
    description_lower = description.lower()
    
    for period, data in periods.items():
        matches = sum(1 for keyword in data["keywords"] if keyword in description_lower)
        if matches > 0:
            return {
                "periodo": period,
                "rango_temporal": data["rango"],
                "caracteristicas_periodo": data["caracteristicas"],
                "elementos_identificados": [kw for kw in data["keywords"] if kw in description_lower]
            }
    
    return {
        "periodo": "indeterminado",
        "rango_temporal": "sin_definir",
        "caracteristicas_periodo": ["requiere_analisis_adicional"]
    }

def analyze_painting_technique(image):
    """Analiza la técnica pictórica utilizada"""
    img_array = np.array(image)
    
    # Analizar textura y pinceladas
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Detectar bordes (indica precisión del trazo)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # Analizar variación en la imagen (indica textura)
    texture_variance = np.var(gray)
    
    # Determinar técnica
    techniques = []
    
    if edge_density > 0.1:
        techniques.append("trazos_definidos")
    else:
        techniques.append("trazos_suaves")
    
    if texture_variance > 2000:
        techniques.append("textura_rugosa")
        medium = "oleo_o_acrilico"
    else:
        techniques.append("superficie_lisa")
        medium = "fresco_o_tempera"
    
    return {
        "tecnica_principal": medium,
        "caracteristicas_tecnicas": techniques,
        "densidad_bordes": round(edge_density, 3),
        "varianza_textura": round(texture_variance, 1)
    }

def detect_cultural_influences(description):
    """Detecta influencias culturales"""
    influences = {
        "europea": ["european", "classical", "renaissance", "baroque", "gothic"],
        "indigena": ["indigenous", "native", "tribal", "ancestral", "traditional"],
        "africana": ["african", "tribal", "mask", "rhythm", "ancestral"],
        "asiatica": ["asian", "oriental", "zen", "dragon", "bamboo"],
        "americana": ["american", "modern", "urban", "contemporary", "pop"]
    }
    
    detected_influences = []
    description_lower = description.lower()
    
    for culture, keywords in influences.items():
        matches = [kw for kw in keywords if kw in description_lower]
        if matches:
            detected_influences.append({
                "influencia": culture,
                "elementos": matches,
                "intensidad": len(matches)
            })
    
    return detected_influences

def get_harmony_description(harmony_type):
    """Obtiene descripción de la armonía cromática"""
    descriptions = {
        "analogos": "Colores vecinos en el círculo cromático, crean sensación de calma",
        "complementarios": "Colores opuestos, generan alto contraste y dinamismo",
        "triadicos": "Tres colores equidistantes, balance vibrante",
        "diversos": "Variedad cromática amplia, expresividad compleja"
    }
    return descriptions.get(harmony_type, "Armonía cromática compleja")

def get_temperature_description(temperature, intensity):
    """Describe la temperatura de color"""
    if temperature == "calida":
        if intensity > 0.3:
            return "Paleta muy cálida, evoca energía y pasión"
        else:
            return "Paleta ligeramente cálida, sensación acogedora"
    else:
        if intensity > 0.3:
            return "Paleta muy fría, evoca tranquilidad y serenidad"
        else:
            return "Paleta ligeramente fría, sensación de calma"

def extract_style_characteristics(description):
    """Extrae características estilísticas"""
    characteristics = []
    
    style_indicators = {
        "geometrico": ["geometric", "pattern", "repetitive", "symmetrical"],
        "organico": ["organic", "flowing", "natural", "curved"],
        "expresivo": ["expressive", "emotional", "intense", "dramatic"],
        "detallado": ["detailed", "precise", "intricate", "complex"],
        "minimalista": ["simple", "minimal", "clean", "sparse"]
    }
    
    description_lower = description.lower()
    
    for characteristic, keywords in style_indicators.items():
        if any(keyword in description_lower for keyword in keywords):
            characteristics.append(characteristic)
    
    return characteristics

def suggest_similar_artists(movement):
    """Sugiere artistas similares basado en el movimiento"""
    artists = {
        "muralismo": ["Diego Rivera", "José Clemente Orozco", "David Alfaro Siqueiros"],
        "realismo": ["Gustave Courbet", "Jean-François Millet", "Ilya Repin"],
        "impresionismo": ["Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas"],
        "expresionismo": ["Wassily Kandinsky", "Franz Marc", "Ernst Ludwig Kirchner"],
        "surrealismo": ["Salvador Dalí", "René Magritte", "Joan Miró"]
    }
    
    return artists.get(movement["movimiento"], ["Artistas contemporáneos"])

def estimate_historical_value(period, movement):
    """Estima el valor histórico"""
    value_factors = {
        "rareza_temporal": 0.3,
        "importancia_cultural": 0.4,
        "calidad_artistica": 0.3
    }
    
    historical_importance = {
        "prehispanico": 0.9,
        "colonial": 0.7,
        "independencia": 0.8,
        "revolucion": 0.8,
        "contemporaneo": 0.5
    }
    
    movement_importance = {
        "muralismo": 0.9,
        "realismo": 0.7,
        "impresionismo": 0.8,
        "expresionismo": 0.7,
        "surrealismo": 0.8
    }
    
    period_score = historical_importance.get(period.get("periodo", ""), 0.5)
    movement_score = movement_importance.get(movement.get("movimiento", ""), 0.5)
    
    final_score = (period_score + movement_score) / 2
    
    if final_score > 0.8:
        value_category = "muy_alto"
    elif final_score > 0.6:
        value_category = "alto"
    elif final_score > 0.4:
        value_category = "medio"
    else:
        value_category = "bajo"
    
    return {
        "categoria": value_category,
        "puntuacion": round(final_score, 2),
        "factores": {
            "valor_historico_periodo": round(period_score, 2),
            "valor_artistico_movimiento": round(movement_score, 2)
        }
    }

def get_technique_recommendation(style):
    """Recomienda técnica pictórica según el estilo"""
    techniques = {
        "realista": "Óleo sobre lienzo con capas superpuestas",
        "impresionista": "Acrílico con pinceladas directas",
        "abstracto": "Técnica mixta con acrílicos y texturas",
        "surrealista": "Óleo con técnica de veladura",
        "contemporaneo": "Pintura mural con aerosol y acrílicos"
    }
    
    return techniques.get(style, "Acrílico sobre superficie preparada")

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

@app.get("/view-texture/{prompt}")
async def view_texture(prompt: str, size: str = "512x512"):
    """Genera y muestra una textura directamente en el navegador"""
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
            num_inference_steps=20,
            guidance_scale=7.5
        ).images[0]
        
        # Convertir a bytes para streaming
        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return StreamingResponse(img_io, media_type="image/png")
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
        
@app.post("/analyze-mural")
async def analyze_mural(file: UploadFile = File(...)):
    """Analiza un mural para identificar elementos, colores y estilo"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Obtener descripción básica
        caption = predict_step(image)
        
        # Análisis de colores dominantes
        colors = extract_dominant_colors(image)
        
        # Clasificación de estilo artístico (simulado por ahora)
        style = classify_art_style(caption)
        
        return JSONResponse({
            "descripcion": caption,
            "colores_dominantes": colors,
            "estilo_artistico": style,
            "elementos_detectados": extract_elements(caption),
            "recomendaciones": generate_recommendations(style)
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.post("/generate-mural-description")
async def generate_mural_description(
    tema: str = Form(...), 
    estilo: str = Form("realista"),
    colores: str = Form("vibrantes")
):
    """Genera una descripción detallada para crear un mural"""
    try:
        # Crear prompt especializado para murales
        mural_prompt = f"mural painting, {tema}, {estilo} style, {colores} colors, wall art, large scale artwork, detailed composition"
        
        # Generar imagen del mural
        pipeline = get_texture_pipeline()
        image = pipeline(
            mural_prompt,
            width=1024,
            height=512,  # Formato panorámico típico de murales
            num_inference_steps=25,
            guidance_scale=8.0
        ).images[0]
        
        # Convertir a base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return JSONResponse({
            "mural_generado": img_str,
            "descripcion_tecnica": f"Mural de {tema} en estilo {estilo} con paleta de colores {colores}",
            "dimensiones_sugeridas": "1024x512 píxeles (formato panorámico)",
            "tecnica_recomendada": get_technique_recommendation(estilo),
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/detect-elements")
async def detect_elements(file: UploadFile = File(...)):
    """Detección avanzada de figuras, símbolos y personajes en murales"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Conversión para OpenCV
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Detección de contornos para figuras
        figures = detect_figures(cv_image)
        
        # Detección de formas geométricas (símbolos)
        symbols = detect_symbols(cv_image)
        
        # Análisis de composición
        composition = analyze_composition(cv_image)
        
        # Descripción general con IA
        description = predict_step(image)
        
        return JSONResponse({
            "figuras_detectadas": figures,
            "simbolos_identificados": symbols,
            "composicion": composition,
            "descripcion_general": description,
            "elementos_culturales": identify_cultural_elements(description),
            "personajes_estimados": count_human_figures(figures)
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.post("/analyze-colors")
async def analyze_colors(file: UploadFile = File(...)):
    """Análisis avanzado de paleta cromática y pigmentos"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Análisis de colores dominantes con clustering
        dominant_colors = advanced_color_analysis(image)
        
        # Identificación de pigmentos históricos
        historical_pigments = identify_historical_pigments(dominant_colors)
        
        # Análisis de temperatura de color
        color_temperature = analyze_color_temperature(image)
        
        # Armonía cromática
        color_harmony = analyze_color_harmony(dominant_colors)
        
        return JSONResponse({
            "paleta_cromatica": dominant_colors,
            "pigmentos_historicos": historical_pigments,
            "temperatura_color": color_temperature,
            "armonia_cromatica": color_harmony,
            "epoca_estimada": estimate_period_by_colors(historical_pigments),
            "tecnica_sugerida": suggest_painting_technique(dominant_colors)
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.post("/recognize-style")
async def recognize_style(file: UploadFile = File(...)):
    """Reconocimiento de época, movimiento artístico y técnica"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Descripción base
        description = predict_step(image)
        
        # Análisis de estilo avanzado
        art_movement = identify_art_movement(image, description)
        
        # Estimación de época
        historical_period = estimate_historical_period(image, description)
        
        # Análisis de técnica pictórica
        painting_technique = analyze_painting_technique(image)
        
        # Influencias culturales
        cultural_influences = detect_cultural_influences(description)
        
        return JSONResponse({
            "movimiento_artistico": art_movement,
            "epoca_historica": historical_period,
            "tecnica_pictorica": painting_technique,
            "influencias_culturales": cultural_influences,
            "caracteristicas_estilo": extract_style_characteristics(description),
            "artistas_similares": suggest_similar_artists(art_movement),
            "valor_historico": estimate_historical_value(historical_period, art_movement)
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
