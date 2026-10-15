#!/usr/bin/env python3
import re

filepath = r"D:\trithuc\kho_bau_luong_b/src/data/vietnamese/rhymes.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix all mc calls missing the 7th (explanation) argument
# The pattern: mc('id', skill, diff, prompt, opts, correct) - needs explanation added
# We need to add ', explanation_text' after the correct answer

# Fix specific lines by targeting the unique patterns
fixes applied = 0

# vn-r12-4: line has 'Từ "cây" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ "cây" có vần ai.'
# Need to add ', 'Vần ai là i-a-i' after 'vần ai.'

# Let me just use string replacement on the specific problematic patterns
# I'll look for the exact mc call strings and replace them

# vn-r12-4
old1 = "mc('vn-r12-4', s12, 2, 'Từ \"cây\" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ \"cây\" có vần ai.')"
new1 = 'mc("vn-r12-4", s12, 2, \'Từ "cây" có vần nào?\', [\'ai\', \'ay\', \'ây\', \'ưa\'], \'ai\', \'Từ "cây" có vần ai.\', \'Vần ai là i-a-i\')"'
# Hmm this is getting complicated with quoting

# Let me try a different approach - just add the explanation as a 7th arg 
# by finding the pattern and inserting

# Actually, let me just use a regex to find mc calls with 6 arguments and add the 7th
# Pattern: mc\('([^']*)', '([^']*)', (\d+), '([^']*)', (\\[.*\\]), '([^']*)', ('[^']*')\)
# This is getting too complex

# Let me just manually read line by line and use edit with smaller chunks
print("Starting manual fixes...")
print(f"Content length: {len(content)}")
print(f"First 500 chars: {content[:500]}")