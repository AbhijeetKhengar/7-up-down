# 🎲 7 Up Down - Dice Betting Game

A simple yet engaging dice game where players bet on the outcome of two dice rolls. Test your luck and strategy in this classic game of chance!

---

## 🎮 Game Overview

In **7 Up Down**, two dice are rolled, and players bet on the outcome of the total:

- **UP**: Total will be greater than 7 (8, 9, 10, 11, 12)
- **DOWN**: Total will be less than 7 (2, 3, 4, 5, 6)
- **EXACT**: Total will be exactly 7

### 💰 Payouts

- **Correct UP or DOWN prediction**: _2x your bet_
- **Correct EXACT prediction**: _4x your bet_

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm or yarn
- MySQL (v5.7+) or PostgreSQL (v10+)
- Git

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AbhijeetKhengar/7-up-down.git
cd 7-up-down
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create one of the following files based on your environment:

- `.env.local` – for local development
- `.env.development` – for development environment
- `.env.production` – for production environment

#### Example `.env` Configuration

```env
# Server Configuration
PORT=3000
NODE_ENV=local  # or development, production

# Database Configuration
DB_DRIVER=mysql  # or postgres
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=7updown
HOST=localhost
DB_PORT=3306  # 3306 for MySQL, 5432 for PostgreSQL

# Sync Options
DB_SYNC_ALTER=true  # Use with caution
DB_SYNC_FORCE=false  # DANGER: This will drop tables!

# Logging
SQL_LOGGING=false

# Encryption
ENCRYPTION=false
KEY=1cUYmFcGr1dgoPOEGqkrLDS7XvydoJ4t
IV=FSqFKHJBBqGwlKJM
```

### 4. Start the Application

Before running, ensure dependencies are installed:

```bash
yarn install
# or
npm install
```

### 5. Run the Application

```bash
yarn run local
```

#### For Documentation, I've added postman collection to the root directory of the project

#### For better understanding the database, I've added db diagram image to the root directory of the project