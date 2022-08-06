import logging
import os

import aggregate
import scrape
import upload

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")


def run():
    if not os.environ["S3_BUCKET"] or not os.environ["AWS_ACCESS_KEY_ID"]:
        logging.fatal("missing env vars")
        raise RuntimeError("missing env vars")

    try:
        scrape.scrape()
        aggregate.aggregate()
        upload.upload()
    except:
        logging.exception("failed to update data")
        raise


if __name__ == "__main__":
    run()
