const paymentAmount = "0.0001"; // Payment amount in ETH
let web3;
let audioContract; // Initialize the contract

// Function to update the UI based on the wallet connection status
async function updateUI() {
  const connectWalletBtn = document.getElementById("connectButton");

  if (web3 && web3.eth && window.ethereum.selectedAddress) {
    connectWalletBtn.textContent = "Connected";
    connectWalletBtn.disabled = true;
  } else {
    connectWalletBtn.textContent = "Connect Wallet";
    connectWalletBtn.disabled = false;
  }
}

// Function to connect the wallet
async function connectWallet() {
  try {
    await window.ethereum.enable();
    console.log("Connected to MetaMask");

    web3 = new Web3(window.ethereum);

    // Update UI
    await updateUI();

    const connectWalletBtn = document.getElementById("connectButton");
    connectWalletBtn.textContent = "Connected";
    connectWalletBtn.disabled = true;
  } catch (error) {
    console.error("Error connecting to MetaMask", error);
  }
}

// Function to fetch the audio URL from the smart contract
async function getAudioUrlFromContract(audioId) {
  try {
    web3 = new Web3(window.ethereum);
    // Initialize the contract with the ABI and contract address
    const audioContract = new web3.eth.Contract(
      window.ListenAudio.abi,
      window.ListenAudio.address
    );

    // Call the smart contract function to get the audio URL
    const audioUrl = await audioContract.methods.getAudioUrl(audioId).call();

    return audioUrl;
  } catch (error) {
    console.error("Error fetching audio URL:", error);
    return null;
  }
}

// Function to calculate the duration of the audio
async function getAudioDuration(audioId) {
  // Fetch the audio URL from the smart contract
  const audioUrl = await getAudioUrlFromContract(audioId);

  if (!audioUrl) {
    console.log("Unable to get audio URL.");
    return;
  }

  // Create an Audio element to calculate the duration
  const audio = new Audio(audioUrl);

  audio.addEventListener("loadedmetadata", () => {
    const duration = audio.duration;
    console.log(`Audio duration for audioId ${audioId}: ${duration} seconds`);
    // Use the duration in your application logic

    // Add an event listener for the "ended" event
    audio.addEventListener("ended", () => {
      console.log(`Audio playback ended for audioId ${audioId}`);
      enableAudioControls(audioId);
    });

    // Trigger loading of the audio file
    audio.play();
  });

  // Handle the case where the audio cannot be loaded
  audio.addEventListener("error", (error) => {
    console.error("Error loading audio:", error);
  });

  // Trigger loading of the audio file
  audio.load();
}

// Example usage
const audioIdToCheck = 1;
getAudioDuration(audioIdToCheck);

// Function to handle the click event on the "Pay with ETH" button
async function payWithETH(audioId) {
  // Check if the user is connected to Metamask
  if (!web3 || !web3.eth || !window.ethereum.selectedAddress) {
    alert("Please connect to your wallet first.");
    return;
  }

  try {
    // Initialize the contract with the ABI and contract address
    audioContract = new web3.eth.Contract(
      window.ListenAudio.abi,
      window.ListenAudio.address
    );

    // Make the payment to the smart contract
    await audioContract.methods.payToListen().send({
      from: window.ethereum.selectedAddress,
      value: web3.utils.toWei(paymentAmount, "ether"),
    });

    // Access granted, now listen to the audio
    const audioUrl = await getAudioUrlFromContract(audioId);
    console.log("Transaction complete");

    // Check the payment status after the transaction
    const hasAccess = await audioContract.methods
      .hasAccess(window.ethereum.selectedAddress)
      .call();

    if (hasAccess) {
      // Payment successful, update UI or perform other tasks
      updateUI();
      alert("Payment successful! Enjoy the audio.");

      // Dynamically update the audio controls
      enableAudioControls(audioId, audioUrl);

      // Start audio playback after user action
      const audioElement = document.getElementById(`audio-${audioId}`);
      audioElement.play();
    } else {
      console.error("Payment not successful.");
      alert("Payment failed. Please try again.");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("Payment failed. Please try again.");
  }
}

// Function to enable audio controls after a successful payment
async function enableAudioControls(audioId, audioUrl) {
  console.log("Enabling audio controls for audioId:", audioId);

  const audioElement = document.getElementById(`audio-${audioId}`);
  const payButton = document.getElementById(`pay-button-${audioId}`);

  // Update the audio controls and pay button
  if (audioElement && payButton) {
    console.log("Updating audio controls");

    // Check the payment status after the transaction
    const hasAccess = await audioContract.methods
      .hasAccess(window.ethereum.selectedAddress)
      .call();

    // Check if the user has already listened to the audio
    const hasListened =
      audioElement.getAttribute("data-has-listened") === "true";

    if (hasAccess) {
      // If the user has access, show the audio controls
      audioElement.controls = true;
      payButton.textContent = "Paid"; // Optionally, update the pay button text
      payButton.disabled = true;

      if (!hasListened) {
        // If the user has not listened, set the "data-has-listened" attribute to true
        audioElement.setAttribute("data-has-listened", "true");

        // Add event listener for the "ended" event to hide controls after audio ends
        audioElement.addEventListener("ended", () => {
          audioElement.controls = false;
          payButton.textContent = "Pay to listen again";
          payButton.disabled = false;
        });
      }
    } else {
      // If the user does not have access, hide the audio controls
      audioElement.controls = false;
      payButton.textContent = "Pay to listen again";
      payButton.disabled = false;
    }
  } else {
    console.error("Audio controls not found for audioId:", audioId);
  }
}
