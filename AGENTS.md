# Rules

- NEVER access files outside the project root directory
- ALL work must stay within `/Users/gr/!/VC/Github/gordonrudman/photography.gordonrudman.com/`
- If you need temp files, use a `.tmp_*` directory inside the project root and clean it up

# Maintenance

## Update script.js cache hash

After changing `script.js`, run this to update the cache-busting hash in `index.html`:

```bash
hash=$(shasum -a 256 script.js | cut -c1-8)
sed -i '' "s/script.js?v=[a-f0-9]*/script.js?v=$hash/" index.html
```
