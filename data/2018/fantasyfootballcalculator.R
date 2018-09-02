###
# Getting ADP and BYE week for each player using 8, 10, 12, and 14 team leagues from FFC
###

library(plyr)
library(rvest)

# scrape 8, 10, 12, and 14 week timepoints from ffc
scrapeFFC <- function(url, suffix) {
  adp.bye.data <- NULL
  for (count in seq(from = 8, to = 14, by = 2)) {
    full.url <- paste0(url, count, "-team/all")
    
    data <- read_html(full.url) %>% html_table()
    data <- data[[1]]
    colnames(data) <- tolower(colnames(data))
    data <- data.frame(data)
    
    # create a name for adp in this sized league, ex: adp-8
    adp.col <- paste0("adp", count, suffix)
    colnames(data)[1] <- adp.col
    data <- data[, c("name", "bye", adp.col, "pos", "team")]
    
    # replace PK with K and DEF with DST
    data$pos <- sapply(data$pos, function(x) gsub("PK", "K", x))
    data$pos <- sapply(data$pos, function(x) gsub("DEF", "DST", x))
    
    if (is.null(adp.bye.data)) {
      adp.bye.data <- data
    } else {
      adp.bye.data <- merge(adp.bye.data, data, all = TRUE)
    }
  }
  adp.bye.data$name <- gsub(" Jr", "", adp.bye.data$name)
  adp.bye.data$name <- gsub(" II", "", adp.bye.data$name)
  adp.bye.data$name <- gsub(" III", "", adp.bye.data$name)
  adp.bye.data
}

adp.bye.data.ppr <- scrapeFFC("https://fantasyfootballcalculator.com/adp/ppr/", "PPR")
adp.bye.data.standard <- scrapeFFC("https://fantasyfootballcalculator.com/adp/standard/", "STN")

adp.bye.data <- merge(adp.bye.data.ppr, adp.bye.data.standard, by = c("name", "pos"))
