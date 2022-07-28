include .env
export

projections:
	python3 -m pip install -r ./src/requirements.txt && \
		python3 ./src/data/projection_scrape.py && \
		python3 ./src/data/projection_aggregate.py && \
		python3 ./src/data/projection_upload.py

container:
	docker build -t ff .
	docker tag ff ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/ff
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com
	docker push ${AWS_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/ff

notebook:
	cd model/src/notebooks && jupyter notebook

