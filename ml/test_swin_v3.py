import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from transformers import AutoImageProcessor, AutoModelForImageClassification
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

MODEL_DIR = "ml/models/swin-deepfake-v3"
TEST_DIR = "ml/dataset_v2/test"

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"Using device: {device}")

processor = AutoImageProcessor.from_pretrained(MODEL_DIR)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=processor.image_mean,
        std=processor.image_std
    )
])

test_dataset = datasets.ImageFolder(TEST_DIR, transform=transform)
test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

print(f"Classes: {test_dataset.classes}")
print(f"Test images: {len(test_dataset)}")

print("Loading trained Swin V3 model...")

model = AutoModelForImageClassification.from_pretrained(MODEL_DIR)
model.to(device)
model.eval()

all_labels = []
all_preds = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)

        outputs = model(pixel_values=images)
        preds = torch.argmax(outputs.logits, dim=1)

        all_labels.extend(labels.numpy())
        all_preds.extend(preds.cpu().numpy())

accuracy = accuracy_score(all_labels, all_preds)
precision = precision_score(all_labels, all_preds, average="weighted")
recall = recall_score(all_labels, all_preds, average="weighted")
f1 = f1_score(all_labels, all_preds, average="weighted")

cm = confusion_matrix(all_labels, all_preds)

print("\n" + "=" * 50)
print("SWIN DATASET V3 TEST RESULTS")
print("=" * 50)

print(f"Accuracy : {accuracy * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}%")
print(f"Recall   : {recall * 100:.2f}%")
print(f"F1 Score : {f1 * 100:.2f}%")

print("\nConfusion Matrix:")
print(cm)

print("\nClassification Report:")
print(classification_report(
    all_labels,
    all_preds,
    target_names=test_dataset.classes
))
