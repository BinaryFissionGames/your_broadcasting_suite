#!/bin/bash
tag=$(cat package.json | jq .version | sed -e 's/^"//' -e 's/"$//')
docker tag binaryfissiongames/your-broadcasting-suite "binaryfissiongames/your-broadcasting-suite:$tag"
docker tag binaryfissiongames/your-broadcasting-suite binaryfissiongames/your-broadcasting-suite:latest
docker push "binaryfissiongames/your-broadcasting-suite:$tag"
docker push binaryfissiongames/your-broadcasting-suite:latest