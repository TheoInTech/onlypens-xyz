# ✍️ OnlyPens.xyz

**OnlyPens.xyz** is a decentralized ghostwriting marketplace tailored for creators. It connects creators with skilled ghostwriters, ensuring trustless transactions through smart contracts and enhancing user experience with AI-driven matchmaking.

---

## 🚀 MVP Scope

### 🎯 Core Features

- **User Authentication**: Wallet connect (e.g., Coinbase Smart Wallet) or email login.
- **Role Selection**: Users choose to be either an Influencer or a Ghostwriter.
- **Dashboard**:
  - _creators_:
    - Post new briefs.
    - View and manage submitted drafts.
    - Approve submissions and release payments.
  - _Ghostwriters_:
    - Browse available briefs.
    - Submit drafts for assigned briefs.
    - Track earnings.
- **AI-Powered Tone Matching**:
  - creators provide sample content to capture their unique tone.
  - AI analyzes these samples to match them with ghostwriters whose writing style aligns closely.
  - This ensures content authenticity and maintains the influencer's brand voice.
- **Escrow System**: Funds are held in a smart contract and released upon approval of work.
- **Yield-Bearing Escrow**: Integrate with Base's Earn component to allow escrowed funds to generate yield until released.

### 🛠️ Tech Stack

- **Frontend**: Next.js
- **Backend**: Supabase (for storing briefs and AI matchmaking data)
- **Blockchain**: Base network
- **Smart Contracts**: Solidity (using Hardhat for development and deployment)

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
- **Improve AI Matchmaking with Vector**: Improve matchmaking algorithms using advanced AI models and vector databases.

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

### 🌾 Earn Component

Integrate Base's Earn component to allow escrowed funds to earn yield until they are released to ghostwriters.

- **Benefits**:
  - Maximizes the utility of idle funds.
  - Provides additional value to users.

_Reference_: [Base Earn Component Documentation](https://docs.base.org/identity/smart-wallet/concepts/what-is-smart-wallet)

---

## 📄 License

[MIT](LICENSE)

---

_Note: This project is currently in its MVP stage. Features and integrations are subject to change as development progresses._
