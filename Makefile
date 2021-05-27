ORG=cloudannotations
REPO=cloudannotations
TAG=0.0.1

.PHONY: docker-publish
docker-publish:
	# DOCKER_BUILDKIT=1 
	@docker build -t ${ORG}/${REPO}:${TAG} .
	@docker push ${ORG}/${REPO}:${TAG}

.PHONY: clean
clean:
	yarn lerna exec "rm -rf node_modules dist build"
	rm -rf node_modules

.PHONY: install
install:
	yarn install
	yarn lerna bootstrap

.PHONY: build
build:
	yarn lerna run build --stream --ignore @iris/app
	yarn lerna run build --scope @iris/app --stream

# .PHONY: start
# start:
# 	yarn lerna run start --scope @iris/app --stream

.PHONY: watch
watch:
	# yarn lerna run start --stream --scope @iris/server
	yarn lerna run build --stream --ignore @iris/app
	# FORCE_COLOR=true yarn lerna run start --scope @iris/app --scope @iris/server --stream
	FORCE_COLOR=true yarn lerna run start --parallel --stream


# Add this back to the package.json to get storybook working again...
# installs took wayyy to long so temporary dissabled (30s to 3m)
# "nohoist": [
#   "**"
# ]
.PHONY: storybook
storybook:
	yarn lerna exec "rm -rf node_modules/html-webpack-plugin/node_modules/webpack" --scope @iris/components
	# build the theme and hooks, storybook watches components already
	yarn lerna run build --stream --scope @iris/theme --scope @iris/hooks
	# exec makes progress bar work
	yarn lerna exec "yarn storybook" --scope @iris/components