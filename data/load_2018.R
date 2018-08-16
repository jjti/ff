library(plm)
library(plyr)
library(readxl)
library(dplyr)

setwd("~/Documents/GitHub/ff/data")

###
# Add Expert Information
###
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/cbs.Rda")
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/nfl.Rda")
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/espn.Rda")
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/fox.Rda")
player.data <- NULL
for (src in list(espn.data, cbs.data, nfl.data, fox.data)) {
  # add the point values in player.data
  src$name <- sapply(src$name, function(x) gsub("^\\s+|\\s+$", "", x))
  if (!is.null(player.data)) {
    player.data <- merge(player.data, src, by = c("name", "pos"), all = TRUE)
  } else {
    player.data <- src
  }
}

# set experts as the average of all sources for a given year
src.names <- c("fox.2018", "espn.2018", "cbs.2018", "nfl.2018")
for (s in src.names) {
  player.data[,s] <- as.numeric(as.character(player.data[,s]))
  player.data[,s] <- sapply(player.data[,s], function(x) ifelse(x < 10, NA, x))
}
player.data$experts <- apply(player.data[, src.names], 1, mean, na.rm = TRUE) # took WAY too long to figure out

# need to be set before Madden wipes them out
dst.data <- player.data[player.data$pos == "DST",]

###
# Add Madden Information
###
madden.data <- read_excel("/Users/jtimmons/Documents/GitHub/ff/data/madden/madden_nfl_2018.xlsx", sheet = 1)

colnames(madden.data) <- lapply(tolower(colnames(madden.data)), function(x) gsub(" ", "_", x))
madden.data$pos <- madden.data$position
madden.data$pos <- sapply(madden.data$pos, function(x) gsub("HB", "RB", x))
madden.data$pos <- sapply(madden.data$pos, function(x) gsub("FB", "RB", x))
madden.data$name <- sapply(madden.data$name, function(x) {
  split.name <- strsplit(x, "\\s+")[[1]]
  paste0(split.name[1], " ", split.name[2])
})

player.data <- merge(player.data, madden.data, by = c("name", "pos"))

# must have a Madden score and an expert score in top three quartiles
player.data <- player.data[player.data$experts > 10 & player.data$overall > 40,]

# replace NA values with zeroes
for (c in 1:ncol(player.data)){
  if (is.numeric(player.data[,c])) {
    player.data[is.na(player.data[,c]), c] <- 0
  }
}

# player.data <- player.data[complete.cases(player.data),]
player.data <- player.data[player.data$experts > 3,]

qb.data <- player.data[player.data$pos == "QB",]
rb.data <- player.data[player.data$pos == "RB",]
wr.data <- player.data[player.data$pos == "WR",]
te.data <- player.data[player.data$pos == "TE",]
k.data <- player.data[player.data$pos == "K",]

## Top 3 Quartiles only
qb.data <- qb.data[qb.data$experts > 30 & qb.data$overall > 70,]
rb.data <- rb.data[rb.data$experts > 20 & rb.data$overall > 67,]
wr.data <- wr.data[wr.data$experts > 20 & wr.data$overall > 64,]
te.data <- te.data[te.data$experts > 20 & te.data$overall > 68,]

## Get players ADP and position
by.adp <- player.data[order(player.data$adp, decreasing = TRUE), ]
by.adp <- by.adp[by.adp$adp > 0,]
by.adp <- by.adp[, c("name", "pos", "adp")]
by.adp <- by.adp[by.adp$adp <= 100,]
by.adp %>%
  group_by(pos) %>%
  summarise(no_rows = length(pos))


