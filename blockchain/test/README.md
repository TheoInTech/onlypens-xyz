# OnlyPens Contract Tests

This directory contains comprehensive tests for the OnlyPens escrow contract. The tests cover all major contract functionalities including:

- Package creation
- Ghostwriter invitation and acceptance/declination
- Deliverable submission
- Approval and rejection of deliverables
- Payment release
- Package cancellation and expiry
- Force release after timeout
- View functions

## Running the Tests

To run all tests:

```bash
npx hardhat test
```

To run only the OnlyPens tests:

```bash
npx hardhat test test/OnlyPens.ts
```

To run with gas reporting:

```bash
REPORT_GAS=true npx hardhat test test/OnlyPens.ts
```

## Test Structure

The tests are organized by functional area:

1. **Deployment**: Tests for contract initialization and ownership
2. **Gig Package Creation**: Tests for creating packages with deliverables
3. **Ghostwriter Invitations**: Tests for inviting ghostwriters to packages
4. **Invitation Acceptance and Declination**: Tests for ghostwriters accepting/declining invitations
5. **Deliverable Submission**: Tests for submitting deliverables
6. **Deliverable Approval and Rejection**: Tests for approving and rejecting deliverables
7. **Package Cancellation**: Tests for cancelling packages
8. **Package Expiry**: Tests for package expiry functionality
9. **Force Release**: Tests for force releasing payments after timeout
10. **View Functions**: Tests for view functions and pagination
11. **Owner Functions**: Tests for admin functions like token recovery

Each section includes both happy path tests and expected error cases to ensure proper contract behavior in all scenarios.
