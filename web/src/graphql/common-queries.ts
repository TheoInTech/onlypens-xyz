import { gql } from "graphql-request";

// Get user basic data
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      totalPaymentsReceived
      totalPaymentsSent
      createdAt
      lastUpdated
    }
  }
`;

// Get packages with pagination (general query)
export const GET_PACKAGES = gql`
  query GetPackages(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: Package_filter
  ) {
    packages(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
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
    }
  }
`;

// Get a single package by ID
export const GET_PACKAGE = gql`
  query GetPackage($id: ID!) {
    package(id: $id) {
      id
      packageId
      creator {
        id
        totalPaymentsReceived
        totalPaymentsSent
      }
      writer {
        id
        totalPaymentsReceived
        totalPaymentsSent
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
      deliverables {
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
  }
`;

// Get payments with filtering options
export const GET_PAYMENTS = gql`
  query GetPayments(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: Payment_filter
  ) {
    payments(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      package {
        id
        packageId
      }
      deliverable {
        id
        deliverableId
      }
      from {
        id
      }
      to {
        id
      }
      amount
      timestamp
      transactionHash
    }
  }
`;
