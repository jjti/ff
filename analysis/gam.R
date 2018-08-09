library(plm)
library(pryr)
library(MASS)
library(mgcv)
library(plyr)
library(robustgam)

setwd("~/Documents/GitHub/ff/analysis")

# Using GAMs with Madden stats and expert predictions to forecast FF points

## Top 3 Quartiles only
qb.data <- qb.data[qb.data$experts > 30 & qb.data$overall > 70,]
rb.data <- rb.data[rb.data$experts > 20 & rb.data$overall > 67,]
wr.data <- wr.data[wr.data$experts > 20 & wr.data$overall > 64,]
te.data <- te.data[te.data$experts > 20 & te.data$overall > 68,]

## QB
qb.formula <- formula(fantpt ~ s(experts) + s(overall))
qb.fit.gam <- gam(qb.formula, data = qb.data, select = TRUE)
summary(qb.fit.gam)

qb.plot %<a-% {
  plot(predict.glm(qb.fit.gam), qb.data$fantpt,
       cex = 0.8,
       xlim = c(0, 375),
       ylim = c(0, 375),
       ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  title(main = "QB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# Deviance explained = 69%

## RB
rb.formula <- formula(fantpt ~ s(experts) + s(overall))
rb.fit.gam <- gam(rb.formula, data = rb.data, select = TRUE)
summary(rb.fit.gam)

rb.plot %<a-% {
  plot(predict.glm(rb.fit.gam), rb.data$fantpt,
       cex = 0.8,
       xlim = c(0, 250),
       ylim = c(0, 250),
       ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  title(main = "RB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# Deviance explained = 41.5%


## WR
wr.formula <- formula(fantpt ~ s(experts))
wr.fit.gam <- gam(wr.formula, data = wr.data, select = TRUE)
summary(wr.fit.gam)

wr.plot %<a-% {
  plot(predict.glm(wr.fit.gam), wr.data$fantpt,
       cex = 0.8,
       xlim = c(0, 250),
       ylim = c(0, 250),
       ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  title(main = "WR", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# Deviance explained = 47%


## TE
te.formula <- formula(fantpt ~ s(experts) + s(awareness) + s(speed))
te.fit.gam <- gam(te.formula, data = te.data, select = TRUE)
summary(te.fit.gam)

te.plot %<a-% {
  plot(predict.glm(te.fit.gam), te.data$fantpt,
       cex = 0.8,
       xlim = c(0, 165),
       ylim = c(0, 165),
       ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  title(main = "TE", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# Deviance explained = 67.8%

all.plot

