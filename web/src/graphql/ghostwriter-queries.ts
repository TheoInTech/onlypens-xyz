import { gql } from "graphql-request";

// Get all invitations for a ghostwriter
export const GET_GHOSTWRITER_INVITATIONS = gql`
  query GetGhostwriterInvitations(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
  ) {
    invitations(
      where: { ghostwriter: $ghostwriterId }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      status
      invitedAt
      respondedAt
      package {
        id
        packageId
        creator {
          id
        }
        totalAmount
        expiresAt
        isExpired
        createdAt
        transactionHash
      }
      transactionHash
    }
  }
`;

// Get all accepted invitations
export const GET_GHOSTWRITER_ACCEPTED_INVITATIONS = gql`
  query GetGhostwriterAcceptedInvitations(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
  ) {
    invitations(
      where: { ghostwriter: $ghostwriterId, status: ACCEPTED }
      first: $first
      skip: $skip
      orderBy: "respondedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      respondedAt
      package {
        id
        packageId
        creator {
          id
        }
        totalAmount
        status
        expiresAt
        createdAt
        transactionHash
      }
      transactionHash
    }
  }
`;

// Get all declined invitations
export const GET_GHOSTWRITER_DECLINED_INVITATIONS = gql`
  query GetGhostwriterDeclinedInvitations(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
  ) {
    invitations(
      where: { ghostwriter: $ghostwriterId, status: DECLINED }
      first: $first
      skip: $skip
      orderBy: "respondedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      respondedAt
      package {
        id
        packageId
        creator {
          id
        }
        totalAmount
        status
        expiresAt
        createdAt
      }
      transactionHash
    }
  }
`;

// Get all drafts submitted by ghostwriter
export const GET_GHOSTWRITER_SUBMITTED_DRAFTS = gql`
  query GetGhostwriterSubmittedDrafts(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
  ) {
    deliverables(
      where: { writer: $ghostwriterId, status: SUBMITTED }
      first: $first
      skip: $skip
      orderBy: "submittedAt"
      orderDirection: "desc"
    ) {
      id
      deliverableId
      contentType
      status
      amount
      submittedAt
      package {
        id
        packageId
        creator {
          id
        }
        status
      }
      transactionHash
    }
  }
`;

// Get all rejected drafts
export const GET_GHOSTWRITER_REJECTED_DRAFTS = gql`
  query GetGhostwriterRejectedDrafts(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
  ) {
    deliverables(
      where: { writer: $ghostwriterId, status: REJECTED }
      first: $first
      skip: $skip
      orderBy: "rejectedAt"
      orderDirection: "desc"
    ) {
      id
      deliverableId
      contentType
      status
      amount
      submittedAt
      rejectedAt
      revisedAt
      package {
        id
        packageId
        creator {
          id
        }
        status
      }
      transactionHash
    }
  }
`;

// Get all approved drafts
export const GET_GHOSTWRITER_APPROVED_DRAFTS = gql`
  query GetGhostwriterApprovedDrafts(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
  ) {
    deliverables(
      where: { writer: $ghostwriterId, status: APPROVED }
      first: $first
      skip: $skip
      orderBy: "approvedAt"
      orderDirection: "desc"
    ) {
      id
      deliverableId
      contentType
      status
      amount
      submittedAt
      approvedAt
      package {
        id
        packageId
        creator {
          id
        }
        status
      }
      transactionHash
    }
  }
`;

// Get all drafts overall
export const GET_GHOSTWRITER_ALL_DRAFTS = gql`
  query GetGhostwriterAllDrafts(
    $ghostwriterId: ID!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
  ) {
    deliverables(
      where: { writer: $ghostwriterId }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      deliverableId
      contentType
      status
      amount
      submittedAt
      approvedAt
      rejectedAt
      revisedAt
      package {
        id
        packageId
        creator {
          id
        }
        status
      }
      transactionHash
    }
  }
`;

// Get all drafts for a specific gig
export const GET_GHOSTWRITER_DRAFTS_PER_GIG = gql`
  query GetGhostwriterDraftsPerGig(
    $ghostwriterId: ID!
    $packageId: ID!
    $first: Int
    $skip: Int
  ) {
    deliverables(
      where: { writer: $ghostwriterId, package: $packageId }
      first: $first
      skip: $skip
      orderBy: "createdAt"
      orderDirection: "desc"
    ) {
      id
      deliverableId
      contentType
      status
      amount
      submittedAt
      approvedAt
      rejectedAt
      revisedAt
      createdAt
      transactionHash
    }
  }
`;

// Get recent non-expired invitations
export const GET_GHOSTWRITER_RECENT_INVITATIONS = gql`
  query GetGhostwriterRecentInvitations($ghostwriterId: ID!, $first: Int) {
    invitations(
      where: {
        ghostwriter: $ghostwriterId
        status: PENDING
        package_: { isExpired: false }
      }
      first: $first
      orderBy: "invitedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      package {
        id
        packageId
        creator {
          id
        }
        totalAmount
        expiresAt
        numDeliverables
        createdAt
      }
      transactionHash
    }
  }
`;

// Get total payment released to address
export const GET_GHOSTWRITER_PAYMENTS = gql`
  query GetGhostwriterPayments($ghostwriterId: ID!, $first: Int, $skip: Int) {
    payments(
      where: { to: $ghostwriterId }
      first: $first
      skip: $skip
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      amount
      timestamp
      package {
        id
        packageId
      }
      deliverable {
        id
        deliverableId
        contentType
      }
      from {
        id
      }
      transactionHash
    }
  }
`;

// Get ghostwriter's overview data (for dashboards)
export const GET_GHOSTWRITER_OVERVIEW = gql`
  query GetGhostwriterOverview($ghostwriterId: ID!) {
    user(id: $ghostwriterId) {
      id
      totalPaymentsReceived
      createdAt
      lastUpdated

      # All packages written by this ghostwriter
      writtenPackages {
        id
        status
      }

      # All invitations
      invitations {
        id
        status
      }

      # All submitted deliverables
      submittedDeliverables {
        id
        status
      }
    }
  }
`;
