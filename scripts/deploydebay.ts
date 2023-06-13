import { ethers } from "hardhat";
import { DeBay__factory } from "../typechain-types";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IEncryptionOracle__factory } from "../typechain-types";

import * as dotenv from "dotenv";
dotenv.config();
const TARGET_BLOCk = 30;
const MINT_VALUE = ethers.utils.parseUnits("100");
const medusaAddress = "0xf1d5A4481F44fe0818b6E7Ef4A60c0c9b29E3118";

async function main() {

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");

  const provider = new JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");

  const lastBlock = await  provider?.getBlock("latest");
  console.log(`Connected to the blocknumber ${lastBlock?.number}`)

  const signer = wallet.connect(provider);
  console.log(`Connected to the address ${signer.address}`);


  const tokenContractFactory = new DeBay__factory(signer);
  const medusaContract = IEncryptionOracle__factory.connect(
    medusaAddress,
    signer
  );
  console.log(`medusaContract connected`);
  const tokenContract = await tokenContractFactory.deploy(medusaContract);
  const tokenContractDeployTxReceipt = await tokenContract.deployTransaction.wait();
  console.log(`Token contract was deployed at address ${tokenContract.address} at the block ${tokenContractDeployTxReceipt.blockNumber}\n`);

 /* const mintTx = await tokenContract.mint(signer.address, MINT_VALUE);
  const mintTxReceipt = await mintTx.wait();
  console.log(`Minted ${ethers.utils.formatUnits(MINT_VALUE)} tokens to the address ${signer.address} at block ${mintTxReceipt.blockNumber}\n`);

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  const proposals = process.argv.slice(2);
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);

  });
  // TODO
  //Get contract factory object
  const ballotContractFactory = new TokenizedBallot__factory(signer);
  //We send deploy contract transaction
  const ballotContract = await ballotContractFactory.deploy(proposals.map(ethers.utils.formatBytes32String),tokenContract.address,lastBlock.number+TARGET_BLOCk);
  //We wait till the contract is deployed on chain
  const deployTxReceipt = await ballotContract.deployTransaction.wait();
  //console.log({deployTxReceipt});
  console.log(`The ballot contract was deployed at the address ${ballotContract.address} at the block number ${deployTxReceipt.blockNumber}`)
  */
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});