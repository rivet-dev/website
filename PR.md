# PR Summary

## Title
Fix contact form submit crash and incorrect changelog link

## Summary
This fix addresses a real runtime bug in the marketing contact forms and corrects the footer navigation for the changelog route.

## Changes made
- Fixed invalid `FormData` conversion in the sales and engineer contact forms.
- Replaced `formData.entries().toArray()` with `Array.from(formData.entries())` to ensure the form data is converted correctly.
- Corrected the footer changelog link from `/blog/` to `/changelog/`.

## Files changed
- `src/components/marketing/talk-to-an-engineer/form.tsx`
- `src/components/marketing/sales/form.tsx`
- `src/components/Footer.jsx`

## Why this was needed
The contact forms were throwing at submit time because `FormData.entries()` does not support `.toArray()`. This caused the lead capture flow to break. The changelog link was also routing to the wrong section.

## Verification status
I ran the build check with:

```bash
pnpm build
```

The build is currently failing before the app compiles because of an environment-level Windows symlink permission issue in:

- `scripts/assemble.ts`

with the following error:

```bash
Error: EPERM: operation not permitted, symlink '..\..\..\vendor\actors\docs\content' -> 'C:\Users\Manish Tiwari\Desktop\New Company Target\website\src\content\docs\actors'
```

Because the build is still failing, this is not ready to be pushed as a GitHub PR yet.
