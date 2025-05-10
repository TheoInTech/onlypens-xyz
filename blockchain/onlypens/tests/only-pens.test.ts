import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  beforeEach,
} from "matchstick-as/assembly/index";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  DeliverableApproved as DeliverableApprovedEvent,
  DeliverableCreated as DeliverableCreatedEvent,
  DeliverableRejected as DeliverableRejectedEvent,
  DeliverableSubmitted as DeliverableSubmittedEvent,
  DeliverableRevised as DeliverableRevisedEvent,
  GhostwriterInvited as GhostwriterInvitedEvent,
  InvitationAccepted as InvitationAcceptedEvent,
  InvitationDeclined as InvitationDeclinedEvent,
  GigPackageCreated as GigPackageCreatedEvent,
  GigPackageCompleted as GigPackageCompletedEvent,
  GigPackageCancelled as GigPackageCancelledEvent,
  GigPackageExpired as GigPackageExpiredEvent,
  PaymentReleased as PaymentReleasedEvent,
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/OnlyPens/OnlyPens";

import {
  handleDeliverableApproved,
  handleDeliverableCreated,
  handleDeliverableRejected,
  handleDeliverableSubmitted,
  handleDeliverableRevised,
  handleGhostwriterInvited,
  handleInvitationAccepted,
  handleInvitationDeclined,
  handleGigPackageCreated,
  handleGigPackageCompleted,
  handleGigPackageCancelled,
  handleGigPackageExpired,
  handlePaymentReleased,
  handleInitialized,
  handleOwnershipTransferred,
} from "../src/only-pens";

import {
  createDeliverableApprovedEvent,
  createDeliverableCreatedEvent,
  createDeliverableRejectedEvent,
  createDeliverableSubmittedEvent,
  createDeliverableRevisedEvent,
  createGhostwriterInvitedEvent,
  createInvitationAcceptedEvent,
  createInvitationDeclinedEvent,
  createGigPackageCreatedEvent,
  createGigPackageCompletedEvent,
  createGigPackageCancelledEvent,
  createGigPackageExpiredEvent,
  createPaymentReleasedEvent,
  createInitializedEvent,
  createOwnershipTransferredEvent,
} from "./only-pens-utils";

// Constants for testing
const PACKAGE_ID = BigInt.fromI32(1);
const DELIVERABLE_ID = BigInt.fromI32(1);
const CONTENT_TYPE = "article";
const AMOUNT = BigInt.fromString("1000000000000000000"); // 1 ETH in wei
const EXPIRES_AT = BigInt.fromI32(1680000000); // Some future timestamp
const CREATOR_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
const WRITER_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
const VERSION = BigInt.fromI32(1);
const PREV_OWNER = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
const NEW_OWNER = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);

