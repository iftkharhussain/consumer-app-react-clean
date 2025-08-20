# Consumer App React

A clean, minimal React application for consumer management with authentication and settings.

## Features

- **Authentication System**
  - Login/Logout functionality
  - Password reset functionality
  - Forgot password functionality

- **Settings Management**
  - User profile management
  - Security settings

- **Clean UI/UX**
  - Responsive design
  - Modern sidebar navigation
  - Clean, minimal interface

## Available Scripts

### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run start:dev-api`
Runs the app with development API endpoints.

### `npm run start:production-api`
Runs the app with production API endpoints.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run build:dev`
Builds the app for development environment.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/
│   ├── login/          # Authentication pages
│   ├── logout/
│   ├── forgotPassword/
│   ├── resetPassword/
│   ├── settings/       # Settings pages
│   │   ├── profile/    # User profile management
│   │   └── security/   # Security settings
│   └── layout/         # Layout components
├── apis/               # API configuration
├── reducers/           # Redux state management
├── translations/       # Internationalization
└── utils/              # Utility functions
```

## Environment Configuration

The app supports multiple environments:

- `LOCAL_API` - Local development
- `DEV_API` - Development server
- `PROD_API` - Production server

Set the `REACT_APP_ENV` environment variable to switch between configurations.

## Technologies Used

- **React 18** - Frontend framework
- **Redux** - State management
- **Ant Design** - UI component library
- **React Router** - Navigation
- **i18next** - Internationalization
- **Less** - CSS preprocessing

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm start`

## Contributing

This is a clean, minimal application. When adding new features, maintain the simplicity and clean structure.
