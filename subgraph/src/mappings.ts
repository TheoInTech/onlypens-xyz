import { BigInt, ByteArray, Bytes, log } from "@graphprotocol/graph-ts";
import {
  GigPackageCreated,
  DeliverableCreated,
  GhostwriterInvited,
  InvitationAccepted,
  InvitationDeclined,
  DeliverableSubmitted,
  DeliverableRevised,
  DeliverableApproved,
  DeliverableRejected,
  PaymentReleased,
  GigPackageCompleted,
  GigPackageCancelled,
  GigPackageExpired,
} from "../generated/OnlyPensEscrow/OnlyPensEscrow";
import {
  GigPackage,
  Deliverable,
  GhostwriterInvitation,
  ActivityEvent,
  PaymentEvent,
  User,
  GlobalStats,
} from "../generated/schema";

// Enum values to match contract
enum PackageStatus {
  PENDING = 0,
  INVITED = 1,
  ASSIGNED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  CANCELLED = 5,
}

enum DeliverableStatus {
  PENDING = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  REJECTED = 3,
}

// Helper to ensure user entity exists
function getOrCreateUser(address: Bytes): User {
  let id = address.toHexString();
  let user = User.load(id);

  if (user == null) {
    user = new User(id);
    user.totalCreated = 0;
    user.totalAssigned = 0;
    user.totalEarned = BigInt.fromI32(0);
    user.totalSpent = BigInt.fromI32(0);
    user.save();
  }

  return user;
}

// Helper to ensure global stats entity exists
function getOrCreateGlobalStats(): GlobalStats {
  let id = "1";
  let stats = GlobalStats.load(id);

  if (stats == null) {
    stats = new GlobalStats(id);
    stats.totalPackages = 0;
    stats.totalDeliverables = 0;
    stats.totalAmountLocked = BigInt.fromI32(0);
    stats.totalAmountReleased = BigInt.fromI32(0);
    stats.activePackages = 0;
    stats.completedPackages = 0;
    stats.cancelledPackages = 0;
    stats.lastUpdateTimestamp = BigInt.fromI32(0);
    stats.save();
  }

  return stats;
}

// Helper for creating activity events
function createActivityEvent(
  event: ethereum.Event,
  packageId: string,
  eventType: string,
  creator: Bytes | null = null,
  writer: Bytes | null = null,
  deliverableId: string | null = null,
  amount: BigInt | null = null
): ActivityEvent {
  let id =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let activityEvent = new ActivityEvent(id);

  activityEvent.package = packageId;
  activityEvent.eventType = eventType;
  activityEvent.timestamp = event.block.timestamp;
  activityEvent.transactionHash = event.transaction.hash;
  activityEvent.blockNumber = event.block.number;

  if (creator) {
    activityEvent.creator = creator;
  }

  if (writer) {
    activityEvent.writer = writer;
  }

  if (deliverableId) {
    activityEvent.deliverable = deliverableId;
  }

  if (amount) {
    activityEvent.amount = amount;
  }

  activityEvent.save();
  return activityEvent;
}

export function handleGigPackageCreated(event: GigPackageCreated): void {
  let packageId = event.params.packageId.toString();
  let creator = event.params.creator;
  let amount = event.params.amount;
  let expiresAt = event.params.expiresAt;

  // Create new gig package
  let gigPackage = new GigPackage(packageId);
  gigPackage.creator = creator;
  gigPackage.totalAmount = amount;
  gigPackage.createdAt = event.block.timestamp;
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.expiresAt = expiresAt;
  gigPackage.status = PackageStatus.PENDING;
  gigPackage.numDeliverables = 0;
  gigPackage.numApproved = 0;
  gigPackage.amountReleased = BigInt.fromI32(0);
  gigPackage.save();

  // Create activity event
  createActivityEvent(
    event,
    packageId,
    "GIG_CREATED",
    creator,
    null,
    null,
    amount
  );

  // Update user stats
  let user = getOrCreateUser(creator);
  user.totalCreated += 1;
  user.totalSpent = user.totalSpent.plus(amount);
  user.save();

  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.totalPackages += 1;
  stats.activePackages += 1;
  stats.totalAmountLocked = stats.totalAmountLocked.plus(amount);
  stats.lastUpdateTimestamp = event.block.timestamp;
  stats.save();
}

export function handleDeliverableCreated(event: DeliverableCreated): void {
  let packageId = event.params.packageId.toString();
  let deliverableId = event.params.deliverableId;
  let contentType = event.params.contentType;
  let amount = event.params.amount;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleDeliverableCreated for package {}", [
      packageId,
    ]);
    return;
  }

  // Create new deliverable
  let id = packageId + "-" + deliverableId.toString();
  let deliverable = new Deliverable(id);
  deliverable.deliverableId = deliverableId;
  deliverable.package = packageId;
  deliverable.contentType = contentType;
  deliverable.status = DeliverableStatus.PENDING;
  deliverable.amount = amount;
  deliverable.createdAt = event.block.timestamp;
  deliverable.save();

  // Update package
  gigPackage.numDeliverables += 1;
  gigPackage.save();

  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.totalDeliverables += 1;
  stats.lastUpdateTimestamp = event.block.timestamp;
  stats.save();
}