describe("OnlyPens Subgraph Tests", () => {
  beforeEach(() => {
    clearStore();
  });

  describe("Contract Initialization", () => {
    test("Contract Initialized", () => {
      // Create and handle Initialized event
      let initEvent = createInitializedEvent(VERSION);
      handleInitialized(initEvent);

      // Check if event entity is correctly created
      assert.entityCount("InitializedEvent", 1);

      // The entity ID format matches what's used in the handler
      let eventEntityID = initEvent.transaction.hash
        .concatI32(initEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "InitializedEvent",
        eventEntityID,
        "version",
        VERSION.toString()
      );
    });

    test("Ownership Transferred", () => {
      // Create and handle OwnershipTransferred event
      let ownershipEvent = createOwnershipTransferredEvent(
        PREV_OWNER,
        NEW_OWNER
      );
      handleOwnershipTransferred(ownershipEvent);

      // Check if event entity is correctly created
      assert.entityCount("OwnershipTransferredEvent", 1);

      let eventEntityID = ownershipEvent.transaction.hash
        .concatI32(ownershipEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "OwnershipTransferredEvent",
        eventEntityID,
        "previousOwner",
        PREV_OWNER.toHexString()
      );
      assert.fieldEquals(
        "OwnershipTransferredEvent",
        eventEntityID,
        "newOwner",
        NEW_OWNER.toHexString()
      );
    });
  });

  describe("Package Lifecycle", () => {
    test("Create GigPackage", () => {
      // Create and handle GigPackageCreated event
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      // Check if event entity is correctly created
      assert.entityCount("GigPackageCreatedEvent", 1);

      let eventEntityID = packageEvent.transaction.hash
        .concatI32(packageEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "GigPackageCreatedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );

      // Check if User entity for creator is created
      assert.entityCount("User", 1);
      assert.fieldEquals(
        "User",
        CREATOR_ADDRESS.toHexString(),
        "totalPaymentsSent",
        "0"
      );

      // Check if Package entity is correctly created
      assert.entityCount("Package", 1);
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "creator",
        CREATOR_ADDRESS.toHexString()
      );
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "totalAmount",
        AMOUNT.toString()
      );
      assert.fieldEquals("Package", PACKAGE_ID.toString(), "status", "PENDING");
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "isExpired",
        "false"
      );
    });

    test("Add Deliverable to Package", () => {
      // First create a package
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      // Create and handle DeliverableCreated event
      let deliverableEvent = createDeliverableCreatedEvent(
        PACKAGE_ID,
        DELIVERABLE_ID,
        CONTENT_TYPE,
        AMOUNT
      );
      handleDeliverableCreated(deliverableEvent);

      // Check if event entity is correctly created
      assert.entityCount("DeliverableCreatedEvent", 1);

      let eventEntityID = deliverableEvent.transaction.hash
        .concatI32(deliverableEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "DeliverableCreatedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "DeliverableCreatedEvent",
        eventEntityID,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );

      // Check if Deliverable entity is correctly created
      let deliverableId = PACKAGE_ID.toString()
        .concat("-")
        .concat(DELIVERABLE_ID.toString());
      assert.entityCount("Deliverable", 1);
      assert.fieldEquals(
        "Deliverable",
        deliverableId,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );
      assert.fieldEquals(
        "Deliverable",
        deliverableId,
        "package",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "Deliverable",
        deliverableId,
        "contentType",
        CONTENT_TYPE
      );
      assert.fieldEquals("Deliverable", deliverableId, "status", "PENDING");
      assert.fieldEquals(
        "Deliverable",
        deliverableId,
        "amount",
        AMOUNT.toString()
      );

      // Check if Package entity is updated with numDeliverables incremented
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "numDeliverables",
        "1"
      );
    });

    test("Invite Ghostwriter", () => {
      // First create a package
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      // Create and handle GhostwriterInvited event
      let inviteEvent = createGhostwriterInvitedEvent(
        PACKAGE_ID,
        WRITER_ADDRESS
      );
      handleGhostwriterInvited(inviteEvent);

      // Check if event entity is correctly created
      assert.entityCount("GhostwriterInvitedEvent", 1);

      let eventEntityID = inviteEvent.transaction.hash
        .concatI32(inviteEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "GhostwriterInvitedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "GhostwriterInvitedEvent",
        eventEntityID,
        "ghostwriter",
        WRITER_ADDRESS.toHexString()
      );

      // Check if User entity for writer is created
      assert.entityCount("User", 2); // Creator and writer
      assert.fieldEquals(
        "User",
        WRITER_ADDRESS.toHexString(),
        "totalPaymentsReceived",
        "0"
      );

      // Check if Package entity is updated with status "INVITED"
      assert.fieldEquals("Package", PACKAGE_ID.toString(), "status", "INVITED");

      // Check if Invitation entity is created
      let invitationId = PACKAGE_ID.toString()
        .concat("-")
        .concat(WRITER_ADDRESS.toHexString());
      assert.entityCount("Invitation", 1);
      assert.fieldEquals(
        "Invitation",
        invitationId,
        "package",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "Invitation",
        invitationId,
        "ghostwriter",
        WRITER_ADDRESS.toHexString()
      );
      assert.fieldEquals("Invitation", invitationId, "status", "PENDING");
    });

    test("Accept Invitation", () => {
      // First create a package and invite a writer
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      let inviteEvent = createGhostwriterInvitedEvent(
        PACKAGE_ID,
        WRITER_ADDRESS
      );
      handleGhostwriterInvited(inviteEvent);

      // Create and handle InvitationAccepted event
      let acceptEvent = createInvitationAcceptedEvent(
        PACKAGE_ID,
        WRITER_ADDRESS
      );
      handleInvitationAccepted(acceptEvent);

      // Check if event entity is correctly created
      assert.entityCount("InvitationAcceptedEvent", 1);

      let eventEntityID = acceptEvent.transaction.hash
        .concatI32(acceptEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "InvitationAcceptedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "InvitationAcceptedEvent",
        eventEntityID,
        "ghostwriter",
        WRITER_ADDRESS.toHexString()
      );

      // Check if Package entity is updated with status "ASSIGNED" and writer
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "status",
        "ASSIGNED"
      );
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "writer",
        WRITER_ADDRESS.toHexString()
      );

      // Check if Invitation entity is updated with status "ACCEPTED"
      let invitationId = PACKAGE_ID.toString()
        .concat("-")
        .concat(WRITER_ADDRESS.toHexString());
      assert.fieldEquals("Invitation", invitationId, "status", "ACCEPTED");
    });

    test("Decline Invitation", () => {
      // First create a package and invite a writer
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      let inviteEvent = createGhostwriterInvitedEvent(
        PACKAGE_ID,
        WRITER_ADDRESS
      );
      handleGhostwriterInvited(inviteEvent);

      // Create and handle InvitationDeclined event
      let declineEvent = createInvitationDeclinedEvent(
        PACKAGE_ID,
        WRITER_ADDRESS
      );
      handleInvitationDeclined(declineEvent);

      // Check if event entity is correctly created
      assert.entityCount("InvitationDeclinedEvent", 1);

      let eventEntityID = declineEvent.transaction.hash
        .concatI32(declineEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "InvitationDeclinedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "InvitationDeclinedEvent",
        eventEntityID,
        "ghostwriter",
        WRITER_ADDRESS.toHexString()
      );

      // Check if Package entity is updated back to status "INVITED"
      assert.fieldEquals("Package", PACKAGE_ID.toString(), "status", "INVITED");

      // Check if Invitation entity is updated with status "DECLINED"
      let invitationId = PACKAGE_ID.toString()
        .concat("-")
        .concat(WRITER_ADDRESS.toHexString());
      assert.fieldEquals("Invitation", invitationId, "status", "DECLINED");
    });
  });

  describe("Deliverable Lifecycle", () => {
    test("Submit Deliverable", () => {
      // Setup: Create package, deliverable, invite and accept writer
      setupPackageWithWriter();

      // Create and handle DeliverableSubmitted event
      let submitEvent = createDeliverableSubmittedEvent(
        PACKAGE_ID,
        DELIVERABLE_ID,
        WRITER_ADDRESS
      );
      handleDeliverableSubmitted(submitEvent);

      // Check if event entity is correctly created
      assert.entityCount("DeliverableSubmittedEvent", 1);

      let eventEntityID = submitEvent.transaction.hash
        .concatI32(submitEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "DeliverableSubmittedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "DeliverableSubmittedEvent",
        eventEntityID,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );

      // Check if Deliverable entity status is updated to "SUBMITTED"
      let deliverableId = PACKAGE_ID.toString()
        .concat("-")
        .concat(DELIVERABLE_ID.toString());
      assert.fieldEquals("Deliverable", deliverableId, "status", "SUBMITTED");
      assert.fieldEquals(
        "Deliverable",
        deliverableId,
        "writer",
        WRITER_ADDRESS.toHexString()
      );
    });

    test("Approve Deliverable", () => {
      // Setup: Create package, deliverable, invite and accept writer, submit deliverable
      setupPackageWithSubmittedDeliverable();

      // Create and handle DeliverableApproved event
      let approveEvent = createDeliverableApprovedEvent(
        PACKAGE_ID,
        DELIVERABLE_ID,
        WRITER_ADDRESS
      );
      handleDeliverableApproved(approveEvent);

      // Check if event entity is correctly created
      assert.entityCount("DeliverableApprovedEvent", 1);

      let eventEntityID = approveEvent.transaction.hash
        .concatI32(approveEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "DeliverableApprovedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "DeliverableApprovedEvent",
        eventEntityID,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );

      // Check if Deliverable entity status is updated to "APPROVED"
      let deliverableId = PACKAGE_ID.toString()
        .concat("-")
        .concat(DELIVERABLE_ID.toString());
      assert.fieldEquals("Deliverable", deliverableId, "status", "APPROVED");

      // Check if Package entity is updated with numApproved incremented
      assert.fieldEquals("Package", PACKAGE_ID.toString(), "numApproved", "1");
    });

    test("Reject Deliverable", () => {
      // Setup: Create package, deliverable, invite and accept writer, submit deliverable
      setupPackageWithSubmittedDeliverable();

      // Create and handle DeliverableRejected event
      let rejectEvent = createDeliverableRejectedEvent(
        PACKAGE_ID,
        DELIVERABLE_ID,
        WRITER_ADDRESS
      );
      handleDeliverableRejected(rejectEvent);

      // Check if event entity is correctly created
      assert.entityCount("DeliverableRejectedEvent", 1);

      let eventEntityID = rejectEvent.transaction.hash
        .concatI32(rejectEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "DeliverableRejectedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "DeliverableRejectedEvent",
        eventEntityID,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );

      // Check if Deliverable entity status is updated to "REJECTED"
      let deliverableId = PACKAGE_ID.toString()
        .concat("-")
        .concat(DELIVERABLE_ID.toString());
      assert.fieldEquals("Deliverable", deliverableId, "status", "REJECTED");
    });

    test("Revise Deliverable", () => {
      // Setup: Create package, deliverable, invite and accept writer, submit & reject deliverable
      setupPackageWithRejectedDeliverable();

      // Create and handle DeliverableRevised event
      let reviseEvent = createDeliverableRevisedEvent(
        PACKAGE_ID,
        DELIVERABLE_ID,
        WRITER_ADDRESS
      );
      handleDeliverableRevised(reviseEvent);

      // Check if event entity is correctly created
      assert.entityCount("DeliverableRevisedEvent", 1);

      let eventEntityID = reviseEvent.transaction.hash
        .concatI32(reviseEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "DeliverableRevisedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "DeliverableRevisedEvent",
        eventEntityID,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );

      // Check if Deliverable entity status is updated to "SUBMITTED"
      let deliverableId = PACKAGE_ID.toString()
        .concat("-")
        .concat(DELIVERABLE_ID.toString());
      assert.fieldEquals("Deliverable", deliverableId, "status", "SUBMITTED");
    });

    test("Release Payment", () => {
      // Setup: Create package, deliverable, invite and accept writer, submit & approve deliverable
      setupPackageWithApprovedDeliverable();

      // Create and handle PaymentReleased event
      let paymentEvent = createPaymentReleasedEvent(
        PACKAGE_ID,
        DELIVERABLE_ID,
        WRITER_ADDRESS,
        AMOUNT
      );
      handlePaymentReleased(paymentEvent);

      // Check if event entity is correctly created
      assert.entityCount("PaymentReleasedEvent", 1);

      let eventEntityID = paymentEvent.transaction.hash
        .concatI32(paymentEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "PaymentReleasedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );
      assert.fieldEquals(
        "PaymentReleasedEvent",
        eventEntityID,
        "deliverableId",
        DELIVERABLE_ID.toString()
      );
      assert.fieldEquals(
        "PaymentReleasedEvent",
        eventEntityID,
        "to",
        WRITER_ADDRESS.toHexString()
      );
      assert.fieldEquals(
        "PaymentReleasedEvent",
        eventEntityID,
        "amount",
        AMOUNT.toString()
      );

      // Check if Payment entity is created
      assert.entityCount("Payment", 1);

      // Check if User entities are updated with payment counts
      assert.fieldEquals(
        "User",
        WRITER_ADDRESS.toHexString(),
        "totalPaymentsReceived",
        AMOUNT.toString()
      );
      assert.fieldEquals(
        "User",
        CREATOR_ADDRESS.toHexString(),
        "totalPaymentsSent",
        AMOUNT.toString()
      );

      // Check if Package entity is updated with amountReleased
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "amountReleased",
        AMOUNT.toString()
      );
    });
  });

  describe("Package Status Changes", () => {
    test("Complete Package", () => {
      // Setup: Create package
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      // Create and handle GigPackageCompleted event
      let completeEvent = createGigPackageCompletedEvent(PACKAGE_ID);
      handleGigPackageCompleted(completeEvent);

      // Check if event entity is correctly created
      assert.entityCount("GigPackageCompletedEvent", 1);

      let eventEntityID = completeEvent.transaction.hash
        .concatI32(completeEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "GigPackageCompletedEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );

      // Check if Package entity status is updated to "COMPLETED"
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "status",
        "COMPLETED"
      );
    });

    test("Cancel Package", () => {
      // Setup: Create package
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      // Create and handle GigPackageCancelled event
      let cancelEvent = createGigPackageCancelledEvent(PACKAGE_ID);
      handleGigPackageCancelled(cancelEvent);

      // Check if event entity is correctly created
      assert.entityCount("GigPackageCancelledEvent", 1);

      let eventEntityID = cancelEvent.transaction.hash
        .concatI32(cancelEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "GigPackageCancelledEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );

      // Check if Package entity status is updated to "CANCELLED"
      assert.fieldEquals(
        "Package",
        PACKAGE_ID.toString(),
        "status",
        "CANCELLED"
      );
    });

    test("Expire Package", () => {
      // Setup: Create package
      let packageEvent = createGigPackageCreatedEvent(
        PACKAGE_ID,
        CREATOR_ADDRESS,
        AMOUNT,
        EXPIRES_AT
      );
      handleGigPackageCreated(packageEvent);

      // Create and handle GigPackageExpired event
      let expireEvent = createGigPackageExpiredEvent(PACKAGE_ID);
      handleGigPackageExpired(expireEvent);

      // Check if event entity is correctly created
      assert.entityCount("GigPackageExpiredEvent", 1);

      let eventEntityID = expireEvent.transaction.hash
        .concatI32(expireEvent.logIndex.toI32())
        .toHexString();
      assert.fieldEquals(
        "GigPackageExpiredEvent",
        eventEntityID,
        "packageId",
        PACKAGE_ID.toString()
      );

      // Check if Package entity is updated with isExpired=true and status "EXPIRED"
      assert.fieldEquals("Package", PACKAGE_ID.toString(), "isExpired", "true");
      assert.fieldEquals("Package", PACKAGE_ID.toString(), "status", "EXPIRED");
    });
  });
});

