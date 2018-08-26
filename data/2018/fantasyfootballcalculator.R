###
# Getting ADP and BYE week for each player using 8, 10, 12, and 14 team leagues from FFC
###

library("plyr")
library("data.table")
library(rvest)


adp.bye.data <- NULL
for (count in seq(from = 8, to = 14, by = 2)) {
  url <- paste0("https://fantasyfootballcalculator.com/adp/ppr/", count, "-team/all")
  data <- read_html(url) %>% html_table()
  data <- data[[1]]
  colnames(data) <- tolower(colnames(data))
  data <- data.frame(data)

  # create a name for adp in this sized league, ex: adp-8
  adp.col <- paste0("adp", count)
  colnames(data)[1] <- adp.col
  data <- data[, c("name", "bye", adp.col, "pos")]

  # replace PK with K and DEF with DST
  data$pos <- sapply(data$pos, function(x) gsub("PK", "K", x))
  data$pos <- sapply(data$pos, function(x) gsub("DEF", "DST", x))

  if (is.null(adp.bye.data)) {
    adp.bye.data <- data
  } else {
    adp.bye.data <- merge(adp.bye.data, data, all = TRUE)
  }
}

