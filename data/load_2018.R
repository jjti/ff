library(plm)
library(plyr)
library(readxl)
library(dplyr)

###
# Rescrape everything
###
if (FALSE) {
  sources <- c("cbs", "espn", "fox", "nfl", "fantasyfootballcalculator")
  for (source in sources) {
    setwd("~/Documents/GitHub/ff/data")
    source(paste0("2018/", source, ".R"))
  }
}


###
# Add Expert Information
###
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/cbs.Rda")
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/nfl.Rda")
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/espn.Rda")
load("/Users/jtimmons/Documents/GitHub/ff/data/2018/fox.Rda")
player.data <- NULL
for (src in list(espn.data, cbs.data, nfl.data, fox.data, adp.bye.data)) {
  # add the point values in player.data
  src$name <- sapply(src$name, function(x) gsub("^\\s+|\\s+$", "", x))
  src$name <- sapply(src$name, function(x) gsub("[.']", "", x))
  if (!is.null(player.data)) {
    player.data <- merge(player.data, src, by = c("name", "pos"), all = TRUE)
  } else {
    player.data <- src
  }
}

# set prediction as the average of all sources for a given year
src.names <- c("fox.2018", "espn.2018", "cbs.2018", "nfl.2018")
for (s in src.names) {
  player.data[,s] <- as.numeric(as.character(player.data[,s]))
  player.data[,s] <- sapply(player.data[,s], function(x) ifelse(x < 10, NA, x))
}
player.data$prediction <- apply(player.data[, src.names], 1, mean, na.rm = TRUE) # took WAY too long to figure out


###
# Set DST data as the nfl.R prediction, get bye week info from fantasyfootballcalculator
###
dst.data <- adp.bye.data[adp.bye.data$pos == "DST",] # use ffc's names for dsts
dst.fix <- function (x) {
  name.split <- str_split(x, " ")[[1]]
  paste(name.split[-length(name.split)], collapse = " ")
}
dst.data$name <- lapply(dst.data$name, dst.fix)
dst.data$prediction <- rep(0, nrow(dst.data))

# try and figure out expert predictions from nfl.data
nfl.dst.data <- nfl.data[nfl.data$pos == "DST",]
nfl.dst.data$name <- sub("DEF.*", "", nfl.dst.data$name)
nfl.dst.data$name <- sub("Los Angeles", "LA", nfl.dst.data$name)
nfl.dst.data$name <- lapply(nfl.dst.data$name, dst.fix)
nfl.dst.data$name <- lapply(nfl.dst.data$name, dst.fix)
for (row.index in 1:nrow(nfl.dst.data)) {
  team <- nfl.dst.data[row.index,]
  for (match in which(dst.data$name %like% team$name)) {
    dst.data[match, "prediction"] <- team["nfl.2018"]
  }
}


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
  name <- paste0(split.name[1], " ", split.name[2])
  name <- gsub("^\\s+|\\s+$", "", name)
  gsub("[.']", "", name)
})
player.data <- merge(player.data, madden.data, by = c("name", "pos"))


###
# Post-processing
###
# must have a Madden score and an expert score in top three quartiles
player.data <- player.data[player.data$prediction > 10 & player.data$overall > 40,]

# replace NA values with zeroes
for (c in 1:ncol(player.data)){
  if (is.numeric(player.data[,c])) {
    player.data[is.na(player.data[,c]), c] <- 0
  }
}

qb.data <- player.data[player.data$pos == "QB",]
rb.data <- player.data[player.data$pos == "RB",]
wr.data <- player.data[player.data$pos == "WR",]
te.data <- player.data[player.data$pos == "TE",]
k.data <- player.data[player.data$pos == "K",]