// Helper functions for setting up common test scenarios
function setupPackageWithWriter(): void {
  // Create package
  let packageEvent = createGigPackageCreatedEvent(
    PACKAGE_ID,
    CREATOR_ADDRESS,
    AMOUNT,
    EXPIRES_AT
  );
  handleGigPackageCreated(packageEvent);

  // Add deliverable
  let deliverableEvent = createDeliverableCreatedEvent(
    PACKAGE_ID,
    DELIVERABLE_ID,
    CONTENT_TYPE,
    AMOUNT
  );
  handleDeliverableCreated(deliverableEvent);

  // Invite ghostwriter
  let inviteEvent = createGhostwriterInvitedEvent(PACKAGE_ID, WRITER_ADDRESS);
  handleGhostwriterInvited(inviteEvent);

  // Accept invitation
  let acceptEvent = createInvitationAcceptedEvent(PACKAGE_ID, WRITER_ADDRESS);
  handleInvitationAccepted(acceptEvent);
}

function setupPackageWithSubmittedDeliverable(): void {
  // Set up package with writer
  setupPackageWithWriter();

  // Submit deliverable
  let submitEvent = createDeliverableSubmittedEvent(
    PACKAGE_ID,
    DELIVERABLE_ID,
    WRITER_ADDRESS
  );
  handleDeliverableSubmitted(submitEvent);
}

function setupPackageWithApprovedDeliverable(): void {
  // Set up package with submitted deliverable
  setupPackageWithSubmittedDeliverable();

  // Approve deliverable
  let approveEvent = createDeliverableApprovedEvent(
    PACKAGE_ID,
    DELIVERABLE_ID,
    WRITER_ADDRESS
  );
  handleDeliverableApproved(approveEvent);
}

function setupPackageWithRejectedDeliverable(): void {
  // Set up package with submitted deliverable
  setupPackageWithSubmittedDeliverable();

  // Reject deliverable
  let rejectEvent = createDeliverableRejectedEvent(
    PACKAGE_ID,
    DELIVERABLE_ID,
    WRITER_ADDRESS
  );
  handleDeliverableRejected(rejectEvent);
}
