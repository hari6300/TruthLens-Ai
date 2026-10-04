import io
import torch
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from transformers import AutoImageProcessor, SwinForImageClassification

MODEL_DIR = "ml/models/swin-deepfake-v3"

app = FastAPI(title="TruthLens Swin ML API")

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)
print("Loading Swin model...")

processor = AutoImageProcessor.from_pretrained(MODEL_DIR)

model = SwinForImageClassification.from_pretrained(MODEL_DIR)

model.to(device)
model.eval()

print("Swin model loaded successfully!")


@app.get("/")
def home():
    return {
        "status": "online",
        "model": "Swin Deepfake Detector"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image_bytes = await file.read()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "success": False,
            "error": "Invalid image file"
        }

    inputs = processor(
        images=image,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():
        outputs = model(**inputs)

        probabilities = torch.softmax(
            outputs.logits,
            dim=-1
        )[0]

    fake_probability = probabilities[0].item() * 100
    real_probability = probabilities[1].item() * 100

    prediction = (
        "FAKE"
        if fake_probability > real_probability
        else "REAL"
    )

    return {
        "success": True,
        "prediction": prediction,
        "fake_probability": round(fake_probability, 2),
        "real_probability": round(real_probability, 2)
    }
