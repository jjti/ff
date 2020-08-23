import boto3
import datetime
import os
import logging
import uuid

from .data.projection_scrape import scrape
from .data.projection_aggregate import aggregate, AGGREGATE_JSON

YEAR = datetime.datetime.now().year

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from env variables
s3 = boto3.client("s3")


def lambda_handler(event, context):
    logger.info("## ENVIRONMENT VARIABLES")
    logger.info(os.environ)

    try:
        scrape()
    except:
        logging.exception("Failed to scrape player projections")

    try:
        aggregate()
    except:
        logging.exception("Failed to aggregate player projections")

    try:
        s3.upload_file(
            AGGREGATE_JSON,
            os.environ["S3_BUCKET"],
            "projections.json",
            ExtraArgs={"ACL": "public-read", "CacheControl": "max-age=10800,public"},
        )
        s3.upload_file(
            AGGREGATE_JSON,
            os.environ["S3_BUCKET"],
            f"history/f{datetime.datetime.now().strftime('%m/%d/%Y %H:%M:%S')}",
        )
    except:
        logging.exception("Failed to upload projections to S3")

