import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/OnlyPens/OnlyPens"

export function createDeliverableApprovedEvent(
  packageId: BigInt,
  deliverableId: BigInt,
  writer: Address
): DeliverableApproved {
  let deliverableApprovedEvent = changetype<DeliverableApproved>(newMockEvent())

  deliverableApprovedEvent.parameters = new Array()

  deliverableApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  deliverableApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "deliverableId",
      ethereum.Value.fromUnsignedBigInt(deliverableId)
    )
  )
  deliverableApprovedEvent.parameters.push(
    new ethereum.EventParam("writer", ethereum.Value.fromAddress(writer))
  )

  return deliverableApprovedEvent
}

export function createDeliverableCreatedEvent(
  packageId: BigInt,
  deliverableId: BigInt,
  contentType: string,
  amount: BigInt
): DeliverableCreated {
  let deliverableCreatedEvent = changetype<DeliverableCreated>(newMockEvent())

  deliverableCreatedEvent.parameters = new Array()

  deliverableCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  deliverableCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deliverableId",
      ethereum.Value.fromUnsignedBigInt(deliverableId)
    )
  )
  deliverableCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "contentType",
      ethereum.Value.fromString(contentType)
    )
  )
  deliverableCreatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return deliverableCreatedEvent
}

export function createDeliverableRejectedEvent(
  packageId: BigInt,
  deliverableId: BigInt,
  writer: Address
): DeliverableRejected {
  let deliverableRejectedEvent = changetype<DeliverableRejected>(newMockEvent())

  deliverableRejectedEvent.parameters = new Array()

  deliverableRejectedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  deliverableRejectedEvent.parameters.push(
    new ethereum.EventParam(
      "deliverableId",
      ethereum.Value.fromUnsignedBigInt(deliverableId)
    )
  )
  deliverableRejectedEvent.parameters.push(
    new ethereum.EventParam("writer", ethereum.Value.fromAddress(writer))
  )

  return deliverableRejectedEvent
}

export function createDeliverableRevisedEvent(
  packageId: BigInt,
  deliverableId: BigInt,
  writer: Address
): DeliverableRevised {
  let deliverableRevisedEvent = changetype<DeliverableRevised>(newMockEvent())

  deliverableRevisedEvent.parameters = new Array()

  deliverableRevisedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  deliverableRevisedEvent.parameters.push(
    new ethereum.EventParam(
      "deliverableId",
      ethereum.Value.fromUnsignedBigInt(deliverableId)
    )
  )
  deliverableRevisedEvent.parameters.push(
    new ethereum.EventParam("writer", ethereum.Value.fromAddress(writer))
  )

  return deliverableRevisedEvent
}

export function createDeliverableSubmittedEvent(
  packageId: BigInt,
  deliverableId: BigInt,
  writer: Address
): DeliverableSubmitted {
  let deliverableSubmittedEvent =
    changetype<DeliverableSubmitted>(newMockEvent())

  deliverableSubmittedEvent.parameters = new Array()

  deliverableSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  deliverableSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "deliverableId",
      ethereum.Value.fromUnsignedBigInt(deliverableId)
    )
  )
  deliverableSubmittedEvent.parameters.push(
    new ethereum.EventParam("writer", ethereum.Value.fromAddress(writer))
  )

  return deliverableSubmittedEvent
}

export function createGhostwriterInvitedEvent(
  packageId: BigInt,
  ghostwriter: Address
): GhostwriterInvited {
  let ghostwriterInvitedEvent = changetype<GhostwriterInvited>(newMockEvent())

  ghostwriterInvitedEvent.parameters = new Array()

  ghostwriterInvitedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  ghostwriterInvitedEvent.parameters.push(
    new ethereum.EventParam(
      "ghostwriter",
      ethereum.Value.fromAddress(ghostwriter)
    )
  )

  return ghostwriterInvitedEvent
}

export function createGigPackageCancelledEvent(
  packageId: BigInt
): GigPackageCancelled {
  let gigPackageCancelledEvent = changetype<GigPackageCancelled>(newMockEvent())

  gigPackageCancelledEvent.parameters = new Array()

  gigPackageCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )

  return gigPackageCancelledEvent
}

export function createGigPackageCompletedEvent(
  packageId: BigInt
): GigPackageCompleted {
  let gigPackageCompletedEvent = changetype<GigPackageCompleted>(newMockEvent())

  gigPackageCompletedEvent.parameters = new Array()

  gigPackageCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )

  return gigPackageCompletedEvent
}

export function createGigPackageCreatedEvent(
  packageId: BigInt,
  creator: Address,
  amount: BigInt,
  expiresAt: BigInt
): GigPackageCreated {
  let gigPackageCreatedEvent = changetype<GigPackageCreated>(newMockEvent())

  gigPackageCreatedEvent.parameters = new Array()

  gigPackageCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  gigPackageCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  gigPackageCreatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  gigPackageCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "expiresAt",
      ethereum.Value.fromUnsignedBigInt(expiresAt)
    )
  )

  return gigPackageCreatedEvent
}

export function createGigPackageExpiredEvent(
  packageId: BigInt
): GigPackageExpired {
  let gigPackageExpiredEvent = changetype<GigPackageExpired>(newMockEvent())

  gigPackageExpiredEvent.parameters = new Array()

  gigPackageExpiredEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )

  return gigPackageExpiredEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createInvitationAcceptedEvent(
  packageId: BigInt,
  ghostwriter: Address
): InvitationAccepted {
  let invitationAcceptedEvent = changetype<InvitationAccepted>(newMockEvent())

  invitationAcceptedEvent.parameters = new Array()

  invitationAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  invitationAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "ghostwriter",
      ethereum.Value.fromAddress(ghostwriter)
    )
  )

  return invitationAcceptedEvent
}

export function createInvitationDeclinedEvent(
  packageId: BigInt,
  ghostwriter: Address
): InvitationDeclined {
  let invitationDeclinedEvent = changetype<InvitationDeclined>(newMockEvent())

  invitationDeclinedEvent.parameters = new Array()

  invitationDeclinedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  invitationDeclinedEvent.parameters.push(
    new ethereum.EventParam(
      "ghostwriter",
      ethereum.Value.fromAddress(ghostwriter)
    )
  )

  return invitationDeclinedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPaymentReleasedEvent(
  packageId: BigInt,
  deliverableId: BigInt,
  to: Address,
  amount: BigInt
): PaymentReleased {
  let paymentReleasedEvent = changetype<PaymentReleased>(newMockEvent())

  paymentReleasedEvent.parameters = new Array()

  paymentReleasedEvent.parameters.push(
    new ethereum.EventParam(
      "packageId",
      ethereum.Value.fromUnsignedBigInt(packageId)
    )
  )
  paymentReleasedEvent.parameters.push(
    new ethereum.EventParam(
      "deliverableId",
      ethereum.Value.fromUnsignedBigInt(deliverableId)
    )
  )
  paymentReleasedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  paymentReleasedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return paymentReleasedEvent
}
