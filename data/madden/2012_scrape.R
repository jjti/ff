library(plyr)
library(rvest)
library(openxlsx)

setwd("~/Documents/GitHub/ff/data/madden")
output_file <- "madden_nfl_2012.xlsx" # output file


# Setup the pages for scraping
# QB
# http://maddenultimate.com/ratings/search.php?page=1&Type=&Tier=Quarterbacks&Position=&Team=&Rating=&order=overrat
# RB
# http://maddenultimate.com/ratings/search.php?page=1&Type=&Tier=Running+Backs&Position=&Team=&Rating=&order=overrat
# WR / TE
# http://maddenultimate.com/ratings/search.php?page=1&Type=&Tier=Wide+Receivers+and+Tight+Ends&Position=&Team=&Rating=&order=overrat
pages <- list(
  list(
    pos = "QB",
    page_count = 2,
    page_name = "Quarterbacks"
  ),
  list(
    pos = "RB",
    page_count = 3,
    page_name = "Running+Backs"
  ),
  list(
    pos = "WR/TE",
    page_count = 6,
    page_name = "Wide+Receivers+and+Tight+Ends"
  )
)


page.url <- "http://maddenultimate.com/ratings/search.php?page=1&Type=&Tier=Quarterbacks&Position=&Team=&Rating=&order=overrat"

#Download fantasy football projections from ESPN.com
base_url <- "http://maddenultimate.com/ratings/search.php?page="

#Scrape
madden.page <- "http://maddenultimate.com/ratings/search.php?page=1&Type=&Tier=Quarterbacks&Position=&Team=&Rating=&order=overrat"
madden.data <- data.frame()
for (position in pages) {
  for (page.index in seq(from = 0, to = position$page_count - 1)) {
    page.url <- paste0(base_url, page.index, "&Type=&Tier=", position$page_name, "&Position=&Team=&Rating=&order=overrat")
    madden.page.data <- read_html(page.url)

    madden.this.data <- html_table(madden.page.data, fill = TRUE)
    madden.this.data <- madden.this.data[[3]]
    madden.this.data <- madden.this.data[2:nrow(madden.this.data)-1, ] # get rid of the first and last row

    madden.this.data <- madden.this.data[,c(1, 2, 3, 4)] # name, position, overall
    colnames(madden.this.data) <- c("name", "team", "position", "overall")

    madden.this.data <- madden.this.data[madden.this.data$name != "Name", ]
    madden.data <- rbind.fill(madden.data, madden.this.data)
  }
}

madden.data$position <- sapply(madden.data$position, function(x) gsub("HB", "RB", x))
madden.data$position <- sapply(madden.data$position, function(x) gsub("FB", "RB", x))



write.xlsx(madden.data, output_file)

