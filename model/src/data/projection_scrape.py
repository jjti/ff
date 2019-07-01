import os
import time

import pandas as pd
import numpy as np
from bs4 import BeautifulSoup, NavigableString
import requests
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


RAW = os.path.join("..", "..", "data", "raw", "projections")
DRIVER = os.path.sep + os.path.join("usr", "local", "bin", "chromedriver")
"""The path to a chrome driver for the scraping of JS apps.
I put my binary in /usr/local/bin
http://chromedriver.chromium.org/
"""


def scrape_espn(url="http://fantasy.espn.com/football/players/projections", out=RAW):
    """Scrape the ESPN projections
    """

    print("scraping ESPN")

    # set this to the p
    driver = webdriver.Chrome(DRIVER)
    driver.get(url)
    time.sleep(5)  # wait for JS app to render

    players = []
    current_button = 1
    while True:
        soup = BeautifulSoup(
            driver.execute_script("return document.body.innerHTML"), "html.parser"
        )

        for player in soup.select("div.full-projection-table"):

            name = player.select(".pointer")[0].get_text()
            pos = player.select(".playerinfo__playerpos")[0].get_text()
            team = player.select(".pro-team-name")[0].get_text()

            table = player.select(".Table2__table")[1]
            headers = [
                e.find("div").get("title")
                for e in table.find("tbody").find_all("tr")[1].find_all("td")
            ][1:]
            headers = [column(h) for h in headers]
            data = [
                e.get_text().lower() for e in table.find("tbody").find_all("tr")[1]
            ][1:]

            p_data = {}
            p_data["name"] = name.strip()
            p_data["pos"] = pos.strip()
            p_data["team"] = team.strip().upper()
            for h, d in zip(headers, data):
                if h in p_data:
                    continue  # oddly there are duplicate columns
                if "/" in d:
                    d = d.split("/")[0]
                if "-" in d:
                    p_data[h] = np.NaN
                else:
                    p_data[h] = float(d)

            players.append(p_data)

        try:
            next_button = driver.find_element_by_link_text(str(current_button + 1))
            actions = ActionChains(driver)
            actions.move_to_element(next_button).perform()
        except Exception as err:
            break

        try:
            current_button += 1
            next_button.send_keys(Keys.ENTER)
            time.sleep(1.0)
        except Exception as err:
            print(err)
            break

    df = pd.DataFrame(players)
    df["fpts"] = df["fantasy_points"]
    df = sort_columns(df)
    df.to_csv(os.path.join(out, "ESPN-Projections-2019.csv"), index=False)

    driver.quit()


def scrape_cbs(url="https://www.cbssports.com/fantasy/football/stats", out=RAW):
    """Scrape the CBS projections site.
    
    Unlike ESPN, there are routes for each position and PPR versus non-PPR.

    Example URL:
    https://www.cbssports.com/fantasy/football/stats/WR/2019/season/projections/nonppr/
    """

    print("scraping CBS")

    driver = webdriver.Chrome(DRIVER)

    for ppr in ["ppr", "nonppr"]:
        players = []
        for pos in ["QB", "RB", "WR", "TE", "DST", "K"]:
            page_url = f"{url}/{pos}/2019/season/projections/{ppr}/"

            driver.get(page_url)

            soup = BeautifulSoup(
                driver.execute_script("return document.body.innerHTML"), "html.parser"
            )

            table_header = soup.find("thead")
            table_header = table_header.find_all("tr")[1]

            headers = [
                h.find("div").get_text() for h in table_header.find_all("th")[1:]
            ]
            headers = [column(h) for h in headers]
            headers = ["name", "pos", "team"] + headers

            table = soup.select(".TableBase-table")[0]
            table_body = table.find("tbody")
            for row in table_body.find_all("tr"):  # for each player
                if isinstance(row, NavigableString):
                    continue
                if not len(row.find_all("td")):
                    continue

                if pos is not "DST":
                    name_cell = row.select(".CellPlayerName--long")[0]

                    name = name_cell.find("a").get_text()
                    pos, team = [
                        v.get_text().strip() for v in name_cell.find_all("span")
                    ]
                    data = [name, pos, team]
                else:
                    team = row.find("td").get_text().strip()
                    data = [team, "DST", team]

                data += [
                    td.get_text().strip().replace("—", "")
                    for td in row.find_all("td")[1:]
                ]

                player_data = {}
                for k, v in zip(headers, data):
                    player_data[k] = v
                    if k == "fantasy_points":
                        k = "fpts"
                    player_data[k] = v
                players.append(player_data)

        df = pd.DataFrame(players)
        df = sort_columns(df)

        filename = os.path.join(out, "CBS-Projections-2019.csv")
        if ppr == "ppr":
            filename = os.path.join(out, "CBS-Projections-PPR-2019.csv")

        df.to_csv(filename, index=False)

    driver.quit()


def scrape_nfl(out=RAW):
    """Scrape the NFL projections site.
    
    Static routes, but the URLs are massive w/ query parameters. Example:
    https://fantasy.nfl.com/research/projections?position=0&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D1%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace
    
    First page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1

    Second page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D6%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace
    
    Last page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D926%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace

    Just going to simluate clicking the next button until there's no next button
    """

    print("scraping NFL")

    driver = webdriver.Chrome(DRIVER)
    page_url = "https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1"
    driver.get(page_url)
    time.sleep(1)

    headers = [
        "Passing_Yds",
        "Passing_TD",
        "Passing_Int",
        "Rushing_Yds",
        "Rushing_TD",
        "Receiving_Rec",
        "Receiving_Yds",
        "Receiving_TD",
        "Ret_TD",
        "FumTD",
        "2PT",
        "Lost",
        "Points",
    ]
    headers = [column(h) for h in headers]
    headers = ["name", "pos", "team"] + headers

    players = []
    while True:
        soup = BeautifulSoup(
            driver.execute_script("return document.body.innerHTML"), "html.parser"
        )
        table = soup.find("tbody")

        for row in table.find_all("tr"):  # for each player
            if isinstance(row, NavigableString):
                continue
            if not len(row.find_all("td")):
                continue

            # get name, position and team
            name_cell = row.find_all("td")[0]
            name = name_cell.select(".playerNameFull")[0].get_text()
            pos_team = name_cell.find("em").get_text()
            pos_team = [v.strip() for v in pos_team.split("-")]
            if len(pos_team) == 1:
                data = [name, "DEF", name]
            else:
                data = [name, pos_team[0], pos_team[1]]

            data += [
                td.get_text().strip().replace("-", "") for td in row.find_all("td")[3:]
            ]

            player_data = {}
            for k, v in zip(headers, data):
                player_data[k] = v
            players.append(player_data)

        # find and click the next button
        try:
            next_button = driver.find_element_by_link_text(">")
            actions = ActionChains(driver)
            actions.move_to_element(next_button).click().perform()
            time.sleep(0.5)
        except Exception as err:
            break

    df = pd.DataFrame(players)
    df["fpts"] = df["points"]
    df = sort_columns(df)

    filename = os.path.join(out, "NFL-Projections-2019.csv")
    df.to_csv(filename, index=False)

    driver.quit()


def column(text):
    """Parse column to common format.
    """

    return text.strip().replace(" ", "_").lower().split("\n")[0].split("/")[0].strip()


def sort_columns(df):
    """Put name, pos, team and pts first
    """

    ordered_cols = ["name", "pos", "team", "fpts"]
    df = df[ordered_cols + [c for c in df.columns if c not in ordered_cols]]
    return df


if __name__ == "__main__":
    # scrape_espn()
    # scrape_cbs()
    scrape_nfl()
