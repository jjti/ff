#Load libraries
library("XML")
library("stringr")
library("ggplot2")
library("plyr")
library(rvest)

setwd("~/Documents/GitHub/ff/data/2018")

# http://msn.foxsports.com/fantasy/football/commissioner/Research/Projections.aspx?page=1&position=8&split=3 qb
# http://msn.foxsports.com/fantasy/football/commissioner/Research/Projections.aspx?page=1&position=16&split=3 rb
# http://msn.foxsports.com/fantasy/football/commissioner/Research/Projections.aspx?page=1&position=1&split=3 wr
# http://msn.foxsports.com/fantasy/football/commissioner/Research/Projections.aspx?page=1&position=4&split=3 te

base.url <- "http://msn.foxsports.com/fantasy/football/commissioner/Research/Projections.aspx"
pages.by.pos <- list(
  list(
    pos = "QB",
    position = 8,
    page_count = 5
  ),
  list(
    pos = "RB",
    position = 16,
    page_count = 11
  ),
  list(
    pos = "WR",
    position = 1,
    page_count = 18
  ),
  list(
    pos = "TE",
    position = 4,
    page_count = 10
  )
)

fox.page.data <- read_html("http://msn.foxsports.com/fantasy/football/commissioner/Research/Projections.aspx?page=1&position=8&split=3") %>%
  html_node("#playerTable") %>%
  html_table(fill = TRUE)


fox.data <- data.frame()
for (pos.data in pages.by.pos) {
  for (page in seq(from = 1, to = pos.data$page_count)) {
#  for (page in seq(from = 1, to = 2)) {
    page.url <- paste0(base.url, "?page=", page, "&position=", pos.data$position, "&split=3")

    fox.page.data <- read_html(page.url) %>%
      html_node("#playerTable") %>%
      html_table(fill = TRUE)

    colnames(fox.page.data) <- tolower(colnames(fox.page.data))
    fox.page.data <- fox.page.data[fox.page.data$name != "Name",]
    fox.page.data <- fox.page.data[, c("name", "pts")]
    fox.page.data$pos <- pos.data$pos

    for (i in 1:nrow(fox.page.data)) {
      fox.name <- fox.page.data[i, "name"]
      fox.name.split <- strsplit(fox.name, "\\\r")
      fox.page.data[i,"name"] <- fox.name.split[1]
    }

    fox.data <- rbind.fill(fox.data, fox.page.data)
  }
}

fox.data$fox.2018 <- fox.data$pts
fox.data <- fox.data[, c("name", "pos", "fox.2018")]
save(fox.data, file = paste0("fox.Rda"))
