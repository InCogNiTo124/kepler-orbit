up: build
	docker-compose up -d

build: down
	docker-compose build --no-cache

down:
	docker-compose down
