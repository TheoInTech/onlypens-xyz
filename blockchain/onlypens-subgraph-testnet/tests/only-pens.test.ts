import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { DeliverableApproved } from "../generated/schema"
import { DeliverableApproved as DeliverableApprovedEvent } from "../generated/OnlyPens/OnlyPens"
import { handleDeliverableApproved } from "../src/only-pens"
import { createDeliverableApprovedEvent } from "./only-pens-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let packageId = BigInt.fromI32(234)
    let deliverableId = BigInt.fromI32(234)
    let writer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newDeliverableApprovedEvent = createDeliverableApprovedEvent(
      packageId,
      deliverableId,
      writer
    )
    handleDeliverableApproved(newDeliverableApprovedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DeliverableApproved created and stored", () => {
    assert.entityCount("DeliverableApproved", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DeliverableApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "packageId",
      "234"
    )
    assert.fieldEquals(
      "DeliverableApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "deliverableId",
      "234"
    )
    assert.fieldEquals(
      "DeliverableApproved",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "writer",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
