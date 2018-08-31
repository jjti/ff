library(plyr)
library(jsonlite)

source("/Users/josh/Documents/GitHub/ff/data/load_2018.R")

setwd("~/Documents/GitHub/ff/output")

full.predictions <- rbind.fill(player.data, dst.data)

full.predictions$href <- full.predictions$img.url
full.predictions$madden <- full.predictions$overall
full.predictions$predictionPPR <- round(full.predictions$predictionPPR)
full.predictions$predictionSTN <- round(full.predictions$predictionSTN)
full.predictions <- full.predictions[!duplicated(full.predictions$name),]
full.predictions$bye <- full.predictions$bye.x
full.predictions <- full.predictions[, c("name", "pos", "team", "predictionPPR", "predictionSTN", "adp8STN", "adp10STN", "adp12STN", "adp14STN","adp8PPR", "adp10PPR", "adp12PPR", "adp14PPR", "madden", "href", "bye")]
full.predictions <- full.predictions[order(full.predictions$predictionPPR, decreasing = TRUE),]

write_json(full.predictions, "/Users/josh/Documents/GitHub/ff/app/public/forecast.json")

