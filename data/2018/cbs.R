#Load libraries
library(plyr)
library(rvest)

# qb
# https://www.cbssports.com/fantasy/football/stats/sortable/points/QB/standard/projections/2018/ytd

base.url <- "https://www.cbssports.com/fantasy/football/stats/sortable/points/"
base.url.suffix <- "/standard/projections/2018/ytd"

pages.by.pos <- list(
  list(
    pos = "QB",
    page_count = 2
  ),
  list(
    pos = "RB",
    page_count = 4
  ),
  list(
    pos = "WR",
    page_count = 5
  ),
  list(
    pos = "TE",
    page_count = 3
  )
)


cbs.page.data <- read_html("https://www.cbssports.com/fantasy/football/stats/sortable/points/TE/standard/projections/2018/ytd") %>%
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

    colnames(cbs.page.data) <- tolower(colnames(cbs.page.data))
    cbs.page.data <- cbs.page.data[4:nrow(cbs.page.data)-1,] # get rid of header row
    cbs.page.data$name <- cbs.page.data[, "x1"]
    cbs.page.data$cbs.2018 <- cbs.page.data[, "x18"]
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
save(cbs.data, file = paste0("cbs.Rda"))
