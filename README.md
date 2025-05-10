# ✍️ OnlyPens.xyz

**OnlyPens.xyz** is a decentralized ghostwriting matchmaking app tailored for creators. It connects creators with skilled ghostwriters, ensuring trustless transactions through smart contracts and enhancing user experience with AI-driven matchmaking.

---

## 🚀 MVP Scope

### 🎯 Core Features

- **User Authentication**: Wallet connect using Coinbase Smart Wallet.
- **Role Selection**: Users choose to be either a Creator or a Ghostwriter.
- **Gig Creation**: Create gig packages with an AI-assisted pricing and start inviting the best-matched ghostwriters
- **Dashboard**:
  - _creators_:
    - Post new gigs in packages (e.g. 2 Thread, 4 short-post, 4 image caption).
    - View and manage submitted drafts.
    - Approve submissions and release payments.
  - _ghostwriters_:
    - Accept gig invitations from creators
    - Submit drafts for accepted gigs.
    - Track earnings.
- **AI-Powered Tone Matching**:
  - creators provide sample content to capture their unique tone.
  - AI analyzes these samples to match them with ghostwriters whose writing style aligns closely.
  - This ensures content authenticity and maintains the influencer's brand voice.
- **Escrow System**: Funds are held in a smart contract and released upon approval of work.
- **Yield-Bearing Escrow**: Integrate with Base's Earn component to allow escrowed funds to generate yield until released.

### 🛠️ Tech Stack

- **Frontend**: Next.js, Zod, Mantine UI
- **Backend**: Firebase's Firestore (for storing gigs metadata and AI matchmaking data)
- **Blockchain**: Base network
- **Smart Contracts**: Solidity (using Hardhat for development and deployment)
- **Indexing**: TheGraph Protocol's Subgraph

---

## 🌱 Future Enhancements

- **Long-Term Collaborations**: Enable creators to establish ongoing relationships with preferred ghostwriters aside from just a per-gig engagement.
- **Content Revision System**: Implement a structured revision process allowing creators to request changes and ghostwriters to submit updated versions.
- **Version History**: Maintain a comprehensive version history of all content, enabling easy comparison between drafts and tracking of changes.
- **Notification System**: Implement a comprehensive notification system to alert ghostwriters about new opportunities:
  - Real-time notifications for gig invitations and brief matches.
  - Email notifications for important updates and new opportunities.
  - In-app notification center to track all communications.
  - Customizable notification preferences allowing users to filter by opportunity type, budget range, and urgency.
  - Push notifications for mobile users to ensure timely responses to time-sensitive opportunities.
- **Reputation System**: Implement on-chain reputation scores for both creators and ghostwriters.
- **Commission-based Payments**: Implement a flexible royalty system allowing creators to offer ghostwriters a percentage of revenue generated from content, enabling profit-sharing arrangements alongside or instead of fixed payments.
- **Improved AI Matchmaking with Vector**: Improve matchmaking algorithms using advanced AI models and vector databases.

---

## 🔗 Base Integration

### 🧠 Smart Wallet

Utilize Base's Smart Wallet for seamless and secure user authentication.

- **Features**:
  - No need for browser extensions or separate apps.
  - Enhanced security with passkeys.
  - Simplified user onboarding.

_Reference_: [Base Smart Wallet Documentation](https://docs.base.org/identity/smart-wallet/concepts/what-is-smart-wallet)

### 💰 Smart Contracts

Develop and deploy smart contracts on the Base network using Hardhat and Solidity.

- **Use Cases**:
  - Escrow contracts to hold payments.
  - Automated release of funds upon approval.
  - Integration with yield-generating vaults.

_Reference_: [Deploying Smart Contracts with Hardhat](https://docs.base.org/cookbook/smart-contract-development/hardhat/deploy-with-hardhat)

---

## 📜 Smart Contracts

The OnlyPens platform utilizes the following smart contracts:

| Contract Name               | Contract Address                           | Description                                                                                             |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| OnlyPensHelpers             | 0x74f6F9aaB65920dE55CD499227Cb99aD86C02964 | Library contract containing helper functions for deliverable validation and other utility operations    |
| OnlyPens (Implementation)   | 0xC8F769515cf20B8Ba3b195Efc17DAc1Cd3a85b41 | Core contract containing the business logic for gig management, deliverables, and payment release       |
| CustomProxyAdmin            | 0xf92C590E5d2DF7E795293834d83CCb35a345b826 | Admin contract controlling the upgrade mechanism and permissions                                        |
| TransparentUpgradeableProxy | 0xAea48688cD175CC4dC269b0ceFB65597B5419900 | Proxy contract that users interact with, forwarding calls to the implementation while maintaining state |

The system uses the Transparent Proxy Pattern, allowing for future upgrades while preserving user data and contract state.

---

## 📄 License

[MIT](LICENSE)

---

_Note: This project is currently in its MVP stage. Features and integrations are subject to change as development progresses._
