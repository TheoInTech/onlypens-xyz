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
  PaymentReleased as PaymentReleasedEvent
} from "../generated/OnlyPens/OnlyPens"
import {
  DeliverableApproved,
  DeliverableCreated,
  DeliverableRejected,
  DeliverableRevised,
  DeliverableSubmitted,
  GhostwriterInvited,
  GigPackageCancelled,
  GigPackageCompleted,
  GigPackageCreated,
  GigPackageExpired,
  Initialized,
  InvitationAccepted,
  InvitationDeclined,
  OwnershipTransferred,
  PaymentReleased
} from "../generated/schema"

export function handleDeliverableApproved(
  event: DeliverableApprovedEvent
): void {
  let entity = new DeliverableApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.deliverableId = event.params.deliverableId
  entity.writer = event.params.writer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeliverableCreated(event: DeliverableCreatedEvent): void {
  let entity = new DeliverableCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.deliverableId = event.params.deliverableId
  entity.contentType = event.params.contentType
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeliverableRejected(
  event: DeliverableRejectedEvent
): void {
  let entity = new DeliverableRejected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.deliverableId = event.params.deliverableId
  entity.writer = event.params.writer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeliverableRevised(event: DeliverableRevisedEvent): void {
  let entity = new DeliverableRevised(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.deliverableId = event.params.deliverableId
  entity.writer = event.params.writer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeliverableSubmitted(
  event: DeliverableSubmittedEvent
): void {
  let entity = new DeliverableSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.deliverableId = event.params.deliverableId
  entity.writer = event.params.writer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGhostwriterInvited(event: GhostwriterInvitedEvent): void {
  let entity = new GhostwriterInvited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.ghostwriter = event.params.ghostwriter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGigPackageCancelled(
  event: GigPackageCancelledEvent
): void {
  let entity = new GigPackageCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGigPackageCompleted(
  event: GigPackageCompletedEvent
): void {
  let entity = new GigPackageCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGigPackageCreated(event: GigPackageCreatedEvent): void {
  let entity = new GigPackageCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.creator = event.params.creator
  entity.amount = event.params.amount
  entity.expiresAt = event.params.expiresAt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGigPackageExpired(event: GigPackageExpiredEvent): void {
  let entity = new GigPackageExpired(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInvitationAccepted(event: InvitationAcceptedEvent): void {
  let entity = new InvitationAccepted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.ghostwriter = event.params.ghostwriter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInvitationDeclined(event: InvitationDeclinedEvent): void {
  let entity = new InvitationDeclined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.ghostwriter = event.params.ghostwriter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaymentReleased(event: PaymentReleasedEvent): void {
  let entity = new PaymentReleased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.packageId = event.params.packageId
  entity.deliverableId = event.params.deliverableId
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
