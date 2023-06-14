import * as readline from 'readline';
import { ethers } from "hardhat";
import { VideoMarketPlace, VideoMarketPlace__factory} from "../typechain-types";
import { VideoMarketPlaceERC20Token, VideoMarketPlaceERC20Token__factory} from "../typechain-types";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

let contract: VideoMarketPlace;
let token: VideoMarketPlaceERC20Token;
let accounts: SignerWithAddress[];

let videoCount = 0;
const BET_FEE = 0.01;
const TOKEN_RATIO = 1;

async function main() {
  await initAccounts();
  await initContracts();
  getEvent();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
}

async function initAccounts() {
  accounts = await ethers.getSigners();
}


async function initContracts() {
  const contractFactory = new VideoMarketPlace__factory(accounts[0]);
  contract = await contractFactory.deploy("VideoListToken","VLT",TOKEN_RATIO,ethers.utils.parseEther(BET_FEE.toFixed(10)));
  await contract.deployed(); 
  const tokenAddress = await contract.paymentToken();
  const tokenFactory = new VideoMarketPlaceERC20Token__factory();
  token = tokenFactory.attach(tokenAddress).connect(accounts[0]);
  console.log("Deployed video market contract to address "+contract.address);
  console.log("Deployed Token contract to address "+token.address);
}

async function listAllVideos() {
  console.log(contract.listings.length);
  for (let index = 0; index < videoCount; index++) {
    const list = await contract.listings(index);
    console.log(`Video added ${list.nftId} from ${list.seller} price ${ethers.utils.formatUnits(list.price)} uri:${list.uri}`);
  }
}

async function listMyVideos() {
  console.log(contract.listings.length);
  for (let index = 0; index < videoCount; index++) {
    const list = await contract.listings(index);
    console.log(`Video added ${list.nftId} from ${list.seller} price ${ethers.utils.formatUnits(list.price)} uri:${list.uri}`);
  }
}


async function getEvent(){
  console.log("Starting event handler");
  /*const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; ///USDC Contract
  const provider = new ethers.providers.WebSocketProvider(
      `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
  );
  const contract = new ethers.Contract(usdcAddress, ABI, provider);*/
  contract.on("NewSale", (buyer, seller, nftId, uri)=>{
      let saleEvent ={
        buyer: buyer,
        seller: seller,
          nftId: nftId,
          uri: uri,
      }
      console.log(JSON.stringify(saleEvent, null, 4))
  })
  contract.on("NewListing", (seller, nftId, price, uri)=>{
    console.log(`New nft created ${nftId}`)
    let listingEvent ={
        seller: seller,
        nftId: nftId,
        price: price,
        uri: uri,
    }
    console.log(JSON.stringify(listingEvent, null, 4))
})
}

async function listUploadedVideos() {
  console.log(contract.listings.length);
  for (let index = 0; index < videoCount; index++) {
    const list = await contract.listings(index);
    console.log(`Video added ${list.nftId} from ${list.seller} price ${ethers.utils.formatUnits(list.price)} uri:${list.uri}`);
  }
}

async function buyTokens(index: string, amount: string) {
  // TODO
  await contract.connect(accounts[Number(index)]).purchaseTokens({ value: ethers.utils.parseUnits(amount) });


}



async function addVideo(index: string, price: string,uri: string) {

  const tx = await contract.connect(accounts[Number(index)]).createListing(ethers.utils.parseEther(price),uri);
  //console.log(tx);
  const receipt = await tx.wait();

  console.log(`Video added (${receipt.transactionHash}) `);
  videoCount++;
}

async function buyVideo(index: string, nftId: string) {

  const allowTx = await token
  .connect(accounts[Number(index)])
  .approve(contract.address, ethers.constants.MaxUint256);
  await allowTx.wait();

  const tx = await contract.connect(accounts[Number(index)]).buyListing(BigInt(nftId));
  //console.log(tx);
  const receipt = await tx.wait();

  console.log(`Video listed (${receipt.transactionHash}) `);
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

async function displayBalance(index: string) {
  //const balanceBN = await ethers.provider.getBalance(accounts[Number(index)].address);
  const balanceBN = await accounts[Number(index)].getBalance();
  const balance  = ethers.utils.formatEther(balanceBN);
  console.log(
    `The account address ${accounts[Number(index)].address} has ${balance} ETH\n`
  );
}

async function burnTokens(index: string, amount: string) {
  const allowTx = await token
    .connect(accounts[Number(index)])
    .approve(contract.address, ethers.constants.MaxUint256);
  const receiptAllow = await allowTx.wait();
  console.log(`Allowance confirmed (${receiptAllow.transactionHash})\n`);
  const tx = await contract
    .connect(accounts[Number(index)])
    .returnTokens(ethers.utils.parseEther(amount));
  const receipt = await tx.wait();
  console.log(`Burn confirmed (${receipt.transactionHash})\n`);
}

async function displayTokenBalance(index: string) {
  const balanceBN = await token.balanceOf(accounts[Number(index)].address);
  const balance  = ethers.utils.formatEther(balanceBN);
  console.log(
    `The account address ${accounts[Number(index)].address} has ${balance} ETH\n`
  );
}

function menuOptions(rl: readline.Interface) {
  rl.question(
    "Select operation: \n Options: \n [0]: Exit \n [1]: List all videos \n [2]: Add video \n [3]: Buy video \n [4]: List my created videos \n [5]: List my bought videos \n [6]: Top up account tokens \n [7]: Burn tokens \n",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          process.exit(1);
          return;
        case 1:
          await listAllVideos();
          mainMenu(rl);
          break;
        case 2:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayBalance(index);
            rl.question("Content uri?\n", async (uri) => {
              try {
                await addVideo(index,"0.01",uri);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 3:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayBalance(index);
            rl.question("Content nfd Id?\n", async (id) => {
              try {
                await buyVideo(index,id);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 4:
            //await checkState();
            mainMenu(rl);
            break;       
        case 5:
            //await checkState();
            mainMenu(rl);
            break;  
        case 6:
            rl.question("What account (index) to use?\n", async (index) => {
              await displayBalance(index);
              rl.question("Buy how many tokens?\n", async (amount) => {
                try {
                  await buyTokens(index, amount);
                  await displayBalance(index);
                  await displayTokenBalance(index);
                } catch (error) {
                  console.log("error\n");
                  console.log({ error });
                }
                mainMenu(rl);
              });
            });
            break;            
        case 7:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayTokenBalance(index);
            rl.question("Burn how many tokens?\n", async (amount) => {
              try {
                await burnTokens(index, amount);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;                                   
        default:
          throw new Error("Invalid option");
      }
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});