// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {VideoMarketPlaceERC20Token} from "./VideoMarketPlaceERC20Token.sol";

contract VideoMarketPlace is Ownable {

    /// @notice Address of the token used as payment for the bets
    VideoMarketPlaceERC20Token public paymentToken;
    /// @notice Amount of tokens given per ETH paid
    uint256 public purchaseRatio;
    /// @notice Amount of tokens required for placing a bet that goes for the owner pool
    uint256 public marketFee;

    /// @notice Constructor function
    /// @param tokenName Name of the token used for payment
    /// @param tokenSymbol Symbol of the token used for payment
    /// @param _purchaseRatio Amount of tokens given per ETH paid
    /// @param _marketFee Amount of tokens required for placing a bet that goes for the owner pool
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 _purchaseRatio,
        uint256 _marketFee
    ) {
        paymentToken = new VideoMarketPlaceERC20Token(tokenName, tokenSymbol);
        purchaseRatio = _purchaseRatio;
        marketFee = _marketFee;
    }

}
