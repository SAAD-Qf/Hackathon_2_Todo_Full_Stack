<!--
  Sync Impact Report:
  - Version change: [TEMPLATE] → 1.0.0
  - New constitution created for Evolution of Todo - Phase I
  - Principles defined: 6 core principles for Spec-Driven Development
  - Templates status:
    ✅ spec-template.md - aligned with user story approach
    ✅ plan-template.md - aligned with constitution check requirements
    ✅ tasks-template.md - aligned with modular task structure
  - Follow-up TODOs: None - all placeholders filled
-->

# Evolution of Todo — Phase I Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

All implementation MUST derive from written specifications. No code shall be written without a corresponding specification that defines:
- Feature requirements and acceptance criteria
- Expected inputs and outputs
- Edge cases and error conditions

**Rationale**: Spec-Driven Development ensures that every line of code has a documented purpose and can be traced back to a requirement. This prevents scope creep and maintains implementation clarity.

### II. Single Responsibility

Each function MUST have one clear, testable purpose. Functions shall:
- Perform exactly one operation
- Have descriptive names that indicate their purpose
- Accept explicit parameters (no hidden dependencies)
- Return predictable outputs

**Rationale**: Single responsibility enables easier testing, debugging, and maintenance. Each function becomes a self-contained unit that can be understood and modified independently.

### III. In-Memory Simplicity

Phase I MUST maintain zero external dependencies:
- Storage: In-memory Python list only
- No database connections
- No file I/O operations
- No network calls
- No third-party libraries beyond Python standard library

**Rationale**: Simplicity reduces complexity and focuses development on core functionality. External dependencies can be added in later phases once the core logic is proven.

### IV. Console Interface

User interaction MUST occur through a text-based console menu:
- Clear menu options displayed to user
- Numeric or character-based selection
- Input validation with helpful error messages
- Clean output formatting

**Rationale**: Console interfaces provide immediate feedback and are platform-independent, making them ideal for MVP development and testing.

### V. Minimal Global State

Global variables are PROHIBITED except for:
- The in-memory task list (single source of truth)

All other state MUST be:
- Passed as function parameters
- Returned as function results
- Scoped locally within functions

**Rationale**: Minimizing global state prevents hidden dependencies, makes testing easier, and reduces the risk of unexpected side effects.

### VI. Iterative Refinement Through Specs

When implementation produces incorrect output:
- DO NOT modify code directly
- DO refine the specification to clarify requirements
- DO regenerate implementation from updated spec
- DO document what was unclear in the original spec

**Rationale**: This principle enforces the Spec-Driven Development contract. If the spec was clear, the implementation would be correct. Incorrect output indicates ambiguous or incomplete specifications.

## Development Workflow

### Specification Phase

1. Write feature specification with:
   - User stories with priorities (P1, P2, P3)
   - Acceptance scenarios (Given/When/Then)
   - Functional requirements (FR-001, FR-002, etc.)
   - Success criteria (measurable outcomes)

2. Review specification for completeness:
   - All edge cases documented
   - All error conditions specified
   - All inputs and outputs defined

3. Obtain approval before proceeding to implementation

### Implementation Phase

1. Generate implementation ONLY from approved specification
2. Implement features in priority order (P1 → P2 → P3)
3. Test each feature against acceptance scenarios
4. If output is incorrect, return to Specification Phase

### Validation Phase

1. Verify all acceptance scenarios pass
2. Verify all functional requirements met
3. Verify all success criteria achieved
4. Document any deviations or clarifications needed

## Technical Constraints

**Language**: Python 3.x (standard library only)

**Architecture**: Single-file console application

**Data Structure**: Python list of dictionaries, where each task is:
```python
{
    "id": int,           # Unique identifier
    "title": str,        # Task title
    "description": str,  # Task description
    "completed": bool    # Completion status
}
```

**Required Features** (Phase I MVP):
- Add Task
- Delete Task (by ID)
- Update Task (title or description)
- View Tasks (all)
- Mark Complete/Incomplete (toggle)

**Prohibited**:
- External libraries (except Python stdlib)
- File persistence
- Database connections
- Network operations
- GUI frameworks

## Quality Standards

### Code Quality

- Functions MUST have descriptive names (verb + noun pattern)
- Functions MUST include docstrings explaining purpose
- Input validation MUST occur at function boundaries
- Error messages MUST be user-friendly and actionable

### Testing Approach

- Manual testing via console interaction
- Each feature MUST be testable independently
- Test cases MUST match acceptance scenarios from spec

### Documentation

- Specification MUST be maintained in `specs/` directory
- Implementation plan MUST reference specification
- Any spec refinements MUST be documented with rationale

## Governance

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing specifications
3. Update constitution version following semantic versioning:
   - MAJOR: Breaking changes to core principles
   - MINOR: New principles or sections added
   - PATCH: Clarifications or wording improvements
4. Update all dependent templates and documentation

### Compliance

- All code reviews MUST verify compliance with constitution
- Violations MUST be justified in writing or corrected
- Complexity beyond these principles MUST be explicitly approved

### Version Control

This constitution supersedes all other development practices for Phase I.

**Version**: 1.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
