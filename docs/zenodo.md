# Zenodo Archiving & DOI

Zenodo gives PoHI a **permanent, citable DOI** with no endorsement or moderation
gate — unlike arXiv. This is the canonical reference we link to from ResearchHub,
the README, and the paper's citation.

The repository ships a [`.zenodo.json`](../.zenodo.json) at the root. Zenodo reads
it automatically on each GitHub release, so title, authors, ORCID, license, and
keywords stay correct without touching the Zenodo UI.

## One-time setup (GitHub ↔ Zenodo)

1. Sign in at <https://zenodo.org/> with the GitHub account that owns
   `pohi-protocol/pohi`.
2. Go to <https://zenodo.org/account/settings/github/> and flip the toggle
   **ON** for the `pohi-protocol/pohi` repository.
3. (Optional) Open the repo row to copy the **Zenodo badge** — it contains the
   numeric record/concept DOI you will paste into the README placeholders.

> Zenodo only archives releases created **after** the toggle is switched on.
> An existing release will not be picked up retroactively — cut a fresh one.

### Troubleshooting: only personal repos show up (no `pohi-protocol/`)

Zenodo lists only `eltociear/...` and not the org's `pohi-protocol/pohi`. This is
because `pohi` lives in a **GitHub organization**, and Zenodo's OAuth app has not
been granted third-party access to that org. Fix it from the GitHub side:

1. GitHub → your avatar → **Settings → Applications → Authorized OAuth Apps → Zenodo**.
2. Under **Organization access**, find `pohi-protocol` and click **Grant**
   (if you see **Request**, an org owner must approve — you are the owner, so Grant).
   - If the org enforces an OAuth policy, set it at
     `https://github.com/organizations/pohi-protocol/settings/oauth_application_policy`
     and approve Zenodo there.
3. Back on Zenodo's GitHub settings page, click **Sync** (top-right). The list is
   cached — the screenshot showed "updated 2 years ago", so a manual sync is needed.
4. `pohi-protocol/pohi` should now appear; flip its switch **ON**.

Notes:
- The repo must be **public** — Zenodo does not archive private repos (`pohi` is public ✓).
- You need **admin** on the repo.

## Cutting a release (mints / updates the DOI)

```bash
# from the repo root, on main, working tree clean
git tag -a v0.3.0 -m "PoHI v0.3.0"
git push origin v0.3.0
```

Then publish it as a GitHub Release (Zenodo triggers on *published releases*, not
bare tags):

```bash
gh release create v0.3.0 \
  --title "PoHI v0.3.0" \
  --notes "Reference implementation + paper. See CHANGELOG.md."
```

Within a minute or two Zenodo archives the repo and mints two DOIs:

| DOI | What it points to | Use it for |
|-----|-------------------|------------|
| **Concept DOI** (`Cite all versions`) | The project, always resolving to the latest version | README badge, citations, ResearchHub |
| **Version DOI** | This specific release (e.g. v0.3.0) | Reproducibility, "I used exactly this" |

## After the first release

Replace the `ZENODO_RECORD_ID` placeholders with the **concept DOI** number in:

- `README.md` — the DOI badge (top) and the `### Citation` block
- `paper/README.md` — status line
- `CITATION.cff` if/when added

Then update `.zenodo.json` only if metadata changes; routine releases need no edits.

## Optional: a standalone DOI for the PDF

The release above archives the *whole repo* as `upload_type: software`. If you also
want a paper-specific record (some readers prefer a pure preprint DOI):

1. <https://zenodo.org/uploads/new>
2. Upload `paper/main.pdf`, set **Resource type → Publication → Preprint**.
3. Reuse the same title / authors / ORCID / keywords as `.zenodo.json`.
4. Link it back with **Related works → "is supplemented by" → the software DOI**.

Cite whichever fits the venue; for ResearchHub the software concept DOI is fine
since it covers both code and paper.
