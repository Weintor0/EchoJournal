# EchoJournal

EchoJournal is a full-stack mobile journaling application that allows users to capture, organize, and manage personal entries with rich content support.

The project consists of a React Native (Expo) frontend and a Node.js (Express) backend with a SQLite database. It is structured using npm workspaces to manage both frontend and backend dependencies from a single root.

---

## Features

* Create, edit, and delete journal entries
* Rich text editing support
* Image selection and manipulation
* Date-based journaling
* Search and filtering functionality
* Smooth animations and responsive UI

---

## Architecture

Frontend:

* React Native (Expo)
* Expo Router and React Navigation

Backend:

* Node.js
* Express

Database:

* SQLite (sqlite3)

Project Structure:

* Frontend and backend are managed via npm workspaces
* Shared dependency management at the root level

---

## Tech Stack

Frontend:

* React Native (Expo)
* Expo Router
* React Navigation (Native Stack, Bottom Tabs)

Media and Content:

* Expo Image Picker
* Expo Image Manipulator
* React Native Render HTML
* React Native WebView

Backend:

* Node.js
* Express
* SQLite (sqlite3)
* CORS

Utilities:

* i18n-js
* lodash

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/echojournal.git
cd echojournal
```

Install all dependencies (frontend + backend via workspaces):

```bash
npm install
```

---

## Running the Project

Start the backend:

```bash
npm run start --workspace=backend
```

Start the frontend:

```bash
npx expo start
```

---

## Running the App

You can run the mobile application using:

* Android Emulator
* iOS Simulator
* Expo Go

---

## Project Purpose

This project was developed to explore:

* Full-stack mobile application development
* Structuring scalable React Native projects
* Integrating a backend API with a mobile client
* Managing local databases with SQLite
* Handling rich media and formatted content

---

## Future Improvements

* Authentication and user accounts
* Cloud synchronization
* Tagging system and advanced search
* Backup and restore functionality
* Push notifications

---

## Author

Umut Berke Hancıoğlu

---

## License

This project is open-source and available under the MIT License.
