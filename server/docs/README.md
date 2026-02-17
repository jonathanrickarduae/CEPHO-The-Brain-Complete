# Server Documentation

This directory contains technical documentation for the CEPHO.AI backend server.

## Documents

### [SQL_SAFETY.md](./SQL_SAFETY.md)
**Critical security documentation** explaining why our SQL queries are safe from injection attacks.

**Read this if:**
- You're doing a security audit
- You see `sql` template tags and think they're unsafe
- You're considering converting SQL queries to query builder
- You're new to the codebase and reviewing database code

**Key Takeaway**: All 86 SQL queries in this codebase use Drizzle's parameterized `sql` template tag and are SAFE from SQL injection.

## Future Documentation

As the codebase grows, add documentation for:
- Architecture decisions (ADRs)
- API design patterns
- Service layer structure
- Database schema evolution
- Deployment procedures
- Performance optimization strategies

---

**Last Updated**: February 17, 2026
