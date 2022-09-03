#!/usr/bin/env bash

set -e

export AWS_EC2_METADATA_DISABLED=true

rm -rf ./out
npm i
npm run build
aws s3 sync ./out "s3://${S3_BUCKET}" --exclude "projections.json" --acl public-read --sse --delete --cache-control max-age=10800,public
aws cloudfront create-invalidation --distribution-id "${CF_DISTRIBUTION}" --paths "/*"
