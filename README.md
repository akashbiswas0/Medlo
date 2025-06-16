# Medlo

AI-IP tooling built on **Story Protocol** 

Creators & influencers collaboratively generate AI art, register it as on-chain intellectual property, set royalty splits, and let their communities mint licences that unlock gated utility (events, chats, future drops, etc.).

---

## ✨ Key Features

| Module | Description |
| ------ | ----------- |
| AI Generation |  (opensource models finetuned in influencer's images) produces image variations for nft projects. |
| IP Registration | Final image & metadata are pinned to IPFS and registered as an **IP Asset** on Story Network. |
| Royalty Splits | Creator, influencer, platform & base-model shares encoded on-chain at registration. |
| Licence Minting | Followers mint licence NFTs (1 $WIP default fee) and revenue flows automatically. |
| Royalty Dashboard | Claim accumulated revenue in $WIP with one click. |
| Disputes | Raise Story Protocol disputes with evidence files, bonded & time-boxed. |
| Tomo Wallet | Account-abstraction & social login via Tomo SDL for seamless onboarding. |

---

## 🛠️ Tech Stack

* Next.js 14 (App Router, React 18)
* Tailwind CSS v4
* **@story-protocol/core-sdk** – IP, licensing, royalties, disputes
* **@tomo-inc/tomo-evm-kit** – wallet provider & connect modal
* wagmi v2 + viem – typed EVM interactions
* Replicate SDK – model inference
* Pinata – IPFS uploads
* TypeScript everywhere

---

## ▶️ Getting Started

```bash
# 1 Install dependencies
npm install

# 2 Populate environment variables
cp .env.example .env.local
#   PINATA_JWT, NEXT_PUBLIC_PLATFORM_ADDRESS, etc.

# 3 Run dev server
npm run dev
# open http://localhost:3000
```

### Environment Variables

| Name | Purpose |
| ---- | ------- |
| `PINATA_JWT` | Auth token for Pinata upload API |
| `NEXT_PUBLIC_PLATFORM_ADDRESS` | Platform royalty receiver |
| `NEXT_PUBLIC_BASE_MODEL_ADDRESS` | Base model royalty receiver |
| `TOMO_CLIENT_ID` | App client ID from Tomo dashboard |
| `WALLETCONNECT_PROJECT_ID` | WalletConnect 2 project id used by Tomo EVM kit |

---

## 🏗️ Story Protocol Flow

1. **Collection** – create a fresh SPG NFT collection (`client.nftClient.createNFTCollection`).
2. **Mint + Register** – `client.ipAsset.mintAndRegisterIp` registers metadata CIDs & mints ownership in one tx.
3. **Licence Terms** – `client.license.registerPILTerms` sets default fee (1 $WIP) & rules.
4. **Attach** – terms are linked to the IP (`client.license.attachLicenseTerms`).
5. **Licence Mint** – followers call `client.license.mintLicenseTokens`.
6. **Royalties** – creators claim via `client.royalty.claimAllRevenue`.

All calls execute client-side using the signer injected by Tomo.


---

## 📂 Project Structure (high-level)

```
src/
  app/
    generate-campaigns/   # AI → IP workflow
    mint-license/         # Licence minting screen
    royalty-dashboard/    # Revenue claims
    raise-dispute/        # Dispute form
  lib/
    story-client.ts       # Story SDK helper
    tomo-config.ts        # Tomo provider config
    pinata.ts             # IPFS helpers
  components/             # Shared providers & UI pieces
public/                   # Static assets
```

---

## 🪙 Network


---Chain: **Story Network – Aeneid testnet** (chain id 1315).


## 🤝 Contributing

1. Fork and clone.
2. `git checkout -b feature/xyz`
3. Commit, push, open a PR.