import { BigInt } from "@graphprotocol/graph-ts";
import {
  OnlyPensEscrow,
  GigCreated,
  InviteSent,
  InviteAccepted,
  DraftSubmitted,
  DraftRevised,
  DraftApproved,
  DraftRejected,
  PaymentReleased,
  PaymentRefunded,
  GigExpired,
  GigCancelled,
} from "../generated/OnlyPensEscrow/OnlyPensEscrow";
import { Gig, Activity } from "../generated/schema";

function recordActivity(
  gigId: BigInt,
  type: string,
  actor: Bytes | null,
  amount: BigInt | null,
  timestamp: BigInt
): void {
  let gig = Gig.load(gigId.toString());
  if (!gig) return;
  let activityId = gigId.toString() + "-" + type + "-" + timestamp.toString();
  let act = new Activity(activityId);
  act.gig = gig.id;
  act.type = type;
  if (actor) act.actor = actor;
  if (amount) act.amount = amount;
  act.timestamp = timestamp;
  act.save();

  // update gig status/timestamps if needed
  gig.status = type;
  gig.lastUpdated = timestamp;
  gig.save();
}

export function handleGigCreated(e: GigCreated): void {
  let gig = new Gig(e.params.gigId.toString());
  gig.id = e.params.gigId.toString();
  gig.creator = e.params.creator;
  gig.writer = null;
  gig.amount = e.params.amount;
  gig.status = "GIG_CREATED";
  gig.createdAt = e.params.timestamp;
  gig.lastUpdated = e.params.timestamp;
  gig.save();

  recordActivity(
    e.params.gigId,
    "GIG_CREATED",
    e.params.creator,
    null,
    e.params.timestamp
  );
}

export function handleInviteSent(e: InviteSent): void {
  recordActivity(
    e.params.gigId,
    "INVITE_SENT",
    e.params.writer,
    null,
    e.block.timestamp
  );
}

// ...and so on for each event handler...
