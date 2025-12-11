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

#### Local Development
```bash
npm run dev
```

The server will start on `http://localhost:3005` with hot-reloading enabled.

#### Docker Development
```bash
make up-dev
```

To stop the development container:
```bash
make down-dev
```

### Production Mode

#### Local Production
```bash
npm run build
npm start
```

#### Docker Production
```bash
make up-prod
```

To stop the production container:
```bash
make down-prod
```

### Docker Compose Profiles

The application uses Docker Compose profiles for different environments:

- **Development Profile** (`dev`): Runs with hot-reload, mounts source code as volumes
- **Production Profile** (`prod`): Runs optimized build with multi-stage Dockerfile, includes restart policy

Manual Docker Compose commands (if not using Makefile):
```bash
# Development
docker compose --profile dev up -d --build
docker compose --profile dev down -v

# Production
docker compose --profile prod up -d --build
docker compose --profile prod down -v
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
