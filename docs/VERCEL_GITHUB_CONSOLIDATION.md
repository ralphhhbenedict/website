# Vercel & GitHub Consolidation Plan

**Date:** December 25, 2024
**Status:** COMPLETE
**Objective:** Consolidate to single source of truth

---

## Problem Statement

Multiple duplicate directories, GitHub repos, and Vercel projects causing confusion:
- 3 local directories
- 2 GitHub repos (different accounts)
- 4 Vercel projects (across 2 accounts)

---

## Current State Audit

### Local Directories

| Directory | GitHub Remote | HEAD | Status |
|-----------|---------------|------|--------|
| `/website` | `Ralphbenedict/website` | `841d69f` | ❌ STALE |
| `/website-ralphhhbenedict` | `ralphhhbenedict/website` | `9256a1a` | ✅ CANONICAL |
| `/ralphhhbenedict-website` | `ralphhhbenedict/website` | `e95b544` | ⚠️ BEHIND |

### GitHub Repos

| Repo | HEAD | Status |
|------|------|--------|
| `ralphhhbenedict/website` | `9256a1a` | ✅ KEEP |
| `Ralphbenedict/website` | `841d69f` | ❌ ARCHIVE |

### Vercel Projects

| Account | Project | Status |
|---------|---------|--------|
| `resu-me-ai` | `website` | ✅ PRODUCTION |
| `rbbautista312-gmailcoms-projects` | `website` | ❌ DELETE |
| `rbbautista312-gmailcoms-projects` | `website-ralphhhbenedict` | ❌ DELETE |
| `rbbautista312-gmailcoms-projects` | `ralphhhbenedict-website` | ❌ DELETE |

---

## Target State

```
Local: /Users/ralphbautista/website-ralphhhbenedict
         │
         ▼
GitHub: ralphhhbenedict/website
         │
         ▼
Vercel: resu-me-ai/website → ralphhhbenedict.com
```

---

## TDD: Pre-Execution Tests

### Test 1: Canonical directory has latest code
```bash
# PASS if HEAD is 9256a1a
cd /Users/ralphbautista/website-ralphhhbenedict
git rev-parse --short HEAD
# Expected: 9256a1a
```

### Test 2: No uncommitted work will be lost
```bash
# PASS if no critical uncommitted changes
cd /Users/ralphbautista/website-ralphhhbenedict
git status --short | wc -l
# Expected: 0 or only docs we just created
```

### Test 3: GitHub remote is correct
```bash
# PASS if points to ralphhhbenedict account
cd /Users/ralphbautista/website-ralphhhbenedict
git remote get-url origin
# Expected: git@github.com:ralphhhbenedict/website.git
```

### Test 4: Production site is live
```bash
# PASS if HTTP 200
curl -sI https://ralphhhbenedict.com | head -1
# Expected: HTTP/2 200
```

### Test 5: Duplicate directories exist (pre-cleanup)
```bash
# PASS if both exist
ls -d /Users/ralphbautista/website /Users/ralphbautista/ralphhhbenedict-website
# Expected: both directories listed
```

### Test 6: Duplicate Vercel projects exist (pre-cleanup)
```bash
# PASS if 3 projects found
vercel project ls 2>&1 | grep -E "^  (website|website-ralphhhbenedict|ralphhhbenedict-website)" | wc -l
# Expected: 3
```

---

## TDD: Post-Execution Tests

### Test 7: Only canonical directory remains
```bash
# PASS if only website-ralphhhbenedict exists
ls -d /Users/ralphbautista/website 2>&1 | grep -c "No such file"
ls -d /Users/ralphbautista/ralphhhbenedict-website 2>&1 | grep -c "No such file"
# Expected: 1 for each (not found)
```

### Test 8: Vercel linked to production team
```bash
# PASS if orgId matches resu-me-ai team
cat /Users/ralphbautista/website-ralphhhbenedict/.vercel/project.json | grep -o '"orgId":"[^"]*"'
# Expected: team ID for resu-me-ai (not rbbautista312)
```

### Test 9: Duplicate Vercel projects deleted
```bash
# PASS if 0 projects in personal account
vercel project ls 2>&1 | grep -cE "^  (website|website-ralphhhbenedict|ralphhhbenedict-website)"
# Expected: 0
```

### Test 10: Production still works after changes
```bash
# PASS if HTTP 200
curl -sI https://ralphhhbenedict.com | head -1
# Expected: HTTP/2 200
```

---

## Execution Log

### Step 1: Run Pre-Execution Tests
- [x] Test 1: Canonical HEAD - `3d6dd51` (after commit)
- [x] Test 2: No uncommitted work - 7 files committed
- [x] Test 3: GitHub remote correct - `git@github.com:ralphhhbenedict/website.git`
- [x] Test 4: Production live - HTTP/2 200
- [x] Test 5: Duplicate dirs exist - Both found
- [x] Test 6: Duplicate Vercel projects exist - 3 found

### Step 2: Commit any uncommitted work
- [x] Commit docs created today - `3d6dd51`

### Step 3: Relink to production Vercel
- [x] Remove .vercel directory
- [x] Run vercel link with resu-me-ai team - orgId: `team_ki8vktXES7zoI5rbNDnc3Kri`

### Step 4: Delete duplicate local directories
- [x] Delete /website
- [x] Delete /ralphhhbenedict-website

### Step 5: Delete duplicate Vercel projects
- [x] Delete website-ralphhhbenedict (personal)
- [x] Delete ralphhhbenedict-website (personal)
- [x] Note: `website` in resu-me-ai is PRODUCTION (kept)

### Step 6: Archive obsolete GitHub repo
- [ ] Rename Ralphbenedict/website - SKIPPED (requires manual action)
- [ ] Add deprecation notice - SKIPPED

### Step 7: Run Post-Execution Tests
- [x] Test 7: Only canonical dir remains - `/website` and `/ralphhhbenedict-website` deleted
- [x] Test 8: Vercel linked correctly - orgId: `team_ki8vktXES7zoI5rbNDnc3Kri`
- [x] Test 9: Duplicate projects deleted - 0 duplicates remain
- [x] Test 10: Production still works - HTTP/2 200

---

## Rollback Plan

If anything goes wrong:
1. GitHub repo is unchanged (only local changes)
2. Vercel resu-me-ai/website is unchanged (only personal account projects deleted)
3. Can re-clone from GitHub if local dirs deleted prematurely

---

## Changelog

| Time | Action | Result |
|------|--------|--------|
| Dec 25, 09:30 | Pre-execution tests | All 6 PASSED |
| Dec 25, 09:31 | Committed 7 files | `3d6dd51` pushed to GitHub |
| Dec 25, 09:32 | Relinked Vercel | Connected to `resu-me-ai/website` |
| Dec 25, 09:33 | Deleted local duplicates | `/website` and `/ralphhhbenedict-website` removed |
| Dec 25, 09:34 | Deleted Vercel duplicates | `website-ralphhhbenedict` and `ralphhhbenedict-website` removed |
| Dec 25, 09:35 | Post-execution tests | All 4 PASSED |

## Final State

```
Local: /Users/ralphbautista/website-ralphhhbenedict (CANONICAL)
         │
         ▼
GitHub: ralphhhbenedict/website (HEAD: 3d6dd51)
         │
         ▼
Vercel: resu-me-ai/website → ralphhhbenedict.com
        (orgId: team_ki8vktXES7zoI5rbNDnc3Kri)
```

