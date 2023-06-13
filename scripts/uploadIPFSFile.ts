import { Web3Storage, getFilesFromPath } from 'web3.storage'
import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

/*async function main() {

const token = process.env.WEB3_STORAGE_TOKEN;
if (!token) {
    return console.error('A token is needed. You can create one on https://web3.storage')
  }
const storage = new Web3Storage({ token })
const files = []



const pathFiles = await getFilesFromPath("/home/sergi/Desktop/Big.Buck.Bunny.-.Bunny.Portrait.png")
files.push(...pathFiles)

const pathFiles2 = await getFilesFromPath("/home/sergi/Desktop/Big_Buck_Bunny_1080_10s_5MB.mp4")
files.push(...pathFiles2)

const obj = { id: 'id', name:'Big_Buck_Bunny_1080_10s_5MB.mp4', screenshot:'Big.Buck.Bunny.-.Bunny.Portrait.png', description:'sample video'}
const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
files.push(obj)

console.log(`Uploading ${files.length} files`)
const cid = await storage.put(files)
console.log('Content added with CID:', cid)



const cid = await storage.put(blob)

}*/
function jsonFile(filename: string, obj: { path: any; caption: any; }) {
    return new File([JSON.stringify(obj)], filename)
  }
  
function makeGatewayURL(cid, path) {
    return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(path)}`
  }
  
async function main() {
    // The name for our upload includes a prefix we can use to identify our files later
  
    // We store some metadata about the image alongside the image file.
    // The metadata includes the file path, which we can use to generate 
    // a URL to the full image.
    const files = []

    /*const obj = { id: 'id', name:'Big_Buck_Bunny_1080_10s_5MB.mp4', screenshot:'Big.Buck.Bunny.-.Bunny.Portrait.png', description:'sample video'}
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  
    const metadataFile = new File([blob], 'metadata.json')

    files.push(metadataFile)*/

    const image = await getFilesFromPath("/home/sergi/Desktop/Big.Buck.Bunny.-.Bunny.Portrait.png")
    files.push(...image)

    const video = await getFilesFromPath("/home/sergi/Desktop/Big_Buck_Bunny_1080_10s_5MB.mp4")
    files.push(...video)

    const token = process.env.WEB3_STORAGE_TOKEN;
    if (!token) {
        console.log('> ❗️ no API token found for Web3.Storage. You can add one in the settings page!')
        console.log(`${location.protocol}//${location.host}/settings.html`)
      return
    }
    const web3storage = new Web3Storage({ token })
    console.log(`> 🤖 calculating content ID `)
    const cid = await web3storage.put(files, {
  
      // onRootCidReady will be called as soon as we've calculated the Content ID locally, before uploading
      onRootCidReady: (localCid) => {
        console.log(`> 🔑 locally calculated Content ID: ${localCid} `)
        console.log('> 📡 sending files to web3.storage ')
      },
  
      // onStoredChunk is called after each chunk of data is uploaded
      onStoredChunk: (bytes) => console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
    })
  
    const metadataGatewayURL = makeGatewayURL(cid, 'metadata.json')
    const imageGatewayURL = makeGatewayURL(cid, 'Big.Buck.Bunny.-.Bunny.Portrait.png')
    const imageURI = `ipfs://${cid}/Big.Buck.Bunny.-.Bunny.Portrait.png`
    const metadataURI = `ipfs://${cid}/metadata.json`
    return { cid, metadataGatewayURL, imageGatewayURL, imageURI, metadataURI }
  }
  

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
