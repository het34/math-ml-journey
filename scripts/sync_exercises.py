"""
sync_exercises.py
Runs via GitHub Actions on every .ipynb push.
- Reads metadata from the first cell of each notebook
- Creates a timestamped history file in history/
- Updates data/exercises.json (the master list for the website)
"""

import json
import os
import glob
from datetime import datetime
import nbformat

REPO        = os.environ.get("GITHUB_REPOSITORY", "username/math-ml-journey")
COMMIT_SHA  = os.environ.get("COMMIT_SHA", "")
DATA_FILE   = "data/exercises.json"
HISTORY_DIR = "history"
NOTEBOOKS   = "notebooks"


def slugify(text: str) -> str:
    return (
        text.lower()
        .replace(" ", "-")
        .replace("_", "-")
        .replace("/", "-")
        .replace("(", "")
        .replace(")", "")
    )


def parse_metadata(nb_path: str) -> dict:
    """
    Searches the first 3 cells for metadata lines like:
    # @name: Vectors and Dot Products
    # @topic: Linear Algebra
    # @level: Beginner
    # @description: Understanding vector ops
    # @tags: numpy, vectors, dot-product

    This handles the case where Colab inserts a badge cell at position 0
    automatically when saving with "Include a link to Colab" checked.
    """
    meta = {
        "name": "",
        "topic": "",
        "level": "Beginner",
        "description": "",
        "tags": [],
        "snippet": "",
    }

    nb = nbformat.read(nb_path, as_version=4)
    if not nb.cells:
        return meta

    # Search first 3 cells for metadata (Colab badge may occupy cell 0)
    metadata_cell_index = None
    for i, cell in enumerate(nb.cells[:3]):
        src = cell.source if isinstance(cell.source, str) else "".join(cell.source)
        if "@name" in src:
            metadata_cell_index = i
            for line in src.splitlines():
                clean = line.strip().lstrip("#").strip()
                if not clean.startswith("@"):
                    continue
                clean = clean[1:]  # remove @
                if ":" not in clean:
                    continue
                key, _, value = clean.partition(":")
                key   = key.strip()
                value = value.strip()
                if key == "name":
                    meta["name"] = value
                elif key == "topic":
                    meta["topic"] = value
                elif key == "level":
                    meta["level"] = value
                elif key == "description":
                    meta["description"] = value
                elif key == "tags":
                    meta["tags"] = [t.strip() for t in value.split(",") if t.strip()]
            break

    # Collect ALL code cells after the metadata cell and join them
    # This way the snippet shows the full exercise even if split across many cells
    start_from = (metadata_cell_index + 1) if metadata_cell_index is not None else 1
    all_code_parts = []
    for cell in nb.cells[start_from:]:
        if cell.cell_type == "code":
            src = cell.source if isinstance(cell.source, str) else "".join(cell.source)
            src = src.strip()
            if src and not src.startswith("# @"):
                all_code_parts.append(src)

    if all_code_parts:
        # Join all cells with a blank line between them (mirrors how they look in Colab)
        full_code = "\n\n".join(all_code_parts)
        meta["snippet"] = full_code

    return meta


def colab_url(path: str) -> str:
    return f"https://colab.research.google.com/github/{REPO}/blob/main/{path}"


def load_data() -> dict:
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return {"exercises": [], "lastUpdated": ""}


def save_data(data: dict) -> None:
    os.makedirs("data", exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def write_history(meta: dict, nb_path: str, ts: datetime) -> None:
    os.makedirs(HISTORY_DIR, exist_ok=True)
    slug     = slugify(meta["name"]) if meta["name"] else slugify(nb_path)
    filename = f"{ts.strftime('%Y-%m-%d_%H-%M')}_{slug}.json"
    payload  = {
        **meta,
        "notebookPath": nb_path,
        "notebookUrl":  colab_url(nb_path),
        "pushedAt":     ts.isoformat() + "Z",
        "commitSha":    COMMIT_SHA[:7] if COMMIT_SHA else "",
    }
    with open(os.path.join(HISTORY_DIR, filename), "w") as f:
        json.dump(payload, f, indent=2)
    print(f"  History → {filename}")


def main() -> None:
    notebooks  = sorted(glob.glob(f"{NOTEBOOKS}/**/*.ipynb", recursive=True))
    data       = load_data()
    existing   = {e["notebookPath"]: e for e in data["exercises"]}
    timestamp  = datetime.utcnow()
    synced     = 0

    for raw_path in notebooks:
        nb_path = raw_path.replace("\\", "/")
        print(f"\nProcessing: {nb_path}")

        try:
            meta = parse_metadata(nb_path)
            if not meta["name"]:
                print("  Skipped — no @name metadata found in first 3 cells")
                continue

            slug = slugify(meta["name"])
            existing[nb_path] = {
                "slug":         slug,
                "name":         meta["name"],
                "topic":        meta["topic"],
                "level":        meta["level"],
                "description":  meta["description"],
                "tags":         meta["tags"],
                "snippet":      meta["snippet"],
                "notebookPath": nb_path,
                "notebookUrl":  colab_url(nb_path),
                "pushedAt":     timestamp.isoformat() + "Z",
            }
            write_history(meta, nb_path, timestamp)
            print(f"  Synced  ✓  {meta['name']}")
            synced += 1

        except Exception as exc:
            print(f"  Error: {exc}")

    data["exercises"]   = list(existing.values())
    data["lastUpdated"] = timestamp.isoformat() + "Z"
    save_data(data)
    print(f"\n✅  Done — {synced} notebooks synced, {len(data['exercises'])} total in manifest.")


if __name__ == "__main__":
    main()