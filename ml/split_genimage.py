from pathlib import Path
import random
import shutil

random.seed(42)

SOURCE = Path("ml/dataset_v2/genimage_sample")
DEST = Path("ml/dataset_v2")

splits = {
    "train": 0.70,
    "validation": 0.15,
    "test": 0.15,
}

for label in ["REAL", "FAKE"]:
    files = list((SOURCE / label).glob("*.png"))
    random.shuffle(files)

    total = len(files)
    train_end = int(total * splits["train"])
    val_end = train_end + int(total * splits["validation"])

    groups = {
        "train": files[:train_end],
        "validation": files[train_end:val_end],
        "test": files[val_end:],
    }

    for split, split_files in groups.items():
        target = DEST / split / label
        target.mkdir(parents=True, exist_ok=True)

        for src in split_files:
            shutil.copy2(src, target / src.name)

        print(f"{split}/{label}: {len(split_files)}")

print("\nDataset split complete.")
