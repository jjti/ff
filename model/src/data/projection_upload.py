import datetime
import logging
import os

import boto3

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")

YEAR = datetime.datetime.now().year
PROJECTIONS = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "data",
    "processed",
    f"Projections-{YEAR}.json",
)


# uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from .env
s3 = boto3.client("s3")

logging.info(
    "uploading to S3: projections=%s bucket=%s",
    PROJECTIONS,
    os.environ["S3_BUCKET"],
)

try:
    s3.upload_file(
        PROJECTIONS,
        os.environ["S3_BUCKET"],
        "projections.json",
        ExtraArgs={"ACL": "public-read", "CacheControl": "max-age=7200,public"},
    )
    s3.upload_file(
        PROJECTIONS,
        os.environ["S3_BUCKET"],
        f"history/f{datetime.datetime.now().strftime('%m:%d:%Y %H:%M:%S')}",
    )
except:
    logging.exception("failed to upload")
    raise
