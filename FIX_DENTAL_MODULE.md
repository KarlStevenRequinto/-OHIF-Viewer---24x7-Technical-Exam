# 🔧 FIX: Dental Module Resolution Errors

## Problem
```
ERROR in ./pluginImports.js 84:27-59
Module not found: Error: Can't resolve '@ohif/extension-dental'

ERROR in ./pluginImports.js 124:27-54
Module not found: Error: Can't resolve '@ohif/mode-dental'
```

## Solution - Run These Commands

### Step 1: Stop the Dev Server
Press `Ctrl+C` in your terminal to stop the running server.

### Step 2: Clean & Reinstall Dependencies

```bash
# From project root directory
yarn install --frozen-lockfile
```

This will:
- ✅ Link the dental extension workspace package
- ✅ Link the dental mode workspace package
- ✅ Install zustand dependency
- ✅ Resolve all module paths

### Step 3: Verify Workspaces are Linked

```bash
# Check if dental extension is linked
yarn workspaces info | findstr "dental"
```

You should see:
```
"@ohif/extension-dental"
"@ohif/mode-dental"
```

### Step 4: Restart Dev Server

```bash
yarn dev:orthanc
```

## What Was Fixed

1. ✅ **package.json** - Added `zustand` dependency to dental extension
2. ✅ **Workspaces** - Yarn will now properly link `@ohif/extension-dental` and `@ohif/mode-dental`
3. ✅ **Module Resolution** - Webpack will find the modules via workspace symlinks

## Verification

After `yarn install` completes, you should see:
```
✨  Done in X.XXs.
```

No errors should appear about missing modules.

## If Issues Persist

If you still see errors after running the above:

### Option A: Deep Clean
```bash
# Remove all node_modules
yarn clean:deep

# Reinstall everything
yarn install --frozen-lockfile
```

### Option B: Manual Workspace Link
```bash
# From project root
cd extensions/dental
yarn install
cd ../..

cd modes/dental
yarn install
cd ../..

# Then from root
yarn install --frozen-lockfile
```

## Expected Result

After running `yarn dev:orthanc`:
- ✅ No module resolution errors
- ✅ Dental mode appears in mode selector
- ✅ Browser loads successfully at http://localhost:3000

---

**Next Step After This Fix:**
See `DENTAL_INTEGRATION_GUIDE.md` for testing instructions.
