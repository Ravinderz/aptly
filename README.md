# Aptly: Housing Society Management App

Aptly is a comprehensive housing society management application designed specifically for Indian residential communities. It is built with React Native and Expo, providing a modern, mobile-first experience for managing societies with under 100 units.

## Key Features

- **GST-Compliant Billing:** Automated maintenance bill generation with GST calculations, digital receipts, and online payment gateway integration (UPI, Net Banking, Cards).
- **Maintenance Request System:** Residents can digitally file complaints with photos and voice notes, track request status in real-time, and provide feedback on completed work.
- **Amenity Booking:** A system for booking common facilities like clubhouses, gyms, and community halls, with a visual calendar that includes Indian festivals.
- **Vendor Management:** A marketplace of verified local service providers, allowing societies to manage and coordinate services efficiently.
- **Committee Management:** Tools for scheduling meetings, conducting digital voting, and ensuring financial transparency.
- **Visitor Management:** Pre-approve visitors, and generate QR codes for secure gate access.
- **Document Management:** A secure digital vault for residents and society management to store and access important documents.

## Target Audience

- **Society Secretaries:** To streamline maintenance billing, ensure GST compliance, improve communication, and reduce manual paperwork.
- **Residents:** For easy maintenance payments, quick complaint resolution, community participation, and access to society documents.
- **Facility Managers:** To efficiently track work orders, communicate with residents, and document maintenance issues.

## Tech Stack

- **Frontend:** React Native, Expo, TypeScript, NativeWindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management:** Zustand
- **Navigation:** React Navigation
- **API Communication:** Axios
- **Push Notifications:** Firebase Cloud Messaging

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npx expo start
   ```

   This will provide you with options to run the app in a development build, an Android emulator, an iOS simulator, or the Expo Go app.

## Project Structure

- `app/`: Contains the application's screens and navigation, using Expo's file-based routing.
- `components/`: Shared UI components used across the application.
- `services/`: Modules for interacting with external APIs and services.
- `stores/`: Zustand stores for global state management.
- `hooks/`: Custom React hooks.
- `constants/`: Application-wide constants like colors and styles.
- `types/`: TypeScript type definitions.
- `docs/`: Detailed project documentation, including Product Requirements Documents.

## Contributing

This project is currently under active development. Contribution guidelines will be provided in the future.
