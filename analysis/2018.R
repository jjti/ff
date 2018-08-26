library(plyr)
library(jsonlite)

source("/Users/jtimmons/Documents/GitHub/ff/data/load_2018.R")

setwd("~/Documents/GitHub/ff/output")

full.predictions <- rbind.fill(qb.data, dst.data)
full.predictions <- rbind.fill(full.predictions, rb.data)
full.predictions <- rbind.fill(full.predictions, wr.data)
full.predictions <- rbind.fill(full.predictions, te.data)
full.predictions <- rbind.fill(full.predictions, k.data)

full.predictions$href <- full.predictions$img.url
full.predictions$madden <- full.predictions$overall
full.predictions$prediction <- round(full.predictions$prediction)
full.predictions <- full.predictions[!duplicated(full.predictions$name),]
colnames(full.predictions)
full.predictions <- full.predictions[, c("name", "pos", "team", "prediction", "adp8", "adp10", "adp12", "adp14", "madden", "href", "bye")]
full.predictions <- full.predictions[order(full.predictions$prediction, decreasing = TRUE),]

write_json(full.predictions, "/Users/jtimmons/Documents/GitHub/ff/app/public/forecast.json")

