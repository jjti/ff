.PHONY: data

projections:
	cd src/data && python3 projection_scrape.py && python3 projection_aggregate.py
	cp ./data/processed/Projections-2019.json ./public/Projections-2019.json