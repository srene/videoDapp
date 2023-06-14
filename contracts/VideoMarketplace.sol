// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {VideoMarketPlaceERC20Token} from "./VideoMarketPlaceERC20Token.sol";
import {VideoList} from "./VideoList.sol";
import {PullPayment} from "@openzeppelin/contracts/security/PullPayment.sol";



error CallbackNotAuthorized();
error ListingDoesNotExist();
error InsufficentFunds();

contract VideoMarketPlace is Ownable,PullPayment {

    struct Listing {
        uint256 nftId;
        address seller;
        uint256 price;
        string uri;
    }
    /// @notice Address of the token used as payment for the videos
    VideoMarketPlaceERC20Token public paymentToken;
    /// @notice Video NFTtoken 
    VideoList public nftToken;
    /// @notice Amount of tokens given per ETH paid
    uint256 public purchaseRatio;
    /// @notice Amount of tokens required for placing a bet that goes for the owner pool
    uint256 public marketFee;

    Listing[] public listings;

    //mapping(uint256 => Listing) public listings;

    mapping(address => uint256) public sales;

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
        nftToken = new VideoList();
        purchaseRatio = _purchaseRatio;
        marketFee = _marketFee;
    }


    function createListing(
        uint256 price,
        string calldata uri
    ) external /*returns (uint256)*/ {
        uint256 nftId = nftToken.createItem(msg.sender, uri);
        //listings[nftId] = Listing(msg.sender, price, uri);
        listings.push(Listing({
                nftId: nftId,
                seller: msg.sender,
                price: price,
                uri: uri
            }));
        //return nftId;
    }

    /// @notice Pay for a listing
    /// @dev Buyer pays the price for the listing, which can be withdrawn by the seller later; emits an event
    /// @return requestId The id of the reencryption request associated with the purchase
    function buyListing(uint256 nftId) external payable returns (string memory) {
        Listing memory listing = listings[nftId];
        if (listing.seller == address(0)) {
            revert ListingDoesNotExist();
        }
        if (msg.value < listing.price) {
            revert InsufficentFunds();
        }
        _asyncTransfer(listing.seller, msg.value);
        //sales[msg.sender]=nftId;
        //uint256 requestId = oracle.requestReencryption(cipherId, buyerPublicKey);
        //emit NewSale(msg.sender, listing.seller, nftId, nftId);
        return listing.uri;
    }


}
