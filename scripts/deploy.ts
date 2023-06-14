import { ethers } from "hardhat";
import { VideoMarketPlace__factory } from "../typechain-types";

import { JsonRpcProvider } from "@ethersproject/providers";

import * as dotenv from "dotenv";
dotenv.config();
//const TARGET_BLOCk = 30;
//const MINT_VALUE = ethers.utils.parseUnits("100");
//const medusaAddress = "0xf1d5A4481F44fe0818b6E7Ef4A60c0c9b29E3118";
const BET_FEE = 0.01;
const TOKEN_RATIO = 10000;

async function main() {

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");

  const provider = new JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");

  const lastBlock = await  provider?.getBlock("latest");
  console.log(`Connected to the blocknumber ${lastBlock?.number}`)

  const signer = wallet.connect(provider);
  console.log(`Connected to the address ${signer.address}`);

  /*const medusaContract = IEncryptionOracle__factory.connect(
    medusaAddress,
    signer
  );


  const suite = await medusaContract.suite();

  console.log(`medusaContract connected ${suite} `);

  const onlyFilesContractFactory = new OnlyFiles__factory(signer);

  const tokenContract = await onlyFilesContractFactory.deploy(medusaContract);
  const tokenContractDeployTxReceipt = await tokenContract.deployTransaction.wait();
  console.log(`Token contract was deployed at address ${tokenContract.address} at the block ${tokenContractDeployTxReceipt.blockNumber}\n`);*/


  const videoDappContractFactory = new VideoMarketPlace__factory(signer);

  const tokenContract = await videoDappContractFactory.deploy("VideoListToken","VLT",TOKEN_RATIO,ethers.utils.parseEther(BET_FEE.toFixed(10)));

  const deployTxReceipt = await tokenContract.deployTransaction.wait();

  console.log(`The contract was deployed at the address ${tokenContract.address} at the block number ${deployTxReceipt.blockNumber}`)


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});