"""Debug harness: run individual scrapers without S3 upload.

Usage: python debug_scrape.py [espn|cbs|nfl|adp|aggregate]
"""

import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "all"

    if target == "aggregate":
        import aggregate
        aggregate.aggregate()
        return

    import scrape

    fns = {
        "espn": scrape.scrape_espn,
        "cbs": scrape.scrape_cbs,
        "nfl": scrape.scrape_nfl,
        "adp": scrape.scrape_adp,
    }

    try:
        if target == "all":
            for name, fn in fns.items():
                logging.info("=== running %s ===", name)
                fn()
        else:
            fns[target]()
    finally:
        scrape.DRIVER.quit()


if __name__ == "__main__":
    main()
