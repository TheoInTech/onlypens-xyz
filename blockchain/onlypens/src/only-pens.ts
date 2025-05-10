import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import {
  DeliverableApproved as DeliverableApprovedEvent,
  DeliverableCreated as DeliverableCreatedEvent,
  DeliverableRejected as DeliverableRejectedEvent,
  DeliverableRevised as DeliverableRevisedEvent,
  DeliverableSubmitted as DeliverableSubmittedEvent,
  GhostwriterInvited as GhostwriterInvitedEvent,
  GigPackageCancelled as GigPackageCancelledEvent,
  GigPackageCompleted as GigPackageCompletedEvent,
  GigPackageCreated as GigPackageCreatedEvent,
  GigPackageExpired as GigPackageExpiredEvent,
  Initialized as InitializedEvent,
  InvitationAccepted as InvitationAcceptedEvent,
  InvitationDeclined as InvitationDeclinedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PaymentReleased as PaymentReleasedEvent,
} from "../generated/OnlyPens/OnlyPens";
import {
  DeliverableApprovedEvent as DeliverableApprovedEntity,
  DeliverableCreatedEvent as DeliverableCreatedEntity,
  DeliverableRejectedEvent as DeliverableRejectedEntity,
  DeliverableRevisedEvent as DeliverableRevisedEntity,
  DeliverableSubmittedEvent as DeliverableSubmittedEntity,
  GhostwriterInvitedEvent as GhostwriterInvitedEntity,
  GigPackageCancelledEvent as GigPackageCancelledEntity,
  GigPackageCompletedEvent as GigPackageCompletedEntity,
  GigPackageCreatedEvent as GigPackageCreatedEntity,
  GigPackageExpiredEvent as GigPackageExpiredEntity,
  InitializedEvent as InitializedEntity,
  InvitationAcceptedEvent as InvitationAcceptedEntity,
  InvitationDeclinedEvent as InvitationDeclinedEntity,
  OwnershipTransferredEvent as OwnershipTransferredEntity,
  PaymentReleasedEvent as PaymentReleasedEntity,
  User,
  Package,
  Deliverable,
  Invitation,
  Payment,
} from "../generated/schema";

// Helper functions to create or load entities
function getOrCreateUser(address: Address, timestamp: BigInt): User {
  let id = Bytes.fromHexString(address.toHexString());
  let user = User.load(id);

  if (user == null) {
    user = new User(id);
    user.totalPaymentsReceived = BigInt.fromI32(0);
    user.totalPaymentsSent = BigInt.fromI32(0);
    user.createdAt = timestamp;
    user.lastUpdated = timestamp;
    user.save();
  }

  return user;
}

function getPackageId(packageId: BigInt): string {
  return packageId.toString();
}

function getDeliverableId(packageId: BigInt, deliverableId: BigInt): string {
  return packageId.toString().concat("-").concat(deliverableId.toString());
}

function getInvitationId(packageId: BigInt, ghostwriter: Address): string {
  return packageId.toString().concat("-").concat(ghostwriter.toHexString());
}

// Handler for GigPackageCreated event
export function handleGigPackageCreated(event: GigPackageCreatedEvent): void {
  // Create event entity
  let entity = new GigPackageCreatedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.creator = event.params.creator;
  entity.amount = event.params.amount;
  entity.expiresAt = event.params.expiresAt;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Create or update User entity for creator
  let creator = getOrCreateUser(event.params.creator, event.block.timestamp);
  creator.lastUpdated = event.block.timestamp;
  creator.save();

  // Create Package entity
  let packageId = getPackageId(event.params.packageId);
  let newPackage = new Package(packageId);
  newPackage.packageId = event.params.packageId;
  newPackage.creator = creator.id;
  newPackage.totalAmount = event.params.amount;
  newPackage.amountReleased = BigInt.fromI32(0);
  newPackage.createdAt = event.block.timestamp;
  newPackage.lastUpdated = event.block.timestamp;
  newPackage.expiresAt = event.params.expiresAt;
  newPackage.status = "PENDING";
  newPackage.numDeliverables = BigInt.fromI32(0);
  newPackage.numApproved = BigInt.fromI32(0);
  newPackage.isExpired = false;
  newPackage.transactionHash = event.transaction.hash;
  newPackage.save();
}

