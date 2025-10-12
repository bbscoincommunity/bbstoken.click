/**
 * BBSToken Platform DApp
 *
 * This script handles wallet connection, balance fetching, and token swaps
 * for the BBSToken ecosystem on the Tron network.
 *
 * Refactored for modern JavaScript (ES6+) syntax.
 */

console.info(
  '\nWelcome to the BBSToken Platform!\n\n' +
  'This DApp allows you to deposit BBSCoin(BBS) and convert it to BBSToken(BBST) to use on the Tron network and exchanges like Bololex. ' +
  'You may also convert BBST to Wrapped BBSToken(WBBS). All conversions may be reversible. \n\n' +
  'More information is available on https://www.bbscoin.org.\n\n' +
  'Coming Soon! Our own micro DEX.\n'
);

// --- Configuration and Constants ---
const WBBS_CONTRACT_ID = "TB3CjdHfkraU7MJLSQESYPY4U2CMKXi3LB";
const BBST_TOKEN_ID = "1003413";

// --- Global State Variables ---
let myWallet = null;
let dappWallet = null;
let walletHex = null;

// --- Helper Functions ---

/**
 * A simple utility for handling API requests using the Fetch API.
 * @param {string} url The URL to fetch.
 * @returns {Promise<object>} The JSON response data.
 */
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

// --- Core Application Logic ---

/**
 * Connects to the user's TronLink wallet.
 */
const connectWallet = async () => {
  if (!window.tronLink) {
    alert("Please install the TronLink wallet extension to connect.");
    console.log("TronLink extension not found!");
    return;
  }

  try {
    const res = await window.tronLink.request({ method: 'tron_requestAccounts' });

    if (res.code === 200) {
      console.log("Successfully connected to TronLink!");
      const tronWeb = window.tronLink.tronWeb;
      myWallet = tronWeb.defaultAddress.base58;
      walletHex = tronWeb.defaultAddress.hex.slice(2); // Remove '41' prefix
      dappWallet = window.tronWeb.address.fromHex('19' + walletHex);

      console.log("User's Tron wallet address:", myWallet);
      console.log("User's DApp wallet address:", dappWallet);

      const connectButton = document.getElementById("connectButton");
      if(connectButton) {
        connectButton.innerText = 'Connected';
        connectButton.disabled = true;
      }
      
      updateWalletUI(myWallet, dappWallet);
      await getWalletBalance(walletHex);

    } else {
      throw new Error(`Failed to connect. Code: ${res.code}, Message: ${res.message}`);
    }
  } catch (error) {
    console.error("An error occurred while connecting:", error);
    if (error.code === 4001) {
      alert("Connection request was rejected by the user.");
    } else {
      alert(`An error occurred: ${error.message}`);
    }
  }
};

/**
 * Updates the UI with wallet address information or shows the login prompt.
 * @param {string} base58Address The user's base58 Tron address.
 * @param {string} dAppAddress The user's DApp-specific address.
 */
const updateWalletUI = (base58Address, dAppAddress) => {
  const tronitElement = document.getElementById("tronit");
  if (base58Address) {
    tronitElement.innerHTML = `
      <i class='text-dark text-monospace pb-3 h7' data-toggle='tooltip' data-placement='top' title='${base58Address}'>
        <b><i class='fas fa-wallet'></i> ${base58Address}</b>
      </i><br>
      <i class='text-dark text-monospace pb-3 h7' data-toggle='tooltip' data-placement='top' title='Recorded as: ${dAppAddress}'>
        <b><i class='fas fa-file-medical-alt'></i> ${dAppAddress}</b>
      </i><br>&nbsp;<br>`;
    
    document.getElementById("bbs").innerHTML = `
      <div class="justify-content-center">
        <div id="loginErrorMsg" class="card alert alert-warning">
          Welcome! You only need to unlock your BBSCoin address if you plan to <strong>DEPOSIT</strong> BBSCoin (BBS) into the platform.
        </div><br>
        <button type="button" class="btn btn-info p-4 mb-3" id="unlockBbsButton">Unlock BBSCoin Address</button>
      </div>`;
    
    // Add event listener directly
    document.getElementById('unlockBbsButton').addEventListener('click', () => BBSCoin(base58Address));

    $("#nav-bbstoken, #nav-bbscoin").removeClass('d-none');
    $("#nav-bbstoken-tab").removeClass('disabled');

  } else {
    tronitElement.innerHTML = `
      <div class="row justify-content-center p-5">
        <div class="col-20 pb-3 text-center">
          <b>Welcome to the BBSToken Platform!</b><br>
          Where you may wrap your BBS as BBST for use on the Tron network.<hr>
          Login/Register using Tronlink. Tronlink must be open/unlocked.
        </div>
        <button id="connectButton" type="button" class="btn btn-primary p-3">
          <i class="fas fa-sign-in-alt"></i> Connect TronLink
        </button>
      </div>`;
      document.getElementById('connectButton').addEventListener('click', connectWallet());
  }
};


