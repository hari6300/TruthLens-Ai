import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from transformers import AutoImageProcessor, SwinForImageClassification
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

MODEL_DIR = "ml/models/swin-deepfake-v2"
TEST_DIR = "ml/dataset_v2/test"

BATCH_SIZE = 16

# -----------------------------
# Device
# -----------------------------

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)

# -----------------------------
# Processor
# -----------------------------

processor = AutoImageProcessor.from_pretrained(MODEL_DIR)

image_mean = processor.image_mean
image_std = processor.image_std
image_size = processor.size["height"]

transform = transforms.Compose([
    transforms.Resize((image_size, image_size)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=image_mean,
        std=image_std
    )
])

# -----------------------------
# Dataset
# -----------------------------

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=transform
)

print("Classes:", test_dataset.classes)
print("Test images:", len(test_dataset))

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

# -----------------------------
# Model
# -----------------------------

print("Loading trained Swin model...")

model = SwinForImageClassification.from_pretrained(
    MODEL_DIR
)

model.to(device)
model.eval()

# -----------------------------
# Prediction
# -----------------------------

all_labels = []
all_predictions = []

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(device)

        outputs = model(
            pixel_values=images
        )

        predictions = torch.argmax(
            outputs.logits,
            dim=1
        )

        all_labels.extend(labels.numpy())
        all_predictions.extend(
            predictions.cpu().numpy()
        )

# -----------------------------
# Metrics
# -----------------------------

accuracy = accuracy_score(
    all_labels,
    all_predictions
)

precision = precision_score(
    all_labels,
    all_predictions,
    zero_division=0
)

recall = recall_score(
    all_labels,
    all_predictions,
    zero_division=0
)

f1 = f1_score(
    all_labels,
    all_predictions,
    zero_division=0
)

cm = confusion_matrix(
    all_labels,
    all_predictions
)

print()
print("=" * 50)
print("SWIN DATASET V2 TEST RESULTS")
print("=" * 50)

print(f"Accuracy : {accuracy * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}%")
print(f"Recall   : {recall * 100:.2f}%")
print(f"F1 Score : {f1 * 100:.2f}%")

print()
print("Confusion Matrix:")
print(cm)

print()
print("Classification Report:")
print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=["FAKE", "REAL"],
        zero_division=0
    )
)

print("=" * 50)