export function handleGhostwriterInvited(event: GhostwriterInvited): void {
  let packageId = event.params.packageId.toString();
  let ghostwriter = event.params.ghostwriter;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleGhostwriterInvited for package {}", [
      packageId,
    ]);
    return;
  }

  // Update package status
  gigPackage.status = PackageStatus.INVITED;
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.save();

  // Create invitation
  let id = packageId + "-" + ghostwriter.toHexString();
  let invitation = new GhostwriterInvitation(id);
  invitation.package = packageId;
  invitation.ghostwriter = ghostwriter;
  invitation.status = "PENDING";
  invitation.invitedAt = event.block.timestamp;
  invitation.user = ghostwriter.toHexString();
  invitation.save();

  // Create activity event
  createActivityEvent(
    event,
    packageId,
    "INVITE_SENT",
    gigPackage.creator,
    ghostwriter
  );

  // Ensure user entity exists
  getOrCreateUser(ghostwriter);
}

export function handleInvitationAccepted(event: InvitationAccepted): void {
  let packageId = event.params.packageId.toString();
  let ghostwriter = event.params.ghostwriter;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleInvitationAccepted for package {}", [
      packageId,
    ]);
    return;
  }

  // Update package
  gigPackage.writer = ghostwriter;
  gigPackage.status = PackageStatus.ASSIGNED;
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.save();

  // Update invitation
  let invitationId = packageId + "-" + ghostwriter.toHexString();
  let invitation = GhostwriterInvitation.load(invitationId);
  if (invitation != null) {
    invitation.status = "ACCEPTED";
    invitation.respondedAt = event.block.timestamp;
    invitation.save();
  }

  // Create activity event
  createActivityEvent(
    event,
    packageId,
    "INVITE_ACCEPTED",
    gigPackage.creator,
    ghostwriter
  );

  // Update user stats
  let user = getOrCreateUser(ghostwriter);
  user.totalAssigned += 1;
  user.save();
}

export function handleInvitationDeclined(event: InvitationDeclined): void {
  let packageId = event.params.packageId.toString();
  let ghostwriter = event.params.ghostwriter;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleInvitationDeclined for package {}", [
      packageId,
    ]);
    return;
  }

  // Update invitation
  let invitationId = packageId + "-" + ghostwriter.toHexString();
  let invitation = GhostwriterInvitation.load(invitationId);
  if (invitation != null) {
    invitation.status = "DECLINED";
    invitation.respondedAt = event.block.timestamp;
    invitation.save();
  }

  // Create activity event
  createActivityEvent(event, packageId, "INVITE_DECLINED", null, ghostwriter);
}

export function handleDeliverableSubmitted(event: DeliverableSubmitted): void {
  let packageId = event.params.packageId.toString();
  let deliverableId = event.params.deliverableId;
  let writer = event.params.writer;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error(
      "Package not found in handleDeliverableSubmitted for package {}",
      [packageId]
    );
    return;
  }

  // Update package if needed
  if (gigPackage.status == PackageStatus.ASSIGNED) {
    gigPackage.status = PackageStatus.IN_PROGRESS;
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }

  // Update deliverable
  let id = packageId + "-" + deliverableId.toString();
  let deliverable = Deliverable.load(id);
  if (deliverable != null) {
    deliverable.status = DeliverableStatus.SUBMITTED;
    deliverable.submittedAt = event.block.timestamp;
    deliverable.save();
  }

  // Create activity event
  createActivityEvent(event, packageId, "DRAFT_SUBMITTED", null, writer, id);
}

export function handleDeliverableRevised(event: DeliverableRevised): void {
  let packageId = event.params.packageId.toString();
  let deliverableId = event.params.deliverableId;
  let writer = event.params.writer;

  // Load the package and update its timestamp
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage != null) {
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }

  // Update deliverable
  let id = packageId + "-" + deliverableId.toString();
  let deliverable = Deliverable.load(id);
  if (deliverable != null) {
    deliverable.status = DeliverableStatus.SUBMITTED;
    deliverable.submittedAt = event.block.timestamp;
    deliverable.save();
  }

  // Create activity event
  createActivityEvent(event, packageId, "DRAFT_REVISED", null, writer, id);
}

