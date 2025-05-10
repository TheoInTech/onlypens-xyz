// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract CustomProxyAdmin is ProxyAdmin {
    constructor() ProxyAdmin(msg.sender) {}
}
