import torch
from transformers import AutoImageProcessor, SwinForImageClassification

MODEL_NAME = "microsoft/swin-tiny-patch4-window7-224"

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)
print("Loading Swin Transformer...")

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)

model = SwinForImageClassification.from_pretrained(MODEL_NAME)

model.to(device)
model.eval()

print("Model loaded successfully!")
print("Number of labels:", model.config.num_labels)
print("Labels:", model.config.id2label)