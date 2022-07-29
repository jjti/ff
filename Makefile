include .env
export

.PHONY: data app

data:
	python3 -m pip install -r ./data/requirements.txt && python3 ./data/main.py

app:
	cd app & release.sh
