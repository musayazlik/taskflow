## Summary
Refactor the `apps/web/app/(panel)/panel` dialog/modals structure so page code stays thin and dialog-related code is organized into small, single-responsibility components with consistent naming.

The focus of this iteration is `users` (currently more “UI-heavy” inside dialog components) and aligning `tasks` toward the same controlled pattern where beneficial.

## Goals
- Make dialog implementations easier to navigate and maintain by:
  - Splitting large dialog components into smaller parts (header, fields, error UI, action footer, etc.).
  - Standardizing naming and file structure for create/edit/delete dialogs.
- Keep state ownership predictable via the **Parent-controlled** pattern:
  - `UsersPageClient` (and optionally `TasksPageClient`) owns `open`, form values, submitting state, and submit handlers.
  - Dialog components are mostly controlled UI surfaces.
- Reduce prop confusion by defining clear interfaces for each dialog surface and its subcomponents.

## Non-goals
- Changing backend API behavior or response formats.
- Redesigning the UI theme beyond what is needed for extraction/refactor.
- A sweeping refactor across unrelated components beyond dialogs in `panel/users` and `panel/tasks`.

## Current Observations
- `panel/tasks` dialogs (`task-create-dialog`, `task-edit-dialog`, `task-delete-dialog`) already use a controlled UI approach:
  - Parent holds form values (`title/description/status/assigneeId`) and submit logic.
  - Dialog components mainly render `Dialog`/`AlertDialog` and bind inputs.
- `panel/users` dialogs (`create-user-dialog`, `edit-user-dialog`, `delete-user-dialog`) currently:
  - Have more internal state (form values, validation, API calls, toast calls) inside the dialog components.
  - Contain large UI blocks, which makes extraction difficult and naming inconsistent as the dialog grows.

## Proposed Architecture (Parent-controlled)

### State ownership
- In `UsersPageClient`:
  - `isCreateOpen`, `createSubmitting`, `createForm`, `createErrors`
  - `isEditOpen`, `editSubmitting`, `selectedUser`, `editForm`, `editErrors`
  - `isDeleteOpen`, `deleteSubmitting`, `selectedUser`
- Submit handlers (create/edit/delete) live in the parent:
  - Perform validation, call `userService`, handle success/error, call `onSuccess`/`reload` callbacks, and close dialogs.
- Dialog components receive controlled props and only:
  - Render the dialog UI.
  - Call `onSubmit` provided by parent.
  - Render errors provided by parent.

### Wrapper (optional but recommended)
- Create a small wrapper component per resource to keep page markup clean:
  - `users-dialogs.tsx` renders `UserCreateDialog`, `UserEditDialog`, `UserDeleteDialog`.
  - It forwards controlled props and ensures consistent placement in the page.
- This wrapper is optional; if the page already remains readable, we can render dialogs directly like tasks does.

## Component Breakdown (Users)

### File structure (target)
`apps/web/app/(panel)/panel/users/components/dialogs/`
- `users-dialogs.tsx` (optional wrapper)
- `user-create-dialog.tsx`
- `user-edit-dialog.tsx`
- `user-delete-dialog.tsx`
- `components/fields/`
  - `user-name-email-fields.tsx` (shared for create/edit)
  - `user-role-select.tsx` (shared for create/edit)
  - `user-password-field.tsx` (create-only)
- `components/ui/`
  - `user-dialog-error-box.tsx` (shared rendering for field/submit errors)
  - `user-dialog-header.tsx` (shared header block, or per-dialog header if copy differs)

> Naming rule: prefer `user-*` for users; prefer `task-*` for tasks. Avoid mixing `CreateUserDialog`/`EditUserDialog` casing styles across files.

### Subcomponent responsibilities (examples)
- `user-dialog-header.tsx`
  - Renders icon + title + description.
  - Receives strings and optionally icon component.
- `user-name-email-fields.tsx`
  - Renders `Full Name` and `Email` inputs.
  - Controlled via `name`, `email`, `onNameChange`, `onEmailChange`, and `errors`.
- `user-role-select.tsx`
  - Renders `Role` select.
  - Controlled via `role` and `onRoleChange`.
  - Uses role option rendering (icons/labels) but does not call API.
- `user-password-field.tsx` (create-only)
  - Renders password input + show/hide toggle.
  - May expose a controlled `password` value and optional `onGeneratePassword` handler if password generation remains parent-controlled.
- `user-dialog-error-box.tsx`
  - Displays `errors` in a uniform place (field-level and/or submit-level).
- `user-create-dialog.tsx`
  - Composes header + fields + error box + footer.
  - `onSubmit` is a callback from parent.
- `user-edit-dialog.tsx`
  - Composes header + name/email/role fields + error box + footer.
  - Uses `user` passed as `selectedUser` (if needed); if the component depends on it, it renders `null` when missing.
- `user-delete-dialog.tsx`
  - Uses `AlertDialog` for confirm UI.
  - Displays the selected user’s name and calls `onConfirm` from parent.

## Component Breakdown (Tasks alignment)
- `panel/tasks/components/` already looks close to the desired controlled pattern.
- If we extract small field subcomponents there, prefer:
  - `task-dialog-title/description` as shared blocks (if repeated).
  - `task-status-select` and `task-assignee-select` as shared field components.
- Do not change parent-controlled boundaries for tasks unless it reduces duplication without increasing prop complexity.

## Naming Conventions
- File names:
  - Prefer kebab-case: `user-create-dialog.tsx`, `user-delete-dialog.tsx`.
  - Use plural wrapper naming: `users-dialogs.tsx` for resource-level composition.
- Component names:
  - Use PascalCase for exported components: `UserCreateDialog`, `UserEditDialog`, `UserDeleteDialog`.
  - Keep internal subcomponents in `components/fields/*` and `components/ui/*` with clear names matching their UI responsibility.
- Prop naming:
  - `open`, `onOpenChange`
  - `submitting`
  - `form` fields naming aligned with domain: `name/email/role/password` or `title/description/status/assigneeId`.
  - `errors` structure should be explicit: `errors.submit`, `errors.name`, etc.

## Error Handling Policy
- Parent owns:
  - Validation logic
  - API error mapping into `errors` passed to dialog components
  - Toast messages (unless product wants to centralize to dialog components; for this refactor, keep it in parent to keep dialogs pure-ish).
- Dialog components only render errors and disable buttons when `submitting` is true.

## Testing / Verification Plan (high level)
- Manual verification:
  - Users create/edit/delete dialogs open/close properly.
  - Validation messages show in the expected fields.
  - Submitting disables correct actions and re-enables on failure.
  - Tasks dialogs remain unaffected (or changes stay within identical behavior).
- If the project already has component tests, add/adjust tests only when there is an existing test harness for dialogs.

