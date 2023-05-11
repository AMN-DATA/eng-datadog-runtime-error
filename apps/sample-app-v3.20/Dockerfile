ARG APP_DIR="sample-app-v3.20"
ARG APP_NAME="sample-app-v3.20"
ARG BUILD_DIR="build"

### Build container
FROM node:16.20.0-alpine as build

ARG APP_DIR
ARG APP_NAME
ARG BUILD_DIR
WORKDIR ${BUILD_DIR}

# Setup yarn and its dependencies
COPY .yarn .yarn
COPY .yarnrc.yml yarn.lock package.json ./

# Build the app including referenced packages
COPY tsconfig.build.json ./
COPY apps/${APP_DIR}/package.json ./apps/${APP_DIR}/

RUN yarn install

COPY apps/${APP_DIR}/ ./apps/${APP_DIR}/
RUN yarn workspace ${APP_NAME} exec "yarn workspaces focus --production"

### Release container
FROM amazon/aws-lambda-nodejs:16.2023.05.05.16 as release

ARG APP_DIR
ARG BUILD_DIR
ARG FUNCTION_DIR="/var/task"

### Setup Datadog tracer
COPY --from=datadog/lambda-extension:latest /opt/extensions/ /opt/extensions

RUN mkdir -p ${FUNCTION_DIR}

COPY --from=build ${BUILD_DIR}/apps/${APP_DIR}/dist ${FUNCTION_DIR}
COPY --from=build ${BUILD_DIR}/node_modules ${FUNCTION_DIR}/node_modules

ENV DD_LAMBDA_HANDLER=index.myHanlder

RUN rm node_modules/datadog-lambda-js/dist/handler.js
CMD ["node_modules/datadog-lambda-js/dist/handler.handler"]
