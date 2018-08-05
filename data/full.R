
###
# Add Basic player stats
###

library(plm)
library(plyr)

setwd("~/Documents/GitHub/ff/analysis")
load("~/Documents/GitHub/ff/data/player_data.Rda")

player.data$year <- as.integer(player.data$year)

# only years that I have all source of data for
years <- as.integer(2013:2014)
player.data <- player.data[player.data$year %in% years,]


###
# Add Madden Information
###

library(readxl)

dir <- "/Users/jtimmons/Documents/GitHub/ff/data/madden"

all.madden.data <- data.frame()
for (year in 2013:2014) {
  madden.path <- paste0(dir, "/madden_nfl_", year, ".xlsx")
  madden.data <- read_excel(madden.path, sheet = 1)

  colnames(madden.data) <- lapply(tolower(colnames(madden.data)), function(x) gsub(" ", "_", x))
  madden.data$name <- with(madden.data, paste0(first_name, " ", last_name))

  madden.data$year <- as.integer(rep(year, nrow(madden.data)))

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

#player.data <- player.data[player.data$experts > 0,]

# split up by position
player.data <- split(player.data, player.data$fantpos)

# general data cleaning
for (i in 1:length(player.data)) {
  position.data <- player.data[[i]]

  if (ncol(position.data) < 1) next

  # replace NA values with the median for that column
  for (c in 1:ncol(position.data)){
    if (is.numeric(position.data[,c])) {
      position.data[is.na(position.data[,c]), c] <- median(position.data[,c], na.rm = TRUE)
    }
  }

  # remove duplicates
  print(nrow(position.data[!duplicated(position.data[c("year", "name")]),]))
  player.data[[i]] <- position.data[!duplicated(position.data[c("year", "name")]),]
}

qb.data <- player.data[["QB"]]
rb.data <- player.data[["RB"]]
wr.data <- player.data[["WR"]]
tw.data <- player.data[["TE"]]
