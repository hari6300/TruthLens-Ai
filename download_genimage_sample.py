from kaggle.api.kaggle_api_extended import KaggleApi
from pathlib import Path
import re
import time

DATASET = "tripya/genimage-224-8-generators"
OUT = Path("ml/dataset_v2/genimage_sample")

GENERATORS = [
    "adm",
    "sd-v1-4",
    "sd-v1-5",
    "wukong",
    "vqdm",
    "biggan",
    "midjourney",
    "glide",
]

PER_CLASS = 100
PAGE_SIZE = 100

api = KaggleApi()
api.authenticate()

print("Getting complete file list...")

all_files = []
token = None
page = 1

while True:
    if token:
        response = api.dataset_list_files(
            DATASET,
            page_size=PAGE_SIZE,
            page_token=token
        )
    else:
        response = api.dataset_list_files(
            DATASET,
            page_size=PAGE_SIZE
        )

    files = response.files
    all_files.extend(files)

    print(f"Page {page}: {len(files)} files | total collected: {len(all_files)}")

    token = response.next_page_token

    if not token:
        break

    page += 1

print(f"\nTotal files discovered: {len(all_files)}")

# Build paths grouped by generator/class
groups = {}

for f in all_files:
    parts = f.name.split("/")

    if len(parts) != 3:
        continue

    generator, label, filename = parts

    generator = generator.lower()
    label = label.lower()

    if generator in GENERATORS and label in ("real", "fake"):
        groups.setdefault((generator, label), []).append(f.name)

print("\nAvailable groups:")

for generator in GENERATORS:
    for label in ("real", "fake"):
        count = len(groups.get((generator, label), []))
        print(f"{generator:12} {label:5} {count}")

print("\nStarting download...\n")

downloaded = 0

for generator in GENERATORS:
    for label in ("real", "fake"):

        paths = sorted(groups.get((generator, label), []))

        if len(paths) < PER_CLASS:
            print(f"WARNING: only {len(paths)} files for {generator}/{label}")
            selected = paths
        else:
            selected = paths[:PER_CLASS]

        target_dir = OUT / label.upper()
        target_dir.mkdir(parents=True, exist_ok=True)

        for index, remote_path in enumerate(selected):

            source_name = Path(remote_path).name

            # Keep generator information in filename
            local_name = f"{generator}_{label}_{index:04d}_{source_name}"

            destination = target_dir / local_name

            if destination.exists():
                downloaded += 1
                continue

            print(f"[{downloaded + 1}] {remote_path}")

            try:
                api.dataset_download_file(
                    DATASET,
                    remote_path,
                    path=str(target_dir),
                    force=False,
                    quiet=True
                )

                # Kaggle normally creates a ZIP for individual files.
                zip_file = target_dir / (source_name + ".zip")

                if zip_file.exists():
                    zip_file.rename(destination)

                downloaded += 1

            except Exception as e:
                print(f"ERROR: {remote_path}")
                print(e)

print("\nFinished.")
print(f"Files processed: {downloaded}")
print(f"Dataset location: {OUT}")
