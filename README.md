# IrysUp Backend

The backend service for IrysUp — a decentralized platform for creative asset management built on the Irys DataChain. This service handles user authentication, asset metadata processing, temporary file storage, and communication with the Irys SDK for on-chain anchoring.

## Overview

This Node.js/Express application serves as the intermediary between the IrysUp frontend and the Irys DataChain. It provides RESTful APIs for:

- User wallet connection and session management
- Asset upload and metadata processing
- Temporary file storage (during testnet phase)
- Manifest generation via Irys SDK
- Secure password handling (double-encrypted hashing)

All data persistence is minimal and temporary. Upon migration to mainnet, this service will transition to a stateless architecture, with all asset data permanently stored on-chain.

## Architecture

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (for session and metadata indexing only)
- **Storage**: Local filesystem (temporary uploads) — to be deprecated on mainnet
- **Blockchain Integration**: Irys SDK (v1.x) for anchoring files to Sepolia testnet
- **Authentication**: WalletConnect + EIP-191 signature verification
- **Security**: Client-side password encryption → server-side double-hashing (bcrypt)
- **Deployment**: Dockerized, deployed on private infrastructure via PM2

## Environment Variables

Create a `.env` file in the root directory with the following:

```
PORT=PORT
HOST=HOST
USER=USER
PASSWORD=PASSWORD
DATABASE=DATABASE
```
