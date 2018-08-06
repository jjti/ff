
###
# Add Basic player stats
###

library(plm)
library(plyr)
library(readxl)

setwd("~/Documents/GitHub/ff/data")

###
# Add Madden Information
###

player.data <- read_excel("/Users/jtimmons/Documents/GitHub/ff/data/madden/madden_nfl_2018.xlsx", sheet = 1)

colnames(player.data) <- lapply(tolower(colnames(player.data)), function(x) gsub(" ", "_", x))
player.data$pos <- player.data$position
player.data$pos <- sapply(player.data$pos, function (x) gsub("HB|FB", "RB", x))

###
# Add Expert Information
###

for (src in list(espn.data, cbs.data, nfl.data, fox.data)) {
  # add the point values in player.data
  src$name <- sapply(src$name, function (x) gsub("^\\s+|\\s+$", "", x))
  player.data <- merge(player.data, src, by = c("name", "pos"), all = TRUE)
}

# set experts as the average of all sources for a given year
src.names <- c("espn.2018", "cbs.2018", "nfl.2018", "fox.2018")
for (s in src.names) {
  player.data[,s] <- as.numeric(as.character(player.data[,s]))
  player.data[,s] <- sapply(player.data[,s], function(x) ifelse(x < 10, NA, x))
}
player.data$experts <- apply(player.data[, src.names], 1, mean, na.rm = TRUE) # took WAY too long to figure out

# must have a Madden score and an expert score in top three quartiles
player.data <- player.data[player.data$experts > 10 & player.data$overall > 40,]

# replace NA values with zeroes
for (c in 1:ncol(player.data)){
  if (is.numeric(player.data[,c])) {
    player.data[is.na(player.data[,c]), c] <- 0
  }
}

player.data <- player.data[complete.cases(player.data),]

qb.data <- player.data[player.data$position == "QB",]
rb.data <- player.data[player.data$position == "RB",]
wr.data <- player.data[player.data$position == "WR",]
tw.data <- player.data[player.data$position == "TE",]
