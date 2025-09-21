console.info('\nWelcome to the BBSToken Platform!\n\nThis DApp allows you to deposit BBSCoin(BBS) and convert it to BBSToken(BBST) to use on the Tron network and exchanges like Bololex. You may also convert BBST to Wrapped BBSToken(WBBS). All conversions may be reversible. \n\nMore information is available on https://www.bbscoin.click.\n\nComing Soon! Our own micro CEX.\n');
var mymsg, mywallet, account="";
var appLoaded, mylocal, i=0;
var contractID = "TB3CjdHfkraU7MJLSQESYPY4U2CMKXi3LB";
var tokenID = "1003413";
var isTRC10, isTRC20, isHolding, isExtra = "";
var trc10price, trc20price, trc10calc, trc20calc, bbst, wbbs = 0;

    function getWalletAddress() {
        if ('tronWeb' in window && 'base58' in window.tronWeb.defaultAddress){
          mywallet = window.tronWeb.defaultAddress.base58;

          if (mywallet == false) { document.getElementById("tronit").innerHTML = "&#128274; Seems like Tronlink may still be locked, please unlock it to be able to login."; }
          else {
            document.getElementById("tronit").innerHTML = "<!-- i class='fa fa-at'>:</i --> <!-- b> Address:</b><hr --><i class='text-dark text-monospace pb-3 h7' data-toggle='tooltip' data-placement='top' title='" + mywallet + "'><!-- text-nowrap --><b><i class='fas fa-wallet'></i> " + mywallet + "</b></i><br>&nbsp;<br><!-- b><i class='fa fa-coins'></i>Tokens:</b><hr -->";
            $("#tokenBalance").append("<b class='text-danger'>Refreshing wallet...</b>");
            getWalletBalance(window.tronWeb.defaultAddress.base58);

            document.getElementById("bbs").innerHTML = "<div class=\"justify-content-center\"><div id=\"loginErrorMsg\" class=\"card alert alert-warning hide\">Welcome! Please note that if you <b>WILL NOT DEPOSIT BBSCoin(BBS)</b> into the platform, you do NOT need to unlock this feature.</div><br><button type=\"button\" class=\"btn btn-info p-4 mb-3\" onclick=\"BBSCoin()\">Unlock BBSCoin Address</button><br>&nbsp;<br><div id=\"loginErrorMsg\" class=\"card alert alert-success hide\">When unlocking, Tronlink will ask to sign your unique DApp string that acts like your password to BBSCoin.<div><div>";
            $("#nav-bbstoken").removeClass('d-none');
            $("#nav-bbscoin").removeClass('d-none');
            $("#nav-bbstoken-tab").removeClass('disabled');
//                $("#nav-bbscoin-tab").removeClass('disabled');
          }
        }
        else {
          document.getElementById("tronit").innerHTML = "<div class=\"row justify-content-center p-5\"><div class=\"col-20 pb-3 text-center\"><b>Welcome to the BBSToken Platform!</b><br>Where you may wrap your BBS as BBST for use on the Tron network.<hr>Login/Register using Tronlink. Tronlink must be open/unlocked.</div><button type=\"button\" class=\"btn btn-primary p-3\" onclick=\"getWalletAddress()\"><i class=\"fas fa-sign-in-alt\"></i> TronLink</button><div class=\"col-20 text-center\"><hr>You may also login using email & password:</div><div class=\"row col-20 justify-content-center text-center py-3 d-none d-md-block\"><a data-toggle=\"modal\" data-target=\"#myLogin\"><b>[ <i class=\"fas fa-sign-in-alt\"></i> Login ]</b></a>&nbsp;&nbsp;&nbsp;or&nbsp;&nbsp;&nbsp;<a data-toggle=\"modal\" data-target=\"#myRegister\"><b>[ <i class=\"fas fa-user-plus\"></i> Register ]</b></a></div><div class=\"row col-20 justify-content-center py-3 d-block d-md-none\"><div class=\"col-20 text-center pt-3\"><a data-toggle=\"modal\" data-target=\"#myLogin\"><b>[ <i class=\"fas fa-sign-in-alt\"></i> Login ]</b></a></div><div class=\"col-20 text-center pt-3\"><a data-toggle=\"modal\" data-target=\"#myRegister\"><b>[ <i class=\"fas fa-user-plus\"></i> Register ]</b></a></div></div></div>";
//                $('#myLogin').modal('show');
        }

    }

    function getWalletBalance(mywallet) {

      isTRC10 = "";
      isTRC20 = "";
      bbst = 0;
      wbbs = 0;
//              window.setTimeout(function(){
             $.ajax({
              url: 'https://api.trongrid.io/v1/accounts/' + mywallet,
              dataType: 'json',
              cache: 'false'
            }).done(function(result){
            result = result.data[0];


            if (result) {

              for (i = 0; i < result.assetV2.length; i++) {
                if (result.assetV2[i].key == tokenID) { bbst = (result.assetV2[i].value / 1000); 
                  isTRC10 = "<div class='col-20 p-0 text-right' data-toggle='tooltip' data-placement='top' title='Balance: " + bbst.toLocaleString() + " BBST'><i class='text-dark'><b>Balance:</b> " + bbst.toLocaleString() + " <b>BBST</b></i></div>";
                }
              }
              if (!isTRC10) { 
                isTRC10 = "<div class='col-20 p-0 text-right' data-toggle='tooltip' data-placement='top' title='Balance: " + bbst.toLocaleString() + " BBST'><i class='text-dark'><b>Balance:</b> " + bbst + " <b>BBST</b></i></div>";
              }

              for (i = 0; i < result.trc20.length; i++) {
                if (result.trc20[i].TB3CjdHfkraU7MJLSQESYPY4U2CMKXi3LB) { wbbs = (result.trc20[i].TB3CjdHfkraU7MJLSQESYPY4U2CMKXi3LB / 1000); 
                  isTRC20 = "<div class='col-20 p-0 text-right'><i class='text-dark' data-toggle='tooltip' data-placement='top' title='Balance: " + wbbs.toLocaleString() + " WBBS'><b>Balance:</b> " + wbbs.toLocaleString() + " <b>WBBS</b></i></div>";
                }
//                    else if (result.trc20[i].TRTpeTYQm5mxjjiwpBhmAHt43ib5s5J4th) {
//                      isExtra = "<div class='col-20'><i class='text-dark' data-toggle='tooltip' data-placement='top' title='Locality'>" + (result.trc20[i].TRTpeTYQm5mxjjiwpBhmAHt43ib5s5J4th / 100000000) + " <b>LOCAL</b></i></div>";
//                    }
                else { continue; }
              }
              if (!isTRC20) { 
                isTRC20 = "<div class='col-20 p-0 text-right'><i class='text-dark' data-toggle='tooltip' data-placement='top' title='Balance: " + wbbs.toLocaleString() + " WBBS'><b>Balance:</b> " + wbbs + " <b>WBBS</b></i></div>";
              }

              $.ajax({
//                  url: 'https://www.tradecrypto.click/API?v=markets&o=price&q=BBST+WBBS',
              url: 'https://www.tradecrypto.click/API?v=markets&o=price&q=BBST_1003413%20WBBS_TB3CjdHfkraU7MJLSQESYPY4U2CMKXi3LB',
              dataType: 'json',
              cache: 'false'
            }).done(function(price){
                if (price && price !== "null") {
//              if (price != "null") && (price.length > 0) {
//                    if (price[0].currency == "BBST") { trc10price = Number(price[0].price).toFixed(6); }
//                    if (price[0].currency == "WBBS") { trc20price = Number(price[0].price).toFixed(6); }
/*
                if (price[0].currency == "BBST") { trc10price = Number(price[0].ask) + Number(price[0].bid); trc10price = Number(trc10price / 2).toFixed(6); }
                if (price[0].currency == "WBBS") { trc20price = Number(price[0].price).toFixed(6); }

                if (price[1]) {
                  if (price[1].currency == "BBST") { trc10price = Number(price[0].ask) + Number(price[0].bid); trc10price = Number(trc10price / 2).toFixed(6); }
                  if (price[1].currency == "WBBS") { trc20price = Number(price[1].price).toFixed(6); }
                }
*/
                for (var p = 0; p < price.length; p++) {
                  if (price[p].currency == "BBST" && price[p].market == "TRX") { 
                    //trc10price = Number(price[p].ask) + Number(price[p].bid); trc10price = Number(trc10price / 2).toFixed(8);
                    trc10price = Number(price[p].price).toFixed(8);
                    trc10usd = Number(price[p].usd * bbst).toFixed(6);
                  }
                  if (price[p].currency == "WBBS") {
                    trc20price = Number(price[p].price).toFixed(8);
                    trc20usd = Number(price[p].usd * wbbs).toFixed(6);
                  }
                }

                if (trc10price) {trc10calc=Number(trc10price * bbst).toFixed(6);}
                if (trc20price) {trc20calc=Number(trc20price * wbbs).toFixed(6);}
              }
//              if (!appLoaded) { $("#tokenBalance").empty(); }

// &times; " + trc10price + " TRX<br> | &times; " + trc20price + " TRX<br>
              $("#tokenBalance").html("<div class='card mt-3 p-1 bg-white'><div class='row col-20'><div class='col-4 m-0 p-0'><img width='50px' src='/images/bbstokenSQwhite.png' data-toggle='tooltip' data-placement='top' title='BBSToken'></div><div class='col-16 text-monospace text-nowrap h7 p-0'>"+isTRC10+"<div class='col-20 text-right p-0'><i class='text-dark h8' data-toggle='tooltip' data-placement='top' title='" + trc10price + " TRX'><b>&commat;</b>" + trc10price + " <b>TRX &asymp;</b>" + trc10calc + " <b>TRX</b><br>&asymp;$"+ trc10usd +" <b>USD</b></i></div></div></div></div>" +
              "<div class='card mt-3 p-1 bg-white'><div class='row col-20'><div class='col-4 m-0 p-0'><img width='50px' src='/images/wrappedbbstokenSQwhite.png' data-toggle='tooltip' data-placement='top' title='BBSToken'></div><div class='col-16 text-monospace text-nowrap h7 p-0'>"+isTRC20+"<div class='col-20 text-right p-0'><i class='text-dark h8' data-toggle='tooltip' data-placement='top' title='" + trc20price + " TRX'><b>&commat;</b>" + trc20price + " <b>TRX &asymp;</b>" + trc20calc + " <b>TRX</b><br>&asymp;$"+ trc20usd +" <b>USD</b></i></div></div></div></div>");
//              $("#tokenBalance").append("<div class='card mt-3 p-2 bg-white'><div class='row col-20'><div class='col-4 m-0 p-0'><img width='40px' src='/images/wrappedbbstokenSQwhite.png' data-toggle='tooltip' data-placement='top' title='BBSToken'></div><div class='col-16 text-monospace text-nowrap h7 p-0'>"+isTRC20+"<div class='col-20 text-right p-0'><i class='text-dark h8' data-toggle='tooltip' data-placement='top' title='" + trc20price + " TRX'>&commat;" + trc20price + " TRX &asymp;" + trc20calc + " <b>TRX</b> &asymp;$"+ trc20usd +"</i></div></div></div></div>");
              $("#bbstSwap").html(isTRC10);
              $("#wbbsSwap").html(isTRC20);

              $.ajax({
                  url: 'https://platform.bbstoken.click/API',
                dataType: 'json',
                cache: 'false',
                data: { airdrops: mywallet },
                success: function (air) {
                    $("#tokenBalance").prepend("<div class='card mt-3 p-2 bg-white'><div class='row col-20'><div class='col-4 m-0 p-0'><b><i class='fas fa-parachute-box fa-3x text-info' title='Total Airdrops Received on " + air.result.txs + " transactions: " + air.result.bbst + " BBST'></i></b></div><div class='col-16 text-monospace text-left h7 p-0'>Airdrops: A total of <b>"+air.result.bbst+" BBST</b> were deposited to your Tron wallet on <b>" + air.result.txs + "</b> transactions.</i></div></div></div>");
                }
            
              });

            });



//                  if (isExtra) { $("#tokenExtra").append(isExtra); }

            }
            else {
              $("#tokenBalance").html("<div class='card mt-3'><div class='row mt-3 mb-5'><div class='col-4 m-0 p-0'><img width='63px' src='https://coin.top/production/upload/logo/1003413.png?t=1602782798355' data-toggle='tooltip' data-placement='top' title='Wrapped BBSToken'></div><div class='col-16 text-monospace text-nowrap'><div class='col-20'><i class='text-dark' data-toggle='tooltip' data-placement='top' title='0 BBST'>0 <b>BBST</b></i></div><div class='col-20'><i class='text-dark' data-toggle='tooltip' data-placement='top' title='0 WBBS'>0 <b>WBBS</b></i></div></div></div></div>");
            } // if result
            });
//              },100);

    appLoaded=1;
    }


    function BBSCoin() {
          $.ajax({
              url: 'https://platform.bbstoken.click/API',
              dataType: 'json',
              cache: 'false',
              data: { address: mywallet },
              success: function (wallet) {

              if (wallet.code == 7) {
                $("#bbs").prepend("<p><i class='fa fa-donate'></i> Please sign/accept the [ Signature Request ] to login...</p><br>");
                const signedtxn = tronWeb.trx.sign(wallet.result.id + window.tronWeb.defaultAddress.hex + wallet.result.code).then(output => {
                  $.ajax({
                  url: 'https://platform.bbstoken.click/API',
                  dataType: 'json',
                  cache: 'false',
                  data: { sign: output, id: wallet.result.id },
                  success: function (sign) {
                    $("#bbs").html("<i class='fa fa-donate'></i> Deposit Address<hr><span onclick=\"javascript:navigator.clipboard.writeText('" + sign.result.address + "').then(function () { alert('" + sign.result.address + " | This BBSCoin address was copied, paste it where you needed.') })\">" + sign.result.address + "</span>").fadeIn;
                    if (!sign.result.bbstx) { $("#bbsbalance").append("Hi! I wasn't able to find any transactions for you. If you had sent any, please wait a little longer as it has to be confirmed on the BBSCoin blockchain first for the platform to see it."); }
                    else { $("#bbsbalance").append("You have circulated " + sign.result.tron.toLocaleString() + "  BBST, and returned " + sign.result.balance.toLocaleString() + " BBST.");  }
                  }});
                });
              }
          }});
    }


    async function TokenSwap() {
      var token = document.getElementById("swapToken").elements.namedItem("tokenSelect").value;
      var amount = document.getElementById("swapToken").elements.namedItem("inputTokens").value;

    $("input[name='inputTokens']").attr("disabled", true);
    $("input[name='inputTokens']").val('');
    $('input:radio[name="tokenSelect"]').prop('checked', false);

      if (!token) {alert("Please select an action")};
      if (!amount) {alert("Please enter an amount")};
      amount.replace(/[^0-9.]/g,'');

      if (token && amount) {

        try {

          amount *= 1000;
          let instance = await tronWeb.contract().at(contractID);
          if (token == "wbbs") { let res = await instance.withdraw(amount).send(); }
          else {
            let res = await instance.deposit().send({feeLimit:10000000,callValue:0,tokenValue:amount,tokenId:1003413,shouldPollResponse:true});
            console.log(res);
          } // Fee changed from 2trx to 5 trx. Added log(res)

        } catch (error) {
          console.log(error);
        }
      }

    }

