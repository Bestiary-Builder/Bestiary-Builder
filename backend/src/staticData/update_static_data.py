#!/usr/bin/env python3
"""
add_key_to_values.py

Opens a JSON file whose top-level structure is an object (dict) mapping
keys to values that are themselves objects (dicts) — possibly with
further nested sub-objects — and adds a new key/value pair into a
chosen sub-object under each top-level entry.

Example input:
{
    "item1": {"description": {"a": 1}, "other": 5},
    "item2": {"description": {"a": 2}, "other": 6}
}

Add "gear": "" into the "description" sub-object of every top-level entry:
    python add_key_to_values.py data.json gear "" --path description

Produces:
{
    "item1": {"description": {"a": 1, "gear": ""}, "other": 5},
    "item2": {"description": {"a": 2, "gear": ""}, "other": 6}
}

Omit --path to add the key directly to each top-level value instead
(the original, one-level behavior).

For a deeper sub-object, chain keys with dots, e.g. --path stats.combat
"""

import argparse
import json
import sys


def resolve_target(entry: dict, path_parts: list[str], entry_name: str):
    """
    Walk path_parts inside entry, returning the nested dict to modify,
    or None (with a warning) if the path doesn't lead to a dict.
    """
    target = entry
    walked = []
    for part in path_parts:
        walked.append(part)
        if not isinstance(target, dict) or part not in target:
            print(
                f"Warning: '{entry_name}' has no path "
                f"'{'.'.join(walked)}' — skipped.",
                file=sys.stderr,
            )
            return None
        target = target[part]

    if not isinstance(target, dict):
        print(
            f"Warning: '{entry_name}.{'.'.join(path_parts)}' is not an "
            f"object (got {type(target).__name__}) — skipped.",
            file=sys.stderr,
        )
        return None

    return target


def add_key_to_all_values(data: dict, new_key: str, new_value, path_parts: list[str]) -> dict:
    """
    For each top-level entry in `data`, navigate to the sub-object
    named by path_parts (or the entry itself if path_parts is empty)
    and add new_key: new_value to it.
    """
    updated_count = 0
    for entry_name, entry in data.items():
        if path_parts:
            target = resolve_target(entry, path_parts, entry_name)
        elif isinstance(entry, dict):
            target = entry
        else:
            print(
                f"Warning: value for key '{entry_name}' is not an object "
                f"(got {type(entry).__name__}) — skipped.",
                file=sys.stderr,
            )
            target = None

        if target is not None:
            target[new_key] = new_value
            updated_count += 1

    print(f"Updated {updated_count} object(s).")
    return data


def parse_value(raw: str):
    """
    Try to interpret the CLI value as JSON (so numbers, booleans,
    null, lists, objects work), falling back to a plain string.
    """
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def main():
    parser = argparse.ArgumentParser(
        description="Add a key/value pair to a sub-object inside every top-level entry of a JSON file."
    )
    parser.add_argument("input_file", help="Path to the input JSON file")
    parser.add_argument("new_key", help="Key to add")
    parser.add_argument(
        "new_value",
        nargs="?",
        default="",
        help=(
            'Value to add (parsed as JSON if possible, e.g. 42, true, "text"). '
            "Optional — omit it (or pass an empty string) to add an empty "
            'string "" as the value, which is a common case some shells '
            "(PowerShell/cmd) drop when passed explicitly as \"\"."
        ),
    )
    parser.add_argument(
        "--path",
        default="",
        help=(
            "Dot-separated path to the sub-object (relative to each "
            "top-level entry) that should receive the new key, e.g. "
            "'description' or 'stats.combat'. Omit to add the key "
            "directly to each top-level entry."
        ),
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Path to write the result to (defaults to overwriting input_file)",
    )

    args = parser.parse_args()

    with open(args.input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        sys.exit("Error: top-level JSON structure must be an object (dict).")

    path_parts = [p for p in args.path.split(".") if p] if args.path else []
    value = parse_value(args.new_value)
    updated = add_key_to_all_values(data, args.new_key, value, path_parts)

    output_path = args.output or args.input_file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(updated, f, indent=4, ensure_ascii=False)

    print(f"Wrote result to: {output_path}")


if __name__ == "__main__":
    main()