// Handler for DeliverableCreated event
export function handleDeliverableCreated(event: DeliverableCreatedEvent): void {
  // Create event entity
  let entity = new DeliverableCreatedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.deliverableId = event.params.deliverableId;
  entity.contentType = event.params.contentType;
  entity.amount = event.params.amount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package numDeliverables
    gigPackage.numDeliverables = gigPackage.numDeliverables.plus(
      BigInt.fromI32(1)
    );
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Create Deliverable entity
    let deliverableId = getDeliverableId(
      event.params.packageId,
      event.params.deliverableId
    );
    let deliverable = new Deliverable(deliverableId);
    deliverable.deliverableId = event.params.deliverableId;
    deliverable.package_ = packageId;
    deliverable.contentType = event.params.contentType;
    deliverable.status = "PENDING";
    deliverable.amount = event.params.amount;
    deliverable.createdAt = event.block.timestamp;
    deliverable.transactionHash = event.transaction.hash;
    deliverable.save();
  }
}

// Handler for GhostwriterInvited event
export function handleGhostwriterInvited(event: GhostwriterInvitedEvent): void {
  // Create event entity
  let entity = new GhostwriterInvitedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.ghostwriter = event.params.ghostwriter;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Create or update User entity for ghostwriter
  let ghostwriter = getOrCreateUser(
    event.params.ghostwriter,
    event.block.timestamp
  );
  ghostwriter.lastUpdated = event.block.timestamp;
  ghostwriter.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package status
    gigPackage.status = "INVITED";
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Create or update Invitation entity
    let invitationId = getInvitationId(
      event.params.packageId,
      event.params.ghostwriter
    );
    let invitation = Invitation.load(invitationId);

    if (invitation == null) {
      invitation = new Invitation(invitationId);
      invitation.package_ = packageId;
      invitation.ghostwriter = ghostwriter.id;
      invitation.status = "PENDING";
      invitation.invitedAt = event.block.timestamp;
      invitation.transactionHash = event.transaction.hash;
      invitation.save();
    }
  }
}

// Handler for InvitationAccepted event
export function handleInvitationAccepted(event: InvitationAcceptedEvent): void {
  // Create event entity
  let entity = new InvitationAcceptedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.ghostwriter = event.params.ghostwriter;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Get user entity
  let ghostwriter = getOrCreateUser(
    event.params.ghostwriter,
    event.block.timestamp
  );
  ghostwriter.lastUpdated = event.block.timestamp;
  ghostwriter.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package status and writer
    gigPackage.status = "ASSIGNED";
    gigPackage.writer = ghostwriter.id;
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Update invitation status
    let invitationId = getInvitationId(
      event.params.packageId,
      event.params.ghostwriter
    );
    let invitation = Invitation.load(invitationId);

    if (invitation) {
      invitation.status = "ACCEPTED";
      invitation.respondedAt = event.block.timestamp;
      invitation.save();
    }

    // Update all deliverables to set writer
    let deliverables = Deliverable.load(`${packageId}-1`); // First deliverable check
    if (deliverables) {
      for (let i = 1; i <= gigPackage.numDeliverables.toI32(); i++) {
        let delivId = `${packageId}-${i}`;
        let deliv = Deliverable.load(delivId);
        if (deliv) {
          deliv.writer = ghostwriter.id;
          deliv.save();
        }
      }
    }
  }
}

// Handler for InvitationDeclined event
export function handleInvitationDeclined(event: InvitationDeclinedEvent): void {
  // Create event entity
  let entity = new InvitationDeclinedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.ghostwriter = event.params.ghostwriter;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Update invitation status
  let invitationId = getInvitationId(
    event.params.packageId,
    event.params.ghostwriter
  );
  let invitation = Invitation.load(invitationId);

  if (invitation) {
    invitation.status = "DECLINED";
    invitation.respondedAt = event.block.timestamp;
    invitation.save();
  }

  // We don't revert the package status here as the contract logic handles that
  // The contract will emit another event if all invitations are declined
}

// Handler for DeliverableSubmitted event
export function handleDeliverableSubmitted(
  event: DeliverableSubmittedEvent
): void {
  // Create event entity
  let entity = new DeliverableSubmittedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.deliverableId = event.params.deliverableId;
  entity.writer = event.params.writer;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package status
    if (gigPackage.status == "ASSIGNED") {
      gigPackage.status = "IN_PROGRESS";
    }
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Update deliverable status
    let deliverableId = getDeliverableId(
      event.params.packageId,
      event.params.deliverableId
    );
    let deliverable = Deliverable.load(deliverableId);

    if (deliverable) {
      deliverable.status = "SUBMITTED";
      deliverable.submittedAt = event.block.timestamp;
      deliverable.save();
    }
  }
}

// Handler for DeliverableRevised event
export function handleDeliverableRevised(event: DeliverableRevisedEvent): void {
  // Create event entity
  let entity = new DeliverableRevisedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.deliverableId = event.params.deliverableId;
  entity.writer = event.params.writer;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package lastUpdated
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Update deliverable status
    let deliverableId = getDeliverableId(
      event.params.packageId,
      event.params.deliverableId
    );
    let deliverable = Deliverable.load(deliverableId);

    if (deliverable) {
      deliverable.status = "SUBMITTED";
      deliverable.submittedAt = event.block.timestamp;
      deliverable.revisedAt = event.block.timestamp;
      deliverable.save();
    }
  }
}

