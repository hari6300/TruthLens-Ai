import os
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from transformers import AutoImageProcessor, SwinForImageClassification
from torch.optim import AdamW

# -----------------------------
# Configuration
# -----------------------------

MODEL_NAME = "microsoft/swin-tiny-patch4-window7-224"

TRAIN_DIR = "dataset/train"
TEST_DIR = "dataset/test"

BATCH_SIZE = 16
EPOCHS = 3
LEARNING_RATE = 2e-5

MODEL_DIR = "models/swin-deepfake"

# -----------------------------
# Device
# -----------------------------

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)

# -----------------------------
# Image preprocessing
# -----------------------------

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)

image_mean = processor.image_mean
image_std = processor.image_std
image_size = processor.size["height"]

transform = transforms.Compose([
    transforms.Resize((image_size, image_size)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=image_mean,
        std=image_std
    )
])

test_transform = transforms.Compose([
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

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=transform
)

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=test_transform
)

print("Classes:", train_dataset.classes)
print("Training images:", len(train_dataset))
print("Test images:", len(test_dataset))

# -----------------------------
# DataLoader
# -----------------------------

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

# -----------------------------
# Model
# -----------------------------

print("Loading Swin Transformer...")

model = SwinForImageClassification.from_pretrained(
    MODEL_NAME,
    num_labels=2,
    ignore_mismatched_sizes=True,
    id2label={
        0: "FAKE",
        1: "REAL"
    },
    label2id={
        "FAKE": 0,
        "REAL": 1
    }
)

model.to(device)

# -----------------------------
# Optimizer
# -----------------------------

optimizer = AdamW(
    model.parameters(),
    lr=LEARNING_RATE
)

# -----------------------------
# Training
# -----------------------------

for epoch in range(EPOCHS):

    print()
    print("=" * 50)
    print(f"Epoch {epoch + 1}/{EPOCHS}")
    print("=" * 50)

    model.train()

    total_loss = 0
    correct = 0
    total = 0

    for batch_index, (images, labels) in enumerate(train_loader):

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(
            pixel_values=images,
            labels=labels
        )

        loss = outputs.loss
        logits = outputs.logits

        loss.backward()
        optimizer.step()

        total_loss += loss.item()

        predictions = torch.argmax(logits, dim=1)

        correct += (predictions == labels).sum().item()
        total += labels.size(0)

        if (batch_index + 1) % 100 == 0:
            accuracy = 100 * correct / total

            print(
                f"Batch {batch_index + 1} | "
                f"Loss: {loss.item():.4f} | "
                f"Accuracy: {accuracy:.2f}%"
            )

    train_accuracy = 100 * correct / total

    print()
    print(f"Training Loss: {total_loss / len(train_loader):.4f}")
    print(f"Training Accuracy: {train_accuracy:.2f}%")

    # -----------------------------
    # Validation
    # -----------------------------

    model.eval()

    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(
                pixel_values=images
            )

            predictions = torch.argmax(
                outputs.logits,
                dim=1
            )

            correct += (
                predictions == labels
            ).sum().item()

            total += labels.size(0)

    test_accuracy = 100 * correct / total

    print(f"Test Accuracy: {test_accuracy:.2f}%")

# -----------------------------
# Save model
# -----------------------------

os.makedirs(MODEL_DIR, exist_ok=True)

model.save_pretrained(MODEL_DIR)
processor.save_pretrained(MODEL_DIR)

print()
print("=" * 50)
print("TRAINING COMPLETE")
print("=" * 50)

print("Model saved to:")
print(MODEL_DIR)