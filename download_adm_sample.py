from kaggle.api.kaggle_api_extended import KaggleApi
from pathlib import Path
import shutil
import time

DATASET = "tripya/genimage-224-8-generators"
COUNT = 100

base = Path("ml/dataset_v2/genimage_sample")
real_dir = base / "REAL"
fake_dir = base / "FAKE"

real_dir.mkdir(parents=True, exist_ok=True)
fake_dir.mkdir(parents=True, exist_ok=True)

api = KaggleApi()
api.authenticate()

for label, output_dir in [("real", real_dir), ("fake", fake_dir)]:

    print(f"\nDownloading ADM {label.upper()} images...")

    for i in range(COUNT):

        filename = f"{i:06d}.png"
        remote = f"adm/{label}/{filename}"

        # Give each file a unique local name
        destination = output_dir / f"adm_{label}_{filename}"

        if destination.exists():
            print(f"Already exists: {destination.name}")
            continue

        print(f"{i + 1}/{COUNT}: {remote}")

        try:
            api.dataset_download_file(
                DATASET,
                remote,
                path=str(output_dir),
                force=False,
                quiet=True
            )

            downloaded_file = output_dir / filename

            if downloaded_file.exists():
                shutil.move(str(downloaded_file), str(destination))

        except Exception as e:
            print(f"ERROR: {remote}")
            print(e)

        # Small delay to reduce API pressure
        time.sleep(0.2)

print("\nADM sample download finished.")
