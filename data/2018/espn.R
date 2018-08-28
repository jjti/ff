library("plyr")
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

#Download fantasy football projections from ESPN.com
espn_base_url <- "http://games.espn.com/ffl/tools/projections"
espn_pages <- as.character(seq(from = 0, to = 560, by = 40))
espn_urls <- lapply(espn_pages, function(x) paste0(espn_base_url, "?startIndex=", x))

#Scrape
espn.page <- "http://games.espn.com/ffl/tools/projections?startIndex=0"
espn.data <- data.frame()
for (espn.page in espn_urls) {
  espn.page.data <- read_html(espn.page)
  espn.this.data <- espn.page.data %>%
    html_node(".playerTableTable") %>%
    html_table()

  espn.popups <- espn.page.data %>%
    html_nodes("a.flexpop") %>%
    html_attrs()
  espn.popups <- data.frame(espn.popups)
  espn.popups <- t(espn.popups)
  espn.popups <- espn.popups[!duplicated(espn.popups[,"playerid"]),]

  espn.this.data <- espn.this.data[espn.this.data$PLAYERS != "RNK", ] # bs rows
  espn.this.data <- espn.this.data[,c(2, 13)]
  colnames(espn.this.data) <- tolower(colnames(espn.this.data))
  espn.this.data$espn.2018 <- espn.this.data$total

  espn.this.data$name <- NA
  espn.this.data$pos <- NA
  espn.this.data$espn.id <- NA
  for (i in 1:nrow(espn.this.data)) {
    espn.row <- espn.this.data[i,]

    name.and.pos <- strsplit(espn.row$players, ",")[[1]]
    name.split <- strsplit(name.and.pos[1], "\\s+")[[1]]

    if (length(name.and.pos) > 1) {
      # it's a player
      n <- name.and.pos[[2]]
      pos.split <- strsplit(name.and.pos[[2]], "\\s+")[[1]]
      espn.this.data[i, "name"] <- paste0(name.split[1], " ", name.split[2])
      espn.this.data[i, "pos"] <- pos.split[[3]]

      # getting image urls from player-ids
      # ex url: http://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/15825.png&w=200&h=145
      espn.this.data[i, "img.url"] <- paste0("http://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/", espn.popups[i, "playerid"], ".png")
    } else {
      # it's a DST
      name.and.pos <- strsplit(name.and.pos[[1]], "\\s+")[[1]]
      espn.this.data[i, "name"] <- name.and.pos[[1]]
      espn.this.data[i, "pos"] <- "DST"
      espn.this.data[i, "playerid"] <- "" # TODO: add support for team names, make a map from name to city abbreviation
    }
  }

  espn.data <- rbind.fill(espn.data, espn.this.data)
}

espn.data <- espn.data[, c("name", "pos", "espn.2018", "img.url")]
espn.data <- espn.data[complete.cases(espn.data),]
save(espn.data, file = paste0("espn.Rda"))

