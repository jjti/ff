library(plyr)

source("~/Documents/GitHub/ff/data/load_2018.R")

# qb.fit.gam, rb.fit.gam, wr.fit.gam, te.fit.gam, predict with each
team.count <- 10

qb.starters <- 1
rb.starters <- 2.5
wr.starters <- 2.5
te.starters <- 1

qb.data$pred <- predict(qb.fit.gam, newdata = qb.data)
rb.data$pred <- predict(rb.fit.gam, newdata = rb.data)
wr.data$pred <- predict(wr.fit.gam, newdata = wr.data)
te.data$pred <- predict(te.fit.gam, newdata = te.data)

qb.pred.sorted <- sort(qb.data$pred, decreasing = TRUE)
rb.pred.sorted <- sort(rb.data$pred, decreasing = TRUE)
wr.pred.sorted <- sort(wr.data$pred, decreasing = TRUE)
te.pred.sorted <- sort(te.data$pred, decreasing = TRUE)

qb.data$replace_value <- qb.pred.sorted[round(qb.starters * team.count)]
rb.data$replace_value <- rb.pred.sorted[round(rb.starters * team.count)]
wr.data$replace_value <- wr.pred.sorted[round(wr.starters * team.count)]
te.data$replace_value <- te.pred.sorted[round(te.starters * team.count)]

full.predictions <- rbind.fill(qb.data, rb.data)
full.predictions <- rbind.fill(full.predictions, wr.data)
full.predictions <- rbind.fill(full.predictions, te.data)
full.predictions <- full.predictions[, c("name", "pos", "team", "pred", "replace_value", "experts", "overall")]
full.predictions$vor <-  full.predictions$pred - full.predictions$replace_value

###
# Plot the predictions (sorted)
###

qb.plot.pred %<a-% {
  plot(qb.pred.sorted,
       cex = 0.6,
       xlim = c(0, 30),
       ylim = c(0, 340),
       ann=FALSE)
  title(main = "QB", line = 0.5)
  title(xlab = "rank", ylab = "predicted", line = 2.25)
}

rb.plot.pred %<a-% {
  plot(rb.pred.sorted,
       cex = 0.6,
       xlim = c(0, 100),
       ylim = c(0, 210),
       ann=FALSE)
  title(main = "RB", line = 0.5)
  title(xlab = "rank", ylab = "predicted", line = 2.25)
}

wr.plot.pred %<a-% {
  plot(wr.pred.sorted,
       cex = 0.6,
       xlim = c(0, 150),
       ylim = c(0, 230),
       ann=FALSE)
  title(main = "WR", line = 0.5)
  title(xlab = "rank", ylab = "predicted", line = 2.25)
}


te.plot.pred %<a-% {
  plot(te.pred.sorted,
       cex = 0.6,
       xlim = c(0, 60),
       ylim = c(0, 155),
       ann=FALSE)
  title(main = "TE", line = 0.5)
  title(xlab = "rank", ylab = "predicted", line = 2.25)
}

qb.plot.pred
rb.plot.pred
wr.plot.pred
te.plot.pred

