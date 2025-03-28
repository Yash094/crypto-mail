"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount, useProfiles } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { client } from "./client";
import { avalancheFuji } from "thirdweb/chains";
import { prepareTransaction, toWei, sendAndConfirmTransaction } from "thirdweb";

export default function Home() {
  const { data: profiles } = useProfiles({ client });
  const account = useActiveAccount();
  const [formData, setFormData] = useState({ email: "", amount: "" });
  const [status, setStatus] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ email: "", amount: "" });
    setTransactionHash("");
    setStatus("");
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Fetching wallet address...");

    try {
      const response = await fetch("/api/getWallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();
      if (!result.wallet) throw new Error("No wallet found for this email.");

      setStatus("Preparing transaction...");
      const transaction = prepareTransaction({
        to: result.wallet,
        chain: avalancheFuji,
        client,
        value: toWei(formData.amount),
      });

      if (!account) return setStatus("No account found");
      setStatus("Sending transaction...");

      const transactionReceipt = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      setTransactionHash(transactionReceipt.transactionHash);
      setStatus("Transaction sent successfully!");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google",
          "discord",
          "telegram",
          "farcaster",
          "email",
          "x",
          "passkey",
          "phone",
          "github",
          "twitch",
          "steam",
          "coinbase",
          "line",
          "apple",
          "facebook",
        ],
      },
    }),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {!account ? (
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Connect Your Wallet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect your wallet to send AVAX to any email address
            </p>
            <div className="mt-6 flex justify-center">
              <div className="transform transition-transform hover:scale-105">
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={avalancheFuji}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={avalancheFuji}
                />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Pay to an Email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Send AVAX directly to anyone using their email address
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipient's Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="recipient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (AVAX)
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    step="0.0001"
                    min="0.0001"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="0.1"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">AVAX</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition-all duration-200`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Send Payment"
                )}
              </button>
            </form>

            {status && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm ${
                  status.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                <div className="flex items-center">
                  {status.includes("Error") ? (
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {status}
                </div>
              </div>
            )}

            {transactionHash && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white animate-fade-in-up">
                  <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Transaction Successful
                    </h3>
                    <div className="text-left mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Amount Sent</p>
                        <p className="font-medium">{formData.amount} AVAX</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">From Email</p>
                        <p className="font-medium">
                          {profiles?.[0]?.details?.email ?? "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">To Email</p>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Transaction Hash
                        </p>
                        <div className="flex items-center mt-1">
                          <p className="font-mono text-xs truncate">
                            {transactionHash}
                          </p>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(transactionHash)
                            }
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                        onClick={resetForm}
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
