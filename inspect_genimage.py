from kaggle.api.kaggle_api_extended import KaggleApi

DATASET = "tripya/genimage-224-8-generators"

api = KaggleApi()
api.authenticate()

print("Getting file list...")

response = api.dataset_list_files(DATASET, page_size=100)

files = response.files

print(f"\nFiles on this page: {len(files)}")
print(f"Next page token: {response.next_page_token}")

print("\nFirst and last files on this page:")
print(files[0].name)
print(files[-1].name)

print("\nFolder structures on this page:")
structures = sorted(set("/".join(f.name.split("/")[:2]) for f in files))
for s in structures:
    print(" ", s)
