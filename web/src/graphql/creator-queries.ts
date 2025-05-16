import { gql } from "graphql-request";

// Get all gigs created by a creator (any status)
export const GET_CREATOR_ALL_GIGS = gql`
  query GetCreatorAllGigs(
    $creatorId: ID!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
  ) {
    packages(
      where: { creator: $creatorId }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      packageId
      totalAmount
      amountReleased
      status
      createdAt
      expiresAt
      lastUpdated
      isExpired
      writer {
        id
      }
      numDeliverables
      numApproved
      transactionHash
    }
  }
`;

// Get all invited ghostwriters for a specific gig
export const GET_CREATOR_INVITED_GHOSTWRITERS_PER_GIG = gql`
  query GetCreatorInvitedGhostwritersPerGig(
    $packageId: ID!
    $first: Int
    $skip: Int
  ) {
    invitations(
      where: { package: $packageId }
      first: $first
      skip: $skip
      orderBy: "invitedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      respondedAt
      ghostwriter {
        id
        totalPaymentsReceived
        totalPaymentsSent
      }
      transactionHash
    }
  }
`;

// Get all ghostwriters invited by a creator (across all gigs)
export const GET_CREATOR_ALL_INVITED_GHOSTWRITERS = gql`
  query GetCreatorAllInvitedGhostwriters(
    $creatorId: ID!
    $first: Int
    $skip: Int
  ) {
    # First get all packages by this creator
    packages(where: { creator: $creatorId }, first: 1000) {
      id
      invitations {
        id
        status
        invitedAt
        respondedAt
        ghostwriter {
          id
        }
      }
    }
  }
`;

// Get all draft submissions on a specific gig
export const GET_CREATOR_DRAFT_SUBMISSIONS = gql`
  query GetCreatorDraftSubmissions($packageId: ID!, $first: Int, $skip: Int) {
    deliverables(
      where: { package: $packageId, status_not: PENDING }
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
      writer {
        id
      }
      submittedAt
      approvedAt
      rejectedAt
      revisedAt
      transactionHash
    }
  }
`;

// Get accepted submissions on a specific gig
export const GET_CREATOR_ACCEPTED_SUBMISSIONS = gql`
  query GetCreatorAcceptedSubmissions(
    $packageId: ID!
    $first: Int
    $skip: Int
  ) {
    deliverables(
      where: { package: $packageId, status: APPROVED }
      first: $first
      skip: $skip
      orderBy: "approvedAt"
      orderDirection: "desc"
    ) {
      id
      deliverableId
      contentType
      amount
      writer {
        id
      }
      submittedAt
      approvedAt
      transactionHash
    }
  }
`;

// Get all deliverables for a specific gig
export const GET_CREATOR_DELIVERABLES_PER_GIG = gql`
  query GetCreatorDeliverablesPerGig($packageId: ID!, $first: Int, $skip: Int) {
    deliverables(
      where: { package: $packageId }
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
      writer {
        id
      }
      submittedAt
      approvedAt
      rejectedAt
      revisedAt
      createdAt
      transactionHash
    }
  }
`;

// Get all deliverables across all gigs
export const GET_CREATOR_ALL_DELIVERABLES = gql`
  query GetCreatorAllDeliverables(
    $creatorId: ID!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
  ) {
    packages(where: { creator: $creatorId }, first: 1000) {
      id
      packageId
      status
      deliverables {
        id
        deliverableId
        contentType
        status
        amount
        writer {
          id
        }
        submittedAt
        approvedAt
        rejectedAt
        transactionHash
      }
    }
  }
`;

// Get all ghostwriters the creator has worked with
export const GET_CREATOR_WORKED_WITH_GHOSTWRITERS = gql`
  query GetCreatorWorkedWithGhostwriters($creatorId: ID!) {
    # Get packages created by this creator
    packages(where: { creator: $creatorId }, first: 1000) {
      id
      writer {
        id
      }
      invitations {
        ghostwriter {
          id
        }
        status
      }
      deliverables {
        writer {
          id
        }
        status
      }
    }

    # Get payments made by this creator
    payments(where: { from: $creatorId }, first: 1000) {
      to {
        id
      }
    }
  }
`;

// Get all active gigs for a creator
export const GET_CREATOR_ACTIVE_GIGS = gql`
  query GetCreatorActiveGigs($creatorId: ID!, $first: Int, $skip: Int) {
    packages(
      where: {
        creator: $creatorId
        status_in: [PENDING, INVITED, ASSIGNED, IN_PROGRESS]
        isExpired: false
      }
      first: $first
      skip: $skip
      orderBy: "lastUpdated"
      orderDirection: "desc"
    ) {
      id
      packageId
      totalAmount
      amountReleased
      status
      createdAt
      lastUpdated
      expiresAt
      writer {
        id
      }
      numDeliverables
      numApproved
      transactionHash
    }
  }
`;

// Get all completed gigs for a creator
export const GET_CREATOR_COMPLETED_GIGS = gql`
  query GetCreatorCompletedGigs($creatorId: ID!, $first: Int, $skip: Int) {
    packages(
      where: { creator: $creatorId, status: COMPLETED }
      first: $first
      skip: $skip
      orderBy: "lastUpdated"
      orderDirection: "desc"
    ) {
      id
      packageId
      totalAmount
      amountReleased
      writer {
        id
      }
      createdAt
      lastUpdated
      numDeliverables
      numApproved
      transactionHash
    }
  }
`;

