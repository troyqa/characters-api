.PHONY: up-dev down-dev up down

# Production
up-prod:
	docker compose --profile prod up -d --build

down-prod:
	docker compose --profile prod down -v

# Development
up-dev:
	docker compose --profile dev up -d --build

down-dev:
	docker compose --profile dev down -v

