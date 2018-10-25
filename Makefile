.PHONY: .ONESHELL

.ONESHELL:

.DEFAULT_GOAL := start

### FOR ALL
#.EXPORT_ALL_VARIABLES:
#	COMPOSE_FILE=docker-compose.dev.yml
#	COMPOSE_PROJECT_NAME=dv-fe-nginx_dev

# for dev
d%: export COMPOSE_FILE=docker-compose.dev.yml
d%: export COMPOSE_PROJECT_NAME=dv-fe-nginx_dev

### common

clean-image:
	docker image prune -f --filter until=240h

### docker

CMD=-h

test:
	docker-compose ${CMD}

#stop: export COMPOSE_FILE=
#stop: export COMPOSE_PROJECT_NAME=
stop: docker-compose.yml
	docker-compose down

build:
	docker-compose build

up:
	docker-compose up -d

start: stop build up

########

dt: test

dstop: docker-compose.dev.yml stop

dbuild: build

dup: up

dstart: dstop dbuild dup