/**
 * Fetches and displays the user's token balances.
 * @param {string} hexAddress The user's wallet address in hex format (without '41').
 */
const getWalletBalance = async (hexAddress) => {
  if (!hexAddress) return;

  try {
    // 1. Fetch account data from Trongrid
    const accountData = await fetchData(`https://api.trongrid.io/v1/accounts/41${hexAddress}`);
    const result = accountData.data[0];

    if (!result) {
      $("#tokenBalance").html("<p>No account data found. Your wallet might be new.</p>");
      return;
    }

    // 2. Parse token balances from the result
    let balances = {};
    balances['TRX'] = window.tronWeb.fromSun(result.balance || 0);

    if (result.assetV2) {
        for (const asset of result.assetV2) {
            if (asset.key === BBST_TOKEN_ID) {
                balances['BBST'] = asset.value / 1000;
            }
        }
    }
    
    if (result.trc20) {
        for (const token of result.trc20) {
            if (token[WBBS_CONTRACT_ID]) {
                balances['WBBS'] = token[WBBS_CONTRACT_ID] / 1000;
            }
        }
    }

    // 3. Fetch token prices
    const priceData = await fetchData('https://www.tradecrypto.click/API?v=quotes&q=BBST%20WBBS%20TRX');
    if (priceData && Array.isArray(priceData)) {
      let tronWallet = {};
      priceData.forEach(coin => {
        tronWallet[coin.symbol] = {
          price: coin.price,
          usd: (coin.usd * balances[coin.symbol])
        };
      });
    }
    
    // 4. Render balances to the UI
    const createBalanceCard = (symbol, balance, price, imageSrc, title) => {
        const trxValue = (balance * price.trx).toFixed(6);
        const usdValue = price.usdValue.toFixed(2);
        return `
            <div class='card mt-2 p-1 bg-white'>
                <div class='row col-20 align-items-center'>
                    <div class='col-4 m-0 p-0'><img width='35px' src='${imageSrc}' data-toggle='tooltip' title='${title}'></div>
                    <div class='col-16 text-monospace text-nowrap h7 p-0'>
                        <div class='col-20 p-0 text-right'><i>${balance.toLocaleString()} <b>${symbol}</b></i></div>
                        <div class='col-20 text-right p-0'>
                            <i class='text-dark h8'>
                                <b>&commat;</b> ${price.trx.toFixed(8)} <b>TRX &asymp;</b> ${trxValue} <b>TRX</b> &asymp; $${usdValue} <b>USD</b>
                            </i>
                        </div>
                    </div>
                </div>
            </div>`;
    };

    $("#tokenBalance").html(
        createBalanceCard('TRX', trxBalance, trxPrice, 'https://static.tronscan.org/production/logo/trx.png', 'Tron') +
        createBalanceCard('BBST', bbstBalance, bbstPrice, '/images/bbstokenSQwhite.png', 'BBSToken') +
        createBalanceCard('WBBS', wbbsBalance, wbbsPrice, '/images/wrappedbbstokenSQwhite.png', 'Wrapped BBSToken')
    );
    
    $("#bbstSwap").html(`<div class='col-20 p-0 text-right'><i>${bbstBalance.toLocaleString()} <b>BBST</b></i></div>`);
    $("#wbbsSwap").html(`<div class='col-20 p-0 text-right'><i>${wbbsBalance.toLocaleString()} <b>WBBS</b></i></div>`);

  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    $("#tokenBalance").html("<p class='text-danger'>Error fetching wallet balance. Please try again later.</p>");
  }
};


/**
 * Handles the process of unlocking a BBSCoin deposit address.
 * @param {string} tronAddress The user's Tron wallet address.
 */
