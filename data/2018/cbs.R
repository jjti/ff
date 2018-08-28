library(plyr)
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

###
# Player stats
###
# https://www.cbssports.com/fantasy/football/stats/sortable/points/QB/standard/projections/2018/ytd

pages.by.pos <- list(
  list(
    pos = "QB",
    page_count = 2,
    header_row_index = 3
  ),
  list(
    pos = "RB",
    page_count = 4,
    header_row_index = 3
  ),
  list(
    pos = "WR",
    page_count = 5,
    header_row_index = 3
  ),
  list(
    pos = "TE",
    page_count = 3,
    header_row_index = 3
  ),
  list(
    pos = "K",
    page_count = 1,
    header_row_index = 2
  ),
  list(
    pos = "DST",
    page_count = 1,
    header_row_index = 2
  )
)

base.url <- "https://www.cbssports.com/fantasy/football/stats/sortable/points/"
scrapeCBS <- function(suffix) {
  cbs.data <- data.frame()
  for (pos.data in pages.by.pos) {
    start_rows <- (1 + 50 * seq(from = 0, to = pos.data$page_count))
    for (start_row in start_rows) {
      page.url <- paste0(base.url, pos.data$pos, suffix, "?&start_row=", start_row)
      
      cbs.page.data <- read_html(page.url) %>%
        html_node(".data") %>%
        html_table(fill = TRUE)
      
      if (nrow(cbs.page.data) < 5) next
      
      colnames(cbs.page.data) <- tolower(as.character(cbs.page.data[pos.data$header_row_index,])) # header_row_index row is the header
      cbs.page.data <- cbs.page.data[4:nrow(cbs.page.data) - 1,] # get rid of header row and footer
      cbs.page.data$name <- cbs.page.data$player # player == name
      cbs.page.data$cbs.2018 <- cbs.page.data$fpts
      cbs.page.data$pos <- pos.data$pos
      cbs.page.data <- cbs.page.data[cbs.page.data$name != "Player",]
      
      for (i in 1:nrow(cbs.page.data)) {
        cbs.name <- as.character(cbs.page.data[i, "name"])
        cbs.name.split <- strsplit(cbs.name, ", ")
        
        cbs.page.data[i,"name"] <- cbs.name.split[1]
      }
      
      cbs.data <- rbind.fill(cbs.data, cbs.page.data[, c("name", "pos", "cbs.2018")])
    }
  }
  cbs.data <- cbs.data[, c("name", "pos", "cbs.2018")]
  cbs.data <- cbs.data[complete.cases(cbs.data), ]
  cbs.data
}

cbs.data.ppr <- scrapeCBS("/ppr/projections/2018/ytd")
cbs.data.standard <- scrapeCBS("/standard/projections/2018/ytd")

cbs.data <- cbs.data.ppr
cbs.data$cbs.2018.ppr <- cbs.data$cbs.2018
cbs.data$cbs.2018.stn <- cbs.data.standard$cbs.2018
cbs.data <- cbs.data[, c("name", "pos", "cbs.2018.ppr", "cbs.2018.stn")]

###
# Save to fs
###


save(cbs.data, file = paste0("cbs.Rda"))
