import sys
import torch
from PIL import Image
from torchvision import transforms
from torchvision.models import efficientnet_b0

MODEL_PATH = "models/efficientnet-b0-deepfake/efficientnet_b0.pth"

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)

model = efficientnet_b0(weights=None)
model.classifier[1] = torch.nn.Linear(
    model.classifier[1].in_features,
    2
)

model.load_state_dict(torch.load(
    MODEL_PATH,
    map_location=device
))

model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

if len(sys.argv) < 2:
    print("Usage: python predict_efficientnet.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]

image = Image.open(image_path).convert("RGB")
image = transform(image).unsqueeze(0).to(device)

with torch.no_grad():
    outputs = model(image)
    probabilities = torch.softmax(outputs, dim=1)[0]

fake_probability = probabilities[0].item() * 100
real_probability = probabilities[1].item() * 100

prediction = "FAKE" if fake_probability > real_probability else "REAL"

print()
print("=" * 50)
print("EfficientNet-B0 Prediction")
print("=" * 50)
print("Prediction:", prediction)
print(f"Fake probability: {fake_probability:.2f}%")
print(f"Real probability: {real_probability:.2f}%")
print("=" * 50)