// Get all expired gigs for a creator
export const GET_CREATOR_EXPIRED_GIGS = gql`
  query GetCreatorExpiredGigs($creatorId: ID!, $first: Int, $skip: Int) {
    packages(
      where: { creator: $creatorId, isExpired: true }
      first: $first
      skip: $skip
      orderBy: "expiresAt"
      orderDirection: "desc"
    ) {
      id
      packageId
      totalAmount
      amountReleased
      status
      createdAt
      expiresAt
      writer {
        id
      }
      numDeliverables
      numApproved
      transactionHash
    }
  }
`;

// Get all cancelled gigs for a creator
export const GET_CREATOR_CANCELLED_GIGS = gql`
  query GetCreatorCancelledGigs($creatorId: ID!, $first: Int, $skip: Int) {
    packages(
      where: { creator: $creatorId, status: CANCELLED }
      first: $first
      skip: $skip
      orderBy: "lastUpdated"
      orderDirection: "desc"
    ) {
      id
      packageId
      totalAmount
      amountReleased
      createdAt
      lastUpdated
      writer {
        id
      }
      numDeliverables
      numApproved
      transactionHash
    }
  }
`;

// Get a single gig with all needed data, including related payments
export const GET_CREATOR_SINGLE_GIG_DETAILS = gql`
  query GetCreatorSingleGigDetails($packageId: ID!) {
    package(id: $packageId) {
      id
      packageId
      creator {
        id
      }
      writer {
        id
      }
      totalAmount
      amountReleased
      createdAt
      lastUpdated
      expiresAt
      status
      numDeliverables
      numApproved
      isExpired
      transactionHash

      # All deliverables in this package
      deliverables(orderBy: createdAt, orderDirection: asc) {
        id
        deliverableId
        contentType
        status
        amount
        writer {
          id
        }
        submittedAt
        approvedAt
        rejectedAt
        revisedAt
        createdAt
        transactionHash
      }

      # All invitations for this package
      invitations(orderBy: invitedAt, orderDirection: desc) {
        id
        ghostwriter {
          id
        }
        status
        invitedAt
        respondedAt
        transactionHash
      }
    }

    # Payments related to this package
    payments(
      where: { package: $packageId }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      from {
        id
      }
      to {
        id
      }
      amount
      timestamp
      transactionHash
      deliverable {
        id
        deliverableId
      }
    }
  }
`;

// Get creator's overview data (for dashboards)
export const GET_CREATOR_OVERVIEW = gql`
  query GetCreatorOverview($creatorId: ID!) {
    user(id: $creatorId) {
      id
      totalPaymentsSent
      createdAt
      lastUpdated

      # Summary of created packages by status
      createdPackages {
        id
        status
        totalAmount
        amountReleased
        isExpired
      }
    }
  }
`;

// Get the most recent gig created by a specific creator
export const GET_CREATOR_RECENT_GIG = gql`
  query GetCreatorRecentGig($creatorId: ID!) {
    gigPackageCreatedEvents(
      where: { creator: $creatorId }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 1
    ) {
      id
      packageId
      creator
      amount
      expiresAt
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_ALL_INVITED_GHOSTWRITERS_FOR_GIG = gql`
  query GetAllInvitedGhostwritersForGig(
    $packageId: ID!
    $first: Int
    $skip: Int
  ) {
    invitations(
      where: { package: $packageId }
      first: $first
      skip: $skip
      orderBy: "invitedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      respondedAt
      ghostwriter {
        id # Wallet address of the ghostwriter
      }
      transactionHash
    }
  }
`;

export const GET_ACCEPTED_GHOSTWRITERS_FOR_GIG = gql`
  query GetAcceptedGhostwritersForGig(
    $packageId: ID!
    $first: Int
    $skip: Int
  ) {
    invitations(
      where: { package: $packageId, status: ACCEPTED }
      first: $first
      skip: $skip
      orderBy: "respondedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      respondedAt
      ghostwriter {
        id
      }
      transactionHash
    }
  }
`;

export const GET_DECLINED_GHOSTWRITERS_FOR_GIG = gql`
  query GetDeclinedGhostwritersForGig(
    $packageId: ID!
    $first: Int
    $skip: Int
  ) {
    invitations(
      where: { package: $packageId, status: DECLINED }
      first: $first
      skip: $skip
      orderBy: "respondedAt"
      orderDirection: "desc"
    ) {
      id
      status
      invitedAt
      respondedAt
      ghostwriter {
        id
      }
      transactionHash
    }
  }
`;

// Direct query to fetch invitations by package ID (both numeric and string ID)
export const GET_PACKAGE_INVITATIONS = gql`
  query GetPackageInvitations($packageId: String!, $numericPackageId: Int!) {
    # Try by string ID (full ID)
    packageById: package(id: $packageId) {
      id
      packageId
      invitations {
        id
        ghostwriter {
          id
        }
        status
        invitedAt
        respondedAt
        transactionHash
      }
    }

    # Also try by numeric packageId
    packagesByNumber: packages(where: { packageId: $numericPackageId }) {
      id
      packageId
      invitations {
        id
        ghostwriter {
          id
        }
        status
        invitedAt
        respondedAt
        transactionHash
      }
    }

    # Direct query for invitations by packageId
    invitationsByPackage: invitations(where: { package: $packageId }) {
      id
      ghostwriter {
        id
      }
      status
      invitedAt
      respondedAt
      transactionHash
      package {
        id
        packageId
      }
    }
  }
`;
