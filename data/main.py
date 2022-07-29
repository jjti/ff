import logging

import aggregate
import scrape
import upload

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")


def run():
    scrape.scrape()
    aggregate.aggregate()
    upload.upload()


if __name__ == "__main__":
    run()
