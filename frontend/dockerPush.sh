#!/bin/bash
tag=$(cat package.json | jq .version | sed -e 's/^"//' -e 's/"$//')
docker tag binaryfissiongames/your-broadcasting-suite-client "binaryfissiongames/your-broadcasting-suite-client:$tag"
docker tag binaryfissiongames/your-broadcasting-suite-client binaryfissiongames/your-broadcasting-suite-client:latest
docker push "binaryfissiongames/your-broadcasting-suite-client:$tag"
docker push binaryfissiongames/your-broadcasting-suite-client:latest