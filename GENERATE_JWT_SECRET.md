# How to Generate JWT_SECRET

## Where is JWT_SECRET used?

`JWT_SECRET` is used in `server/index.cjs` (line 8) to sign and verify JWT tokens for user authentication. It's a secret key that should be:
- **Long and random** (at least 32 characters)
- **Kept secret** (never commit to git)
- **Unique** for each environment (dev, staging, production)

---

## How to Generate JWT_SECRET

### Method 1: Online Generator (Easiest)
1. Visit: https://www.grc.com/passwords.htm
2. Set length to 64 characters
3. Click "Generate"
4. Copy the generated string

### Method 2: PowerShell (Windows)
Open PowerShell and run:
```powershell
-join ((1..64) | ForEach-Object { Get-Random -Minimum 33 -Maximum 127 | ForEach-Object {[char]$_} })
```

Or use this simpler command:
```powershell
New-Guid | ForEach-Object { ($_.ToString() + (New-Guid).ToString() + (New-Guid).ToString()) -replace '-','' }
```

### Method 3: Node.js (If you have Node installed)
Run in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 4: Python (If you have Python installed)
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Method 5: OpenSSL (If you have Git Bash or WSL)
```bash
openssl rand -hex 32
```

---

## Example Generated Secret

A good JWT_SECRET looks like this:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2
```

Or a hexadecimal version:
```
f8a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2
```

---

## How to Set JWT_SECRET in Render

1. **Go to your Render dashboard**
2. **Select your backend service**
3. **Click "Environment" tab**
4. **Click "Add Environment Variable"**
5. **Enter:**
   - Key: `JWT_SECRET`
   - Value: (paste your generated secret)
6. **Click "Save Changes"**
7. Render will automatically redeploy with the new secret

---

## Important Notes

⚠️ **Never use the default secret** (`dev_secret_change_me`) in production!
⚠️ **Never commit JWT_SECRET to git** - always use environment variables
⚠️ **Use different secrets** for development, staging, and production
⚠️ **Keep it secret** - if someone gets your JWT_SECRET, they can forge authentication tokens

---

## Quick Copy-Paste for Render

If you want a quick secret, you can use this one (but it's better to generate your own):
```
K7mN9pQ2rT4vW6xY8zA0bC1dE3fG5hI7jK9lM1nO3pQ5rS7tU9vW1xY3zA5bC7dE9fG1
```

Just copy it and paste into Render's `JWT_SECRET` environment variable.

