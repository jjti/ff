include ../model/.env
export

deploy:
	cd app && \
	npm run build && \
	aws s3 sync ./build ${S3_BUCKET} --acl public-read --sse --delete --cache-control max-age=10800,public --profile personal && \
	aws cloudfront create-invalidation --distribution-id ${CF} --paths "/*" --profile personal
