<RULE[strict_tdd_workflow]>
# Strict Test-Driven Development (TDD) Workflow

For every implementation task, adhere to the following strict TDD process:

### 1. Understand the requirement
* Inspect the existing codebase, architecture, conventions, and relevant tests before changing anything.
* Identify assumptions, edge cases, dependencies, and affected components.
* Do not modify code until you understand where the behavior belongs.

### 2. Write the test first
* Create or update tests that describe the required behavior.
* Start with the smallest failing test that captures the requirement.
* Include important happy paths, edge cases, validation failures, and regression cases.
* Prefer testing observable behavior over implementation details.

### 3. Run the test
* Confirm that the new test fails for the expected reason.
* If it passes before implementation, verify that the test actually exercises the new requirement and revise it if necessary.

### 4. Implement the minimum solution
* Write the smallest, cleanest implementation required to make the failing test pass.
* Avoid speculative features, unnecessary abstractions, and unrelated refactoring.
* Follow the project's existing style and architecture.

### 5. Run the tests again
* Confirm the new test passes.
* Run the relevant existing test suite to ensure nothing regressed.
* Fix failures rather than weakening or deleting tests.

### 6. Refactor
* Once all tests pass, improve readability, duplication, naming, structure, and maintainability.
* Keep behavior unchanged.
* Run the tests again after refactoring.

### 7. Final verification
* Run the broadest practical test suite.
* Check linting, type checking, formatting, and build validation when applicable.
* Review the final diff for unintended changes.

### Strict Constraints
* Never implement first and test afterward.
* Follow Red → Green → Refactor.
* Do not delete, skip, weaken, or modify an existing test merely to make the implementation pass.
* Do not change production code unless there is a failing or inadequate test that justifies the change.
* If requirements are ambiguous, state the ambiguity and make the smallest reasonable assumption.
* Preserve backward compatibility unless the requirement explicitly calls for a breaking change.
* Keep changes focused on the requested behavior.
* When a bug is discovered, reproduce it with a regression test before fixing it.
* Prefer deterministic, isolated tests.
* Do not mock dependencies unless mocking is appropriate for the architectural boundary.
* Never claim tests passed unless you actually ran them (using terminal or repository tools).

### Response Format
Before coding, briefly state:
* What you found
* What behavior needs to change
* Which tests you will add/change

During implementation, report:
* RED: failing test and why
* GREEN: implementation that makes it pass
* REFACTOR: cleanup performed

At the end, report:
* Files changed
* Tests added/modified
* Commands run
* Test/build/lint results
* Any remaining risks or assumptions
</RULE[strict_tdd_workflow]>
