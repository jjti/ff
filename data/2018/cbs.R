library(plyr)
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

###
# Player stats
###
# https://www.cbssports.com/fantasy/football/stats/sortable/points/QB/standard/projections/2018/ytd

base.url <- "https://www.cbssports.com/fantasy/football/stats/sortable/points/"
base.url.suffix <- "/standard/projections/2018/ytd"

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

cbs.page.data <- read_html("https://www.cbssports.com/fantasy/football/stats/sortable/points/DST/standard/projections/2018/ytd") %>%
  html_node(".data") %>%
  html_table(fill = TRUE)

cbs.data <- data.frame()
for (pos.data in pages.by.pos) {
  start_rows <- (1 + 50 * seq(from = 0, to = pos.data$page_count))
  for (start_row in start_rows) {
    page.url <- paste0(base.url, pos.data$pos, base.url.suffix, "?&start_row=", start_row)

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




###
# Average Draft Position
###
# https://www.cbssports.com/fantasy/football/draft/averages?&start_row=31

adp.page <- "https://www.cbssports.com/fantasy/football/draft/averages?&start_row=31"
adp.page.data <- read_html(adp.page) %>%
  html_node(".data") %>%
  html_table(fill = TRUE)

page.count <- 8
offsets <- seq(from = 1, to = 8 * 30, by = 30)
adp.pages <- lapply(offsets, function(x) paste0("https://www.cbssports.com/fantasy/football/draft/averages?&start_row=", x))
adp.data <- data.frame()
for (adp.page in adp.pages) {
  adp.page.data <- read_html(adp.page) %>%
    html_node(".data") %>%
    html_table(fill = TRUE)
  adp.page.data <- adp.page.data[4:nrow(adp.page.data) - 1, c(1, 2)]
  colnames(adp.page.data) <- c("adp", "name")

  for (i in 1:nrow(adp.page.data)) {
    adp.page.data[i, "name"] <- strsplit(adp.page.data[i,"name"], ",")[[1]][1]
  }
  adp.data <- rbind.fill(adp.data, adp.page.data[, c("name", "adp")])
}
cbs.data <- merge(cbs.data, adp.data, by = "name", all.x = TRUE)
cbs.data$adp <- as.numeric(as.character(cbs.data$adp))


###
# Save to fs
###

cbs.data <- cbs.data[, c("name", "pos", "cbs.2018", "adp")]
cbs.data <- cbs.data[complete.cases(cbs.data), ]
save(cbs.data, file = paste0("cbs.Rda"))
