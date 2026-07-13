import json
import os
import requests
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()
GVAR_ID = "1835e9e6-7eb7-45a9-b30e-9219f58ce03f"
MASTER_FILE = "../../staticData/2024/SRDCreatures2024.json"
OUTPUT_FILE = "../../staticData/2024/SRDAttacks2024.json"

# Load allowed monster names
with open(MASTER_FILE, "r", encoding="utf-8") as f:
    monsters = json.load(f)

allowed_lookup = {
    monster["description"]["name"].lower(): monster["description"]["name"]
    for monster in monsters
}

# Load output.json
if os.path.exists(OUTPUT_FILE):
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            output = json.load(f)
    except json.JSONDecodeError:
        output = {}
else:
    output = {}




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
for key, value in data.items():
    lookup = key.lower()

    if lookup not in allowed_lookup:
        rejected.append(key)
        continue
    
    # Use the correctly-capitalized name from monsters.json
    canonical_key = allowed_lookup[lookup]

    if canonical_key not in output:
        output[canonical_key] = value
        added.append(canonical_key)
    else:
        already_present.append(canonical_key)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=4, ensure_ascii=False)

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

allowed_names = set(allowed_lookup.values())

collected = len(allowed_names & set(output.keys()))
remaining = len(allowed_names - set(output.keys()))

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
monster_lookup = {
    monster["description"]["name"]: monster
    for monster in monsters
}

warnings = defaultdict(list)

# Merge output.json data into monsters.json
for key, creature_data in output.items():

    # Match case-insensitively to canonical monster name
    canonical_name = allowed_lookup.get(key.lower())

    if canonical_name is None:
        continue

    monster = monster_lookup[canonical_name]

    monster_features = monster.setdefault("features", {})

    # creature_data already contains the feature sections
    for section in FEATURE_SECTIONS:
        incoming = creature_data.get(section, [])

        if not incoming:
            continue

        existing = monster_features.setdefault(section, [])

        # Map existing feature names to their index
        existing_indexes = {
            item.get("name"): index
            for index, item in enumerate(existing)
            if isinstance(item, dict) and "name" in item
        }

        for feature in incoming:
            name = feature.get("name")

            if name in existing_indexes:
                index = existing_indexes[name]

                warnings[canonical_name].append(
                    f"{section}: replaced '{name}'"
                )

                # Replace existing entry
                existing[index] = feature
            else:
                # Add new entry
                existing.append(feature)
                existing_indexes[name] = len(existing) - 1

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
with open(MASTER_FILE, "w", encoding="utf-8") as f:
    json.dump(monsters, f, indent=4, ensure_ascii=False)


output_keys = {
        key.lower()
        for key in output.keys()
    }

missing = []

for monster in monsters:
    name = monster["description"]["name"]

    if name.lower() not in output_keys:
        missing.append(name)

    if len(missing) == 10:
        break

if missing:
    print("\n\nNext missing creatures:\n")
    print("!aexport " + " ".join(f'"{item}"' for item in missing))
    print("!aexport all")
else:
    print("No missing creatures found.")

print(f"\n!gvar edit {GVAR_ID} {{}}")