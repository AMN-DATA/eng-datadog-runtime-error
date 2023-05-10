ARG BUILD_DIR="build"

### Build container
FROM node:16.20.0-alpine as build

ARG BUILD_DIR
WORKDIR ${BUILD_DIR}

COPY . ./

RUN yarn install
RUN yarn build

### Release container
FROM amazon/aws-lambda-nodejs:16.2023.05.05.16 as release

ARG BUILD_DIR
ARG FUNCTION_DIR="/var/task"

### Setup Datadog tracer
COPY --from=datadog/lambda-extension:latest /opt/extensions/ /opt/extensions

RUN mkdir -p ${FUNCTION_DIR}

COPY --from=build ${BUILD_DIR}/dist ${FUNCTION_DIR}
COPY --from=build ${BUILD_DIR}/node_modules ${FUNCTION_DIR}/node_modules

ENV DD_LAMBDA_HANDLER=index.myHanlder

RUN rm node_modules/datadog-lambda-js/dist/handler.js
CMD ["node_modules/datadog-lambda-js/dist/handler.handler"]