// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract OnlyPensEscrow {

    struct Gig {
        address creator;
        address writer;
        uint256 amount; // escrowed funds
        bool isClaimed;
        bool isSubmitted;
        bool isPaidOut;
    }

    mapping(uint256 => Gig) public gigs;

    uint256 public nextGigId = 1;

    function postGig(address _writer) external payable {
        require(msg.value > 0, "Must send funds to escrow");

        gigs[nextGigId] = Gig({
            creator: msg.sender,
            writer: _writer,
            amount: msg.value,
            isClaimed: false,
            isSubmitted: false,
            isPaidOut: false
        });

        nextGigId++;
    }

    function submitWork(uint256 _gigId) external {
        Gig storage gig = gigs[_gigId];
        require(msg.sender == gig.writer, "Only assigned writer can submit work");
        gig.isSubmitted = true;
    }

    function approveAndRelease(uint256 _gigId) external {
        Gig storage gig = gigs[_gigId];
        require(msg.sender == gig.creator, "Only creator can approve");
        require(gig.isSubmitted, "Work not submitted yet");
        require(!gig.isPaidOut, "Already paid out");

        gig.isPaidOut = true;
        payable(gig.writer).transfer(gig.amount);
    }
}
