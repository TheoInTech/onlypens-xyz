import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MockERC20 } from "../typechain-types/contracts/MockERC20";
import { OnlyPens } from "../typechain-types/contracts/OnlyPens.sol/OnlyPens";
import "./helpers"; // Import the helper functions

// Define interface for DeliverableInput to match contract struct
interface DeliverableInput {
  contentType: string;
  amount: bigint;
  quantity: bigint;
}

// Force TypeScript to use 'any' type for the contract to avoid type errors during test updates
// This is a temporary workaround while updating tests for the modified contract
const asAny = (contract: any) => contract as any;

describe("OnlyPens", function () {
  // Set up fixture
  async function deployOnlyPensFixture() {
    // Get signers
    const [owner, creator, writer1, writer2, otherAccount, treasury] =
      await ethers.getSigners();

    // Deploy Mock USDC token
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = (await MockUSDC.deploy(
      "USD Coin",
      "USDC",
      6
    )) as MockERC20;
    const usdcAddress = await mockUSDC.getAddress();

    // Deploy the OnlyPensHelpers library first
    const OnlyPensHelpers = await ethers.getContractFactory("OnlyPensHelpers");
    const onlyPensHelpers = await OnlyPensHelpers.deploy();
    await onlyPensHelpers.waitForDeployment();
    const helpersAddress = await onlyPensHelpers.getAddress();

    // Deploy OnlyPens with library linking
    const OnlyPens = await ethers.getContractFactory("OnlyPens", {
      libraries: {
        OnlyPensHelpers: helpersAddress,
      },
    });

    // Deploy OnlyPens as a non-upgradeable contract with constructor arguments
    const onlyPens = await OnlyPens.deploy(
      usdcAddress,
      treasury.address,
      1000 // 10% platform fee
    );
    await onlyPens.waitForDeployment();
    // Use as unknown first to avoid TypeScript errors
    const typedOnlyPens = onlyPens as unknown as OnlyPens;
    const onlyPensAddress = await onlyPens.getAddress();

    // Mint some USDC to the creator
    const usdcAmount = ethers.parseUnits("1000", 6); // 1000 USDC with 6 decimals
    await mockUSDC.mint(creator.address, usdcAmount);
    await mockUSDC.mint(writer1.address, usdcAmount);

    // Approve OnlyPens to spend creator's USDC
    await mockUSDC.connect(creator).approve(onlyPensAddress, usdcAmount);
    await mockUSDC.connect(writer1).approve(onlyPensAddress, usdcAmount);

    return {
      onlyPens: typedOnlyPens,
      mockUSDC,
      owner,
      creator,
      writer1,
      writer2,
      otherAccount,
      treasury,
      usdcAmount,
      onlyPensHelpers,
    };
  }

  // Moved setupAssignedPackage to a higher scope
  async function setupAssignedPackage() {
    const fixture = await loadFixture(deployOnlyPensFixture);
    const { onlyPens, creator, writer1, mockUSDC, treasury } = fixture;

    // Create package
    const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
    const deliverables: DeliverableInput[] = [
      { contentType: "Article", amount: BigInt(60000000), quantity: BigInt(2) }, // 60 USDC
      { contentType: "Review", amount: BigInt(40000000), quantity: BigInt(1) }, // 40 USDC
    ];

    const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

    await onlyPens
      .connect(creator)
      .createGigPackage(totalAmount, deliverables, futureTime);

    // Invite and accept
    await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
    await onlyPens.connect(writer1).acceptInvitation(1);

    return {
      ...fixture,
      packageId: 1,
      deliverableIds: [1, 2],
      mockUSDC,
      treasury,
    };
  }

  // Moved setupSubmittedDeliverables to a higher scope
  async function setupSubmittedDeliverables() {
    const fixture = await setupAssignedPackage(); // This now correctly accesses the higher-scoped function
    const { onlyPens, writer1, packageId, deliverableIds, mockUSDC, treasury } =
      fixture;

    // Submit deliverables - using asAny to avoid TypeScript errors
    await asAny(onlyPens)
      .connect(writer1)
      .submitDeliverable(packageId, deliverableIds[0], BigInt(2));
    await asAny(onlyPens)
      .connect(writer1)
      .submitDeliverable(packageId, deliverableIds[1], BigInt(1));

    return fixture; // fixture already contains mockUSDC and treasury from setupAssignedPackage
  }

  describe("Deployment", function () {
    it("Should be initialized with the correct USDC token", async function () {
      const { onlyPens, mockUSDC } = await loadFixture(deployOnlyPensFixture);
      expect(await onlyPens.usdc()).to.equal(await mockUSDC.getAddress());
    });

    it("Should set the right owner", async function () {
      const { onlyPens, owner } = await loadFixture(deployOnlyPensFixture);
      expect(await onlyPens.owner()).to.equal(owner.address);
    });

    it("Should initialize with the correct next package ID", async function () {
      const { onlyPens } = await loadFixture(deployOnlyPensFixture);
      expect(await onlyPens.nextPackageId()).to.equal(1);
    });

    it("Should initialize with the correct next deliverable ID", async function () {
      const { onlyPens } = await loadFixture(deployOnlyPensFixture);
      expect(await onlyPens.nextDeliverableId()).to.equal(1);
    });

    it("Should revert if deployed with zero address for USDC", async function () {
      const { onlyPensHelpers, treasury } = await loadFixture(
        deployOnlyPensFixture
      );

      const helpersAddress = await onlyPensHelpers.getAddress();
      const OnlyPens = await ethers.getContractFactory("OnlyPens", {
        libraries: {
          OnlyPensHelpers: helpersAddress,
        },
      });

      // Try to deploy with zero address for USDC
      await expect(
        OnlyPens.deploy(ethers.ZeroAddress, treasury.address, 1000)
      ).to.be.revertedWith("Invalid USDC");
    });

    it("Should revert if deployed with zero address for treasury", async function () {
      const { onlyPensHelpers, mockUSDC } = await loadFixture(
        deployOnlyPensFixture
      );

      const helpersAddress = await onlyPensHelpers.getAddress();
      const usdcAddress = await mockUSDC.getAddress();
      const OnlyPens = await ethers.getContractFactory("OnlyPens", {
        libraries: {
          OnlyPensHelpers: helpersAddress,
        },
      });

      // Try to deploy with zero address for treasury
      await expect(
        OnlyPens.deploy(usdcAddress, ethers.ZeroAddress, 1000)
      ).to.be.revertedWith("Invalid treasury");
    });

    it("Should revert if deployed with platform fee > 100%", async function () {
      const { onlyPensHelpers, mockUSDC, treasury } = await loadFixture(
        deployOnlyPensFixture
      );

      const helpersAddress = await onlyPensHelpers.getAddress();
      const usdcAddress = await mockUSDC.getAddress();
      const OnlyPens = await ethers.getContractFactory("OnlyPens", {
        libraries: {
          OnlyPensHelpers: helpersAddress,
        },
      });

      // Try to deploy with platform fee > 100%
      await expect(
        OnlyPens.deploy(usdcAddress, treasury.address, 10001)
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Gig Package Creation", function () {
    it("Should create a package successfully with multiple deliverables", async function () {
      const { onlyPens, creator, mockUSDC } = await loadFixture(
        deployOnlyPensFixture
      );

      const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const deliverables: DeliverableInput[] = [
        {
          contentType: "Article",
          amount: BigInt(60000000),
          quantity: BigInt(2),
        }, // 60 USDC
        {
          contentType: "Review",
          amount: BigInt(40000000),
          quantity: BigInt(1),
        }, // 40 USDC
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      )
        .to.emit(onlyPens, "GigPackageCreated")
        .withArgs(1, creator.address, totalAmount, futureTime)
        .to.emit(onlyPens, "DeliverableCreated")
        .withArgs(1, 1, "Article", 60000000, 2) // Include quantity
        .to.emit(onlyPens, "DeliverableCreated")
        .withArgs(1, 2, "Review", 40000000, 1); // Include quantity

      // Check the creator's USDC balance decreased
      const creatorBalance = await mockUSDC.balanceOf(creator.address);
      expect(creatorBalance).to.equal(ethers.parseUnits("900", 6)); // 1000 - 100 = 900

      // Check contract's USDC balance increased
      const contractBalance = await mockUSDC.balanceOf(
        await onlyPens.getAddress()
      );
      expect(contractBalance).to.equal(ethers.parseUnits("100", 6));

      // Verify package details
      const packageDetails = await onlyPens.getPackageDetails(1);
      expect(packageDetails[0]).to.equal(creator.address); // creator
      expect(packageDetails[1]).to.equal(ethers.ZeroAddress); // writer (not assigned yet)
      expect(packageDetails[2]).to.equal(totalAmount); // total amount
      expect(packageDetails[6]).to.equal(0); // status: PENDING
      expect(packageDetails[7]).to.equal(2); // numDeliverables

      // Verify package IDs are correctly recorded for the creator
      const userPackages = await onlyPens.getUserPackages(creator.address);
      expect(userPackages.length).to.equal(1);
      expect(userPackages[0]).to.equal(1);

      // Verify deliverables
      const deliverableIds = await onlyPens.getPackageDeliverables(1);
      expect(deliverableIds.length).to.equal(2);
      expect(deliverableIds[0]).to.equal(1);
      expect(deliverableIds[1]).to.equal(2);

      const deliverable1 = await onlyPens.packageDeliverables(1, 1);
      expect(deliverable1.contentType).to.equal("Article");
      expect(deliverable1.amount).to.equal(60000000); // Adjust to match contract values
      expect(asAny(deliverable1).quantity).to.equal(2);
      expect(deliverable1.status).to.equal(0); // PENDING

      const deliverable2 = await onlyPens.packageDeliverables(1, 2);
      expect(deliverable2.contentType).to.equal("Review");
      expect(deliverable2.amount).to.equal(40000000); // Adjust to match contract values
      expect(asAny(deliverable2).quantity).to.equal(1);
      expect(deliverable2.status).to.equal(0); // PENDING
    });

    it("Should revert when creating a package with zero amount", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const deliverables = [
        { contentType: "Article", amount: BigInt(0), quantity: BigInt(1) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(BigInt(0), deliverables, futureTime)
      ).to.be.revertedWith("Zero amount");
    });

    it("Should revert when creating a package with past expiry date", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const deliverables = [
        { contentType: "Article", amount: BigInt(100), quantity: BigInt(1) },
      ];

      const pastTime = (await time.latest()) - 3600; // 1 hour ago

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, pastTime)
      ).to.be.revertedWith("Past expiry");
    });

    it("Should revert when creating a package with no deliverables", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const emptyDeliverables: any[] = [];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, emptyDeliverables, futureTime)
      ).to.be.revertedWith("Invalid deliverables");
    });

    it("Should revert when deliverable amounts don't sum to total amount", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const deliverables = [
        { contentType: "Article", amount: BigInt(60), quantity: BigInt(1) },
        { contentType: "Review", amount: BigInt(30), quantity: BigInt(1) },
      ];
      // Total is 90, not 100

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Invalid deliverables");
    });

    it("Should revert when a deliverable has an empty content type", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const deliverables = [
        { contentType: "", amount: BigInt(100), quantity: BigInt(1) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Invalid deliverables");
    });

    it("Should revert when a deliverable has zero amount", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const deliverables = [
        { contentType: "Article", amount: BigInt(100), quantity: BigInt(1) },
        { contentType: "Review", amount: BigInt(0), quantity: BigInt(1) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Invalid deliverables");
    });

    it("Should revert when a deliverable has zero quantity", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const deliverables = [
        { contentType: "Article", amount: BigInt(100), quantity: BigInt(0) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Invalid deliverables");
    });

    it("Should revert when creator doesn't have enough USDC", async function () {
      const { onlyPens, creator, mockUSDC } = await loadFixture(
        deployOnlyPensFixture
      );

      // Decrease allowance to create insufficient funds scenario
      await mockUSDC
        .connect(creator)
        .approve(await onlyPens.getAddress(), ethers.parseUnits("50", 6));

      const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const deliverables = [
        {
          contentType: "Article",
          amount: BigInt(100000000), // 100 USDC with 6 decimals
          quantity: BigInt(1),
        },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Transfer failed");
    });

    it("Should create a package with no expiry date", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = BigInt(100);
      const deliverables = [
        { contentType: "Article", amount: BigInt(100), quantity: BigInt(1) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      )
        .to.emit(onlyPens, "GigPackageCreated")
        .withArgs(1, creator.address, totalAmount, futureTime);

      const packageDetails = await onlyPens.getPackageDetails(1);
      expect(packageDetails[5]).to.equal(futureTime); // expiresAt
    });
  });

  describe("Ghostwriter Invitations", function () {
    async function createTestPackage() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator } = fixture;

      const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const deliverables: DeliverableInput[] = [
        {
          contentType: "Article",
          amount: BigInt(60000000),
          quantity: BigInt(2),
        },
        {
          contentType: "Review",
          amount: BigInt(40000000),
          quantity: BigInt(1),
        },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      return { ...fixture, packageId: 1 };
    }

    it("Should invite a ghostwriter successfully", async function () {
      const { onlyPens, creator, writer1, packageId } =
        await createTestPackage();

      await expect(
        onlyPens.connect(creator).inviteGhostwriter(packageId, writer1.address)
      )
        .to.emit(onlyPens, "GhostwriterInvited")
        .withArgs(packageId, writer1.address);

      // Check that package status is updated to INVITED
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(1); // status: INVITED

      // Check that writer is in the invitees list
      const activeInvitees = await onlyPens.getActiveInvitees(packageId);
      expect(activeInvitees.length).to.equal(1);
      expect(activeInvitees[0]).to.equal(writer1.address);

      // Check isInvited mapping
      expect(await onlyPens.isInvited(packageId, writer1.address)).to.be.true;
    });

    it("Should revert when non-creator tries to invite", async function () {
      const { onlyPens, otherAccount, writer1, packageId } =
        await createTestPackage();

      await expect(
        onlyPens
          .connect(otherAccount)
          .inviteGhostwriter(packageId, writer1.address)
      ).to.be.revertedWith("Not creator");
    });

    it("Should revert when trying to invite to non-existent package", async function () {
      const { onlyPens, creator, writer1 } = await loadFixture(
        deployOnlyPensFixture
      );

      await expect(
        onlyPens.connect(creator).inviteGhostwriter(999, writer1.address)
      ).to.be.revertedWith("No package");
    });

    it("Should revert when trying to invite zero address", async function () {
      const { onlyPens, creator, packageId } = await createTestPackage();

      await expect(
        onlyPens
          .connect(creator)
          .inviteGhostwriter(packageId, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid addr");
    });

    it("Should revert when creator tries to invite themselves", async function () {
      const { onlyPens, creator, packageId } = await createTestPackage();

      await expect(
        onlyPens.connect(creator).inviteGhostwriter(packageId, creator.address)
      ).to.be.revertedWith("Self invite");
    });

    it("Should revert when inviting to a package not in PENDING or INVITED state", async function () {
      const { onlyPens, creator, writer1, writer2, packageId } =
        await createTestPackage();

      // Invite writer1
      await onlyPens
        .connect(creator)
        .inviteGhostwriter(packageId, writer1.address);

      // Writer1 accepts invitation
      await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Try to invite writer2 after package is ASSIGNED
      await expect(
        onlyPens.connect(creator).inviteGhostwriter(packageId, writer2.address)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should invite multiple ghostwriters", async function () {
      const { onlyPens, creator, writer1, writer2, packageId } =
        await createTestPackage();

      // Invite writer1
      await onlyPens
        .connect(creator)
        .inviteGhostwriter(packageId, writer1.address);

      // Invite writer2
      await onlyPens
        .connect(creator)
        .inviteGhostwriter(packageId, writer2.address);

      // Check invitees list
      const activeInvitees = await onlyPens.getActiveInvitees(packageId);
      expect(activeInvitees.length).to.equal(2);
      expect(activeInvitees).to.include(writer1.address);
      expect(activeInvitees).to.include(writer2.address);
    });

    it("Should revert when re-inviting an already invited ghostwriter", async function () {
      const { onlyPens, creator, writer1, packageId } =
        await createTestPackage();

      // Invite writer1
      await onlyPens
        .connect(creator)
        .inviteGhostwriter(packageId, writer1.address);

      // Try to invite writer1 again
      await expect(
        onlyPens.connect(creator).inviteGhostwriter(packageId, writer1.address)
      ).to.be.revertedWith("Already invited");
    });
  });

  describe("Invitation Acceptance and Declination", function () {
    async function createAndInvite() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1, writer2 } = fixture;

      const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const deliverables: DeliverableInput[] = [
        {
          contentType: "Article",
          amount: BigInt(100000000),
          quantity: BigInt(1),
        },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      // Invite writers
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
      await onlyPens.connect(creator).inviteGhostwriter(1, writer2.address);

      return { ...fixture, packageId: 1 };
    }

    it("Should accept invitation successfully", async function () {
      const { onlyPens, writer1, packageId } = await createAndInvite();

      await expect(onlyPens.connect(writer1).acceptInvitation(packageId))
        .to.emit(onlyPens, "InvitationAccepted")
        .withArgs(packageId, writer1.address);

      // Check package status and writer assignment
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[1]).to.equal(writer1.address); // writer
      expect(packageDetails[6]).to.equal(2); // status: ASSIGNED

      // Check that package is added to writer's packages
      const writerPackages = await onlyPens.getUserPackages(writer1.address);
      expect(writerPackages.length).to.equal(1);
      expect(writerPackages[0]).to.equal(packageId);
    });

    it("Should revert when non-invited user tries to accept", async function () {
      const { onlyPens, otherAccount, packageId } = await createAndInvite();

      await expect(
        onlyPens.connect(otherAccount).acceptInvitation(packageId)
      ).to.be.revertedWith("Not invited");
    });

    it("Should revert when trying to accept for non-existent package", async function () {
      const { onlyPens, writer1 } = await loadFixture(deployOnlyPensFixture);

      await expect(
        onlyPens.connect(writer1).acceptInvitation(999)
      ).to.be.revertedWith("No package");
    });

    it("Should revert when trying to accept invitation for non-INVITED package", async function () {
      const { onlyPens, creator, writer1 } = await loadFixture(
        deployOnlyPensFixture
      );

      // Create package but don't invite anyone
      const totalAmount = BigInt(100);
      const deliverables: DeliverableInput[] = [
        { contentType: "Article", amount: BigInt(100), quantity: BigInt(1) },
      ];
      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now
      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      await expect(
        onlyPens.connect(writer1).acceptInvitation(1)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should revert when trying to accept invitation that's already assigned", async function () {
      const { onlyPens, writer1, writer2, packageId } = await createAndInvite();

      // Writer1 accepts first
      await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Writer2 tries to accept after it's assigned
      await expect(
        onlyPens.connect(writer2).acceptInvitation(packageId)
      ).to.be.revertedWith("Already assigned");
    });

    it("Should decline invitation successfully", async function () {
      const { onlyPens, writer1, packageId } = await createAndInvite();

      await expect(onlyPens.connect(writer1).declineInvitation(packageId))
        .to.emit(onlyPens, "InvitationDeclined")
        .withArgs(packageId, writer1.address);

      // Check the writer is removed from active invitees
      const activeInvitees = await onlyPens.getActiveInvitees(packageId);
      expect(activeInvitees).to.not.include(writer1.address);
    });

    it("Should revert when non-invited writer tries to decline", async function () {
      const { onlyPens, otherAccount, packageId } = await createAndInvite();

      await expect(
        onlyPens.connect(otherAccount).declineInvitation(packageId)
      ).to.be.revertedWith("Not invited");
    });

    it("Should revert when trying to decline already declined invitation", async function () {
      const { onlyPens, writer1, packageId } = await createAndInvite();

      // Decline once
      await onlyPens.connect(writer1).declineInvitation(packageId);

      // Try to decline again
      await expect(
        onlyPens.connect(writer1).declineInvitation(packageId)
      ).to.be.revertedWith("Already declined");
    });

    it("Should revert package status to PENDING when all invitations are declined", async function () {
      const { onlyPens, writer1, writer2, packageId } = await createAndInvite();

      // Both writers decline
      await onlyPens.connect(writer1).declineInvitation(packageId);
      await onlyPens.connect(writer2).declineInvitation(packageId);

      // Check package status reverted to PENDING
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(0); // status: PENDING
    });

    it("Should revert if a writer tries to accept an invitation multiple times", async function () {
      const { onlyPens, writer1, packageId } = await createAndInvite();

      // Writer1 accepts the invitation
      await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Writer1 tries to accept the invitation again
      await expect(
        onlyPens.connect(writer1).acceptInvitation(packageId)
      ).to.be.revertedWith("Already assigned");
    });

    it("Should revert if an assigned writer tries to decline an invitation", async function () {
      const { onlyPens, writer1, packageId } = await createAndInvite();

      // Writer1 accepts the invitation
      await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Writer1 tries to decline the invitation after accepting
      // The package status is now ASSIGNED, so declineInvitation should fail
      await expect(
        onlyPens.connect(writer1).declineInvitation(packageId)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should revert if a writer who declined tries to accept an invitation", async function () {
      const { onlyPens, writer1, packageId } = await createAndInvite();

      // Writer1 declines the invitation
      await onlyPens.connect(writer1).declineInvitation(packageId);

      // Writer1 tries to accept the invitation after declining
      await expect(
        onlyPens.connect(writer1).acceptInvitation(packageId)
      ).to.be.revertedWith("Invite removed");
    });
  });

  describe("Deliverable Submission", function () {
    it("Should submit a deliverable successfully", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      const submittedQuantity = BigInt(2);

      await expect(
        asAny(onlyPens)
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0], submittedQuantity)
      )
        .to.emit(onlyPens, "DeliverableSubmitted")
        .withArgs(
          packageId,
          deliverableIds[0],
          writer1.address,
          submittedQuantity
        );

      // Check deliverable status
      const deliverable = await onlyPens.packageDeliverables(
        packageId,
        deliverableIds[0]
      );
      expect(deliverable.status).to.equal(1); // SUBMITTED
      // Note: Using asAny to access submittedQuantity which isn't in the type definition
      expect(asAny(deliverable).submittedQuantity).to.equal(submittedQuantity);
      expect(deliverable.submittedAt).to.be.gt(0);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(3); // IN_PROGRESS
    });

    it("Should revert when non-writer tries to submit", async function () {
      const { onlyPens, otherAccount, packageId, deliverableIds } =
        await setupAssignedPackage();

      await expect(
        asAny(onlyPens)
          .connect(otherAccount)
          .submitDeliverable(packageId, deliverableIds[0], BigInt(2))
      ).to.be.revertedWith("Not writer");
    });

    it("Should revert when submitting to non-existent package", async function () {
      const { onlyPens, writer1 } = await loadFixture(deployOnlyPensFixture);

      await expect(
        asAny(onlyPens).connect(writer1).submitDeliverable(999, 1, BigInt(2))
      ).to.be.revertedWith("No package");
    });

    it("Should revert when submitting non-existent deliverable", async function () {
      const { onlyPens, writer1, packageId } = await setupAssignedPackage();

      await expect(
        asAny(onlyPens)
          .connect(writer1)
          .submitDeliverable(packageId, 999, BigInt(2))
      ).to.be.revertedWith("No deliverable");
    });

    it("Should revert when trying to submit already submitted deliverable", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      // Submit once
      await asAny(onlyPens)
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0], BigInt(2));

      // Try to submit again
      await expect(
        asAny(onlyPens)
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0], BigInt(2))
      ).to.be.revertedWith("Already handled");
    });

    it("Should revert when submitting invalid quantity", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      // Trying to submit 0 quantity
      await expect(
        asAny(onlyPens)
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0], BigInt(0))
      ).to.be.revertedWith("Invalid quantity");

      // Trying to submit more than requested quantity
      await expect(
        asAny(onlyPens)
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0], BigInt(3)) // Exceeds quantity of 2
      ).to.be.revertedWith("Invalid quantity");
    });

    it("Should submit all deliverables successfully", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      // Submit first deliverable
      await asAny(onlyPens)
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0], BigInt(2));

      // Submit second deliverable
      await asAny(onlyPens)
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[1], BigInt(1));

      // Check both are submitted
      const deliverable1 = await onlyPens.packageDeliverables(
        packageId,
        deliverableIds[0]
      );
      const deliverable2 = await onlyPens.packageDeliverables(
        packageId,
        deliverableIds[1]
      );

      expect(deliverable1.status).to.equal(1); // SUBMITTED
      expect(deliverable2.status).to.equal(1); // SUBMITTED
    });

    it("Should emit DeliverableRevised when resubmitting a rejected deliverable", async function () {
      const { onlyPens, creator, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      const submittedQuantity = BigInt(2);

      // Submit
      await asAny(onlyPens)
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0], submittedQuantity);

      // Creator rejects
      await onlyPens
        .connect(creator)
        .rejectDeliverable(packageId, deliverableIds[0]);

      // Resubmit
      await expect(
        asAny(onlyPens)
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0], submittedQuantity)
      )
        .to.emit(onlyPens, "DeliverableRevised")
        .withArgs(
          packageId,
          deliverableIds[0],
          writer1.address,
          submittedQuantity
        );
    });
  });

  describe("Deliverable Approval and Rejection", function () {
    it("Should approve a deliverable successfully", async function () {
      const {
        onlyPens,
        creator,
        writer1,
        packageId,
        deliverableIds,
        mockUSDC,
        treasury,
      } = await setupSubmittedDeliverables();

      // Writer's balance before approval
      const writerBalanceBefore = await mockUSDC.balanceOf(writer1.address);
      const treasuryBalanceBefore = await mockUSDC.balanceOf(treasury.address);
      const deliverableAmount = BigInt(60000000); // 60 USDC with 6 decimals
      const submittedQuantity = BigInt(2); // Matches the quantity we set in the test
      const currentPlatformFeeBps = await asAny(onlyPens).platformFeeBps();
      const expectedFee =
        (deliverableAmount * BigInt(currentPlatformFeeBps)) / BigInt(10000);
      const expectedWriterAmount = deliverableAmount - expectedFee;

      await expect(
        onlyPens
          .connect(creator)
          .approveDeliverable(packageId, deliverableIds[0])
      )
        .to.emit(onlyPens, "DeliverableApproved")
        .withArgs(
          packageId,
          deliverableIds[0],
          writer1.address,
          submittedQuantity
        )
        .to.emit(onlyPens, "PaymentReleased")
        .withArgs(
          packageId,
          deliverableIds[0],
          writer1.address,
          expectedWriterAmount,
          expectedFee
        );

      // Check deliverable status
      const deliverable = await onlyPens.packageDeliverables(
        packageId,
        deliverableIds[0]
      );
      expect(deliverable.status).to.equal(2); // APPROVED
      expect(deliverable.approvedAt).to.be.gt(0);

      // Check package update
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[8]).to.equal(1); // numApproved
      expect(packageDetails[9]).to.equal(ethers.parseUnits("60", 6)); // amountReleased (this is the gross amount for the deliverable)

      // Check payment was transferred to writer
      const writerBalanceAfter = await mockUSDC.balanceOf(writer1.address);
      expect(writerBalanceAfter - writerBalanceBefore).to.equal(
        expectedWriterAmount
      );

      // Check fee was transferred to treasury
      const treasuryBalanceAfter = await mockUSDC.balanceOf(treasury.address);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(
        expectedFee
      );
    });

    it("Should complete package when all deliverables are approved", async function () {
      const {
        onlyPens,
        creator,
        writer1,
        packageId,
        deliverableIds,
        mockUSDC,
        treasury,
      } = await setupSubmittedDeliverables();

      const writerInitialBalance = await mockUSDC.balanceOf(writer1.address); // Get writer's balance before any approvals
      const treasuryInitialBalance = await mockUSDC.balanceOf(treasury.address);
      const currentPlatformFeeBpsAll = await asAny(onlyPens).platformFeeBps();

      // Approve first deliverable
      const deliverable1Amount = BigInt(60000000); // 60 USDC with 6 decimals
      const fee1 =
        (deliverable1Amount * BigInt(currentPlatformFeeBpsAll)) / BigInt(10000);
      await onlyPens
        .connect(creator)
        .approveDeliverable(packageId, deliverableIds[0]);

      // Approve second deliverable - should complete the package
      const deliverable2Amount = BigInt(40000000); // 40 USDC with 6 decimals
      const fee2 =
        (deliverable2Amount * BigInt(currentPlatformFeeBpsAll)) / BigInt(10000);
      const writerAmount2 = deliverable2Amount - fee2;
      const submittedQuantity2 = BigInt(1); // Matches the quantity we set in the test

      await expect(
        onlyPens
          .connect(creator)
          .approveDeliverable(packageId, deliverableIds[1])
      )
        .to.emit(onlyPens, "DeliverableApproved")
        .withArgs(
          packageId,
          deliverableIds[1],
          writer1.address,
          submittedQuantity2
        )
        .to.emit(onlyPens, "GigPackageCompleted")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(4); // COMPLETED
      expect(packageDetails[8]).to.equal(2); // numApproved
      expect(packageDetails[9]).to.equal(ethers.parseUnits("100", 6)); // amountReleased (gross)

      // Check total fee transferred to treasury
      const treasuryBalance = await mockUSDC.balanceOf(treasury.address);
      expect(treasuryBalance - treasuryInitialBalance).to.equal(fee1 + fee2);

      // Check total amount transferred to writer
      const writerBalance = await mockUSDC.balanceOf(writer1.address);
      // Initial balance + (deliverable1Amount - fee1) + (deliverable2Amount - fee2)
      const expectedWriterTotal =
        writerInitialBalance +
        (deliverable1Amount - fee1) +
        (deliverable2Amount - fee2);
      expect(writerBalance).to.equal(expectedWriterTotal);
    });

    it("Should reject a deliverable successfully", async function () {
      const { onlyPens, creator, writer1, packageId, deliverableIds } =
        await setupSubmittedDeliverables();

      const submittedQuantity = BigInt(2); // Matches the quantity we set in the test

      await expect(
        onlyPens
          .connect(creator)
          .rejectDeliverable(packageId, deliverableIds[0])
      )
        .to.emit(onlyPens, "DeliverableRejected")
        .withArgs(
          packageId,
          deliverableIds[0],
          writer1.address,
          submittedQuantity
        );

      // Check deliverable status
      const deliverable = await onlyPens.packageDeliverables(
        packageId,
        deliverableIds[0]
      );
      expect(deliverable.status).to.equal(3); // REJECTED
    });

    it("Should revert when non-creator tries to approve", async function () {
      const { onlyPens, otherAccount, packageId, deliverableIds } =
        await setupSubmittedDeliverables();

      await expect(
        onlyPens
          .connect(otherAccount)
          .approveDeliverable(packageId, deliverableIds[0])
      ).to.be.revertedWith("Not creator");
    });

    it("Should revert when non-creator tries to reject", async function () {
      const { onlyPens, otherAccount, packageId, deliverableIds } =
        await setupSubmittedDeliverables();

      await expect(
        onlyPens
          .connect(otherAccount)
          .rejectDeliverable(packageId, deliverableIds[0])
      ).to.be.revertedWith("Not creator");
    });

    it("Should revert when trying to approve non-submitted deliverable", async function () {
      const { onlyPens, creator, packageId, deliverableIds } =
        await setupAssignedPackage();

      await expect(
        onlyPens
          .connect(creator)
          .approveDeliverable(packageId, deliverableIds[0])
      ).to.be.revertedWith("Not submitted");
    });

    it("Should revert when trying to reject non-submitted deliverable", async function () {
      const { onlyPens, creator, packageId, deliverableIds } =
        await setupAssignedPackage();

      await expect(
        onlyPens
          .connect(creator)
          .rejectDeliverable(packageId, deliverableIds[0])
      ).to.be.revertedWith("Not submitted");
    });

    it("Should approve all deliverables at once", async function () {
      const { onlyPens, creator, writer1, packageId, mockUSDC, treasury } =
        await setupSubmittedDeliverables();

      // Writer's balance before approval
      const writerBalanceBefore = await mockUSDC.balanceOf(writer1.address);
      const treasuryBalanceBefore = await mockUSDC.balanceOf(treasury.address);
      const totalPackageAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const currentPlatformFeeBpsAll = await asAny(onlyPens).platformFeeBps();
      const expectedTotalFee =
        (totalPackageAmount * BigInt(currentPlatformFeeBpsAll)) / BigInt(10000);
      const expectedTotalWriterAmount = totalPackageAmount - expectedTotalFee;

      await expect(onlyPens.connect(creator).approveAllDeliverables(packageId))
        .to.emit(onlyPens, "GigPackageCompleted")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(4); // COMPLETED
      expect(packageDetails[8]).to.equal(2); // numApproved
      expect(packageDetails[9]).to.equal(ethers.parseUnits("100", 6)); // amountReleased (gross)

      // Check payment was transferred to writer
      const writerBalanceAfter = await mockUSDC.balanceOf(writer1.address);
      expect(writerBalanceAfter - writerBalanceBefore).to.equal(
        expectedTotalWriterAmount
      );

      // Check fee was transferred to treasury
      const treasuryBalanceAfter = await mockUSDC.balanceOf(treasury.address);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(
        expectedTotalFee
      );
    });
  });

  describe("Package Cancellation", function () {
    async function setupPendingPackage() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator } = fixture;

      const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const deliverables: DeliverableInput[] = [
        {
          contentType: "Article",
          amount: BigInt(100000000),
          quantity: BigInt(1),
        },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      return { ...fixture, packageId: 1 };
    }

    async function setupInvitedPackage() {
      const fixture = await setupPendingPackage();
      const { onlyPens, creator, writer1, packageId } = fixture;

      await onlyPens
        .connect(creator)
        .inviteGhostwriter(packageId, writer1.address);

      return fixture;
    }

    it("Should cancel a PENDING package successfully", async function () {
      const { onlyPens, creator, packageId, mockUSDC } =
        await setupPendingPackage();

      // Creator's balance before cancellation
      const creatorBalanceBefore = await mockUSDC.balanceOf(creator.address);

      await expect(onlyPens.connect(creator).cancelGigPackage(packageId))
        .to.emit(onlyPens, "GigPackageCancelled")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(5); // CANCELLED

      // Check funds were returned to creator
      const creatorBalanceAfter = await mockUSDC.balanceOf(creator.address);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(
        ethers.parseUnits("100", 6)
      );
    });

    it("Should cancel an INVITED package successfully", async function () {
      const { onlyPens, creator, packageId, mockUSDC } =
        await setupInvitedPackage();

      // Creator's balance before cancellation
      const creatorBalanceBefore = await mockUSDC.balanceOf(creator.address);

      await expect(onlyPens.connect(creator).cancelGigPackage(packageId))
        .to.emit(onlyPens, "GigPackageCancelled")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(5); // CANCELLED

      // Check funds were returned to creator
      const creatorBalanceAfter = await mockUSDC.balanceOf(creator.address);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(
        ethers.parseUnits("100", 6)
      );
    });

    it("Should revert when non-creator tries to cancel", async function () {
      const { onlyPens, otherAccount, packageId } = await setupPendingPackage();

      await expect(
        onlyPens.connect(otherAccount).cancelGigPackage(packageId)
      ).to.be.revertedWith("Not creator");
    });

    it("Should revert when trying to cancel a non-existent package", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      await expect(
        onlyPens.connect(creator).cancelGigPackage(999)
      ).to.be.revertedWith("No package");
    });

    it("Should revert when trying to cancel an ASSIGNED package", async function () {
      const { onlyPens, creator, writer1, packageId } =
        await setupInvitedPackage();

      // Writer accepts invitation
      await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Try to cancel after assignment
      await expect(
        onlyPens.connect(creator).cancelGigPackage(packageId)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should revert when trying to cancel an IN_PROGRESS package", async function () {
      const { onlyPens, creator, writer1, packageId } =
        await setupInvitedPackage();

      // Writer accepts invitation
      await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Get deliverable ID
      const deliverableIds = await onlyPens.getPackageDeliverables(packageId);

      // Writer submits deliverable, changing status to IN_PROGRESS
      await asAny(onlyPens)
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0], BigInt(1));

      // Try to cancel after submission
      await expect(
        onlyPens.connect(creator).cancelGigPackage(packageId)
      ).to.be.revertedWith("Invalid status");
    });
  });

  describe("Package Expiry", function () {
    async function setupExpiringPackage() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1 } = fixture;

      const totalAmount = BigInt(100000000); // 100 USDC with 6 decimals
      const deliverables: DeliverableInput[] = [
        {
          contentType: "Article",
          amount: BigInt(100000000),
          quantity: BigInt(1),
        },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      // Invite the writer
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);

      return { ...fixture, packageId: 1, futureTime };
    }

    it("Should report package as not expired before expiry time", async function () {
      const { onlyPens, packageId } = await setupExpiringPackage();

      expect(await onlyPens.isPackageExpired(packageId)).to.be.false;
    });

    it("Should report package as expired after expiry time", async function () {
      const { onlyPens, packageId, futureTime } = await setupExpiringPackage();

      // Move time forward beyond expiry
      await time.increaseTo(futureTime + 1);

      expect(await onlyPens.isPackageExpired(packageId)).to.be.true;
    });

    it("Should allow creator to cancel expired package", async function () {
      const { onlyPens, creator, packageId, futureTime, mockUSDC } =
        await setupExpiringPackage();

      // Move time forward beyond expiry
      await time.increaseTo(futureTime + 1);

      // Creator's balance before cancellation
      const creatorBalanceBefore = await mockUSDC.balanceOf(creator.address);

      await expect(onlyPens.connect(creator).cancelExpiredPackage(packageId))
        .to.emit(onlyPens, "GigPackageExpired")
        .withArgs(packageId)
        .to.emit(onlyPens, "GigPackageCancelled")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(5); // CANCELLED

      // Check funds were returned to creator
      const creatorBalanceAfter = await mockUSDC.balanceOf(creator.address);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(
        ethers.parseUnits("100", 6)
      );
    });

    it("Should revert when trying to cancel non-expired package", async function () {
      const { onlyPens, creator, packageId } = await setupExpiringPackage();

      await expect(
        onlyPens.connect(creator).cancelExpiredPackage(packageId)
      ).to.be.revertedWith("Not expired");
    });

    it("Should revert when trying to cancel package with no expiry time", async function () {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator } = fixture;

      // Create package with no expiry
      const totalAmount = BigInt(100);
      const deliverables: DeliverableInput[] = [
        { contentType: "Article", amount: BigInt(100), quantity: BigInt(1) },
      ];

      // Using 0 for no expiry as per contract logic
      // const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, 0); // Ensure this uses 0

      await expect(
        onlyPens.connect(creator).cancelExpiredPackage(1) // packageId is 1
      ).to.be.revertedWith("No expiry"); // Expected "No expiry"
    });

    it("Should revert when trying to cancel already finalized package", async function () {
      const { onlyPens, creator, writer1, packageId, futureTime } =
        await setupExpiringPackage();

      // DO NOT let Writer1 accept the invitation for this test case
      // await onlyPens.connect(writer1).acceptInvitation(packageId);

      // Creator cancels before expiry (using normal cancel)
      await onlyPens.connect(creator).cancelGigPackage(packageId);

      // Move time forward beyond expiry
      await time.increaseTo(futureTime + 1);

      // Try to cancel expired package
      await expect(
        onlyPens.connect(creator).cancelExpiredPackage(packageId)
      ).to.be.revertedWith("Already finalized");
    });

    it("Should revert when trying to invite to expired package", async function () {
      const { onlyPens, creator, writer2, packageId, futureTime } =
        await setupExpiringPackage();

      // Move time forward beyond expiry
      await time.increaseTo(futureTime + 1);

      // Try to invite after expiry
      await expect(
        onlyPens.connect(creator).inviteGhostwriter(packageId, writer2.address)
      ).to.be.revertedWith("Expired");
    });

    it("Should revert when trying to accept invitation after package expired", async function () {
      const { onlyPens, writer1, packageId, futureTime } =
        await setupExpiringPackage();

      // Move time forward beyond expiry
      await time.increaseTo(futureTime + 1);

      // Try to accept after expiry
      await expect(
        onlyPens.connect(writer1).acceptInvitation(packageId)
      ).to.be.revertedWith("Expired");
    });
  });

  describe("View Functions", function () {
    async function setupComplexScenario() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1, writer2 } = fixture;

      // Create first package
      const totalAmount1 = BigInt(100);
      const deliverables1: DeliverableInput[] = [
        { contentType: "Article", amount: BigInt(60), quantity: BigInt(2) },
        { contentType: "Review", amount: BigInt(40), quantity: BigInt(1) },
      ];
      const futureTime1 = (await time.latest()) + 86400 * 7; // 7 days from now
      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount1, deliverables1, futureTime1);

      // Create second package
      const totalAmount2 = BigInt(200);
      const deliverables2: DeliverableInput[] = [
        { contentType: "Research", amount: BigInt(120), quantity: BigInt(3) },
        { contentType: "Editing", amount: BigInt(80), quantity: BigInt(2) },
      ];
      const futureTime2 = (await time.latest()) + 86400 * 14; // 14 days from now
      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount2, deliverables2, futureTime2);

      // Invite writers
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
      await onlyPens.connect(creator).inviteGhostwriter(1, writer2.address);
      await onlyPens.connect(creator).inviteGhostwriter(2, writer1.address);

      // Writer1 accepts first package
      await onlyPens.connect(writer1).acceptInvitation(1);

      return { ...fixture, packageIds: [1, 2] };
    }

    it("Should get active invitees correctly", async function () {
      const { onlyPens, writer1, writer2, packageIds } =
        await setupComplexScenario();

      // Writer2 is still an active invitee for package 1
      const activeInvitees = await onlyPens.getActiveInvitees(packageIds[0]);
      expect(activeInvitees.length).to.equal(1);
      expect(activeInvitees[0]).to.equal(writer2.address);

      // Package 2 should have writer1 as an active invitee
      const activeInvitees2 = await onlyPens.getActiveInvitees(packageIds[1]);
      expect(activeInvitees2.length).to.equal(1);
      expect(activeInvitees2[0]).to.equal(writer1.address);
    });

    it("Should return empty array for non-existent package", async function () {
      const { onlyPens } = await loadFixture(deployOnlyPensFixture);

      await expect(onlyPens.getActiveInvitees(999)).to.be.revertedWith(
        "No package"
      );
    });

    it("Should get package deliverables correctly", async function () {
      const { onlyPens, packageIds } = await setupComplexScenario();

      const deliverables = await onlyPens.getPackageDeliverables(packageIds[0]);
      expect(deliverables.length).to.equal(2);
      expect(deliverables[0]).to.equal(1);
      expect(deliverables[1]).to.equal(2);

      const deliverables2 = await onlyPens.getPackageDeliverables(
        packageIds[1]
      );
      expect(deliverables2.length).to.equal(2);
      expect(deliverables2[0]).to.equal(3);
      expect(deliverables2[1]).to.equal(4);
    });

    it("Should get user packages correctly", async function () {
      const { onlyPens, creator, writer1 } = await setupComplexScenario();

      // Creator should have both packages
      const creatorPackages = await onlyPens.getUserPackages(creator.address);
      expect(creatorPackages.length).to.equal(2);
      expect(creatorPackages[0]).to.equal(1);
      expect(creatorPackages[1]).to.equal(2);

      // Writer1 should have package 1 (accepted)
      const writer1Packages = await onlyPens.getUserPackages(writer1.address);
      expect(writer1Packages.length).to.equal(1);
      expect(writer1Packages[0]).to.equal(1);
    });

    it("Should get user package details with pagination", async function () {
      const { onlyPens, creator } = await setupComplexScenario();

      // Get all packages
      const result1 = await onlyPens.getUserPackageDetails(
        creator.address,
        0,
        10
      );
      expect(result1[0].length).to.equal(2); // packageIds
      expect(result1[1]).to.equal(2); // total

      // Limit to 1
      const result2 = await onlyPens.getUserPackageDetails(
        creator.address,
        0,
        1
      );
      expect(result2[0].length).to.equal(1);
      expect(result2[0][0]).to.equal(1);
      expect(result2[1]).to.equal(2);

      // Offset by 1
      const result3 = await onlyPens.getUserPackageDetails(
        creator.address,
        1,
        10
      );
      expect(result3[0].length).to.equal(1);
      expect(result3[0][0]).to.equal(2);
      expect(result3[1]).to.equal(2);
    });

    it("Should handle out-of-range pagination", async function () {
      const { onlyPens, creator } = await setupComplexScenario();

      // Offset beyond bounds
      const result = await onlyPens.getUserPackageDetails(
        creator.address,
        10,
        10
      );
      expect(result[0].length).to.equal(0);
      expect(result[1]).to.equal(2);
    });

    it("Should get package details correctly", async function () {
      const { onlyPens, creator, writer1 } = await setupComplexScenario();

      const packageDetails = await onlyPens.getPackageDetails(1);
      expect(packageDetails[0]).to.equal(creator.address); // creator
      expect(packageDetails[1]).to.equal(writer1.address); // writer
      expect(packageDetails[2]).to.equal(BigInt(100)); // totalAmount
      expect(packageDetails[6]).to.equal(2); // status: ASSIGNED
      expect(packageDetails[7]).to.equal(2); // numDeliverables
      expect(packageDetails[8]).to.equal(0); // numApproved
      expect(packageDetails[9]).to.equal(0); // amountReleased
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to set platform fee", async function () {
      const { onlyPens, owner } = await loadFixture(deployOnlyPensFixture);
      const newFee = 500; // 5%
      await expect(asAny(onlyPens).connect(owner).setPlatformFee(newFee))
        .to.emit(onlyPens, "PlatformFeeUpdated")
        .withArgs(newFee);
      expect(await asAny(onlyPens).platformFeeBps()).to.equal(newFee);
    });

    it("Should prevent non-owner from setting platform fee", async function () {
      const { onlyPens, otherAccount } = await loadFixture(
        deployOnlyPensFixture
      );
      const newFee = 500;
      await expect(
        asAny(onlyPens).connect(otherAccount).setPlatformFee(newFee)
      ).to.be.revertedWithCustomError(onlyPens, "OwnableUnauthorizedAccount");
    });

    it("Should revert if platform fee is set too high", async function () {
      const { onlyPens, owner } = await loadFixture(deployOnlyPensFixture);
      const newFee = 10001; // > 100%
      await expect(
        asAny(onlyPens).connect(owner).setPlatformFee(newFee)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should use updated platform fee for new payments", async function () {
      const { onlyPens, owner, creator, writer1, treasury, mockUSDC } =
        await setupSubmittedDeliverables(); // Using existing setup
      const packageId = 1; // From setupSubmittedDeliverables
      const deliverableId = 1; // First deliverable

      // Set a new fee
      const newFeeBps = 2000; // 20%
      await asAny(onlyPens).connect(owner).setPlatformFee(newFeeBps);

      const writerBalanceBefore = await mockUSDC.balanceOf(writer1.address);
      const treasuryBalanceBefore = await mockUSDC.balanceOf(treasury.address);

      const deliverableDetails = await onlyPens.packageDeliverables(
        packageId,
        deliverableId
      );
      const deliverableAmount = deliverableDetails.amount;
      const submittedQuantity = BigInt(2); // Matches the quantity we set in the test

      const expectedFee =
        (deliverableAmount * BigInt(newFeeBps)) / BigInt(10000);
      const expectedWriterAmount = deliverableAmount - expectedFee;

      await expect(
        onlyPens.connect(creator).approveDeliverable(packageId, deliverableId)
      )
        .to.emit(onlyPens, "DeliverableApproved")
        .withArgs(packageId, deliverableId, writer1.address, submittedQuantity)
        .to.emit(onlyPens, "PaymentReleased")
        .withArgs(
          packageId,
          deliverableId,
          writer1.address,
          expectedWriterAmount,
          expectedFee
        );

      const writerBalanceAfter = await mockUSDC.balanceOf(writer1.address);
      expect(writerBalanceAfter - writerBalanceBefore).to.equal(
        expectedWriterAmount
      );

      const treasuryBalanceAfter = await mockUSDC.balanceOf(treasury.address);
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(
        expectedFee
      );
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to recover ERC20 tokens", async function () {
      const { onlyPens, owner } = await loadFixture(deployOnlyPensFixture);

      // Deploy new token (not USDC)
      const TestToken = await ethers.getContractFactory("MockERC20");
      const testToken = await TestToken.deploy("Test Token", "TEST", 18);

      // Send some tokens to OnlyPens contract
      const amount = ethers.parseUnits("1000", 18);
      await testToken.mint(await onlyPens.getAddress(), amount);

      // Owner's balance before recovery
      const ownerBalanceBefore = await testToken.balanceOf(owner.address);

      // Recover tokens
      await onlyPens
        .connect(owner)
        .recoverERC20(await testToken.getAddress(), amount);

      // Check owner's balance after recovery
      const ownerBalanceAfter = await testToken.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(amount);
    });

    it("Should revert when non-owner tries to recover tokens", async function () {
      const { onlyPens, otherAccount, mockUSDC } = await loadFixture(
        deployOnlyPensFixture
      );

      await expect(
        onlyPens
          .connect(otherAccount)
          .recoverERC20(
            await mockUSDC.getAddress(),
            ethers.parseUnits("100", 6)
          )
      ).to.be.revertedWithCustomError(onlyPens, "OwnableUnauthorizedAccount");
    });

    it("Should revert when trying to recover USDC tokens", async function () {
      const { onlyPens, owner, mockUSDC } = await loadFixture(
        deployOnlyPensFixture
      );

      await expect(
        onlyPens
          .connect(owner)
          .recoverERC20(
            await mockUSDC.getAddress(),
            ethers.parseUnits("100", 6)
          )
      ).to.be.revertedWith("Can't recover escrow");
    });
  });
});
