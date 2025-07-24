# Calendar App API

A RESTful API for calendar application built with Node.js 22 and Express.js.

## Features

- Express.js web framework
- CORS enabled
- Security headers with Helmet
- Request logging with Morgan
- Environment configuration with dotenv
- Testing with Jest and Supertest
- Development server with Nodemon

## Prerequisites

- Node.js 22.x
- npm 10.x

## Installation

1. Clone the repository:
```bash
git clone https://github.com/akaplan-axian/calendar-app-api.git
cd calendar-app-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/events` - Calendar events (placeholder)

## Project Structure

```
calendar-app-api/
├── src/
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Data models
│   ├── routes/         # Route definitions
│   └── utils/          # Utility functions
├── tests/              # Test files
├── index.js            # Main application file
├── package.json        # Project dependencies
└── .env.example        # Environment variables template
```

## License

ISC
