#Use general node image as builder and install dependencies
FROM node:12 AS build-env
ADD . /webapp
WORKDIR /webapp
RUN npm ci --omit=dev

## Copy application with its dependencies into distroless image
FROM gcr.io/distroless/nodejs
COPY --from=build-env /webapp /webapp
WORKDIR /webapp
CMD ["index.js"]
