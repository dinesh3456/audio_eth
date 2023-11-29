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
    console.log(window.ListenAudio.abi, window.ListenAudio.address);

    // Make the payment to the smart contract
    await audioContract.methods.payToListen().send({
      from: window.ethereum.selectedAddress,
      value: web3.utils.toWei(paymentAmount, "ether"),
    });

    // Access granted, now listen to the audio
    if (audioContract && audioContract.methods) {
      await audioContract.methods.listenToAudio(audioId).send({
        from: window.ethereum.selectedAddress,
      });
      console.log("Transaction complete");

      // Payment successful, update UI or perform other tasks
      updateUI();
      alert("Payment successful! Enjoy the audio.");
    } else {
      console.error("Contract methods not available.");
      alert("Payment failed. Please try again.");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("Payment failed. Please try again.");
  }
}

