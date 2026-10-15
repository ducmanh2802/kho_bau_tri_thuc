#!/usr/bin/env python3
# Apply fixes to vietnamese/rhymes.ts - add explanation parameter to mc calls

import re

filepath = r"D:\trithuc\kho_bau_luong_b/src/data/vietnamese/rhymes.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# The mc function requires 7-8 arguments: id, skillId, difficulty, prompt, options, correct, explanation (optional: emoji)
# My new T10C mc calls were missing the 7th argument (explanation)
# I need to add the explanation as the 7th argument before any emoji

# Fix strategy: Find each mc call that has only 6 args (correctAnswer without explanation)
# and add the explanation as the 7th arg

# Pattern: mc('id', 'skill', diff, 'prompt', ['opts...'], 'correct')
# Need to add: ', 'explanation' before the closing paren

# Let me use regex to find and fix these patterns

# vn-r12-4: Currently: mc('vn-r12-4', s12, 2, 'Từ "cây" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ "cây" có vần ai.')
# Need: add ', 'Vần ai là i-a-i' after 'vần ai.'

# Use a more direct approach: replace the specific mc call strings

# vn-r12-4
old1 = '''mc('vn-r12-4', s12, 2, 'Từ "cây" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ "cây" có vần ai.')'''
new1 = '''mc('vn-r12-4', s12, 2, 'Từ "cây" có vần nào?', ['ai', 'ay', 'ây', 'ưa'], 'ai', 'Từ "cây" có vần ai.', 'Vần ai là i-a-i')'''

# vn-r12-5
old2 = '''mc('vn-r12-5', s12, 2, 'Từ "bài" có vần nào?', ['ai', 'at', 'am', 'an'], 'ai', 'Từ "bài" có vần ai.')'''
new2 = '''mc('vn-r12-5', s12, 2, 'Từ "bài" có vần nào?', ['ai', 'at', 'am', 'an'], 'ai', 'Từ "bài" có vần ai.', 'Vần ai là i-a-i')'''

# vn-r12-6
old3 = '''mc('vn-r12-6', s12, 3, 'Hai từ "cây" và "bài" cùng có vần "ai". Đúng hay sai?', 'Sai', 'Sai, "cây" vần ay còn "bài" vần ai.')'''
new3 = '''mc('vn-r12-6', s12, 3, 'Hai từ "cây" và "bài" cùng có vần "ai". Đúng hay sai?', 'Sai', 'Sai, "cây" vần ay còn "bài" vần ai.', 'So sánh vần ai và ay')'''

# vn-r13-4
old4 = '''mc('vn-r13-4', s13, 2, 'Từ "tôi" có vần nào?', ['oi', 'ôi', 'ơi', 'ưi'], 'oi', 'Từ "tôi" có vần oi.')'''
new4 = '''mc('vn-r13-4', s13, 2, 'Từ "tôi" có vần nào?', ['oi', 'ôi', 'ơi', 'ưi'], 'oi', 'Từ "tôi" có vần oi.', 'Vần oi là o-i')'''

# vn-r13-5
old5 = '''mc('vn-r13-5', s13, 2, 'Từ "nôi" có vần nào?', ['oi', 'ơi', 'ơm', 'em'], 'oi', 'Từ "nôi" có vần oi.')'''
new5 = '''mc('vn-r13-5', s13, 2, 'Từ "nôi" có vần nào?', ['oi', 'ơi', 'ơm', 'em'], 'oi', 'Từ "nôi" có vần oi.', 'Vần oi là o-i')'''

# vn-r13-6
old6 = '''mc('vn-r13-6', s13, 3, 'Hai từ "tôi" và "nôi" cùng vần "oi". Đúng hay sai?', 'Đúng', 'Đúng, cả hai đều vần oi.')'''
new6 = '''mc('vn-r13-6', s13, 3, 'Hai từ "tôi" và "nôi" cùng vần "oi". Đúng hay sai?', 'Đúng', 'Đúng, cả hai đều vần oi.', 'Cả hai đều có vần oi')'''

# vn-r14-4
old7 = '''mc('vn-r14-4', s14, 2, 'Từ "mùi" có vần gì?', ['ui', 'ưi', 'uí', 'uì'], 'ui', 'Từ "mùi" có vần ui.')'''
new7 = '''mc('vn-r14-4', s14, 2, 'Từ "mùi" có vần gì?', ['ui', 'ưi', 'uí', 'uì'], 'ui', 'Từ "mùi" có vần ui.', 'Vần ui là u-i')'''

# vn-r14-5
old8 = '''mc('vn-r14-5', s14, 2, 'Từ "mui" có vần nào?', ['ui', 'ưi', 'uì', 'ãi'], 'ui', 'Từ "mui" có vần ui.')'''
new8 = '''mc('vn-r14-5', s14, 2, 'Từ "mui" có vần nào?', ['ui', 'ưi', 'uì', 'ãi'], 'ui', 'Từ "mui" có vần ui.', 'Vần ui là u-i')'''

# vn-r14-6
old9 = '''mc('vn-r14-6', s14, 3, 'Hai từ "mùi" và "mui" cùng vần ui. Đúng hay sai?', 'Sai', 'Sai, "mùi" vần ui còn "mui" vần i.')'''
new9 = '''mc('vn-r14-6', s14, 3, 'Hai từ "mùi" và "mui" cùng vần ui. Đúng hay sai?', 'Sai', 'Sai, "mùi" vần ui còn "mui" vần i.', 'Phân biệt vần ui và i')'''

# vn-r15-4
old10 = '''mc('vn-r15-4', s15, 2, 'Từ "cão" có vần gì?', ['ao', 'ơ', 'ô', 'ê'], 'ao', 'Từ "cão" có vần ao.')'''
new10 = '''mc('vn-r15-4', s15, 2, 'Từ "cão" có vần gì?', ['ao', 'ơ', 'ô', 'ê'], 'ao', 'Từ "cão" có vần ao.', 'Vần ao là a-o')'''

# vn-r15-5
old11 = '''mc('vn-r15-5', s15, 2, 'Từ "gạo" có vần gì?', ['ao', 'ô', 'ơ', 'ê'], 'ao', 'Từ "gạo" có vần ao.')'''
new11 = '''mc('vn-r15-5', s15, 2, 'Từ "gạo" có vần gì?', ['ao', 'ô', 'ơ', 'ê'], 'ao', 'Từ "gạo" có vần ao.', 'Vần ao là a-o')'''

# vn-r15-6
old12 = '''mc('vn-r15-6', s15, 3, 'Hai từ "cão" và "gạo" cùng vần ao. Đúng hay sai?', 'Sai', 'Sai, "cão" vần còn "gạo" vần ao.')'''
new12 = '''mc('vn-r15-6', s15, 3, 'Hai từ "cão" và "gạo" cùng vần ao. Đúng hay sai?', 'Sai', 'Sai, "cão" vần còn "gạo" vần ao.', 'So sánh vần ao')'''

applied = 0
for old, new in [(old1, new1), (old2, new2), (old3, new3),
                  (old4, new4), (old5, new5), (old6, new6),
                  (old7, new7), (old8, new8), (old9, new9),
                  (old10, new10), (old11, new11), (old12, new12)]:
    if old in content:
        content = content.replace(old, new)
        applied += 1
        print(f"Applied: {old[:30]}...")
    else:
        print(f"NOT FOUND: {old[:30]}...")

print(f"\nTotal applied: {applied}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")