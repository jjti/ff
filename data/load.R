library(plm)

setwd("~/Documents/GitHub/ff/analysis")
load("~/Documents/GitHub/ff/data/player_data.Rda")

player.data <- player.data[player.data$year == 2014,]
player.data <- pdata.frame(player.data, index=c("name","year"), drop.index=FALSE, row.names=TRUE)

# player.data <- split(player.data, player.data$fantpos)
