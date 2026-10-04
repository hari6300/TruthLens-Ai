import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

TRAIN_DIR = "dataset/train"
TEST_DIR = "dataset/test"
MODEL_DIR = "models/efficientnet-b0-deepfake"

BATCH_SIZE = 8
EPOCHS = 3
LEARNING_RATE = 2e-5
PRINT_EVERY = 100

os.makedirs(MODEL_DIR, exist_ok=True)

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)

weights = EfficientNet_B0_Weights.DEFAULT

train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=weights.transforms().mean,
        std=weights.transforms().std
    )
])

test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=weights.transforms().mean,
        std=weights.transforms().std
    )
])

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transform
)

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=test_transform
)

print("Classes:", train_dataset.class_to_idx)
print("Training images:", len(train_dataset))
print("Testing images:", len(test_dataset))

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

print("Loading EfficientNet-B0...")

model = efficientnet_b0(weights=weights)

model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    2
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE
)

for epoch in range(EPOCHS):

    model.train()

    total_loss = 0
    correct = 0
    total = 0

    total_batches = len(train_loader)

    print()
    print("=" * 60)
    print(f"Epoch {epoch + 1}/{EPOCHS}")
    print(f"Total batches: {total_batches}")
    print("=" * 60)

    for batch_number, (images, labels) in enumerate(train_loader, start=1):

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

        predictions = outputs.argmax(dim=1)

        correct += (predictions == labels).sum().item()

        total += labels.size(0)

        if batch_number % PRINT_EVERY == 0 or batch_number == total_batches:

            current_accuracy = 100 * correct / total

            print(
                f"Batch {batch_number}/{total_batches} | "
                f"Loss: {loss.item():.4f} | "
                f"Accuracy: {current_accuracy:.2f}%"
            )

    train_accuracy = 100 * correct / total

    print()
    print(f"Training Loss: {total_loss / total_batches:.4f}")
    print(f"Training Accuracy: {train_accuracy:.2f}%")

    print("Testing model...")

    model.eval()

    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            predictions = outputs.argmax(dim=1)

            correct += (predictions == labels).sum().item()

            total += labels.size(0)

    test_accuracy = 100 * correct / total

    print(f"Test Accuracy: {test_accuracy:.2f}%")

model_path = os.path.join(
    MODEL_DIR,
    "efficientnet_b0.pth"
)

torch.save(model.state_dict(), model_path)

print()
print("=" * 60)
print("Training complete!")
print("Model saved to:", model_path)
print("=" * 60)
