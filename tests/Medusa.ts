import { Medusa, EVMG1Point, SuiteType } from "@medusa-network/medusa-sdk";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";
import { DeBay__factory } from "../typechain-types";
import { Base64 } from "js-base64";

dotenv.config();

const TOKEN_ADDRESS = "0x6E11267EB6244c15AC9c784d8e7E0c74F133a586"

async function main() {


    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    const medusaAddress = "0xf1d5A4481F44fe0818b6E7Ef4A60c0c9b29E3118";
    const provider = new JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");
    const signer = wallet.connect(provider);
    console.log("WALLET CONNected");
    const medusa = await Medusa.init(medusaAddress, signer);
    console.log("Medusa inititated");
    // Get Public Key of Medusa Oracle contract
    const medusaPublicKey = await medusa.fetchPublicKey()
    // Prompt a user to sign a message with their wallet and derive their medusa keypair from their (deterministic) signature
    const keypair = await medusa.signForKeypair();

    // Encrypt data towards Medusa
    const buff = new TextEncoder().encode("This is secret!")

    /*const { encryptedData, encryptedKey } = await medusa.encrypt(buff,TOKEN_ADDRESS);
    console.log("encrypted "+encryptedKey);
    const b64EncryptedData = Base64.fromUint8Array(encryptedData)

    const debayContract = DeBay__factory.connect(
      TOKEN_ADDRESS,
      signer
    );

    console.log("connected");


    const price = ethers.utils.parseEther("0.001");*/

    //const result =  await debayContract.submitEntry(encryptedKey,price);
    //console.log(result);
    /*const result = await debayContract.functions
      .submitEntry(
        encryptedKey,
        price
      )
      .then((transaction) => {
        console.log(transaction)

        // Listen to the 'NewListing' event
        debayContract.on(
          'NewListing',
          (seller, cipherId, price) => {
            console.log(
              `New Listing created: 
        seller = ${seller}
        cipherId = ${cipherId} 
        price = ${price}`
            )
          }
        )
      })
      .catch((error) => {
        console.error(error)
      })*/

  //let evmPoint = null
  //const { x, y } = keypair.pubkey.toEvm()
  //evmPoint = { x, y }



/*
const res = await debayContract
  .buyEntry(cipherId, evmPoint, {value: price})
  .then((transaction) => {
    console.log(transaction)

  })
  .catch((error) => {
    console.error(error)
  })*/
  console.log("finished");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
