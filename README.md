# asignment_project_nhom3

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run migrate:workspace-last-active`

Runs a one-time backfill to set `lastActive` on legacy `WorkspaceMember` records that are missing this field.

### `npm run test:backend`

Runs backend unit tests using Node's built-in test runner.

### `npm run migrate:soft-delete-deleted-at`

Runs a one-time backfill to set explicit `deletedAt: null` for legacy records in soft-delete entities.

## Workspace Member `lastActive`

- `WorkspaceMember` now includes `lastActive` as a `Date` field.
- Default value is `Date.now` for newly created members.
- The field is nullable for legacy compatibility, and legacy rows are backfilled on server startup.
- Validation rejects future timestamps for `lastActive`.
- Active members are indexed by `{ workspaceId, lastActive }` to support sorting by recent activity.
- `GET /api/workspaces/:workspaceId/members` returns `lastActive` in each member payload.

## Soft Delete Guideline

- Scope implemented: `workspace`, `board`, `board_list`, `card`, `comment`, `checklist`, `checklist_item`, `attachment`, `board_member`, `card_member`, `workspace_member`.
- All delete APIs in this scope now mark records by setting `deletedAt = new Date()` (no physical delete).
- Read APIs (`list/get`) in this scope now filter with `deletedAt: null` by default.
- Access checks for board/list/card paths also ignore soft-deleted parent records.
- Existing API contract is preserved (status code and response shape unchanged).

### When to Soft Delete vs Hard Delete

- Use **soft delete** for business entities and relationships required for audit, restore, and incident recovery.
- Use **hard delete** only for technical/ephemeral data (for example OTP/session cleanup) that is explicitly approved to be non-recoverable.
