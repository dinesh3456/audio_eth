const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  // get the signer that we will use to deploy
  const [deployer] = await ethers.getSigners();

  //const ownerAddress = "0xde018Addf960aB45CEA9b2D96d7a88a2196Cd59C";

  const Audio = await ethers.getContractFactory("Audio");
  const audio = await Audio.deploy();

  await audio.deployed();

  console.log("Successfully deployed marketplace to:", audio.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
