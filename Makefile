.PHONY: data app

# to get secrets for local dev:
# eval `cat ./data/.env | op inject`

data: 
	python3 -m pip install -r ./data/requirements.txt && python3 ./data/main.py

app:
	cd app && ./release.sh
