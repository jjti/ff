include ../model/.env
export

app:
	npm run build && \
	aws s3 sync ./build s3://${S3_BUCKET} --exclude "projections.json" --acl public-read --sse --delete --cache-control max-age=3600,public --profile personal && \
	aws cloudfront create-invalidation --distribution-id ${CF} --paths "/*" --profile personal
