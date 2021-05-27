############################
# Stage 1
############################
FROM node:15.0.1-slim as builder

# Build the UI
COPY yarn.lock package.json lerna.json tsconfig.base.json ./
COPY iris ./iris/
COPY packages ./packages/
RUN yarn install && yarn lerna bootstrap && yarn lerna run build

############################
# Stage 2
############################
FROM node:15.0.1-slim

EXPOSE 8080
ENV PORT 8080
ENV SPA_ROOT=/iris/client

WORKDIR /iris

# Install packages
COPY --from=builder package.json yarn.lock lerna.json ./
# Must use the folder name `iris` otherwise lerna won't find it.
COPY --from=builder iris/package.json ./iris/
RUN yarn install && yarn lerna bootstrap

# Copy in source files
COPY --from=builder packages/iris-app/build ./client/
COPY --from=builder iris/dist ./iris/dist/

WORKDIR /projects

ENTRYPOINT [ "node" ]
CMD [ "/iris/iris/dist/index.js" ]