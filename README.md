# 🃏 Bhabhi Ultimate - Premium Card Game

<!-- Premium Banner: Replace with custom generated image when service restored -->
![Bhabhi Ultimate Banner](https://images.unsplash.com/photo-1541123439599-7977a49938c5?q=80&w=1200&auto=format&fit=crop&text=Bhabhi+Ultimate)

Bhabhi Ultimate is a professionally crafted, immersion-focused mobile card game implementation of the popular South Asian game "Bhabhi" (also known as Tula). Built with **Expo** and **Firebase**, it features a premium aesthetic, smooth animations, and real-time state management.

## ✨ Features

- **👑 Premium UI/UX**: High-fidelity design with 3D-inspired cards, glassmorphism UI, and cinematic transitions.
- **🌗 Suit-Aware Themes**: The entire app's aesthetic (colors, gradients, backgrounds) dynamically changes based on your selected card suit (Spades, Clubs, Hearts, Diamonds).
- **📊 User Profiles**: Track your stats including total games played, wins, and win rate.
- **🔥 Smooth Animations**: Powered by `react-native-reanimated` for a liquid-smooth 60fps experience.
- **🔐 Secure Authentication**: Full authentication flow (Signup, Login, Forgot Password) integrated with Firebase Auth.
- **📱 Cross-Platform**: Runs beautifully on both Android and iOS via Expo.

## 🛠️ Tech Stack

- **Frontend**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **State Management**: React Hooks & Firebase Realtime Database
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Auth, Realtime Database)
- **Icons**: [Lucide React Native](https://lucide.dev/) & [Material Community Icons](https://icons.expo.fyi/)
- **Layout**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- [Expo Go](https://expo.dev/go) app on your mobile device (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Bhabhi-ultimate.git
   cd Bhabhi-ultimate
   ```

2. **Install dependencies**
   > **Note**: `node_modules` and `.expo` folders are ignored in this repo. You must install them manually.
   ```bash
   npm install
   ```

3. **Configure Firebase (CRITICAL)**
   - Open `backend/config/firebase.js`.
   - You will see **placeholder strings** (e.g., `"YOUR_API_KEY_HERE"`).
   - **Replace these placeholders** with your actual Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/).

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code shown in the terminal with your Expo Go app (Android) or Camera app (iOS).

## 📁 Project Structure

```text
├── app/               # Expo Router pages (Login, Signup, Profile, Table)
├── assets/            # Static assets (images, fonts, sounds)
├── backend/           
│   ├── config/        # Firebase & app configuration
│   └── services/      # Auth & Database service logic
├── src/
│   ├── components/    # Reusable UI components
│   ├── constants/     # Theme & Game constants
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Helper functions
└── package.json       # Project dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
