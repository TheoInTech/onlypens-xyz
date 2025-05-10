// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./OnlyPensHelpers.sol";

/**
 * @title OnlyPens
 * @dev Escrow contract for OnlyPens platform managing gig packages and deliverables
 */
contract OnlyPens is Initializable, Ownable {
    enum PackageStatus {
        PENDING,
        INVITED,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    enum DeliverableStatus {
        PENDING,
        SUBMITTED,
        APPROVED,
        REJECTED
    }

    struct Deliverable {
        uint256 id;
        string contentType;
        DeliverableStatus status;
        uint256 amount;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    struct GigPackage {
        uint256 packageId;
        address creator;
        address writer;
        uint256 totalAmount;
        uint256 createdAt;
        uint256 lastUpdated;
        uint256 expiresAt;
        PackageStatus status;
        uint256 numDeliverables;
        uint256 numApproved;
        uint256 amountReleased;
    }

    IERC20 public usdc;
    uint256 public nextPackageId;
    uint256 public nextDeliverableId;
    uint256 public constant RELEASE_TIMEOUT = 14 days;

    // Storage mappings
    mapping(uint256 => GigPackage) public packages;
    mapping(uint256 => mapping(uint256 => Deliverable))
        public packageDeliverables;
    mapping(uint256 => uint256[]) public packageDeliverableIds;
    mapping(uint256 => mapping(uint256 => uint256))
        public deliverableIndexInPackage;
    mapping(address => uint256[]) public userPackages;
    mapping(uint256 => mapping(address => bool)) public isInvited;
    mapping(uint256 => address[]) public packageInvitees;
    mapping(uint256 => mapping(address => bool)) private inviteeRemoved;
    mapping(uint256 => bool) public packageExists;

    // Consolidated events - use fewer parameters where possible
    event GigPackageCreated(
        uint256 indexed packageId,
        address indexed creator,
        uint256 amount,
        uint256 expiresAt
    );
    event DeliverableCreated(
        uint256 indexed packageId,
        uint256 indexed deliverableId,
        string contentType,
        uint256 amount
    );
    event GhostwriterInvited(
        uint256 indexed packageId,
        address indexed ghostwriter
    );
    event InvitationAccepted(
        uint256 indexed packageId,
        address indexed ghostwriter
    );
    event InvitationDeclined(
        uint256 indexed packageId,
        address indexed ghostwriter
    );
    event DeliverableSubmitted(
        uint256 indexed packageId,
        uint256 indexed deliverableId,
        address indexed writer
    );
    event DeliverableRevised(
        uint256 indexed packageId,
        uint256 indexed deliverableId,
        address indexed writer
    );
    event DeliverableApproved(
        uint256 indexed packageId,
        uint256 indexed deliverableId,
        address indexed writer
    );
    event DeliverableRejected(
        uint256 indexed packageId,
        uint256 indexed deliverableId,
        address indexed writer
    );
    event PaymentReleased(
        uint256 indexed packageId,
        uint256 indexed deliverableId,
        address indexed to,
        uint256 amount
    );
    event GigPackageCompleted(uint256 indexed packageId);
    event GigPackageCancelled(uint256 indexed packageId);
    event GigPackageExpired(uint256 indexed packageId);

    // Modifiers - shortened error messages
    modifier packageMustExist(uint256 _packageId) {
        if (!packageExists[_packageId]) {
            revert("No package");
        }
        _;
    }

    modifier onlyPackageCreator(uint256 _packageId) {
        if (!packageExists[_packageId]) {
            revert("No package");
        }
        if (msg.sender != packages[_packageId].creator) {
            revert("Not creator");
        }
        _;
    }

    modifier onlyPackageWriter(uint256 _packageId) {
        if (!packageExists[_packageId]) {
            revert("No package");
        }
        if (msg.sender != packages[_packageId].writer) {
            revert("Not writer");
        }
        _;
    }

    modifier validPackageStatus(
        uint256 _packageId,
        PackageStatus _requiredStatus
    ) {
        if (!packageExists[_packageId]) {
            revert("No package");
        }
        if (packages[_packageId].status != _requiredStatus) {
            revert("Invalid status");
        }
        _;
    }

    modifier validPackageStatusMultiple(
        uint256 _packageId,
        PackageStatus _status1,
        PackageStatus _status2
    ) {
        if (!packageExists[_packageId]) {
            revert("No package");
        }
        if (
            packages[_packageId].status != _status1 &&
            packages[_packageId].status != _status2
        ) {
            revert("Invalid status");
        }
        _;
    }

    modifier validAddress(address _addr) {
        if (_addr == address(0)) {
            revert("Invalid addr");
        }
        _;
    }

    modifier deliverableMustExist(uint256 _packageId, uint256 _deliverableId) {
        if (!packageExists[_packageId]) {
            revert("No package");
        }
        if (deliverableIndexInPackage[_packageId][_deliverableId] == 0) {
            revert("No deliverable");
        }
        _;
    }

    modifier notExpired(uint256 _packageId) {
        if (
            packages[_packageId].expiresAt > 0 &&
            block.timestamp > packages[_packageId].expiresAt
        ) {
            revert("Expired");
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() Ownable(msg.sender) {
        _disableInitializers();
    }

    function initialize(IERC20 _usdc) external initializer {
        require(address(_usdc) != address(0), "Invalid USDC");
        _transferOwnership(msg.sender);

        usdc = _usdc;
        nextPackageId = 1;
        nextDeliverableId = 1;
    }

    /// @notice Creates a new gig package with multiple deliverables
    function createGigPackage(
        uint256 _totalAmount,
        DeliverableInput[] calldata _deliverables,
        uint256 _expiresAt
    ) external validAddress(msg.sender) {
        if (_totalAmount == 0) {
            revert("Zero amount");
        }

        // Allow _expiresAt = 0 for no expiry, otherwise check if in the future
        if (_expiresAt != 0 && _expiresAt <= block.timestamp) {
            revert("Past expiry");
        }

        // Validate deliverables - use library to reduce contract size
        if (
            !OnlyPensHelpers.validateDeliverableInputs(
                _totalAmount,
                _deliverables
            )
        ) {
            revert("Invalid deliverables");
        }

        // Transfer tokens from creator to contract
        bool success = false;
        try usdc.transferFrom(msg.sender, address(this), _totalAmount) returns (
            bool transferSuccess
        ) {
            success = transferSuccess;
        } catch {
            success = false;
        }

        if (!success) {
            revert("Transfer failed");
        }

        // Create the package
        uint256 packageId = nextPackageId++;
        GigPackage storage p = packages[packageId];
        p.packageId = packageId;
        p.creator = msg.sender;
        p.writer = address(0);
        p.totalAmount = _totalAmount;
        p.createdAt = block.timestamp;
        p.lastUpdated = block.timestamp;
        p.expiresAt = _expiresAt;
        p.status = PackageStatus.PENDING;
        p.numDeliverables = _deliverables.length;

        // Create deliverables
        _createDeliverables(packageId, _deliverables);

        packageExists[packageId] = true;
        userPackages[msg.sender].push(packageId);

        emit GigPackageCreated(packageId, msg.sender, _totalAmount, _expiresAt);
    }

    // Split out deliverable creation to reduce function size
    function _createDeliverables(
        uint256 _packageId,
        DeliverableInput[] calldata _deliverables
    ) private {
        for (uint256 i = 0; i < _deliverables.length; i++) {
            uint256 deliverableId = nextDeliverableId++;

            Deliverable storage d = packageDeliverables[_packageId][
                deliverableId
            ];
            d.id = deliverableId;
            d.contentType = _deliverables[i].contentType;
            d.status = DeliverableStatus.PENDING;
            d.amount = _deliverables[i].amount;

            // Store with index+1 for unambiguous detection
            packageDeliverableIds[_packageId].push(deliverableId);
            deliverableIndexInPackage[_packageId][deliverableId] = i + 1;

            emit DeliverableCreated(
                _packageId,
                deliverableId,
                _deliverables[i].contentType,
                _deliverables[i].amount
            );
        }
    }

    /// @notice Invites a ghostwriter to a gig package
    function inviteGhostwriter(
        uint256 _packageId,
        address _ghostwriter
    ) external {
        if (!packageExists[_packageId]) {
            revert("No package");
        }

        if (_ghostwriter == address(0)) {
            revert("Invalid addr");
        }

        if (msg.sender != packages[_packageId].creator) {
            revert("Not creator");
        }

        PackageStatus status = packages[_packageId].status;
        if (
            status != PackageStatus.PENDING && status != PackageStatus.INVITED
        ) {
            revert("Invalid status");
        }

        if (
            packages[_packageId].expiresAt > 0 &&
            block.timestamp > packages[_packageId].expiresAt
        ) {
            revert("Expired");
        }

        if (_ghostwriter == msg.sender) {
            revert("Self invite");
        }

        GigPackage storage p = packages[_packageId];

        // More gas-efficient check if already invited
        if (!isInvited[_packageId][_ghostwriter]) {
            isInvited[_packageId][_ghostwriter] = true;
            inviteeRemoved[_packageId][_ghostwriter] = false;
            packageInvitees[_packageId].push(_ghostwriter);
        }

        p.status = PackageStatus.INVITED;
        p.lastUpdated = block.timestamp;

        emit GhostwriterInvited(_packageId, _ghostwriter);
    }

    /// @notice Ghostwriter accepts an invitation to a gig package
    function acceptInvitation(uint256 _packageId) external {
        if (!packageExists[_packageId]) {
            revert("No package");
        }

        if (msg.sender == address(0)) {
            revert("Invalid addr");
        }

        GigPackage storage p = packages[_packageId];

        if (p.expiresAt > 0 && block.timestamp > p.expiresAt) {
            revert("Expired");
        }

        if (p.writer != address(0)) {
            revert("Already assigned");
        }

        if (p.status != PackageStatus.INVITED) {
            revert("Invalid status");
        }

        if (!isInvited[_packageId][msg.sender]) {
            revert("Not invited");
        }

        if (inviteeRemoved[_packageId][msg.sender]) {
            revert("Invite removed");
        }

        p.writer = msg.sender;
        p.status = PackageStatus.ASSIGNED;
        p.lastUpdated = block.timestamp;

        userPackages[msg.sender].push(_packageId);

        emit InvitationAccepted(_packageId, msg.sender);
    }

    /// @notice Ghostwriter declines an invitation
    function declineInvitation(uint256 _packageId) external {
        if (!packageExists[_packageId]) {
            revert("No package");
        }

        if (packages[_packageId].status != PackageStatus.INVITED) {
            revert("Invalid status");
        }

        if (!isInvited[_packageId][msg.sender]) {
            revert("Not invited");
        }

        if (inviteeRemoved[_packageId][msg.sender]) {
            revert("Already declined");
        }

        // Mark as removed (gas efficient)
        inviteeRemoved[_packageId][msg.sender] = true;

        // Find active invitees count
        uint256 activeCount = 0;

        // First remove the current invitee
        for (uint256 i = 0; i < packageInvitees[_packageId].length; i++) {
            if (packageInvitees[_packageId][i] == msg.sender) {
                // Replace the current element with the last element
                packageInvitees[_packageId][i] = packageInvitees[_packageId][
                    packageInvitees[_packageId].length - 1
                ];
                packageInvitees[_packageId].pop();
                break;
            }
        }

        // Count remaining active invitees
        for (uint256 i = 0; i < packageInvitees[_packageId].length; i++) {
            if (!inviteeRemoved[_packageId][packageInvitees[_packageId][i]]) {
                activeCount++;
            }
        }

        // If all invitees have declined, revert to PENDING
        if (activeCount == 0) {
            packages[_packageId].status = PackageStatus.PENDING;
            packages[_packageId].lastUpdated = block.timestamp;
        }

        emit InvitationDeclined(_packageId, msg.sender);
    }

    /// @notice Ghostwriter submits a deliverable
    function submitDeliverable(
        uint256 _packageId,
        uint256 _deliverableId
    ) external {
        if (!packageExists[_packageId]) {
            revert("No package");
        }

        if (msg.sender != packages[_packageId].writer) {
            revert("Not writer");
        }

        if (deliverableIndexInPackage[_packageId][_deliverableId] == 0) {
            revert("No deliverable");
        }

        PackageStatus status = packages[_packageId].status;
        if (
            status != PackageStatus.ASSIGNED &&
            status != PackageStatus.IN_PROGRESS
        ) {
            revert("Invalid status");
        }

        Deliverable storage d = packageDeliverables[_packageId][_deliverableId];
        GigPackage storage p = packages[_packageId];

        if (
            d.status != DeliverableStatus.PENDING &&
            d.status != DeliverableStatus.REJECTED
        ) {
            revert("Already handled");
        }

        DeliverableStatus prevStatus = d.status;
        d.status = DeliverableStatus.SUBMITTED;
        d.submittedAt = block.timestamp;

        // Update package status if needed
        if (p.status == PackageStatus.ASSIGNED) {
            p.status = PackageStatus.IN_PROGRESS;
        }

        p.lastUpdated = block.timestamp;

        // Differentiate first submission vs revision
        if (prevStatus == DeliverableStatus.REJECTED) {
            emit DeliverableRevised(_packageId, _deliverableId, msg.sender);
        } else {
            emit DeliverableSubmitted(_packageId, _deliverableId, msg.sender);
        }
    }

    /// @notice Cancel a gig package (only before assignment)
    function cancelGigPackage(uint256 _packageId) external {
        if (!packageExists[_packageId]) {
            revert("No package");
        }

        if (msg.sender != packages[_packageId].creator) {
            revert("Not creator");
        }

        PackageStatus status = packages[_packageId].status;
        if (
            status != PackageStatus.PENDING && status != PackageStatus.INVITED
        ) {
            revert("Invalid status");
        }

        GigPackage storage p = packages[_packageId];
        p.status = PackageStatus.CANCELLED;
        p.lastUpdated = block.timestamp;

        // Refund creator
        require(usdc.transfer(p.creator, p.totalAmount), "Transfer failed");

        emit GigPackageCancelled(_packageId);
    }

    /// @notice Cancel expired packages
    function cancelExpiredPackage(uint256 _packageId) external {
        if (!packageExists[_packageId]) {
            revert("No package");
        }

        GigPackage storage p = packages[_packageId];

        if (p.expiresAt == 0) {
            revert("No expiry");
        }

        if (block.timestamp <= p.expiresAt) {
            revert("Not expired");
        }

        if (
            p.status == PackageStatus.COMPLETED ||
            p.status == PackageStatus.CANCELLED
        ) {
            revert("Already finalized");
        }

        // Check if cancellation allowed
        bool canCancel = (p.numApproved == 0) || (msg.sender == p.creator);
        require(canCancel, "Can't cancel");

        _finalizeExpiredPackage(_packageId, p);
    }

    // Helper function to get active invitees
    function _activeInviteesInternal(
        uint256 _packageId
    ) internal view returns (address[] memory) {
        address[] memory allInvitees = packageInvitees[_packageId];
        address assignedWriter = packages[_packageId].writer;

        // First count active invitees
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allInvitees.length; i++) {
            if (
                !inviteeRemoved[_packageId][allInvitees[i]] &&
                allInvitees[i] != assignedWriter
            ) {
                activeCount++;
            }
        }

        // Create and populate the return array
        address[] memory activeInvitees = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allInvitees.length; i++) {
            if (
                !inviteeRemoved[_packageId][allInvitees[i]] &&
                allInvitees[i] != assignedWriter
            ) {
                activeInvitees[index++] = allInvitees[i];
            }
        }

        return activeInvitees;
    }

    /// @notice Get active invitees for a package
    function getActiveInvitees(
        uint256 _packageId
    ) external view packageMustExist(_packageId) returns (address[] memory) {
        return _activeInviteesInternal(_packageId);
    }

    // Extracted to reduce function size
    function _finalizeExpiredPackage(
        uint256 _packageId,
        GigPackage storage p
    ) private {
        p.status = PackageStatus.CANCELLED;
        p.lastUpdated = block.timestamp;

        uint256 refundAmount = p.totalAmount - p.amountReleased;

        if (refundAmount > 0) {
            require(usdc.transfer(p.creator, refundAmount), "Transfer failed");
        }

        emit GigPackageExpired(_packageId);
        emit GigPackageCancelled(_packageId);
    }

    // Helper function to approve a single deliverable and return its amount
    function _approveDeliverable(
        uint256 _packageId,
        uint256 _deliverableId,
        GigPackage storage p
    ) private returns (uint256 amountToRelease) {
        Deliverable storage d = packageDeliverables[_packageId][_deliverableId];

        // This function is called after a check for d.status == DeliverableStatus.SUBMITTED (for single approval)
        // or iterates through deliverables (for approveAll).
        // We only proceed if the deliverable is currently SUBMITTED.
        if (d.status == DeliverableStatus.SUBMITTED) {
            d.status = DeliverableStatus.APPROVED;
            d.approvedAt = block.timestamp;
            p.numApproved++;
            amountToRelease = d.amount;

            emit DeliverableApproved(_packageId, _deliverableId, p.writer);
            return amountToRelease;
        }
        return 0; // Return 0 if not approved (e.g., not in SUBMITTED state)
    }

    /// @notice Handle approval and payment release
    function _handleApproval(
        uint256 _packageId,
        uint256 _deliverableId,
        bool _approveAll
    )
        internal
        onlyPackageCreator(_packageId)
        validPackageStatusMultiple(
            _packageId,
            PackageStatus.IN_PROGRESS,
            PackageStatus.ASSIGNED
        )
    {
        GigPackage storage p = packages[_packageId];
        uint256 totalReleased = 0;

        if (_approveAll) {
            // Batch approval
            uint256[] memory ids = packageDeliverableIds[_packageId];
            for (uint256 i = 0; i < ids.length; i++) {
                totalReleased += _approveDeliverable(_packageId, ids[i], p);
            }
        } else {
            // Single deliverable approval
            require(_deliverableId != 0, "Invalid ID");
            Deliverable storage d = packageDeliverables[_packageId][
                _deliverableId
            ];
            require(d.status == DeliverableStatus.SUBMITTED, "Not submitted");

            uint256 amountReleased = _approveDeliverable(
                _packageId,
                _deliverableId,
                p
            );
            require(amountReleased > 0, "No release amt");
            totalReleased = amountReleased;
        }

        _finalizeApproval(
            _packageId,
            _deliverableId,
            p,
            totalReleased,
            _approveAll
        );
    }

    // Extracted to reduce function size
    function _finalizeApproval(
        uint256 _packageId,
        uint256 _deliverableId,
        GigPackage storage p,
        uint256 totalReleased,
        bool _approveAll
    ) private {
        if (totalReleased > 0) {
            p.amountReleased += totalReleased;

            // Transfer tokens after all state changes
            require(usdc.transfer(p.writer, totalReleased), "Transfer failed");

            // Emit payment released event
            emit PaymentReleased(
                _packageId,
                _approveAll ? 0 : _deliverableId,
                p.writer,
                totalReleased
            );
        }

        // Check if package is now complete
        if (p.numApproved == p.numDeliverables) {
            p.status = PackageStatus.COMPLETED;
            emit GigPackageCompleted(_packageId);
        }
    }

    /// @notice Creator approves a single deliverable
    function approveDeliverable(
        uint256 _packageId,
        uint256 _deliverableId
    ) external deliverableMustExist(_packageId, _deliverableId) {
        _handleApproval(_packageId, _deliverableId, false);
    }

    /// @notice Creator rejects a deliverable for revision
    function rejectDeliverable(
        uint256 _packageId,
        uint256 _deliverableId
    )
        external
        onlyPackageCreator(_packageId)
        deliverableMustExist(_packageId, _deliverableId)
        validPackageStatusMultiple(
            _packageId,
            PackageStatus.ASSIGNED,
            PackageStatus.IN_PROGRESS
        )
    {
        Deliverable storage d = packageDeliverables[_packageId][_deliverableId];
        GigPackage storage p = packages[_packageId];

        require(d.status == DeliverableStatus.SUBMITTED, "Not submitted");

        d.status = DeliverableStatus.REJECTED;
        p.lastUpdated = block.timestamp;

        emit DeliverableRejected(_packageId, _deliverableId, p.writer);
    }

    /// @notice Approve all remaining deliverables
    function approveAllDeliverables(uint256 _packageId) external {
        _handleApproval(_packageId, 0, true);
    }

    // View functions

    /// @notice Check if package is expired but still active
    function isPackageExpired(
        uint256 _packageId
    ) public view packageMustExist(_packageId) returns (bool) {
        GigPackage storage p = packages[_packageId];
        return
            p.expiresAt > 0 &&
            block.timestamp > p.expiresAt &&
            p.status != PackageStatus.COMPLETED &&
            p.status != PackageStatus.CANCELLED;
    }

    /// @notice Get list of deliverables for a package
    function getPackageDeliverables(
        uint256 _packageId
    ) external view packageMustExist(_packageId) returns (uint256[] memory) {
        return packageDeliverableIds[_packageId];
    }

    /// @notice Get all package IDs for a user
    function getUserPackages(
        address _user
    ) external view validAddress(_user) returns (uint256[] memory) {
        return userPackages[_user];
    }

    /// @notice Get package IDs with pagination
    function getUserPackageDetails(
        address _user,
        uint256 _offset,
        uint256 _limit
    )
        external
        view
        validAddress(_user)
        returns (uint256[] memory packageIds, uint256 total)
    {
        // Get user's package IDs
        uint256[] memory userPackageIds = userPackages[_user];
        total = userPackageIds.length;

        if (_offset >= total || total == 0) {
            return (new uint256[](0), total);
        }

        uint256 maxLimit = 20;
        uint256 limit = _limit > maxLimit ? maxLimit : _limit;
        uint256 itemsAvailable = total - _offset;
        uint256 returnSize = itemsAvailable < limit ? itemsAvailable : limit;

        packageIds = new uint256[](returnSize);

        for (uint256 i = 0; i < returnSize; i++) {
            packageIds[i] = userPackageIds[_offset + i];
        }

        return (packageIds, total);
    }

    /// @notice Get a single package's details
    function getPackageDetails(
        uint256 _packageId
    )
        external
        view
        packageMustExist(_packageId)
        returns (
            address creator,
            address writer,
            uint256 totalAmount,
            uint256 createdAt,
            uint256 lastUpdated,
            uint256 expiresAt,
            PackageStatus status,
            uint256 numDeliverables,
            uint256 numApproved,
            uint256 amountReleased
        )
    {
        GigPackage storage p = packages[_packageId];

        return (
            p.creator,
            p.writer,
            p.totalAmount,
            p.createdAt,
            p.lastUpdated,
            p.expiresAt,
            p.status,
            p.numDeliverables,
            p.numApproved,
            p.amountReleased
        );
    }

    /// @notice Emergency token recovery
    function recoverERC20(
        address _tokenAddress,
        uint256 _amount
    ) external onlyOwner {
        require(_tokenAddress != address(usdc), "Can't recover escrow");
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}
