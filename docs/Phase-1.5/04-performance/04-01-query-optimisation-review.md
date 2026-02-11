---
Phase: 1.5
Risk Level: Low
Effort Estimate: 2 hours
Non-breaking: Yes
---

## 4.1 Query Optimisation Review

### Purpose

To improve application performance and reduce database load by identifying and documenting potential N+1 query problems and other inefficient data-fetching patterns in the tRPC API.

### Scope

This is a documentation and review task. It involves analyzing the tRPC query patterns and documenting areas for improvement. It does not involve implementing the optimizations, which would be a code change.

### Current State

- The application uses tRPC for API communication and Prisma as the ORM.
- A review of the codebase suggests that some queries, particularly those fetching lists of items with nested relations, may be susceptible to the N+1 problem.
- For example, fetching a list of 10 projects, and then in a loop, fetching the owner for each project, would result in 1 (for projects) + 10 (for owners) = 11 database queries.

### Recommended Approach

1.  **Identify High-Traffic Queries:** Analyze the tRPC routers to identify the queries that are called most frequently or that fetch lists of data.
2.  **Review Prisma Calls:** For each identified query, inspect the Prisma calls. Look for loops where a database query is made inside the loop.
3.  **Document N+1 Candidates:** Create a list of all potential N+1 queries.
4.  **Propose `include` or `dataloader` Solutions:** For each identified issue, propose a solution.
    - For simple cases, using Prisma's `include` option is sufficient.
    - For more complex cases, a `dataloader` pattern can be used to batch the nested queries into a single database call.

#### Illustrative Code Snippet (N+1 problem and solution)

```typescript
// N+1 Problem (illustrative / not yet enforced)
const projects = await db.project.findMany();
const projectsWithOwners = await Promise.all(
  projects.map(async (project) => {
    const owner = await db.user.findUnique({ where: { id: project.ownerId } });
    return { ...project, owner };
  })
);

// Solution with `include` (illustrative / not yet enforced)
const projectsWithOwners = await db.project.findMany({
  include: {
    owner: true, // Prisma handles the join efficiently
  },
});
```

### Non-breaking Confirmation

This is a documentation-only task in Phase 1.5 and is therefore non-breaking. The subsequent implementation of these optimizations is also non-breaking, as it would only change the performance of the queries, not the data they return.

### Phase Boundary Notes

- **Phase 1.5:** Document all potential query inefficiencies.
- **Phase 2 Follow-ups:** Allocate development time in Phase 2 sprints to implement the documented optimizations, starting with the highest-impact queries.

---

Ready for GitHub commit: Yes
