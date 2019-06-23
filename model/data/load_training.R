
###
# Add Basic player stats
###

library(plm)
library(plyr)

setwd("~/Documents/GitHub/ff/analysis")
load("~/Documents/GitHub/ff/data/player_data.Rda")

player.data$year <- as.integer(player.data$year)

# only years that I have all source of data for
years <- as.integer(2012:2014)
player.data <- player.data[player.data$year %in% years,]


###
# Add Madden Information
###

library(readxl)

dir <- "/Users/jtimmons/Documents/GitHub/ff/data/madden"
all.madden.data <- data.frame()
for (year in years) {
  madden.path <- paste0(dir, "/madden_nfl_", year, ".xlsx")
  madden.data <- read_excel(madden.path, sheet = 1)

  colnames(madden.data) <- lapply(tolower(colnames(madden.data)), function(x) gsub(" ", "_", x))
  if (year %in% c(2013, 2014)) {
    madden.data$name <- with(madden.data, paste0(first_name, " ", last_name))
  }
  madden.data$year <- as.integer(rep(year, nrow(madden.data)))
  madden.data$pos <- madden.data$position
  madden.data$pos <- sapply(madden.data$pos, function(x) gsub("HB", "RB", x))
  madden.data$pos <- sapply(madden.data$pos, function(x) gsub("FB", "RB", x))

  all.madden.data <- rbind.fill(all.madden.data, madden.data)
}

# merge it in
player.data <- merge(player.data, all.madden.data, by = c("name", "year"), all.x = TRUE)


###
# Add Expert Information
###

dir <- "/Users/jtimmons/Documents/GitHub/ff/data/historical"
setwd(dir)

sources <- list(
  list(
    source = "CBS",
    name = "name",
    pts = "pts_cbs",
    years = c(2012, 2013)
  ),
  list(
    source = "CBS",
    name = "name_cbs",
    pts = "pts_cbs",
    years = c(2014)
  ),
  list(
    source = "FOX",
    name = "name_fox",
    pts = "pts_fox",
    years = c(2014)
  ),
    list(
    source = "ESPN",
    name = "name",
    pts = "pts_espn",
    years = c(2012, 2013)
  ),
  list(
    source = "ESPN",
    name = "name_espn",
    pts = "pts_espn",
    years = c(2014)
  ),
  list(
    source = "NFL",
    name = "name",
    pts = "pts_nfl",
    years = c(2012, 2013)
  ),
  list(
    source = "NFL",
    name = "name_nfl",
    pts = "pts_nfl",
    years = c(2014)
  ),
  list(
    source = "Yahoo",
    name = "name_yahoo",
    pts = "pts_yahoo",
    years = c(2014)
  )
)

year.names <- c()
for (src in sources) {
  for (year in src$years) {
    if (!(year %in% years)) next

    hist.data.path <- paste0(dir, "/", src$source, "-Projections-", year, ".RData")
    d <- load(hist.data.path)
    fr <- get(d)
    fr <- fr[!duplicated(fr[src$name]),]

    # create the column
    col.name <- paste0(tolower(src$source), ".", year)
    year.names <- c(year.names, col.name)
    player.data[, col.name] <- NA

    # get names and points out of the data frame
    source.data <- data.frame(name = fr[, src$name], year = rep(year, nrow(fr)))
    source.data[col.name] <- fr[, paste0("pts_", tolower(src$source))]

    # add the point values in player.data
    source.data$year <- as.integer(rep(year, nrow(source.data)))
    player.data <- merge(player.data, source.data, by = c("name", "year"), all.x = TRUE)
    player.data[col.name] <- player.data[, paste0(col.name, ".y")]
    player.data[paste0(col.name, ".x")] <- NULL
    player.data[paste0(col.name, ".y")] <- NULL
  }
}

# set experts as the average of all sources for a given year
player.data$experts <- apply(player.data[, year.names], 1, function(x) mean(x, na.rm = TRUE))

# must not be na
player.data <- player.data[!is.na(player.data$name),]

# limit to some of the columns
colnames(player.data)
player.data <- player.data[, c("name", "year", "team", "pos", "overall", "experts", "fantpt")]
player.data$name <- as.character(player.data$name)
player.data$pos <- as.factor(player.data$pos)
player.data$overall <- as.integer(player.data$overall)

# split up by position
player.data <- split(player.data, player.data$pos)

# general data cleaning
for (i in 1:length(player.data)) {
  position.data <- player.data[[i]]

  if (ncol(position.data) < 1) next

  # replace NA values with the median for that column
  for (c in 1:ncol(position.data)){
    if (is.numeric(position.data[,c])) {
      position.data[is.na(position.data[,c]), c] <- 0
    }
  }

  # remove duplicates
  print(nrow(position.data[!duplicated(position.data[c("year", "name")]),]))
  player.data[[i]] <- position.data[!duplicated(position.data[c("year", "name")]),]
}

qb.data <- player.data[["QB"]]
rb.data <- player.data[["RB"]]
wr.data <- player.data[["WR"]]
te.data <- player.data[["TE"]]

## Top 3 Quartiles only
qb.data <- qb.data[qb.data$experts > 30 & qb.data$overall > 65,]
rb.data <- rb.data[rb.data$experts > 10 & rb.data$overall > 55,]
wr.data <- wr.data[wr.data$experts > 20 & wr.data$overall > 65,]
te.data <- te.data[te.data$experts > 30 & te.data$overall > 65,]

nrow(qb.data)
