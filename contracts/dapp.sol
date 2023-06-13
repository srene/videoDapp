// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { MedusaClient,IEncryptionClient } from "@medusa-network/medusa-contracts/src/MedusaClient.sol";
import { IEncryptionOracle } from "@medusa-network/medusa-contracts/src/EncryptionOracle.sol";

import {Bn128, G1Point, DleqProof} from "@medusa-network/medusa-contracts/src/Bn128.sol";
import {EncryptionOracle, ReencryptedCipher, Ciphertext} from "@medusa-network/medusa-contracts/src/EncryptionOracle.sol";

error CallbackNotAuthorized();
error ListingDoesNotExist();
error InsufficentFunds();

contract deBay is IEncryptionClient {
    /// the address of the Medusa oracle 
    IEncryptionOracle public oracle;
    /// mapping recording the price of each item referenced by its cipher ID
    mapping(uint256 => uint256) itemToPrice;

    constructor(IEncryptionOracle _oracle) {
        oracle = _oracle;
    }

    modifier onlyOracle() {
        if (msg.sender != address(oracle)) {
            revert CallbackNotAuthorized();
        }
        _;
    }
    /// One calls this method to submit a a new entry which is encrypted
    /// towards Medusa. The `submitCiphertext()` call will check if the 
    /// ciphertext is valid and notify the Medusa network.
    function submitEntry(
        Ciphertext calldata cipher,
        uint256 price
    ) external returns (uint256) {
        uint256 cipherId = oracle.submitCiphertext(cipher, msg.sender);
        itemToPrice[cipherId] = price;
        return cipherId;
    }

    /// Looks if the caller is sending enough token to buy the entry. If so, it notifies
    /// the Medusa network to reencrypt the given cipher ID with the given public key.
    /// This public key is generated on the client side (TS) and is most often ephemereal.
    function buyEntry(uint256 cipherId, G1Point calldata buyerPublicKey) external payable returns (uint256) {
        uint256 price = itemToPrice[cipherId];
        if (msg.value < price) {
            revert InsufficentFunds();
        }
        uint256 requestId = oracle.requestReencryption(cipherId, buyerPublicKey);
        return requestId;
    }

    event EntryDecryption(uint256 indexed requestId, ReencryptedCipher ciphertext);

    /// oracleResult gets called when the Medusa network successfully reencrypted 
    /// the ciphertext to the given public key called in the previous method.
    /// This contract here simply emits an event so the client can listen on it and
    /// pick up on the cipher and locally decrypt.
    function oracleResult(uint256 requestId, ReencryptedCipher calldata cipher) external onlyOracle {
        emit EntryDecryption(requestId, cipher);
    }
}