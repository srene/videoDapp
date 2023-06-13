import * as readline from 'readline';
import { ethers } from "hardhat";
import { VideoMarketPlace, VideoMarketPlace__factory} from "../typechain-types";
import { VideoMarketPlaceERC20Token, VideoMarketPlaceERC20Token__factory} from "../typechain-types";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

let contract: VideoMarketPlace;
let token: VideoMarketPlaceERC20Token;
let accounts: SignerWithAddress[];

const BET_FEE = 0.2;
const TOKEN_RATIO = 1;

async function main() {
  await initAccounts();
  await initContracts();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
}

async function initAccounts() {
  accounts = await ethers.getSigners();
  console.log(accounts);
}


async function initContracts() {
  const contractFactory = new VideoMarketPlace__factory(accounts[0]);
  contract = await contractFactory.deploy("VideoListToken","VLT",TOKEN_RATIO,ethers.utils.parseEther(BET_FEE.toFixed(10)));
  await contract.deployed(); 
  const tokenAddress = await contract.paymentToken();
  const tokenFactory = new VideoMarketPlaceERC20Token__factory();
  token = tokenFactory.attach(tokenAddress).connect(accounts[0]);
  console.log("Deployed lottery contract to address "+contract.address);
  console.log("Deployed Token contract to address "+token.address);
}

async function listVideos() {

}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
  rl.question(
    "Select operation: \n Options: \n [0]: Exit \n [1]: List all NFTs \n [2]: Add video \n [3]: Buy video \n [4]: List my videos \n [5]:  Burn tokens \n",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          return;
        case 1:
          await listVideos();
          mainMenu(rl);
          break;
        case 2:
          //await checkState();
          mainMenu(rl);
          break;
        case 3:
        //await checkState();
            mainMenu(rl);
            break;
        case 4:
            //await checkState();
            mainMenu(rl);
            break;       
        case 5:
            //await checkState();
            mainMenu(rl);
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