export function handleDeliverableApproved(event: DeliverableApproved): void {
  let packageId = event.params.packageId.toString();
  let deliverableId = event.params.deliverableId;
  let writer = event.params.writer;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleDeliverableApproved for package {}", [
      packageId,
    ]);
    return;
  }

  // Update package
  gigPackage.numApproved += 1;
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.save();

  // Update deliverable
  let id = packageId + "-" + deliverableId.toString();
  let deliverable = Deliverable.load(id);
  if (deliverable != null) {
    deliverable.status = DeliverableStatus.APPROVED;
    deliverable.approvedAt = event.block.timestamp;
    deliverable.save();
  }

  // Create activity event
  createActivityEvent(
    event,
    packageId,
    "DRAFT_APPROVED",
    gigPackage.creator,
    writer,
    id
  );
}

export function handleDeliverableRejected(event: DeliverableRejected): void {
  let packageId = event.params.packageId.toString();
  let deliverableId = event.params.deliverableId;
  let writer = event.params.writer;

  // Load the package and update its timestamp
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage != null) {
    gigPackage.lastUpdated = event.block.timestamp;
    gigPackage.save();
  }

  // Update deliverable
  let id = packageId + "-" + deliverableId.toString();
  let deliverable = Deliverable.load(id);
  if (deliverable != null) {
    deliverable.status = DeliverableStatus.REJECTED;
    deliverable.save();
  }

  // Create activity event
  createActivityEvent(
    event,
    packageId,
    "DRAFT_REJECTED",
    gigPackage ? gigPackage.creator : null,
    writer,
    id
  );
}

export function handlePaymentReleased(event: PaymentReleased): void {
  let packageId = event.params.packageId.toString();
  let deliverableId = event.params.deliverableId;
  let to = event.params.to;
  let amount = event.params.amount;

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handlePaymentReleased for package {}", [
      packageId,
    ]);
    return;
  }

  // Update package
  gigPackage.amountReleased = gigPackage.amountReleased.plus(amount);
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.save();

  // Create payment event
  let id =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let payment = new PaymentEvent(id);
  payment.package = packageId;
  payment.from = gigPackage.creator;
  payment.to = to;
  payment.amount = amount;
  payment.timestamp = event.block.timestamp;
  payment.transactionHash = event.transaction.hash;
  payment.blockNumber = event.block.number;

  // Link to deliverable if it's a single payment
  if (!deliverableId.isZero()) {
    let deliverableIdStr = packageId + "-" + deliverableId.toString();
    payment.deliverable = deliverableIdStr;
  }

  payment.save();

  // Create activity event
  createActivityEvent(
    event,
    packageId,
    "PAYMENT_RELEASED",
    gigPackage.creator,
    to,
    deliverableId.isZero() ? null : packageId + "-" + deliverableId.toString(),
    amount
  );

  // Update user stats
  let user = getOrCreateUser(to);
  user.totalEarned = user.totalEarned.plus(amount);
  user.save();

  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.totalAmountReleased = stats.totalAmountReleased.plus(amount);
  stats.lastUpdateTimestamp = event.block.timestamp;
  stats.save();
}

export function handleGigPackageCompleted(event: GigPackageCompleted): void {
  let packageId = event.params.packageId.toString();

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleGigPackageCompleted for package {}", [
      packageId,
    ]);
    return;
  }

  // Update package
  gigPackage.status = PackageStatus.COMPLETED;
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.save();

  // Create activity event
  createActivityEvent(event, packageId, "GIG_COMPLETED");

  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.activePackages -= 1;
  stats.completedPackages += 1;
  stats.lastUpdateTimestamp = event.block.timestamp;
  stats.save();
}

export function handleGigPackageCancelled(event: GigPackageCancelled): void {
  let packageId = event.params.packageId.toString();

  // Load the package
  let gigPackage = GigPackage.load(packageId);
  if (gigPackage == null) {
    log.error("Package not found in handleGigPackageCancelled for package {}", [
      packageId,
    ]);
    return;
  }

  // Update package
  gigPackage.status = PackageStatus.CANCELLED;
  gigPackage.lastUpdated = event.block.timestamp;
  gigPackage.save();

  // Create activity event
  createActivityEvent(event, packageId, "GIG_CANCELLED");

  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.activePackages -= 1;
  stats.cancelledPackages += 1;
  stats.totalAmountLocked = stats.totalAmountLocked.minus(
    gigPackage.totalAmount.minus(gigPackage.amountReleased)
  );
  stats.lastUpdateTimestamp = event.block.timestamp;
  stats.save();
}

export function handleGigPackageExpired(event: GigPackageExpired): void {
  let packageId = event.params.packageId.toString();

  // Create activity event
  createActivityEvent(event, packageId, "GIG_EXPIRED");

  // We don't need to update the package status since handleGigPackageCancelled
  // will be called right after this in the same transaction
}
