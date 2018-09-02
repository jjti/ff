library(plyr)
library(jsonlite)

source("/Users/josh/Documents/GitHub/ff/data/load_2018.R")

setwd("~/Documents/GitHub/ff/output")

full.predictions <- rbind.fill(player.data, dst.data)

full.predictions$href <- full.predictions$img.url
full.predictions$predictionPPR <- round(full.predictions$predictionPPR)
full.predictions$predictionSTN <- round(full.predictions$predictionSTN)
full.predictions <- full.predictions[!duplicated(full.predictions$name),]
full.predictions$team <- full.predictions$team.x
full.predictions$bye <- full.predictions$bye.x
colnames(full.predictions)
full.predictions <- full.predictions[, c("name", "pos", "team", "predictionPPR", "predictionSTN", "adp8STN", "adp10STN", "adp12STN", "adp14STN","adp8PPR", "adp10PPR", "adp12PPR", "adp14PPR", "href", "bye")]
full.predictions <- full.predictions[order(full.predictions$predictionPPR, decreasing = TRUE),]

write_json(full.predictions, "/Users/josh/Documents/GitHub/ff/app/public/forecast.json")

cbs.data[cbs.data$name == "Adrian Peterson",]
espn.data[espn.data$name == "Adrian Peterson",]
fox.data[fox.data$name == "Adrian Peterson",]
player.data[player.data$name == "LeVeon Bell",]
player.data[player.data$name == "Adrian Peterson",]
