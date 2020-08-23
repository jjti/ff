include .env
export

YEAR=2020

.PHONY: data app

app: copy-projections
	cd app && npm run start

deploy:
	cd app && \
	npm run build && \
	aws s3 sync ./build ${S3_BUCKET} --acl public-read --sse --delete --cache-control max-age=10800,public --profile personal && \
	aws cloudfront create-invalidation --distribution-id ${CF} --paths "/*" --profile personal

scrape:
	cd ./model/src/data && \
	python3 projection_scrape.py && \
	python3 projection_aggregate.py

copy-projections:
	cp ./model/data/processed/Projections-${YEAR}.json ./app/public/projections.json

projections: scrape
	aws s3 cp ./model/data/processed/Projections-${YEAR}.json ${S3_BUCKET}/projections.json --acl public-read --sse --cache-control max-age=10800,public

projections-local: scrape
	aws s3 cp ./model/data/processed/Projections-${YEAR}.json ${S3_BUCKET}/projections.json --acl public-read --sse --cache-control max-age=10800,public --profile personal
	$(MAKE) copy-projections

ssh:
	ssh -i ${EC2_PEM} ${EC2}

deploy-server:
	rsync -v --stats --progress -e "ssh -i ${EC2_PEM}" --exclude 'app' --exclude '.git' -a . ${EC2}:~

start-server:
	nohup watch -n 10800 make projections &

notebook:
	cd model/src/notebooks && jupyter notebook

