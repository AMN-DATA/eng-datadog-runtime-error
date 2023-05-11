# Datadog Runtime Error reproduction 

_This repository contains the reproduction case of recurring issue of [`dd-trace@^2.27`](https://github.com/DataDog/dd-trace-js) library wrapping all the erros in Runtime exceptions._ 

## Project structure 

There are two minimal sample applications in the `apps` folder: 

* [sample-app-v2.24](./apps/sample-app-v2.24) - it contains a dockerized AWS Lambda function with installed `dd-trace` library in version `2.24.0`; this example works properly 
* [sample-app-v3.20](./apps/sample-app-v2.24) - it contains a dockerized AWS Lambda function with installed `dd-trace` library in (the latest at the moment [10.05.2023]) version `3.20.0`; this example wraps all the errors in the `Runtime.UnhandledPromiseRejection` 

Both sample apps contain the same code with the only difference being the `dd-trace` package version. 

The sample lambda function only throws the error upon being called. 


## Steps to reproduce 

First build the apps by running: 

```sh
$ yarn install
$ yarn build:all
``` 

You can use `docker-compose.yml` file to build and run both apps: 

```sh
$ docker-compose build
$ docker-compose up
``` 

Or build with docker separately: 

```sh
$ docker build -f apps/sample-app-v2.24/Dockerfile . -t sample-app-v2.24
$ docker build -f apps/sample-app-v3.20/Dockerfile . -t sample-app-v3.20
```

And then run:

```sh
$ docker run -p 9224:8080 sample-app-v2.24
$ docker run -p 9320:8080 sample-app-v3.20
```

Call the first sample app (runs on local port `9224`), which has `dd-trace@v2.24.0` installed: 

```sh
$ curl -XPOST "http://localhost:9224/2015-03-31/functions/function/invocations" -d '{}'                 
{"errorType":"CustomError","errorMessage":"my error","trace":["CustomError: my error","    at myHanlder (/var/task/sample-handler.js:11:11)","    at /var/task/node_modules/datadog-lambda-js/dist/utils/handler.js:166:25","    at /var/task/node_modules/datadog-lambda-js/dist/index.js:220:70","    at step (/var/task/node_modules/datadog-lambda-js/dist/index.js:44:23)","    at Object.next (/var/task/node_modules/datadog-lambda-js/dist/index.js:25:53)","    at /var/task/node_modules/datadog-lambda-js/dist/index.js:19:71","    at new Promise (<anonymous>)","    at __awaiter (/var/task/node_modules/datadog-lambda-js/dist/index.js:15:12)","    at traceListenerOnWrap (/var/task/node_modules/datadog-lambda-js/dist/index.js:197:36)","    at /var/task/node_modules/dd-trace/packages/dd-trace/src/tracer.js:102:56"]}% 
``` 

Note that the response has the `errorType` of `CustomError`. 

Then make a request to the second sample app (runs on local port `9320`), which has `dd-trace@v3.20.0` installed: 

```sh
$ curl -XPOST "http://localhost:9320/2015-03-31/functions/function/invocations" -d '{}'  
{"errorType":"Runtime.UnhandledPromiseRejection","errorMessage":"CustomError: my error","trace":["Runtime.UnhandledPromiseRejection: CustomError: my error","    at process.<anonymous> (file:///var/runtime/index.mjs:1189:17)","    at process.emit (node:events:513:28)","    at emit (node:internal/process/promises:140:20)","    at processPromiseRejections (node:internal/process/promises:274:27)","    at processTicksAndRejections (node:internal/process/task_queues:97:32)"]}%  
```  

Note that the response has the `errorType` of `Runtime.UnhandledPromiseRejection` instead of `CustomError`. 