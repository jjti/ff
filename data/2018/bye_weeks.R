library(plyr)
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

# https://www.fantasypros.com/nfl/bye-week-cheatsheet.php

bye.page <- read_html("https://www.fantasypros.com/nfl/bye-weeks.php") %>%
  html_node(".table-bordered") %>%
  html_table()

bye.page[, "bye"] <- bye.page["Bye Week"]
bye.page$team <- apply(bye.page["Team"], 1, function(x) {
  split.names <- strsplit(x, " ")[[1]]
  bye.page.name <- split.names[length(split.names)]
  return(bye.page.name)
})

bye.data <- bye.page[, c("team", "bye")]

bye.data