const BBSCoin = async (tronAddress) => {
  try {
    $("#bbs").prepend("<p><i class='fa fa-spinner fa-spin'></i> Requesting signature to unlock your BBSCoin deposit address...</p>");

    // 1. Get a unique code from the server
    const walletData = await fetchData(`https://platform.bbstoken.click/API?address=${tronAddress}`);
    if (walletData.code !== 7) {
      throw new Error("Failed to get verification code from the server.");
    }
    
    const { id, code } = walletData.result;
    
    // 2. Ask user to sign the message
    const messageToSign = `BBSToken DApp login, sign the verification code: ${code}`;
    const signedMessage = await tronWeb.trx.signMessageV2(messageToSign);
    
    // 3. Send the signature back to the server for verification
    const signData = await fetchData(`https://platform.bbstoken.click/API?sign=${signedMessage}&id=${id}`);
    
    // 4. Display the deposit address
    const depositAddress = signData.result.address;
    $("#bbs").html(
      `<h6><i class='fa fa-donate'></i> Your BBSCoin Deposit Address</h6><hr>` +
      `<div class='alert alert-info' style='cursor:pointer;' onclick="navigator.clipboard.writeText('${depositAddress}').then(() => alert('Address copied to clipboard!'))">` +
      `<strong>${depositAddress}</strong><br><small>(Click to copy)</small></div>`
    );

  } catch (error) {
    console.error("BBSCoin unlock failed:", error);
    $("#bbs").html(`<div class='alert alert-danger'>${error.message}</div>`);
  }
};

/**
 * Executes the token swap between BBST and WBBS.
 */
const TokenSwap = async () => {
    const swapForm = document.getElementById("swapToken");
    const token = swapForm.elements.namedItem("tokenSelect").value;
    let amountStr = swapForm.elements.namedItem("inputTokens").value;

    // Disable inputs during processing
    $("input[name='inputTokens']").prop('disabled', true);
    $("#btnSwap").prop('disabled', true).addClass('btn-muted');

    if (!token) {
        alert("Please select whether to deposit or withdraw.");
        return;
    }
    if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    try {
        const amount = Number(amountStr) * 1000; // Adjust for token decimals
        const instance = await tronWeb.contract().at(WBBS_CONTRACT_ID);

        let transaction;
        if (token === "wbbs") { // Withdraw WBBS (burn) to get BBST (TRC10)
            console.log(`Withdrawing ${amount} WBBS...`);
            transaction = await instance.withdraw(amount).send();
        } else { // Deposit BBST (TRC10) to get WBBS (mint)
            console.log(`Depositing ${amount} BBST...`);
            transaction = await instance.deposit().send({
                feeLimit: 10_000_000, // 10 TRX
                callValue: 0,
                tokenValue: amount,
                tokenId: BBST_TOKEN_ID,
                shouldPollResponse: true
            });
        }
        console.log("Transaction sent:", transaction);
        alert("Transaction submitted! Please wait for confirmation.");
        // Clear input after successful submission
        $("input[name='inputTokens']").val('');

    } catch (error) {
        console.error("Token swap failed:", error);
        alert(`Transaction failed: ${error.message || 'See console for details.'}`);
    } finally {
        // Re-enable inputs regardless of outcome
        $('input:radio[name="tokenSelect"]:checked').prop('checked', false);
        $("input[name='inputTokens']").prop('disabled', true).val('');
        $("#btnSwap").prop('disabled', true).addClass('btn-muted');
    }
};

// --- Event Listeners and Initialization ---

$(document).ready(() => {
    // Initial check for wallet
    updateWalletUI(); 

    // Refresh balance periodically if wallet is connected
    setInterval(() => {
        if (window.tronLink && walletHex) {
            getWalletBalance(walletHex);
        }
    }, 30000); // 30 seconds

    // Swap button logic
    $("#btnSwap").click((e) => {
        e.preventDefault();
        TokenSwap();
    });

    // Enable amount input only when a token is selected
    $('input:radio[name="tokenSelect"]').change(function() {
        $("input[name='inputTokens']").prop('disabled', !this.checked);
    });

    // Enable swap button only when amount is valid
    $("input[name='inputTokens']").on('keyup', function() {
        const amount = $(this).val();
        const isValid = amount && !isNaN(amount) && Number(amount) > 0;
        $("#btnSwap").prop('disabled', !isValid).toggleClass('btn-muted', !isValid);
    });
});
