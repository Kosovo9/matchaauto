# Makefile
.PHONY: help dev build prod clean cf-build deploy

help:
	@echo "Available commands:"
	@echo "  make dev       - Start development environment"
	@echo "  make build     - Build the application"
	@echo "  make prod      - Start production environment"
	@echo "  make clean     - Clean Docker resources"
	@echo "  make cf-build  - Build for Cloudflare Pages"
	@echo "  make deploy    - Full deployment process"

dev:
	docker-compose up frontend

build:
	docker-compose build frontend

prod:
	docker-compose -f docker-compose.prod.yml up -d

clean:
	docker-compose down -v
	docker system prune -f

cf-build:
	docker-compose up cloudflare-build

deploy:
	./deploy.sh
