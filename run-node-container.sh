#! /bin/bash
docker run -it --rm \
   -v /home/user/auth0-webtask/:/root/ \
   --name auth0-webtask \
   node:8.1.3-alpine \
   /bin/sh
