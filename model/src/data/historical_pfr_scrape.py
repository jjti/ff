"""Scrape historical player performance from Pro Football Reference.

For gathering the results of each season.

https://www.pro-football-reference.com
"""

import os

from bs4 import BeautifulSoup
import requests
import pandas as pd
import numpy as np


DIR_PATH = os.path.dirname(os.path.realpath(__file__))


def scrape_pro_ref(start=1997, end=2018):
    """Scrape every year thru N, saving the players year-end performance as output
    """

    output = os.path.join(
        DIR_PATH, "..", "..", "data", "raw", "pro_football_reference.csv"
    )
    columns = []
    data = []

    for year in range(start, end + 1):
        r = requests.get(
            f"https://www.pro-football-reference.com/years/{year}/fantasy.htm"
        )

        soup = BeautifulSoup(r.content, "lxml")
        table = soup.select("#fantasy")[0]
        rows = table.findAll(lambda tag: tag.name == "tr")[2:]  # first two are columns

        if not columns:
            columns = [td["data-stat"] for td in rows[0].findAll("td")] + ["year"]

        for row in rows:
            if len(row.findAll("td")) < 2:
                continue  # random header row
            data.append([fix_data(td.get_text()) for td in row.findAll("td")] + [year])

    df = pd.DataFrame(data, columns=columns)
    df.to_csv(output)


def fix_data(data):
    return data.replace("*", "").replace("+", "")


if __name__ == "__main__":
    scrape_pro_ref()