// Handler for DeliverableApproved event
export function handleDeliverableApproved(
  event: DeliverableApprovedEvent
): void {
  // Create event entity
  let entity = new DeliverableApprovedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.deliverableId = event.params.deliverableId;
  entity.writer = event.params.writer;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package numApproved
    gigPackage.numApproved = gigPackage.numApproved.plus(BigInt.fromI32(1));
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Update deliverable status
    let deliverableId = getDeliverableId(
      event.params.packageId,
      event.params.deliverableId
    );
    let deliverable = Deliverable.load(deliverableId);

    if (deliverable) {
      deliverable.status = "APPROVED";
      deliverable.approvedAt = event.block.timestamp;
      deliverable.save();
    }
  }
}

// Handler for DeliverableRejected event
export function handleDeliverableRejected(
  event: DeliverableRejectedEvent
): void {
  // Create event entity
  let entity = new DeliverableRejectedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.deliverableId = event.params.deliverableId;
  entity.writer = event.params.writer;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Update deliverable status
  let deliverableId = getDeliverableId(
    event.params.packageId,
    event.params.deliverableId
  );
  let deliverable = Deliverable.load(deliverableId);

  if (deliverable) {
    deliverable.status = "REJECTED";
    deliverable.rejectedAt = event.block.timestamp;
    deliverable.save();
  }

  // Update package lastUpdated
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);
  if (gigPackage) {
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }
}

// Handler for PaymentReleased event
export function handlePaymentReleased(event: PaymentReleasedEvent): void {
  // Create event entity
  let entity = new PaymentReleasedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.deliverableId = event.params.deliverableId;
  entity.to = event.params.to;
  entity.amount = event.params.amount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Get the package entity
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    // Update package amountReleased
    gigPackage.amountReleased = gigPackage.amountReleased.plus(
      event.params.amount
    );
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();

    // Create Payment entity
    let paymentId = event.transaction.hash.concatI32(event.logIndex.toI32());
    let payment = new Payment(paymentId);
    payment.package_ = packageId;
    payment.from = gigPackage.creator;
    payment.to = event.params.to;
    payment.amount = event.params.amount;
    payment.timestamp = event.block.timestamp;
    payment.transactionHash = event.transaction.hash;

    // Add deliverable reference if not a batch payment
    if (!event.params.deliverableId.isZero()) {
      let deliverableId = getDeliverableId(
        event.params.packageId,
        event.params.deliverableId
      );
      payment.deliverable = deliverableId;
    }

    payment.save();

    // Update User payment totals
    let creator = User.load(gigPackage.creator);
    let writer = User.load(event.params.to);

    if (creator) {
      creator.totalPaymentsSent = creator.totalPaymentsSent.plus(
        event.params.amount
      );
      creator.lastUpdated = event.block.timestamp;
      creator.save();
    }

    if (writer) {
      writer.totalPaymentsReceived = writer.totalPaymentsReceived.plus(
        event.params.amount
      );
      writer.lastUpdated = event.block.timestamp;
      writer.save();
    }
  }
}

// Handler for GigPackageCompleted event
export function handleGigPackageCompleted(
  event: GigPackageCompletedEvent
): void {
  // Create event entity
  let entity = new GigPackageCompletedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Update package status
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    gigPackage.status = "COMPLETED";
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }
}

// Handler for GigPackageCancelled event
export function handleGigPackageCancelled(
  event: GigPackageCancelledEvent
): void {
  // Create event entity
  let entity = new GigPackageCancelledEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Update package status
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    gigPackage.status = "CANCELLED";
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }
}

// Handler for GigPackageExpired event
export function handleGigPackageExpired(event: GigPackageExpiredEvent): void {
  // Create event entity
  let entity = new GigPackageExpiredEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.packageId = event.params.packageId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Update package status
  let packageId = getPackageId(event.params.packageId);
  let gigPackage = Package.load(packageId);

  if (gigPackage) {
    gigPackage.status = "EXPIRED";
    gigPackage.isExpired = true;
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }
}

// Handler for Initialized event
export function handleInitialized(event: InitializedEvent): void {
  // Create event entity
  let entity = new InitializedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.version = event.params.version;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

// Handler for OwnershipTransferred event
export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  // Create event entity
  let entity = new OwnershipTransferredEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Create User entities if they don't exist yet
  getOrCreateUser(event.params.previousOwner, event.block.timestamp);
  getOrCreateUser(event.params.newOwner, event.block.timestamp);
}
