#Load libraries
library("plyr")
library("data.table")
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

#Download fantasy football projections from ESPN.com
espn_base_url <- "http://games.espn.com/ffl/tools/projections"
espn_pos <- list(QB=0, RB=2, WR=4, TE=6, K=17, DST=16)
espn_pages <- as.character(seq(from = 0, to = 560, by = 40))
espn_urls <- lapply(espn_pages, function(x) paste0(espn_base_url, "?startIndex=", x))

#Scrape
espn.data <- data.frame()
for (espn.page in espn_urls) {
  espn.this.data <- read_html(espn.page) %>%
    html_node(".playerTableTable") %>%
    html_table()

  espn.this.data <- espn.this.data[espn.this.data$PLAYERS != "RNK", ] # bs rows
  espn.this.data <- espn.this.data[,c(2, 13)]
  colnames(espn.this.data) <- tolower(colnames(espn.this.data))
  espn.this.data$espn.2018 <- espn.this.data$total

  espn.this.data$name <- NA
  espn.this.data$pos <- NA
  for (i in 1:nrow(espn.this.data)) {
    espn.row <- espn.this.data[i,]

    name.and.pos <- strsplit(espn.row$players, ",")[[1]]
    name.split <- strsplit(name.and.pos[1], "\\s+")[[1]]

    if (length(name.and.pos) > 1) {
      n <- name.and.pos[[2]]
      pos.split <- strsplit(name.and.pos[[2]], "\\s+")[[1]]

      espn.this.data[i, "name"] <- paste0(name.split[1], " ", name.split[2])
      espn.this.data[i, "pos"] <- pos.split[[2]]
    }
  }

  espn.data <- rbind.fill(espn.data, espn.this.data)
}

espn.data <- espn.data[, c("name", "pos", "espn.2018")]
espn.data <- espn.data[complete.cases(espn.data),]
save(espn.data, file = paste0("espn.Rda"))

