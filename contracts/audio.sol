// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Audio {
    address public owner;
    mapping(address => bool) public hasAccess;
    mapping(address => mapping(uint256 => bool)) public hasListened;
    mapping(uint256 => string) public audioUrls; // Store URLs for each audio

    event PaymentReceived(address indexed payer, uint256 amount);
    event AudioPlayed(address indexed listener);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier requirePayment() {
        require(
            msg.value >= 0.0001 ether,
            "Insufficient payment. Please pay 0.0001 ETH to access the audio."
        );
        _;
    }

    constructor() {
        owner = msg.sender;

        // Set predefined audio URLs during contract deployment
        audioUrls[
            1
        ] = "https://gateway.pinata.cloud/ipfs/QmYd6QqjAsf1BPGijq4kAmuVXPBbvDRWqyprRdAPzLcXpa";
        audioUrls[
            2
        ] = "https://gateway.pinata.cloud/ipfs/QmexfW4Vu6qvgudCSjDjPqTAv1ZYjLDrkDsYBeUtdNxkhE";
        audioUrls[
            3
        ] = "https://gateway.pinata.cloud/ipfs/QmTApCdTVWddkLkJ8PCHADNjDUvcpj1hMhHzTULs3V1CTe";
        audioUrls[
            4
        ] = "https://gateway.pinata.cloud/ipfs/QmTskujoRo3wiqN1BGsB111aRebdENNgNjJrWwAK6W6FPL";
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
        hasAccess[msg.sender] = true;
    }

    // Function to get the URL of a specific audio
    function getAudioUrl(
        uint256 audioId
    ) external view returns (string memory) {
        return audioUrls[audioId];
    }

// Function to fetch the audio URL from the smart contract
async function getAudioUrlFromContract(audioId) {
  try {
    // Initialize the contract with the ABI and contract address
    const audioContract = new web3.eth.Contract(
      window.ListenAudio.abi,
      window.ListenAudio.address
    );

    // Call the smart contract function to get the audio URL
    const audioUrl = await audioContract.methods.getAudioUrl(audioId).call();

    return audioUrl;
  } catch (error) {
    console.error('Error fetching audio URL:', error);
    return null;
  }
}

// Function to calculate the duration of the audio
async function getAudioDuration(audioId) {
  // Fetch the audio URL from the smart contract
  const audioUrl = await getAudioUrlFromContract(audioId);

  if (!audioUrl) {
    console.log('Unable to get audio URL.');
    return;
  }

  // Create an Audio element to calculate the duration
  const audio = new Audio(audioUrl);

  audio.addEventListener('loadedmetadata', () => {
    const duration = audio.duration;
    console.log(`Audio duration for audioId ${audioId}: ${duration} seconds`);
    // Use the duration in your application logic
  });

  // Handle the case where the audio cannot be loaded
  audio.addEventListener('error', (error) => {
    console.error('Error loading audio:', error);
  });

  // Trigger loading of the audio file
  audio.load();
}

    function payToListen() external payable requirePayment {
        emit PaymentReceived(msg.sender, msg.value);
        hasAccess[msg.sender] = true;
        hasListened[msg.sender][1] = false; // Initialize the listened state to false for audioId 1
        hasListened[msg.sender][2] = false; // Initialize the listened state to false for audioId 2
        hasListened[msg.sender][3] = false; // Initialize the listened state to false for audioId 3
        hasListened[msg.sender][4] = false; // Initialize the listened state to false for audioId 4
    }

    function listenToAudio(uint256 audioId) external {
        //require(hasAccess[msg.sender], "You need to pay to access the audio.");
        require(
            !hasListened[msg.sender][audioId],
            "You have already listened to the audio."
        );

        // Logic to play the audio goes here

        // Additional logic to handle the audio URL (e.g., emit an event)
        emit AudioPlayed(msg.sender);

        hasListened[msg.sender][audioId] = true; // Set the listened state to true after listening
    }

    function grantAccess(address user) external onlyOwner {
        hasAccess[user] = true;
    }

    function revokeAccess(address user) external onlyOwner {
        hasAccess[user] = false;
    }
}
