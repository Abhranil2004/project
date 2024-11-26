import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3State } from '../types/blockchain';

export function useWeb3() {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    account: null,
    chainId: null,
    connected: false,
  });

  const connectWallet = async () => {
    // Check for Core Wallet
    if (typeof window.avalanche !== 'undefined') {
      try {
        await window.avalanche.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.avalanche);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        const network = await provider.getNetwork();

        setWeb3State({
          provider,
          account,
          chainId: network.chainId,
          connected: true,
        });
      } catch (error) {
        console.error('Error connecting to Core Wallet', error);
      }
    } else {
      console.error('Please install Core Wallet');
    }
  };

  useEffect(() => {
    if (typeof window.avalanche !== 'undefined') {
      window.avalanche.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWeb3State((prev) => ({
            ...prev,
            account: accounts[0],
          }));
        } else {
          setWeb3State({
            provider: null,
            account: null,
            chainId: null,
            connected: false,
          });
        }
      });

      window.avalanche.on('chainChanged', (chainId: string) => {
        window.location.reload();
      });
    }
  }, []);

  return { ...web3State, connectWallet };
}