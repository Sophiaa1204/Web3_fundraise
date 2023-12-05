import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x322948ebb46367DC51aAA609f87A3C0a437957A0";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Hope it helps!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("donation processed!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>SmartFundraise</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div style={{position:"sticky", top:0, display:"flex",gap:700, alignItems:"center", width:1650, backgroundColor:"#CBC3E3", padding: 10}}>
        <div style={{display:"flex",justifyContent:"space-between", alignItems:"center",width:220}}>
          <div style={{width:40,height:35}}><svg t="1701735585645" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7549" width="40" height="40"><path d="M632.246857 121.904762c130.56 0 236.422095 105.837714 236.422095 236.422095 0 82.895238-42.666667 155.794286-107.203047 198.022095l192.853333 225.01181A73.142857 73.142857 0 0 1 898.779429 902.095238l-116.443429 0.024381c12.824381-22.186667 16.335238-48.566857 9.99619-73.142857L898.779429 828.952381 651.702857 540.696381l69.705143-45.568a163.279238 163.279238 0 0 0-86.381714-300.056381 287.158857 287.158857 0 0 0-63.341715-65.340952A236.544 236.544 0 0 1 632.246857 121.904762z m-69.90019 471.722667l160.914285 187.733333A73.142857 73.142857 0 0 1 667.672381 902.095238H134.656a73.142857 73.142857 0 0 1-55.53981-120.734476l160.914286-187.733333a283.867429 283.867429 0 0 0 161.158095 49.883428c59.806476 0 115.321905-18.407619 161.158096-49.883428zM401.188571 121.904762c130.56 0 236.422095 105.837714 236.422096 236.422095 0 130.56-105.862095 236.422095-236.422096 236.422095-130.584381 0-236.422095-105.862095-236.422095-236.422095C164.766476 227.742476 270.60419 121.904762 401.188571 121.904762z" p-id="7550"></path></svg></div>
          <div style={{fontWeight:"bold", fontSize:20}}>SmartFundraise</div>
        </div>
        <div  style= {{display:"flex",justifyContent:"space-between", alignItems:"center", width:800}}>
          <div className={styles.navigator}>About</div>
          <div className={styles.navigator}>For Individuals</div>
          <div className={styles.navigator}>For Charities</div>
          <div className={styles.navigator}>Start Fundraising!</div>
        </div>
      </div>

      <main className={styles.main}>
        <img src='/logo.png' ></img>
        <h1 className={styles.title} >
          Crowdfunding Reimagined for the Digital Age.
        </h1>
        <div style={{display: "flex", width:600, flexWrap:"wrap", gap:10, marginTop:4git0}}>
          <div className={styles.item}>Medical</div>
          <div className={styles.item}>Memorial</div>
          <div className={styles.item}>Emergency</div>
          <div className={styles.item}>Non-Profit</div>
          <div className={styles.item}>Education</div>
        </div>

        {currentAccount ? (
          <div className={styles.mainSection}>
            <form>
              <div>
                <label>
                  Name
                </label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label>
                  Send fundraiser a message
                </label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Hope it helps!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={buyCoffee}
                  style={{fontWeight:"bold"}}
                >
                  Donate 0.001ETH now!
                </button>
              </div>
            </form>
          </div>
        ) : (
            <button onClick={connectWallet} className={styles.buttonMargin}> Connect your wallet </button>
          )}
      </main>

      {currentAccount && (<h1>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{ border: "2px solid", "borderRadius": "5px", padding: "5px", margin: "5px" }}>
            <p style={{ "fontWeight": "bold" }}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by SmartFundraise: A Web3 Crowdfunding Platform
        </a>
      </footer>
    </div>
  )
}
