include .env
export

container:
	docker build -t ff .
	docker tag ff ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/ff
	docker push ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/ff

projections:
	AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} S3_BUCKET=${S3_BUCKET} \
		python3 ./src/data/projection_scrape.py && \
		python3 ./src/data/projection_aggregate.py && \
		python3 ./src/data/projection_upload.py

notebook:
	cd model/src/notebooks && jupyter notebook

