#!/usr/bin/env python3
"""Restore api/ files listed in manifest when content exists on disk in a staging dir.

This script is a helper for manual restore: copy from STAGING_DIR if you export
index files there. Primary restore uses Cursor Read+Write per manifest path.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "_api_restore_manifest.txt"
API = ROOT / "api"
STAGING = ROOT / "_api_staging"


def main() -> int:
    if not MANIFEST.exists():
        print(f"Missing manifest: {MANIFEST}", file=sys.stderr)
        return 1
    paths = [line.strip() for line in MANIFEST.read_text().splitlines() if line.strip()]
    restored = 0
    missing = []
    for rel in paths:
        src = STAGING / rel.removeprefix("api/")
        dst = ROOT / rel
        if not src.is_file():
            missing.append(rel)
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        restored += 1
    print(f"restored={restored} missing={len(missing)}")
    return 0 if not missing else 2


if __name__ == "__main__":
    raise SystemExit(main())
