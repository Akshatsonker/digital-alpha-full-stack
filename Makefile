.PHONY: up down seed test frontend backend

up:
	docker compose up --build

down:
	docker compose down

seed:
	cd backend && python -m app.seed

test:
	cd backend && pytest

frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --reload --port 8000
