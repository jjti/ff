library(plm)
library(pryr)
library(MASS)

setwd("~/Documents/GitHub/ff/analysis")

# Predicting outcome using Madden stats and expert predictions

## QB
qb.formula <- formula(fantpt ~ experts + overall + injury + stamina + throw_power + awareness + strength + age.x + years_pro)
qb.model <- lm(qb.formula, data = qb.data)
qb.fit <- stepAIC(qb.model, direction = "both")
summary(qb.fit)

qb.rsqrd <- round(summary(qb.fit)$r.squared, digits = 3)
qb.rsqrd <- paste0("R^2 = ", sprintf("%.3f", qb.rsqrd))
qb.plot %<a-% {
  plot(predict(qb.fit), qb.data$fantpt,
     cex = 0.8,
     xlim = c(0, 375),
     ylim = c(0, 375),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(65, 350, labels = qb.rsqrd)
  title(main = "QB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}

# 0.646 experts, overall, injury

## RB
rb.formula <- formula(fantpt ~ experts + overall + injury + route_running + return + stamina + toughness + catching + acceleration + carrying + trucking + stamina + agility + elusiveness + speed + awareness + strength + age.x + years_pro)
rb.model <- lm(rb.formula, data = rb.data)
rb.fit <- stepAIC(rb.model, direction = "both")

summary(rb.fit)
rb.rsqrd <- round(summary(rb.fit)$r.squared, digits = 3)
rb.rsqrd <- paste0("R^2 = ", sprintf("%.3f", rb.rsqrd))
rb.plot %<a-% {
  plot(predict(rb.fit), rb.data$fantpt,
     cex = 0.8,
     xlim = c(0, 250),
     ylim = c(0, 250),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(45, 235, labels = rb.rsqrd)
  title(main = "RB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}


## WR
wr.formula <- formula(fantpt ~ experts + overall + injury + route_running + return + stamina + toughness + catching + acceleration + carrying + trucking + stamina + agility + elusiveness + speed + awareness + strength + age.x + years_pro)
wr.model <- lm(wr.formula, data = wr.data)
wr.fit <- stepAIC(wr.model, direction = "both")

summary(wr.fit)
wr.rsqrd <- round(summary(wr.fit)$r.squared, digits = 3)
wr.rsqrd <- paste0("R^2 = ", sprintf("%.3f", wr.rsqrd))
wr.plot %<a-% {
  plot(predict(wr.fit), wr.data$fantpt,
     cex = 0.8,
     xlim = c(0, 250),
     ylim = c(0, 250),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(45, 235, labels = wr.rsqrd)
  title(main = "WR", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# wr.plot

# .54 experts + speed
# .53 experts


## TE

te.formula <- formula(fantpt ~ experts + overall + injury + route_running + return + stamina + toughness + catching + acceleration + carrying + trucking + stamina + agility + elusiveness + speed + awareness + strength + age.x + years_pro)
te.model <- lm(te.formula, data = te.data)
te.fit <- stepAIC(te.model, direction = "both")

summary(te.fit)
te.rsqrd <- round(summary(te.fit)$r.squared, digits = 3)
te.rsqrd <- paste0("R^2 = ", sprintf("%.3f", te.rsqrd))
te.plot %<a-% {
  plot(predict(te.fit), te.data$fantpt,
     cex = 0.8,
     xlim = c(0, 155),
     ylim = c(0, 155),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(27, 145, labels = te.rsqrd)
  title(main = "TE", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# te.plot

# .54 experts + speed
# .53 experts

all.plot
