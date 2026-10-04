import os
import time
import subprocess

DATASET = "tripya/genimage-224-8-generators"
BASE = "ml/dataset_v2/genimage_sample"

GENERATORS = [
    "adm",
    "biggan",
    "glide",
    "midjourney",
    "vqdm",
    "wukong",
]

COUNT = 100

for generator in GENERATORS:
    for label in ["real", "fake"]:

        destination = os.path.join(
            BASE,
            "REAL" if label == "real" else "FAKE"
        )

        os.makedirs(destination, exist_ok=True)

        print(f"\n===== {generator.upper()} {label.upper()} =====")

        for i in range(COUNT):
            filename = f"{generator}_{label}_{i:06d}.png"
            output = os.path.join(destination, filename)

            if os.path.exists(output):
                print(f"SKIP {filename}")
                continue

            kaggle_file = f"{generator}/{label}/{i:06d}.png"

            command = [
                "kaggle",
                "datasets",
                "download",
                "-d",
                DATASET,
                "-f",
                kaggle_file,
                "-p",
                "/tmp/genimage_download"
            ]

            os.makedirs("/tmp/genimage_download", exist_ok=True)

            try:
                subprocess.run(command, check=True)

                downloaded = os.path.join(
                    "/tmp/genimage_download",
                    f"{i:06d}.png"
                )

                if os.path.exists(downloaded):
                    os.rename(downloaded, output)
                    print(f"OK {filename}")
                else:
                    print(f"ERROR: downloaded file missing: {filename}")

            except subprocess.CalledProcessError:
                print(f"ERROR downloading: {kaggle_file}")

            time.sleep(0.2)

print("\n================================")
print("GENIMAGE 6-GENERATOR DOWNLOAD COMPLETE")
print("================================")
