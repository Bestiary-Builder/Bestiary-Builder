import json
import os
import requests
from collections import defaultdict
from dotenv import load_dotenv
import re

load_dotenv()
GVAR_ID = "1835e9e6-7eb7-45a9-b30e-9219f58ce03f"
MONSTER_FILE = "../../staticData/2024/SRDCreatures2024.json"
PROGRESS_FILE = "./progress.json"

# Load monster data
with open(MONSTER_FILE, "r", encoding="utf-8") as f:
    monsters = json.load(f)
allowed_lookup = {
    name.lower(): name
    for name in monsters
}

# Load progress
if os.path.exists(PROGRESS_FILE):
    try:
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            progress = set(json.load(f))
    except json.JSONDecodeError:
        progress = set()
else:
    progress = set()


# Fetch GVAR
response = requests.get(
    f"https://api.avrae.io/customizations/gvars/{GVAR_ID}",
    headers={
        "Authorization": os.getenv("AVRAE_TOKEN")
    },
)
response.raise_for_status()

data = json.loads(response.json()["value"])

added = []
rejected = []
already_present = []
creature_data = {}
for key, value in data.items():
    lookup = key.lower()

    if lookup not in allowed_lookup:
        rejected.append(key)
        continue
    
    # Use the correctly-capitalized name from monsters.json
    canonical_key = allowed_lookup[lookup]

    if canonical_key not in progress:
        progress.add(canonical_key)
        added.append(canonical_key)
        creature_data[canonical_key] = value
    else:
        already_present.append(canonical_key)
        creature_data[canonical_key] = value



if len(added) > 0:
    print(f"Added {len(added)} key(s):")
    for key in added:
        print(f" + {key}")

if len(rejected) > 0:
    print(f"\nRejected {len(rejected)} key(s) (not in master list):")
    for key in rejected:
        print(f" - {key}")

if len(already_present)>0:
    print(f"\nDuplicate {len(already_present)}")
    for key in already_present:
        print(f" - {key}")

allowed_names = set(monsters.keys())

collected = len(allowed_names & set(progress))
remaining = len(allowed_names - set(progress))

print(f"\nCollected {collected}/{len(allowed_names)}")
print(f"Remaining: {remaining}")


FEATURE_SECTIONS = (
    "features",
    "actions",
    "bonus",
    "reactions",
    "legendary",
    "lair",
    "mythic",
    "regional",
)

# Build lookup of monsters by canonical name
warnings = defaultdict(list)


def normalize_feature_name(name):
    if not isinstance(name, str):
        return name
    # Remove anything in parentheses and trim whitespace
    return re.sub(r"\s*\([^)]*\)\s*$", "", name).strip()

# Merge output.json
#  data into monsters.json
for key, creature_data in creature_data.items():
    # Match case-insensitively to canonical monster name
    canonical_name = allowed_lookup.get(key.lower())

    if canonical_name is None:
        continue

    monster = monsters[canonical_name]

    monster_features = monster.setdefault("features", {})

    # creature_data already contains the feature sections
    for section in FEATURE_SECTIONS:
        incoming = creature_data.get(section, [])

        if not incoming:
            continue

        existing = monster_features.setdefault(section, [])

        for feature in incoming:
            normalized_name = normalize_feature_name(feature.get("name"))

            index = next(
                (
                    i
                    for i, item in enumerate(existing)
                    if normalize_feature_name(item.get("name")) == normalized_name
                ),
                None,
            )

            if index is not None:
                warnings[canonical_name].append(
                    f"{section}: replaced '{existing[index]['name']}'"
                )

                replacement = feature.copy()
                replacement["name"] = existing[index]["name"]
                existing[index] = replacement
            else:
                existing.append(feature)

# Print warnings grouped by creature
# if warnings:
#     #print("\nDuplicate entries found:")

#     for creature in sorted(warnings):
#         print(f"\n{creature}")
#         for warning in warnings[creature]:
#             print(f"  - {warning}")
# else:
#     print("\nNo duplicate entries found.")

# Save updated monsters.json
with open(MONSTER_FILE, "w", encoding="utf-8") as f:
    json.dump(monsters, f, indent=4, ensure_ascii=False)


missing = []

for name in monsters:
    if name not in progress:
        missing.append(name)

    if len(missing) == 20:
        break

if missing:
    print("\n\nNext missing creatures:\n")
    print("!aexport " + " ".join(f'"{item}"' for item in missing))
    print("!aexport all")
else:
    print("No missing creatures found.")

## empty the gvar
print(f"\n!empty")

with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
    json.dump(sorted(list(progress)), f, indent=4, ensure_ascii=False)


