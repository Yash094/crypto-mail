"use client";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets"
import { client } from "./client";
import { useState } from "react";
import { avalancheFuji } from "thirdweb/chains";
import { prepareTransaction, toWei, sendAndConfirmTransaction } from "thirdweb";
import { useProfiles } from "thirdweb/react";

export default function Home() {
  const { data: profiles } = useProfiles({
    client,
  });
  const account = useActiveAccount()
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const resetForm = () => {
    setEmail("");
    setAmount("");
    setWalletAddress("");
    setTransactionHash("");
    setStatus("");
  };

  

  const handleSubmit = async () => {
    console.log("handleSubmit function called");
    setIsLoading(true);
    setStatus("Fetching wallet address...");
    try {
      const response = await fetch('/api/getWallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const result = await response.json();
      setWalletAddress(result.wallet);
      setStatus("Preparing transaction...");
      const transaction = prepareTransaction({
        to: result.wallet,
        chain: avalancheFuji,
        client: client,
        value: toWei(amount),
      });
      setStatus("Sending transaction...");
      try {
        const transactionReceipt = await sendAndConfirmTransaction({
          transaction,
          //@ts-ignore
          account
        })
        setTransactionHash(transactionReceipt.transactionHash);
        setStatus("Transaction sent successfully!");
      } catch (e) {
        console.error(e)
        // to-do fix
        //@ts-ignore 
        setStatus("Transaction failed: " + e?.message);
      }

    } catch (error) {
      console.error('Error in handleSubmit:', error);

      // to-do fix
      //@ts-ignore 
      setStatus("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google", "discord", "telegram", "farcaster", "email", "x", "passkey",
          "phone", "github", "twitch", "steam", "coinbase", "line", "apple", "facebook",
        ],
      },
    }),
  ];

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {!account ? (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Connect Your Wallet
            </h2>
            <div className="mt-6">
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={avalancheFuji}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="mt-6 text-center">
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={avalancheFuji}
                />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Pay to an Email
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              handleSubmit().catch(error => console.error("Error in handleSubmit:", error));
            }}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="sr-only">Amount</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Send Payment'
                  )}
                </button>
              </div>
            </form>

            {status && status !== "Transaction sent successfully!" && (
              <div className="mt-4 text-center">
                <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {status}
                </p>
              </div>
            )}

            {status === "Transaction sent successfully!" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                <div className="fixed inset-0 bg-black opacity-50"></div>
                <div className="relative w-full max-w-md mx-auto my-6 z-50">
                  <div className="relative flex flex-col w-full bg-white rounded-lg shadow-xl">
                    <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Transaction Details
                      </h3>
                      <button
                        className="p-1 ml-auto bg-transparent border-0 text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={() => resetForm()}
                      >
                        <span className="bg-transparent text-gray-900 h-6 w-6 text-2xl block outline-none focus:outline-none">
                          ×
                        </span>
                      </button>
                    </div>
                    <div className="relative p-6 flex-auto">
                      <div className="my-4 text-gray-600 text-lg leading-relaxed">
                        <p className="mb-2">
                          <span className="font-semibold text-gray-900">Amount Sent:</span>
                          <span className="break-all">{amount} AVAX</span>
                        </p>
                        <p className="mb-2">
                          <span className="font-semibold text-gray-900">From Email:</span>
                          <span className="break-all">{profiles?.[0]?.details?.email ?? ''}</span>


                        </p>
                        <p className="mb-2">
                          <span className="font-semibold text-gray-900">To Email:</span>
                          <span className="break-all">{email}</span>
                        </p>
                        <p className="mb-2">
                          <span className="font-semibold text-gray-900">Transaction Hash:</span>
                          <span className="break-all">{transactionHash}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                      <button
                        className="text-white bg-indigo-600 hover:bg-indigo-700 font-bold uppercase px-6 py-3 rounded text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => resetForm()}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
