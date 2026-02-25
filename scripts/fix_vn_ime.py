#!/usr/bin/env python3
"""Apply Option 3 Vietnamese IME fix to Claude Code cli.js"""

import sys
from pathlib import Path

CLI_PATH = Path(r"C:\Users\Admin\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\cli.js")

print("Reading cli.js...")
content = CLI_PATH.read_text(encoding="utf-8")
print(f"Size: {len(content):,} chars")

# The DEL char in the file is actual 0x7F byte
DEL = "\x7f"

# Find the exact block using the DEL byte
marker = f'a.includes("{DEL}")'
idx = content.find(marker)
if idx < 0:
    if "/* VN IME fix" in content:
        print("Already patched!")
        sys.exit(0)
    print("ERROR: DEL block not found")
    sys.exit(1)

print(f"Found DEL handler at index {idx}")

# Find the full if block
start = content.rfind("if(", max(0, idx - 200), idx)
depth = 0
end = start
for i in range(start, min(len(content), start + 2000)):
    if content[i] == "{":
        depth += 1
    elif content[i] == "}":
        depth -= 1
        if depth == 0:
            end = i + 1
            break

old_code = content[start:end]
print(f"Original block: {len(old_code)} chars")
print(f"  {old_code[:80]}...")

# Build Option 3 fix with the SAME variable names from the file
# Original: delete old + return (missing insert)
# Fix: delete old + INSERT NEW + return
new_code = (
    f'/* VN IME fix - Option 3 */'
    f'if(!H6.backspace&&!H6.delete&&a.includes("{DEL}")){{'
    f'let e=(a.match(/\\x7f/g)||[]).length,_6=L;'
    f'for(let D6=0;D6<e;D6++)_6=_6.deleteTokenBefore()??_6.backspace();'
    f'let R1=a.replace(/\\x7f/g,"");'
    f'for(let c1 of R1)_6=_6.insert(c1);'
    f'if(!L.equals(_6)){{if(L.text!==_6.text)q(_6.text);v(_6.offset)}}'
    f'fb6(),Vb6();return}}'
)

print(f"New block: {len(new_code)} chars")

# Apply
patched = content[:start] + new_code + content[end:]
CLI_PATH.write_text(patched, encoding="utf-8")

# Verify
verify = CLI_PATH.read_text(encoding="utf-8")
if "/* VN IME fix - Option 3 */" in verify:
    print("\nSUCCESS! Option 3 applied.")
    print("  + Delete old chars (original)")
    print("  + Filter DEL from input (NEW)")
    print("  + Insert replacement chars (NEW)")
    print("  + Return")
    print("\nRESTART Claude Code now!")
else:
    print("\nERROR: Verification failed!")
    sys.exit(1)
