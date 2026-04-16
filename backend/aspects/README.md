# Backend Mutation Aspects

## Purpose

This folder contains reusable AOP-style wrappers for backend mutation flows.
The goal is to keep service mutation handlers focused on core business logic,
while cross-cutting concerns are composed around them.

## Mutation Context Contract

Each mutation handler receives a `ctx` object with the following shape:

```js
{
  app,
  userId,
  params,
  body,
  session,
  resources,
  meta
}
```

- `app`: Express app instance, used by socket and activity utilities.
- `userId`: authenticated user id from `authMiddleware`.
- `params`: route params needed by the mutation.
- `body`: request payload.
- `session`: optional mongoose session for transactional flows.
- `resources`: hydrated domain objects loaded by access aspects.
- `meta`: transient data such as old snapshots for audit logging.

## Recommended Mutation Flow

Successful path:

1. `withValidation`
2. `withAccessControl`
3. `withTransaction`
4. `coreHandler`
5. `withAuditLog`
6. `withSocketEmit`

`withErrorBoundary` should wrap the whole chain so errors from every stage are
normalized without changing the API contract.

## Current Pilot

`backend/services/boardListService.js` is the first migrated mutation module.
It is the reference implementation for future rollouts to boards, cards,
comments, checklist items, and workspace mutations.

## Notes About Transactions

`withTransaction` is ready for multi-write flows, but services must pass
`ctx.session` into mongoose operations to fully benefit from rollback behavior.
Single-write mutations can keep the aspect disabled.
