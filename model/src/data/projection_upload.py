import datetime
import os
import traceback

import boto3


YEAR = datetime.datetime.now().year
PROJECTIONS = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "data",
    "processed",
    f"Projections-{YEAR}.json",
)

# uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from env variables
s3 = boto3.client("s3")


def run():
    print("uploading ", PROJECTIONS)

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
        print("failed to upload projections")
        traceback.print_exc()
        raise


if __name__ == "__main__":
    run()
