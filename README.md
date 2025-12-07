# Characters API

A RESTful API built with TypeScript and Express for managing character data. Features include full CRUD operations, rate limiting, file-based database storage, and Swagger documentation.

## Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd characters-api
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3005` with hot-reloading enabled.

### Production Mode

```bash
npm run build
npm start
```

### Docker

Build and run with Docker:

```bash
docker build -t characters-api .
docker run -p 3005:3005 characters-api
```

## API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3005/docs
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production code

## Environment Variables

- `PORT` - Server port (default: 3005)

## License

ISC

## Author

Dmytro Beliavskyi - [Github](https://github.com/troyqa)
