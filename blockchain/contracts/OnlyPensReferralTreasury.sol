// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OnlyPensReferralTreasury is Ownable {
    IERC20 public usdc;
    address public finalTreasury;

    // Referral tracking
    mapping(address => address) public referredBy; // ghostwriter => referrer
    mapping(address => address[]) public referrals; // referrer => ghostwriters referred
    mapping(address => uint256) public referralEarnings; // referrer => total earnings

    // Referral percentage in basis points (2% = 200)
    uint16 public referralFeeBps = 200;

    event ReferralRegistered(
        address indexed referrer,
        address indexed ghostwriter
    );
    event ReferralPaid(
        address indexed referrer,
        address indexed ghostwriter,
        uint256 amount,
        uint256 packageId
    );

    constructor(IERC20 _usdc, address _finalTreasury) Ownable(msg.sender) {
        usdc = _usdc;
        finalTreasury = _finalTreasury;
    }

    // Register a referral relationship
    function registerReferral(address referrer) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(referredBy[msg.sender] == address(0), "Already referred");

        referredBy[msg.sender] = referrer;
        referrals[referrer].push(msg.sender);

        emit ReferralRegistered(referrer, msg.sender);
    }

    // Handle incoming USDC from OnlyPens contract
    function handlePayment(address writer, uint256 packageId) external {
        // Get current USDC balance that was just received
        uint256 amount = usdc.balanceOf(address(this));
        require(amount > 0, "No payment received");

        address referrer = referredBy[writer];
        if (referrer != address(0)) {
            // Calculate referral amount (2% of total platform fee)
            uint256 referralAmount = (amount * referralFeeBps) / 10000;

            // Send referral fee to referrer
            if (referralAmount > 0) {
                usdc.transfer(referrer, referralAmount);
                referralEarnings[referrer] += referralAmount;

                emit ReferralPaid(referrer, writer, referralAmount, packageId);
            }

            // Send remaining fee to final treasury
            uint256 treasuryAmount = amount - referralAmount;
            if (treasuryAmount > 0) {
                usdc.transfer(finalTreasury, treasuryAmount);
            }
        } else {
            // No referrer, send entire fee to final treasury
            usdc.transfer(finalTreasury, amount);
        }
    }

    // Handle receiving USDC without specific function call (fallback)
    receive() external payable {
        revert("ETH not accepted");
    }

    // Get referrals for an address
    function getReferrals(
        address referrer
    ) external view returns (address[] memory) {
        return referrals[referrer];
    }

    // Update referral fee percentage
    function setReferralFee(uint16 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee too high"); // Max 10%
        referralFeeBps = _newFeeBps;
    }

    // Update final treasury address
    function setFinalTreasury(address _finalTreasury) external onlyOwner {
        require(_finalTreasury != address(0), "Invalid treasury");
        finalTreasury = _finalTreasury;
    }
}
