#!/usr/bin/env python3
"""Parse an exported test-case workbook (.xlsx) with the standard library only.

Usage (JSON goes to stdout, human-readable summary to stderr):
    python parse_cases.py <input.xlsx> > cases.json

The local machine has no openpyxl / pandas, so read the xlsx zip directly.
Redirect stdout with bash `>` rather than writing JSON from Python: on this
machine Python-written document files may be encrypted by E-SafeNet.
"""

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def column_index(cell_reference):
    match = re.match(r"([A-Z]+)", cell_reference)
    index = 0
    for char in match.group(1):
        index = index * 26 + ord(char) - 64
    return index


def read_workbook(path):
    archive = zipfile.ZipFile(path)
    shared_strings = []
    if "xl/sharedStrings.xml" in archive.namelist():
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        for item in root.findall(NS + "si"):
            shared_strings.append("".join(node.text or "" for node in item.iter(NS + "t")))

    sheet_names = sorted(
        name for name in archive.namelist()
        if re.match(r"xl/worksheets/sheet\d+\.xml$", name)
    )
    if not sheet_names:
        raise SystemExit("No worksheet found in " + path)

    sheet = ET.fromstring(archive.read(sheet_names[0]))
    rows = []
    for row in sheet.iter(NS + "row"):
        cells = {}
        for cell in row.findall(NS + "c"):
            value_type = cell.get("t")
            value_node = cell.find(NS + "v")
            value = ""
            if value_type == "s" and value_node is not None:
                value = shared_strings[int(value_node.text)]
            elif value_type == "inlineStr":
                value = "".join(node.text or "" for node in cell.iter(NS + "t"))
            elif value_node is not None:
                value = value_node.text or ""
            cells[column_index(cell.get("r"))] = value
        rows.append(cells)

    headers = {index: name for index, name in rows[0].items()}
    column_count = max(headers)
    cases = []
    for row in rows[1:]:
        record = {
            headers.get(index, "COL%d" % index): (row.get(index) or "")
            for index in range(1, column_count + 1)
        }
        if any(record.values()):
            cases.append(record)
    return [headers[index] for index in sorted(headers)], cases


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python parse_cases.py <input.xlsx> > <output.json>")

    headers, cases = read_workbook(sys.argv[1])
    json.dump({"headers": headers, "cases": cases}, sys.stdout, ensure_ascii=False, indent=1)
    print(file=sys.stdout)

    print("HEADERS:", headers, file=sys.stderr)
    print("CASE_COUNT:", len(cases), file=sys.stderr)
    for column in ("级别", "版本", "所属模块", "状态"):
        if column in headers:
            print(
                "DIST %s:" % column,
                Counter(case.get(column, "") for case in cases).most_common(12),
                file=sys.stderr,
            )
    if "级别" in headers:
        level_one = [case for case in cases if case.get("级别", "").strip() == "1"]
        print("LEVEL_1_COUNT:", len(level_one), file=sys.stderr)
        for case in level_one:
            print(
                "  %s | %s | 版本=%s" % (
                    case.get("key", ""),
                    case.get("标题", "")[:60],
                    case.get("版本", ""),
                ),
                file=sys.stderr,
            )


if __name__ == "__main__":
    main()
