#Load libraries
library(plyr)
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

# qb
# http://fantasy.nfl.com/research/projections?offset=1&position=1&sort=projectedPts&statCategory=projectedStats&statSeason=2018&statType=seasonProjectedStats&statWeek=1
#

base.url <- "http://fantasy.nfl.com/research/projections?sort=projectedPts&statCategory=projectedStats&statSeason=2018&statType=seasonProjectedStats&statWeek=1"
pages.by.pos <- list(
  list(
    pos = "QB",
    position = 1,
    page_count = 3
  ),
  list(
    pos = "RB",
    position = 2,
    page_count = 6
  ),
  list(
    pos = "WR",
    position = 3,
    page_count = 9
  ),
  list(
    pos = "TE",
    position = 4,
    page_count = 5
  )
)


nfl.page.data <- read_html("http://fantasy.nfl.com/research/projections?offset=1&position=1&sort=projectedPts&statCategory=projectedStats&statSeason=2018&statType=seasonProjectedStats&statWeek=1") %>%
  html_node(".tableType-player") %>%
  html_table(fill = TRUE)


nfl.data <- data.frame()
for (pos.data in pages.by.pos) {
  offsets <- (1 + 25 * seq(from = 0, to = pos.data$page_count))
  for (offset in offsets) {
    page.url <- paste0(base.url, "&offset=", offset, "&position=", pos.data$position)

    nfl.page.data <- read_html(page.url) %>%
      html_node(".tableType-player") %>%
      html_table(fill = TRUE)

    colnames(nfl.page.data) <- tolower(colnames(nfl.page.data))
    nfl.page.data <- nfl.page.data[2:nrow(nfl.page.data),] # get rid of header row
    nfl.page.data$name <- nfl.page.data[,1]

    nfl.page.data$nfl.2018 <- as.numeric(as.character(nfl.page.data$fantasy))
    nfl.page.data$pos <- pos.data$pos

    for (i in 1:nrow(nfl.page.data)) {
      nfl.name <- as.character(nfl.page.data[i, "name"])
      # if (!is.character(nfl.name)) next
      nfl.name.split <- strsplit(nfl.name, " ")
      nfl.name.split <- nfl.name.split[[1]]

      nfl.page.data[i,"name"] <- paste0(nfl.name.split[1], " ", nfl.name.split[2])
    }

    nfl.data <- rbind.fill(nfl.data, nfl.page.data[, c("name", "pos", "nfl.2018")])
  }
}

nfl.data <- nfl.data[, c("name", "pos", "nfl.2018")]
save(nfl.data, file = paste0("nfl.Rda"))
