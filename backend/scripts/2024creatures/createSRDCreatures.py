import json
import os
import requests
from collections import defaultdict
from dotenv import load_dotenv
import re

load_dotenv()

# 1 == 2024, 0 == 2014
mode = 0

GVAR_ID = "1835e9e6-7eb7-45a9-b30e-9219f58ce03f"
if mode:
    MONSTER_FILE = "../../staticData/2024/SRDCreatures2024.json"
    ATTACKS_FILE = "../../staticData/2024/SRDAttacks2024.json"
    PROGRESS_FILE = "./progress2024.json"
    REPORT_FILE = "wrong_activation_type_report_2024.txt"
else:
    MONSTER_FILE = "../../staticData/2014/SRDCreatures2014.json"
    ATTACKS_FILE = "../../staticData/2014/SRDAttacks2014.json"
    PROGRESS_FILE = "./progress2014.json"
    REPORT_FILE = "wrong_activation_type_report_2014.txt"


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
["effects", "hit", "miss", "fail", "success", "onTrue", "onFalse"]
required_keys = {
    "attack": [
        "hit",
        "miss",
    ],
    "save": [
        "success",
        "fail",
    ],
    "condition": [
        "onTrue",
        "onFalse"
    ],
}

from collections.abc import Mapping

def visit_automation(node, required_keys):
    """Recursively visit an automation node."""

    if not isinstance(node, Mapping):
        return

    node_type = node.get("type")

    if node_type in required_keys:
        for key in required_keys[node_type]:
            node.setdefault(key, [])

    for value in node.values():
        if isinstance(value, Mapping):
            visit_automation(value, required_keys)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, Mapping):
                    visit_automation(item, required_keys)


def ensure_automation_keys(data, required_keys):
    """Walk every feature automation in every monster."""

    for monster in data.values():
        for feature_list in monster.get("features", {}).values():
            if not isinstance(feature_list, list):
                continue

            for feature in feature_list:
                automation = feature.get("automation")
                if automation:
                    visit_automation(automation, required_keys)

ensure_automation_keys(monsters, required_keys)

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


import json
from collections import defaultdict


from collections import defaultdict

FEATURE_SECTION_IDS = {
    "actions": 1,      # ACTION
    "features": 2,     # NO_ACTION
    "bonus": 3,        # BONUS_ACTION
    "reactions": 4,    # REACTION
    "legendary": 9,    # LEGENDARY
    "mythic": 10,      # MYTHIC
    "lair": 11,        # LAIR
    "regional": 2
}



with open(REPORT_FILE, "w", encoding="utf-8") as out:
    for creature_name, creature in sorted(monsters.items()):
        features = creature.get("features", {})

        # name -> list of occurrences
        by_name = defaultdict(list)

        for section in FEATURE_SECTIONS:
            for item in features.get(section, []):
                if not isinstance(item, dict):
                    continue

                name = item.get("name")
                if not name:
                    continue

                by_name[name].append({
                    "section_id": FEATURE_SECTION_IDS.get(section),
                    "automation": item.get("automation"),
                })

        found_any = False

        SECTION_NAMES = {
            1: "ACTION",
            2: "NO_ACTION",
            3: "BONUS_ACTION",
            4: "REACTION",
            6: "MINUTE",
            7: "HOUR",
            8: "SPECIAL",
            9: "LEGENDARY",
            10: "MYTHIC",
            11: "LAIR",
        }

        def format_ids(ids):
            return ", ".join(f"{i} ({SECTION_NAMES.get(i, 'UNKNOWN')})" for i in ids)

        for name, occurrences in sorted(by_name.items()):
            expected = sorted({
                o["section_id"]
                for o in occurrences
                if o["automation"] is None and o["section_id"] is not None
            })

            received = sorted({
                o["activation_type"]
                for o in occurrences
                if (
                    o["automation"] is not None
                    and o.get("activation_type") is not None
                )
            })

            missing_activation = any(
                o["automation"] is not None
                and o.get("activation_type") is None
                for o in occurrences
            )

            if expected and (received or missing_activation):
                if not found_any:
                    out.write(f"{creature_name}\n")
                    found_any = True

                if missing_activation:
                    received_text = "MISSING activation_type"
                else:
                    received_text = format_ids(received)

                out.write(
                    f"  {name} (Expected {format_ids(expected)}; "
                    f"received {received_text})\n"
                )

        if found_any:
            out.write("\n")

print(f"Wrote report to {REPORT_FILE}")


attacks = {}
for creature in monsters.values():  # or monsters.values() if monsters is a dict
    creature_name = creature["description"]["name"]

    for section in FEATURE_SECTIONS:
        for feature in creature.get("features", {}).get(section, []):
            if feature.get("automation") is None:
                continue

            attacks[f"{creature_name} - {feature['name']}"] = feature

with open(ATTACKS_FILE, "w", encoding="utf-8") as f:
    json.dump(attacks, f, indent=4, ensure_ascii=False)
