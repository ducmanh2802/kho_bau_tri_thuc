#!/usr/bin/env python3
import re

filepath = r"D:\trithuc\kho_bau_luong_b/src/data/vietnamese/rhymes.ts"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Fix the mc calls that are missing the 7th argument (explanation)
# We need to identify lines 332-334, 349-351, 366-368, 383-385
# and add the explanation as the 7th argument

# Let me process each line and add explanation where needed
new_lines = []
for i, line in enumerate(lines):
    # Check if this line has a mc call with 6 arguments (missing explanation)
    # Pattern: mc('id', skill, diff, prompt, opts, correct) - no explanation after
    # The existing correct calls have 7+ args
    
    # Look for mc calls in T10C section (after line 320 or so)
    # that have the specific T10C question patterns
    
    new_lines.append(line)

# Now let me use a different approach - replace specific lines by line number
# Lines 332, 333, 334 need explanation added (they're the vn-r12-4 through vn-r12-6 mc calls)
# Lines 349, 350, 351 need explanation (vn-r13-4 through vn-r13-6)
# Lines 366, 367, 368 need explanation (vn-r14-4 through vn-r14-6)  
# Lines 383, 384, 385 need explanation (vn-r15-4 through vn-r15-6)

# Actually, let me just use the known line numbers and content

# Line 332 (0-indexed: 331): mc('vn-r12-4', s12, 2, 'Từ "cây" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ "cây" có vần ai.')
# Need to add ', 'Vần ai là i-a-i' after 'vần ai.'

# Let me just replace the specific lines by exact content match
# Read the file as text and use string replacement

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix each mc call by finding the exact string and adding the explanation
fixes = []

# vn-r12-4
s1 = 'mc("vn-r12-4", s12, 2, \'Từ "cây" có vần any?\', [\'ai\', \'ay\', \'ây\', \'ưa\'], \'ai\', \'Từ "cây" có vần ai.\')'
# This is getting too complex with quoting

# Let me just use a simple approach: find the line content and replace it
# I'll target the exact Vietnamese text that's unique

# vn-r12-4: 'Từ "cây" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ "cây" có vần ai.'
# Replace the end of this line to add explanation

# Actually, the simplest approach: just add the explanation text as a 7th arg
# by replacing the closing pattern of each mc call

# Let me use regex to find mc calls with 6 args and add the 7th
# Pattern: mc\('([^']*)', '([^']*)', (\d+), '([^']*)', (\\[.*\\]), '([^']*)'\)
# This matches: mc(id, skill, diff, prompt, opts, correct)

# But regex with Vietnamese and brackets is tricky

# Let me take the easiest path: just manually fix each line using known content
# I'll read the file, identify the lines, and use edit with exact matching

print("Starting fixes...")
print(f"File has {len(lines)} lines")

# Let me verify the exact content of lines 332-334
for i in [331, 332, 333]:  # 0-indexed
    print(f"Line {i+1}: {lines[i].strip()[:60]}")

PYEOF