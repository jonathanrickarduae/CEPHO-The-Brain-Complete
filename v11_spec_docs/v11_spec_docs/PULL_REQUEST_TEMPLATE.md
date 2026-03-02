# Pull Request

## Grand Master Plan Item Reference

> Every PR must reference at least one item from the Grand Master Plan.
> Find item IDs in `GRAND_MASTER_PLAN.md`.

**Item ID(s):** <!-- e.g. SEC-01, FE-02 -->

**Phase:** <!-- Phase 0 / 1 / 2 / 3 / 4 / 5 -->

---

## What Was Changed

<!-- Describe what was changed and why. Be specific. -->

**Files modified:**
- `path/to/file.ts` — reason
- `path/to/file.tsx` — reason

---

## Root Cause (for bug fixes)

<!-- What was the root cause of the bug? -->

---

## How It Was Tested

<!-- Describe exactly how this was tested. -->

- [ ] Unit test added/updated
- [ ] Tested manually on local dev environment
- [ ] Tested against staging deployment
- [ ] Validation script passed: `python3 scripts/validate.py --check <ITEM_ID>`

**Validation output:**
```
Paste output of validate.py here
```

---

## Expected Behaviour After This PR

<!-- What should happen now that was not working before? -->

**Before:** <!-- e.g. Clicking PDF button navigated to /null -->
**After:** <!-- e.g. Clicking PDF button downloads a PDF from S3 -->

---

## Grade Impact

<!-- Does this fix improve a grade? If so, which workstream and by how much? -->

| Workstream | Before | After |
| :--- | :--- | :--- |
| <!-- e.g. Frontend Stability --> | <!-- e.g. E --> | <!-- e.g. D --> |

---

## Screenshots / Evidence

<!-- Add screenshots, screen recordings, or logs that prove the fix works. -->

---

## Checklist

- [ ] I have read the Grand Master Plan item for this PR
- [ ] The code follows the project's TypeScript standards (no `any` types)
- [ ] I have added/updated tests for this change
- [ ] I have updated `GRADES.md` if this PR improves a grade
- [ ] I have updated `CHANGELOG.md` with a summary of this change
- [ ] I have not introduced any new `console.log` statements in production code
- [ ] I have not hardcoded any secrets, API keys, or environment variables
- [ ] The CI pipeline passes (all jobs green)
