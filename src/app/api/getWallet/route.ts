import { NextResponse } from "next/server";

const { THIRDWEB_SECRET_KEY } = process.env;

const THIRDWEB_API_BASE_URL = 'https://in-app-wallet.thirdweb.com/api';
const EMBEDDED_WALLET_DETAILS_ENDPOINT = `${THIRDWEB_API_BASE_URL}/2023-11-30/embedded-wallet/user-details`;
const PREGENERATE_WALLET_ENDPOINT = `${THIRDWEB_API_BASE_URL}/v1/pregenerate`;

interface WalletResponse {
    walletAddress?: string;
}

interface PregenerateResponse {
    wallet: {
        address: string;
    };
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { email }: { email: string } = await request.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const walletAddress = await fetchWalletAddress(email);
        if (walletAddress) {
            return NextResponse.json({ message: "Wallet address retrieved", wallet: walletAddress }, { status: 200 });
        }

        const generatedWallet = await pregenerateWallet(email);
        if (generatedWallet) {
            return NextResponse.json({ message: "Wallet address created", wallet: generatedWallet }, { status: 200 });
        }

        return NextResponse.json({ message: "Failed to create wallet" }, { status: 500 });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json({ message: "An error occurred", error: error.message }, { status: 500 });
    }
}

async function fetchWalletAddress(email: string): Promise<string | null> {
    try {
        const url = new URL(EMBEDDED_WALLET_DETAILS_ENDPOINT);
        url.searchParams.append('queryBy', 'email');
        url.searchParams.append('email', email);

        const options = getFetchOptions('GET');

        const response = await fetch(url, options);
        if (!response.ok) {
            console.warn("Failed to fetch wallet details:", response.status, response.statusText);
            return null;
        }

        const data: WalletResponse[] = await response.json();
        return data[0]?.walletAddress || null;
    } catch (error) {
        console.error("Error fetching wallet address:", error);
        return null;
    }
}

async function pregenerateWallet(email: string): Promise<string | null> {
    try {
        const data = { strategy: "email", email };
        const options = getFetchOptions('POST', data);

        const response = await fetch(PREGENERATE_WALLET_ENDPOINT, options);
        if (!response.ok) {
            console.warn("Failed to pregenerate wallet:", response.status, response.statusText);
            return null;
        }

        const result: PregenerateResponse = await response.json();
        return result.wallet.address;
    } catch (error) {
        console.error("Error pregenerating wallet:", error);
        return null;
    }
}

function getFetchOptions(method: 'GET' | 'POST', body?: Record<string, any>) {
    const headers: HeadersInit = {
        'x-secret-key': THIRDWEB_SECRET_KEY || '',
        'Content-Type': 'application/json',
    };

    return {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
    };
}
