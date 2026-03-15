"""
sync_exercises.py
Runs via GitHub Actions on every .ipynb push.
- Reads metadata from the first cell of each notebook
- Stores BOTH code cells and markdown/text cells in order
- Captures outputs (text, images) from code cells
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


def extract_outputs(cell) -> list:
    outputs = []
    for output in getattr(cell, "outputs", []):
        output_type = output.get("output_type", "")

        if output_type == "stream":
            text = output.get("text", "")
            if isinstance(text, list):
                text = "".join(text)
            if text.strip():
                outputs.append({"type": "text", "content": text.rstrip()})

        elif output_type in ("display_data", "execute_result"):
            data = output.get("data", {})
            if "image/png" in data:
                img = data["image/png"]
                if isinstance(img, list):
                    img = "".join(img)
                outputs.append({"type": "image", "content": img.strip()})
            elif "text/plain" in data:
                text = data["text/plain"]
                if isinstance(text, list):
                    text = "".join(text)
                if text.strip():
                    outputs.append({"type": "text", "content": text.strip()})

        elif output_type == "error":
            ename  = output.get("ename", "Error")
            evalue = output.get("evalue", "")
            outputs.append({"type": "error", "content": f"{ename}: {evalue}"})

    return outputs


def parse_notebook(nb_path: str) -> dict:
    meta = {
        "name": "",
        "topic": "",
        "level": "Beginner",
        "description": "",
        "tags": [],
        "snippet": "",
        "cells": [],   # list of { kind: "code"|"markdown", source, outputs? }
    }

    nb = nbformat.read(nb_path, as_version=4)
    if not nb.cells:
        return meta

    # --- Find metadata cell (search first 3) ---
    metadata_cell_index = None
    for i, cell in enumerate(nb.cells[:3]):
        src = cell.source if isinstance(cell.source, str) else "".join(cell.source)
        if "@name" in src:
            metadata_cell_index = i
            for line in src.splitlines():
                clean = line.strip().lstrip("#").strip()
                if not clean.startswith("@"):
                    continue
                clean = clean[1:]
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

    # --- Collect all cells after metadata (both code + markdown) ---
    start_from = (metadata_cell_index + 1) if metadata_cell_index is not None else 1
    first_code_snippet = None

    for cell in nb.cells[start_from:]:
        src = cell.source if isinstance(cell.source, str) else "".join(cell.source)
        src = src.strip()
        if not src:
            continue

        if cell.cell_type == "markdown":
            # Skip the Colab badge cell
            if "colab.research.google.com" in src and "badge" in src:
                continue
            meta["cells"].append({
                "kind":   "markdown",
                "source": src,
            })

        elif cell.cell_type == "code":
            if src.startswith("# @"):
                continue
            outputs = extract_outputs(cell)
            meta["cells"].append({
                "kind":    "code",
                "source":  src,
                "outputs": outputs,
            })
            if first_code_snippet is None:
                first_code_snippet = src

    # flat snippet for card preview
    if first_code_snippet:
        meta["snippet"] = "\n".join(first_code_snippet.splitlines()[:12])

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
    print(f"  History -> {filename}")


def main() -> None:
    notebooks = sorted(glob.glob(f"{NOTEBOOKS}/**/*.ipynb", recursive=True))
    data      = load_data()
    existing  = {e["notebookPath"]: e for e in data["exercises"]}
    timestamp = datetime.utcnow()
    synced    = 0

    for raw_path in notebooks:
        nb_path = raw_path.replace("\\", "/")
        print(f"\nProcessing: {nb_path}")

        try:
            meta = parse_notebook(nb_path)
            if not meta["name"]:
                print("  Skipped - no @name metadata found in first 3 cells")
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
                "cells":        meta["cells"],
                "notebookPath": nb_path,
                "notebookUrl":  colab_url(nb_path),
                "pushedAt":     timestamp.isoformat() + "Z",
            }
            write_history(meta, nb_path, timestamp)
            code_count = sum(1 for c in meta["cells"] if c["kind"] == "code")
            text_count = sum(1 for c in meta["cells"] if c["kind"] == "markdown")
            print(f"  Synced  {meta['name']}  ({code_count} code, {text_count} text cells)")
            synced += 1

        except Exception as exc:
            print(f"  Error: {exc}")

    data["exercises"]   = list(existing.values())
    data["lastUpdated"] = timestamp.isoformat() + "Z"
    save_data(data)
    print(f"\nDone - {synced} notebooks synced, {len(data['exercises'])} total in manifest.")


if __name__ == "__main__":
    main()