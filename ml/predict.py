import sys
import torch
from PIL import Image
from transformers import AutoImageProcessor, SwinForImageClassification

MODEL_DIR = "models/swin-deepfake"

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)

if len(sys.argv) < 2:
    print("Usage:")
    print("python predict.py /path/to/image.jpg")
    sys.exit(1)

image_path = sys.argv[1]

try:
    image = Image.open(image_path).convert("RGB")
except Exception as e:
    print("Error opening image:", e)
    sys.exit(1)

processor = AutoImageProcessor.from_pretrained(MODEL_DIR)

model = SwinForImageClassification.from_pretrained(MODEL_DIR)
model.to(device)
model.eval()

inputs = processor(images=image, return_tensors="pt")
inputs = {
    key: value.to(device)
    for key, value in inputs.items()
}

with torch.no_grad():
    outputs = model(**inputs)
    probabilities = torch.softmax(outputs.logits, dim=-1)[0]

fake_probability = probabilities[0].item() * 100
real_probability = probabilities[1].item() * 100

prediction = (
    "FAKE"
    if fake_probability > real_probability
    else "REAL"
)

print()
print("=" * 45)
print("SWIN DEEPFAKE ANALYSIS")
print("=" * 45)
print(f"Image: {image_path}")
print(f"Prediction: {prediction}")
print(f"Fake probability: {fake_probability:.2f}%")
print(f"Real probability: {real_probability:.2f}%")
print("=" * 45)
