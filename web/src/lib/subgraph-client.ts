import { createClient } from "@urql/core";

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.thegraph.com/subgraphs/name/onlypens/onlypens-escrow";

export const subgraphClient = createClient({
  url: SUBGRAPH_URL,
});

// Common fragment for GigPackage fields
const GIG_PACKAGE_FRAGMENT = `
  fragment GigPackageFields on GigPackage {
    id
    creator
    writer
    totalAmount
    createdAt
    lastUpdated
    expiresAt
    status
    numDeliverables
    numApproved
    amountReleased
  }
`;

// Common fragment for Deliverable fields
const DELIVERABLE_FRAGMENT = `
  fragment DeliverableFields on Deliverable {
    id
    deliverableId
    contentType
    status
    amount
    submittedAt
    approvedAt
    createdAt
  }
`;

// Fetch GigPackage by ID
export async function fetchGigPackage(packageId: string) {
  const query = `
    ${GIG_PACKAGE_FRAGMENT}
    ${DELIVERABLE_FRAGMENT}
    query GetGigPackage($packageId: ID!) {
      gigPackage(id: $packageId) {
        ...GigPackageFields
        deliverables {
          ...DeliverableFields
        }
      }
    }
  `;

  const result = await subgraphClient.query(query, { packageId }).toPromise();
  return result.data?.gigPackage;
}

// Fetch gig packages for a user
export async function fetchUserGigPackages(
  address: string,
  first: number = 10,
  skip: number = 0
) {
  const query = `
    ${GIG_PACKAGE_FRAGMENT}
    query GetUserGigPackages($address: Bytes!, $first: Int!, $skip: Int!) {
      createdPackages: gigPackages(
        first: $first
        skip: $skip
        where: { creator: $address }
        orderBy: createdAt
        orderDirection: desc
      ) {
        ...GigPackageFields
      }
      assignedPackages: gigPackages(
        first: $first
        skip: $skip
        where: { writer: $address }
        orderBy: createdAt
        orderDirection: desc
      ) {
        ...GigPackageFields
      }
    }
  `;

  const result = await subgraphClient
    .query(query, {
      address: address.toLowerCase(),
      first,
      skip,
    })
    .toPromise();

  return {
    createdPackages: result.data?.createdPackages || [],
    assignedPackages: result.data?.assignedPackages || [],
  };
}

// Fetch invitations for a ghostwriter
export async function fetchGhostwriterInvitations(
  address: string,
  first: number = 10,
  skip: number = 0
) {
  const query = `
    ${GIG_PACKAGE_FRAGMENT}
    query GetInvitations($address: Bytes!, $first: Int!, $skip: Int!) {
      ghostwriterInvitations(
        first: $first
        skip: $skip
        where: { 
          ghostwriter: $address, 
          status: "PENDING" 
        }
        orderBy: invitedAt
        orderDirection: desc
      ) {
        id
        invitedAt
        package {
          ...GigPackageFields
        }
      }
    }
  `;

  const result = await subgraphClient
    .query(query, {
      address: address.toLowerCase(),
      first,
      skip,
    })
    .toPromise();

  return result.data?.ghostwriterInvitations || [];
}

// Fetch deliverables for a package
export async function fetchPackageDeliverables(packageId: string) {
  const query = `
    ${DELIVERABLE_FRAGMENT}
    query GetPackageDeliverables($packageId: ID!) {
      deliverables(
        where: { package: $packageId }
        orderBy: deliverableId
        orderDirection: asc
      ) {
        ...DeliverableFields
      }
    }
  `;

  const result = await subgraphClient.query(query, { packageId }).toPromise();
  return result.data?.deliverables || [];
}

// Fetch activity events for a package
export async function fetchPackageActivities(
  packageId: string,
  first: number = 20,
  skip: number = 0
) {
  const query = `
    query GetPackageActivities($packageId: ID!, $first: Int!, $skip: Int!) {
      activityEvents(
        first: $first
        skip: $skip
        where: { package: $packageId }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        eventType
        timestamp
        creator
        writer
        deliverable {
          id
          deliverableId
          contentType
        }
        amount
        transactionHash
      }
    }
  `;

  const result = await subgraphClient
    .query(query, {
      packageId,
      first,
      skip,
    })
    .toPromise();

  return result.data?.activityEvents || [];
}

// Fetch payment events for a user
export async function fetchUserPayments(
  address: string,
  first: number = 10,
  skip: number = 0
) {
  const query = `
    query GetUserPayments($address: Bytes!, $first: Int!, $skip: Int!) {
      paymentsReceived: paymentEvents(
        first: $first
        skip: $skip
        where: { to: $address }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        package {
          id
          creator
        }
        deliverable {
          id
          deliverableId
          contentType
        }
        amount
        timestamp
        transactionHash
      }
      paymentsSent: paymentEvents(
        first: $first
        skip: $skip
        where: { from: $address }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        package {
          id
          writer
        }
        deliverable {
          id
          deliverableId
          contentType
        }
        amount
        timestamp
        transactionHash
      }
    }
  `;

  const result = await subgraphClient
    .query(query, {
      address: address.toLowerCase(),
      first,
      skip,
    })
    .toPromise();

  return {
    paymentsReceived: result.data?.paymentsReceived || [],
    paymentsSent: result.data?.paymentsSent || [],
  };
}

// Fetch global statistics
export async function fetchGlobalStats() {
  const query = `
    query GetGlobalStats {
      globalStats(id: "1") {
        totalPackages
        totalDeliverables
        totalAmountLocked
        totalAmountReleased
        activePackages
        completedPackages
        cancelledPackages
        lastUpdateTimestamp
      }
    }
  `;

  const result = await subgraphClient.query(query).toPromise();
  return result.data?.globalStats;
}

// Fetch a user's statistics
export async function fetchUserStats(address: string) {
  const query = `
    query GetUserStats($id: ID!) {
      user(id: $id) {
        id
        totalCreated
        totalAssigned
        totalEarned
        totalSpent
      }
    }
  `;

  const result = await subgraphClient
    .query(query, {
      id: address.toLowerCase(),
    })
    .toPromise();

  return result.data?.user;
}
