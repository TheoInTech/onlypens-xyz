// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

struct DeliverableInput {
    string contentType;
    uint256 amount;
}

// Helper library to reduce contract size
library OnlyPensHelpers {
    // Remove duplicated validation logic
    function validateDeliverableInputs(
        uint256 _totalAmount,
        DeliverableInput[] calldata _deliverables
    ) external pure returns (bool) {
        if (_deliverables.length == 0) return false;

        uint256 sumAmounts = 0;
        for (uint256 i = 0; i < _deliverables.length; i++) {
            if (bytes(_deliverables[i].contentType).length == 0) return false;
            if (_deliverables[i].amount == 0) return false;
            sumAmounts += _deliverables[i].amount;
        }

        return sumAmounts == _totalAmount;
    }
}