function showTransaction() {
document.getElementById("transactionAlert").innerHTML("Please wait a moment while your balance updates.");
document.getElementById("transactionAlert").css("display", "block");
}

function btnEnable(){
$("#btnSwap").attr("disabled", false);
$("#btnSwap").removeClass('btn-muted');
}

$( document ).ready(function() {
  getWalletAddress();

var accountInterval = setInterval(function() {
  if ('tronWeb' in window) {
    if (window.tronWeb.defaultAddress.base58 !== mywallet) {
      getWalletAddress();
    }
  }
}, 100);

      var accountInterval = setInterval(function() {
        if ('tronWeb' in window && 'base58' in window.tronWeb.defaultAddress) { getWalletBalance(window.tronWeb.defaultAddress.base58); }
      }, 30000);

  $("#btnSwap").click(function(){
    $("#btnSwap").attr("disabled", true);
    $("#btnSwap").addClass('btn-muted');
    TokenSwap();
  return false;
  }); 

  $('input:radio[name="tokenSelect"]').change(
    function(){
      if (this.checked) { $("input[name='inputTokens']").attr("disabled", false); }
  });

  $("input[name='inputTokens']").keyup(function(event){

        if (document.getElementById("swapToken").elements.namedItem("inputTokens").value > 0) {
          $("#btnSwap").attr("disabled", false);
          $("#btnSwap").removeClass('btn-muted');
        }
        else {
          $("#btnSwap").attr("disabled", true);
          $("#btnSwap").addClass('btn-muted');
        event.preventDefault();
        }

  });

});
