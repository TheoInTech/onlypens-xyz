# OnlyPens Subgraph

This subgraph indexes events from the OnlyPens Escrow smart contract to provide fast and efficient data access for the OnlyPens platform frontend.

## Overview

The OnlyPens subgraph tracks all important events in the platform's lifecycle:

- Gig package creation and deliverable setup
- Ghostwriter invitations, acceptances, and declines
- Content submission and revision processes
- Approval, rejection, and payment workflows
- Package completion, cancellations, and expiration

## Schema Entities

### GigPackage

Represents a content gig with deliverables. Maps to the smart contract's `GigPackage` struct.

### Deliverable

Represents a single content deliverable within a gig package. Maps to the smart contract's `Deliverable` struct.

### GhostwriterInvitation

Tracks invitations sent to ghostwriters and their status.

### ActivityEvent

Records all contract events as activities for UI display.

### PaymentEvent

Tracks payment releases for deliverables.

### User

Stores user statistics (packages created, assigned, earnings, etc.)

### GlobalStats

Maintains platform-wide statistics.

## Integration Points

### Smart Contract Events

The subgraph listens for these events from the OnlyPensEscrow contract:

1. `GigPackageCreated(indexed uint256, indexed address, uint256, uint256)`
2. `DeliverableCreated(indexed uint256, indexed uint256, string, uint256)`
3. `GhostwriterInvited(indexed uint256, indexed address)`
4. `InvitationAccepted(indexed uint256, indexed address)`
5. `InvitationDeclined(indexed uint256, indexed address)`
6. `DeliverableSubmitted(indexed uint256, indexed uint256, indexed address)`
7. `DeliverableRevised(indexed uint256, indexed uint256, indexed address)`
8. `DeliverableApproved(indexed uint256, indexed uint256, indexed address)`
9. `DeliverableRejected(indexed uint256, indexed uint256, indexed address)`
10. `PaymentReleased(indexed uint256, indexed uint256, indexed address, uint256)`
11. `GigPackageCompleted(indexed uint256)`
12. `GigPackageCancelled(indexed uint256)`
13. `GigPackageExpired(indexed uint256)`

### Frontend Integration

The web application integrates with the subgraph through GraphQL queries defined in `web/src/lib/subgraph-client.ts` using the @urql/core library. Data adapters in `web/src/lib/subgraph-adapter.ts` convert the subgraph response format to match the application's schema format.

## Flow Diagram

User -> App Frontend -> Smart Contract -> Events -> Subgraph -> GraphQL API -> App Frontend

## Deployment

1. Install the Graph CLI: `npm install -g @graphprotocol/graph-cli`
2. Update contract address in `subgraph.yaml`
3. Build the subgraph: `graph build`
4. Deploy to hosted service or self-hosted Graph Node

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Update contract details in `subgraph.yaml`
4. Generate types: `graph codegen`
5. Build: `graph build`

## Queries

The subgraph supports querying:

- Gig packages (by ID, creator, writer, status)
- Deliverables (by ID, package, status)
- Invitations (by ghostwriter, status)
- Activities (by package, type, timestamp)
- Payment events (by package, sender, receiver)
- User statistics
- Platform statistics

## Data Synchronization

The subgraph indexes historical blockchain events for permanent storage, while the application stores off-chain metadata (like content details and drafts) in Firestore. The combination provides a complete view of all platform activity.

## Example Queries

### Fetch a Specific Gig Package

```graphql
{
  gigPackage(id: "1") {
    id
    creator
    writer
    totalAmount
    createdAt
    status
    deliverables {
      id
      contentType
      status
      amount
    }
  }
}
```

### Fetch User's Created Packages

```graphql
{
  gigPackages(where: { creator: "0xYourAddress" }) {
    id
    totalAmount
    createdAt
    status
    numDeliverables
    numApproved
  }
}
```

### Fetch Package Activities

```graphql
{
  activityEvents(
    where: { package: "1" }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    eventType
    timestamp
    creator
    writer
  }
}
```
