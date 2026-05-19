#!/usr/bin/env python3
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "src", "pages")
os.makedirs(BASE, exist_ok=True)


def w(name, content):
    content = content.replace("MOTION", "motion")
    content = content.replace("motion", "div")
    path = os.path.join(BASE, name)
    with open(path, "w") as f:
        f.write(content.strip() + "\n")
    print("wrote", name)


# Login, Register, Dashboard, Farm, InputCosts, Benchmark, Scenario, DaleChat page, Report, Scenarios list
# ... will be added in next invocation - run script in shell with full content
