import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { MockERC20 } from "../typechain-types/contracts/MockERC20";
import { OnlyPens } from "../typechain-types/contracts/OnlyPens.sol/OnlyPens";
import "./helpers"; // Import the helper functions

describe("OnlyPens", function () {
  // Set up fixture
  async function deployOnlyPensFixture() {
    // Get signers
    const [owner, creator, writer1, writer2, otherAccount] =
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

    // Deploy implementation first
    const onlyPensImpl = await OnlyPens.deploy();
    await onlyPensImpl.waitForDeployment();
    const implAddress = await onlyPensImpl.getAddress();

    // Create a proxy admin
    const ProxyAdmin = await ethers.getContractFactory("CustomProxyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.waitForDeployment();
    const adminAddress = await proxyAdmin.getAddress();

    // Encode the initialize function call
    const initializeData = OnlyPens.interface.encodeFunctionData("initialize", [
      usdcAddress,
    ]);

    // Deploy the TransparentUpgradeableProxy
    const TransparentUpgradeableProxy = await ethers.getContractFactory(
      "CustomTransparentUpgradeableProxy"
    );
    const proxy = await TransparentUpgradeableProxy.deploy(
      implAddress,
      adminAddress,
      initializeData
    );
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    // Create a contract instance at the proxy address
    const onlyPens = OnlyPens.attach(proxyAddress) as OnlyPens;

    // Mint some USDC to the creator
    const usdcAmount = ethers.parseUnits("1000", 6); // 1000 USDC with 6 decimals
    await mockUSDC.mint(creator.address, usdcAmount);
    await mockUSDC.mint(writer1.address, usdcAmount);

    // Approve OnlyPens to spend creator's USDC
    await mockUSDC.connect(creator).approve(proxyAddress, usdcAmount);
    await mockUSDC.connect(writer1).approve(proxyAddress, usdcAmount);

    return {
      onlyPens,
      mockUSDC,
      owner,
      creator,
      writer1,
      writer2,
      otherAccount,
      usdcAmount,
      onlyPensHelpers,
    };
  }

  describe("Deployment", function () {
    it("Should initialize with the correct USDC token", async function () {
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

    it("Should revert if initialized with zero address for USDC", async function () {
      const { onlyPensHelpers } = await loadFixture(deployOnlyPensFixture);
      const helpersAddress = await onlyPensHelpers.getAddress();

      const OnlyPens = await ethers.getContractFactory("OnlyPens", {
        libraries: {
          OnlyPensHelpers: helpersAddress,
        },
      });

      // Deploy implementation first
      const onlyPensImpl = await OnlyPens.deploy();
      await onlyPensImpl.waitForDeployment();

      // Create a proxy admin
      const ProxyAdmin = await ethers.getContractFactory("CustomProxyAdmin");
      const proxyAdmin = await ProxyAdmin.deploy();
      await proxyAdmin.waitForDeployment();

      // Get the initialize function data with zero address
      const initData = OnlyPens.interface.encodeFunctionData("initialize", [
        ethers.ZeroAddress,
      ]);

      // Deploy transparent proxy - should revert during initialization
      const TransparentUpgradeableProxy = await ethers.getContractFactory(
        "CustomTransparentUpgradeableProxy"
      );
      await expect(
        TransparentUpgradeableProxy.deploy(
          await onlyPensImpl.getAddress(),
          await proxyAdmin.getAddress(),
          initData
        )
      ).to.be.revertedWith("Invalid USDC");
    });
  });

  describe("Gig Package Creation", function () {
    it("Should create a package successfully with multiple deliverables", async function () {
      const { onlyPens, creator, mockUSDC } = await loadFixture(
        deployOnlyPensFixture
      );

      const totalAmount = ethers.parseUnits("100", 6); // 100 USDC
      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("60", 6) },
        { contentType: "Review", amount: ethers.parseUnits("40", 6) },
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
        .withArgs(1, 1, "Article", ethers.parseUnits("60", 6))
        .to.emit(onlyPens, "DeliverableCreated")
        .withArgs(1, 2, "Review", ethers.parseUnits("40", 6));

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
      expect(deliverable1.amount).to.equal(ethers.parseUnits("60", 6));
      expect(deliverable1.status).to.equal(0); // PENDING

      const deliverable2 = await onlyPens.packageDeliverables(1, 2);
      expect(deliverable2.contentType).to.equal("Review");
      expect(deliverable2.amount).to.equal(ethers.parseUnits("40", 6));
      expect(deliverable2.status).to.equal(0); // PENDING
    });

    it("Should revert when creating a package with zero amount", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("0", 6) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(ethers.parseUnits("0", 6), deliverables, futureTime)
      ).to.be.revertedWith("Zero amount");
    });

    it("Should revert when creating a package with past expiry date", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

      const pastTime = (await time.latest()) - 3600; // 1 hour ago

      const futureTime = pastTime + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Past expiry");
    });

    it("Should revert when creating a package with no deliverables", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = ethers.parseUnits("100", 6);
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

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("60", 6) },
        { contentType: "Review", amount: ethers.parseUnits("30", 6) },
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

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "", amount: totalAmount }];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Invalid deliverables");
    });

    it("Should revert when a deliverable has zero amount", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("100", 6) },
        { contentType: "Review", amount: ethers.parseUnits("0", 6) },
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

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await expect(
        onlyPens
          .connect(creator)
          .createGigPackage(totalAmount, deliverables, futureTime)
      ).to.be.revertedWith("Transfer failed");
    });

    it("Should create a package with no expiry date", async function () {
      const { onlyPens, creator } = await loadFixture(deployOnlyPensFixture);

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

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

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("60", 6) },
        { contentType: "Review", amount: ethers.parseUnits("40", 6) },
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
  });

  describe("Invitation Acceptance and Declination", function () {
    async function createAndInvite() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1, writer2 } = fixture;

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

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
      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];
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
  });

  describe("Deliverable Submission", function () {
    async function setupAssignedPackage() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1 } = fixture;

      // Create package
      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("60", 6) },
        { contentType: "Review", amount: ethers.parseUnits("40", 6) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      // Invite and accept
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
      await onlyPens.connect(writer1).acceptInvitation(1);

      return { ...fixture, packageId: 1, deliverableIds: [1, 2] };
    }

    it("Should submit a deliverable successfully", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      await expect(
        onlyPens
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0])
      )
        .to.emit(onlyPens, "DeliverableSubmitted")
        .withArgs(packageId, deliverableIds[0], writer1.address);

      // Check deliverable status
      const deliverable = await onlyPens.packageDeliverables(
        packageId,
        deliverableIds[0]
      );
      expect(deliverable.status).to.equal(1); // SUBMITTED
      expect(deliverable.submittedAt).to.be.gt(0);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(3); // IN_PROGRESS
    });

    it("Should revert when non-writer tries to submit", async function () {
      const { onlyPens, otherAccount, packageId, deliverableIds } =
        await setupAssignedPackage();

      await expect(
        onlyPens
          .connect(otherAccount)
          .submitDeliverable(packageId, deliverableIds[0])
      ).to.be.revertedWith("Not writer");
    });

    it("Should revert when submitting to non-existent package", async function () {
      const { onlyPens, writer1 } = await loadFixture(deployOnlyPensFixture);

      await expect(
        onlyPens.connect(writer1).submitDeliverable(999, 1)
      ).to.be.revertedWith("No package");
    });

    it("Should revert when submitting non-existent deliverable", async function () {
      const { onlyPens, writer1, packageId } = await setupAssignedPackage();

      await expect(
        onlyPens.connect(writer1).submitDeliverable(packageId, 999)
      ).to.be.revertedWith("No deliverable");
    });

    it("Should revert when trying to submit already submitted deliverable", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      // Submit once
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0]);

      // Try to submit again
      await expect(
        onlyPens
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0])
      ).to.be.revertedWith("Already handled");
    });

    it("Should submit all deliverables successfully", async function () {
      const { onlyPens, writer1, packageId, deliverableIds } =
        await setupAssignedPackage();

      // Submit first deliverable
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0]);

      // Submit second deliverable
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[1]);

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

      // Submit
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0]);

      // Creator rejects
      await onlyPens
        .connect(creator)
        .rejectDeliverable(packageId, deliverableIds[0]);

      // Resubmit
      await expect(
        onlyPens
          .connect(writer1)
          .submitDeliverable(packageId, deliverableIds[0])
      )
        .to.emit(onlyPens, "DeliverableRevised")
        .withArgs(packageId, deliverableIds[0], writer1.address);
    });
  });

  describe("Deliverable Approval and Rejection", function () {
    async function setupSubmittedDeliverables() {
      const fixture = await setupAssignedPackage();
      const { onlyPens, writer1, packageId, deliverableIds } = fixture;

      // Submit deliverables
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0]);
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[1]);

      return fixture;
    }

    async function setupAssignedPackage() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1 } = fixture;

      // Create package
      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [
        { contentType: "Article", amount: ethers.parseUnits("60", 6) },
        { contentType: "Review", amount: ethers.parseUnits("40", 6) },
      ];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      // Invite and accept
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
      await onlyPens.connect(writer1).acceptInvitation(1);

      return { ...fixture, packageId: 1, deliverableIds: [1, 2] };
    }

    it("Should approve a deliverable successfully", async function () {
      const {
        onlyPens,
        creator,
        writer1,
        packageId,
        deliverableIds,
        mockUSDC,
      } = await setupSubmittedDeliverables();

      // Writer's balance before approval
      const writerBalanceBefore = await mockUSDC.balanceOf(writer1.address);

      await expect(
        onlyPens
          .connect(creator)
          .approveDeliverable(packageId, deliverableIds[0])
      )
        .to.emit(onlyPens, "DeliverableApproved")
        .withArgs(packageId, deliverableIds[0], writer1.address)
        .to.emit(onlyPens, "PaymentReleased")
        .withArgs(
          packageId,
          deliverableIds[0],
          writer1.address,
          ethers.parseUnits("60", 6)
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
      expect(packageDetails[9]).to.equal(ethers.parseUnits("60", 6)); // amountReleased

      // Check payment was transferred to writer
      const writerBalanceAfter = await mockUSDC.balanceOf(writer1.address);
      expect(writerBalanceAfter - writerBalanceBefore).to.equal(
        ethers.parseUnits("60", 6)
      );
    });

    it("Should complete package when all deliverables are approved", async function () {
      const { onlyPens, creator, packageId, deliverableIds } =
        await setupSubmittedDeliverables();

      // Approve first deliverable
      await onlyPens
        .connect(creator)
        .approveDeliverable(packageId, deliverableIds[0]);

      // Approve second deliverable - should complete the package
      await expect(
        onlyPens
          .connect(creator)
          .approveDeliverable(packageId, deliverableIds[1])
      )
        .to.emit(onlyPens, "GigPackageCompleted")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(4); // COMPLETED
      expect(packageDetails[8]).to.equal(2); // numApproved
      expect(packageDetails[9]).to.equal(ethers.parseUnits("100", 6)); // amountReleased
    });

    it("Should reject a deliverable successfully", async function () {
      const { onlyPens, creator, writer1, packageId, deliverableIds } =
        await setupSubmittedDeliverables();

      await expect(
        onlyPens
          .connect(creator)
          .rejectDeliverable(packageId, deliverableIds[0])
      )
        .to.emit(onlyPens, "DeliverableRejected")
        .withArgs(packageId, deliverableIds[0], writer1.address);

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
      const { onlyPens, creator, writer1, packageId, mockUSDC } =
        await setupSubmittedDeliverables();

      // Writer's balance before approval
      const writerBalanceBefore = await mockUSDC.balanceOf(writer1.address);

      await expect(onlyPens.connect(creator).approveAllDeliverables(packageId))
        .to.emit(onlyPens, "GigPackageCompleted")
        .withArgs(packageId);

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(4); // COMPLETED
      expect(packageDetails[8]).to.equal(2); // numApproved
      expect(packageDetails[9]).to.equal(ethers.parseUnits("100", 6)); // amountReleased

      // Check payment was transferred to writer
      const writerBalanceAfter = await mockUSDC.balanceOf(writer1.address);
      expect(writerBalanceAfter - writerBalanceBefore).to.equal(
        ethers.parseUnits("100", 6)
      );
    });
  });

  describe("Package Cancellation", function () {
    async function setupPendingPackage() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator } = fixture;

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

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
      await onlyPens
        .connect(writer1)
        .submitDeliverable(packageId, deliverableIds[0]);

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

      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

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
      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

      // Using future time instead of 0
      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      await expect(
        onlyPens.connect(creator).cancelExpiredPackage(1)
      ).to.be.revertedWith("No expiry");
    });

    it("Should revert when trying to cancel already finalized package", async function () {
      const { onlyPens, creator, writer1, packageId, futureTime } =
        await setupExpiringPackage();

      // Writer accepts invitation
      await onlyPens.connect(writer1).acceptInvitation(packageId);

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

  describe("Force Release", function () {
    async function setupSubmittedDeliverable() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1 } = fixture;

      // Create package
      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      // Invite and accept
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
      await onlyPens.connect(writer1).acceptInvitation(1);

      // Get deliverable ID and submit
      const deliverableIds = await onlyPens.getPackageDeliverables(1);
      await onlyPens.connect(writer1).submitDeliverable(1, deliverableIds[0]);

      return { ...fixture, packageId: 1, deliverableId: deliverableIds[0] };
    }

    it("Should revert when trying to force release before timeout", async function () {
      const { onlyPens, writer1, packageId, deliverableId } =
        await setupSubmittedDeliverable();

      await expect(
        onlyPens.connect(writer1).forceRelease(packageId, deliverableId)
      ).to.be.revertedWith("Too early");
    });

    it("Should successfully force release after timeout", async function () {
      const { onlyPens, writer1, packageId, deliverableId, mockUSDC } =
        await setupSubmittedDeliverable();

      // Get writer's balance before force release
      const writerBalanceBefore = await mockUSDC.balanceOf(writer1.address);

      // Move time forward beyond the timeout period (14 days)
      await time.increase(14 * 24 * 60 * 60 + 1);

      await expect(
        onlyPens.connect(writer1).forceRelease(packageId, deliverableId)
      )
        .to.emit(onlyPens, "DeliverableApproved")
        .withArgs(packageId, deliverableId, writer1.address)
        .to.emit(onlyPens, "PaymentReleased")
        .withArgs(
          packageId,
          deliverableId,
          writer1.address,
          ethers.parseUnits("100", 6)
        )
        .to.emit(onlyPens, "GigPackageExpired")
        .withArgs(packageId)
        .to.emit(onlyPens, "GigPackageCompleted")
        .withArgs(packageId);

      // Check deliverable status
      const deliverable = await onlyPens.packageDeliverables(
        packageId,
        deliverableId
      );
      expect(deliverable.status).to.equal(2); // APPROVED

      // Check package status
      const packageDetails = await onlyPens.getPackageDetails(packageId);
      expect(packageDetails[6]).to.equal(4); // COMPLETED
      expect(packageDetails[8]).to.equal(1); // numApproved
      expect(packageDetails[9]).to.equal(ethers.parseUnits("100", 6)); // amountReleased

      // Check funds were transferred to writer
      const writerBalanceAfter = await mockUSDC.balanceOf(writer1.address);
      expect(writerBalanceAfter - writerBalanceBefore).to.equal(
        ethers.parseUnits("100", 6)
      );
    });

    it("Should revert when non-writer tries to force release", async function () {
      const { onlyPens, otherAccount, packageId, deliverableId } =
        await setupSubmittedDeliverable();

      // Move time forward beyond the timeout period
      await time.increase(14 * 24 * 60 * 60 + 1);

      await expect(
        onlyPens.connect(otherAccount).forceRelease(packageId, deliverableId)
      ).to.be.revertedWith("Not writer");
    });

    it("Should revert when trying to force release non-submitted deliverable", async function () {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1 } = fixture;

      // Create package
      const totalAmount = ethers.parseUnits("100", 6);
      const deliverables = [{ contentType: "Article", amount: totalAmount }];

      const futureTime = (await time.latest()) + 86400 * 7; // 7 days from now

      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount, deliverables, futureTime);

      // Invite and accept
      await onlyPens.connect(creator).inviteGhostwriter(1, writer1.address);
      await onlyPens.connect(writer1).acceptInvitation(1);

      // Get deliverable ID (but don't submit)
      const deliverableIds = await onlyPens.getPackageDeliverables(1);

      // Move time forward
      await time.increase(14 * 24 * 60 * 60 + 1);

      await expect(
        onlyPens.connect(writer1).forceRelease(1, deliverableIds[0])
      ).to.be.revertedWith("Not submitted");
    });
  });

  describe("View Functions", function () {
    async function setupComplexScenario() {
      const fixture = await loadFixture(deployOnlyPensFixture);
      const { onlyPens, creator, writer1, writer2 } = fixture;

      // Create first package
      const totalAmount1 = ethers.parseUnits("100", 6);
      const deliverables1 = [
        { contentType: "Article", amount: ethers.parseUnits("60", 6) },
        { contentType: "Review", amount: ethers.parseUnits("40", 6) },
      ];
      const futureTime1 = (await time.latest()) + 86400 * 7; // 7 days from now
      await onlyPens
        .connect(creator)
        .createGigPackage(totalAmount1, deliverables1, futureTime1);

      // Create second package
      const totalAmount2 = ethers.parseUnits("200", 6);
      const deliverables2 = [
        { contentType: "Research", amount: ethers.parseUnits("120", 6) },
        { contentType: "Editing", amount: ethers.parseUnits("80", 6) },
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
      expect(packageDetails[2]).to.equal(ethers.parseUnits("100", 6)); // totalAmount
      expect(packageDetails[6]).to.equal(2); // status: ASSIGNED
      expect(packageDetails[7]).to.equal(2); // numDeliverables
      expect(packageDetails[8]).to.equal(0); // numApproved
      expect(packageDetails[9]).to.equal(0); // amountReleased
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
