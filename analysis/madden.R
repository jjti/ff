
library(plm)
library(pryr)

setwd("~/Documents/GitHub/ff/analysis")

qb.data <- player.data[["QB"]]
qb.data <- qb.data[!duplicated(qb.data[c("year", "name")]),]

for(i in 1:ncol(qb.data)){
  if (is.numeric(qb.data[,i])) {
    qb.data[is.na(qb.data[,i]), i] <- median(qb.data[,i], na.rm = TRUE) 
  }
}

qb.formula <- formula(fantpt ~ overall + injury + throw_accuracy)
qb.model <- plm(qb.formula, data = qb.data, index = c("name","year"), model="pooling")
summary(qb.model)

# for each player in the data set
qb.coors = data.frame(x=numeric(0), y=numeric(0))
med.pts <- median(qb.data$fantpt, na.rm = TRUE)
for (i in 1:nrow(qb.data)) {
  player <- qb.data[i,]
  qb.coors <- rbind(
     qb.coors,
     list(
        x = sum(c(1, player$overall, player$injury, player$throw_accuracy) * qb.model$coefficients, na.rm = TRUE),
        y = player$fantpt
     )
  )
}

# only keep the cases where we know next season's score
qb.coors <- qb.coors[complete.cases(qb.coors),]

# calculate R-squared
total <- with(qb.coors, sum((y - mean(y))^2))
var <- with(qb.coors, sum((y - x)^2))
qb.rsqrd <- round(1 - (var / total), digits = 3)
qb.rsqrd <- paste0("R^2 = ", qb.rsqrd)
qb.rsqrd # 0.637

qb.plot.madden %<a-% {
  plot(qb.coors$x, qb.coors$y,
     cex = 0.8,
     xlim = c(0, 350),
     ylim = c(0, 450),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(70, 420, labels = qb.rsqrd)
  title(main = "QB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}

# 0.574 overall, injury
# 0.583 overall, injury, throw_accuracy

## RB

rb.data <- player.data[["RB"]]
rb.data <- rb.data[!duplicated(rb.data[c("year", "name")]),]

for(i in 1:ncol(rb.data)){
  if (is.numeric(rb.data[,i])) {
    rb.data[is.na(rb.data[,i]), i] <- median(rb.data[,i], na.rm = TRUE) 
  }
}

rb.formula <- formula(fantpt ~ overall + agility + carrying)
rb.model <- plm(rb.formula, data = rb.data, index = c("name","year"), model="pooling")
summary(rb.model)

# for each player in the data set
rb.coors = data.frame(x=numeric(0), y=numeric(0))
med.pts <- median(rb.data$fantpt, na.rm = TRUE)
for (i in 1:nrow(rb.data)) {
  player <- rb.data[i,]
  rb.coors <- rbind(
     rb.coors,
     list(
        x = sum(c(1, player$overall, player$agility, player$carrying) * rb.model$coefficients, na.rm = TRUE),
        y = player$fantpt
     )
  )
}

# only keep the cases where we know next season's score
rb.coors <- rb.coors[complete.cases(rb.coors),]

# calculate R-squared
total <- with(rb.coors, sum((y - mean(y))^2))
var <- with(rb.coors, sum((y - x)^2))
rb.rsqrd <- round(1 - (var / total), digits = 3)
rb.rsqrd <- paste0("R^2 = ", rb.rsqrd)
rb.rsqrd # 0.637

rb.plot.madden %<a-% {
  plot(rb.coors$x, rb.coors$y,
     cex = 0.8,
     xlim = c(0, 350),
     ylim = c(0, 450),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(70, 420, labels = rb.rsqrd)
  title(main = "QB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# rb.plot

# 0.214 overall, agility, carrying


## WR


wr.data <- player.data[["WR"]]
wr.data <- wr.data[!duplicated(wr.data[c("year", "name")]),]

for(i in 1:ncol(wr.data)){
  if (is.numeric(wr.data[,i])) {
    wr.data[is.na(wr.data[,i]), i] <- median(wr.data[,i], na.rm = TRUE) 
  }
}

wr.formula <- formula(fantpt ~ overall + speed + catching)
wr.model <- plm(wr.formula, data = wr.data, index = c("name","year"), model="pooling")
summary(wr.model)

# for each player in the data set
wr.coors = data.frame(x=numeric(0), y=numeric(0))
med.pts <- median(wr.data$fantpt, na.rm = TRUE)
for (i in 1:nrow(wr.data)) {
  player <- wr.data[i,]
  wr.coors <- rbind(
     wr.coors,
     list(
        x = sum(c(1, player$overall, player$speed, player$catching) * wr.model$coefficients, na.rm = TRUE),
        y = player$fantpt
     )
  )
}

# only keep the cases where we know next season's score
wr.coors <- wr.coors[complete.cases(wr.coors),]

# calculate R-squared
total <- with(wr.coors, sum((y - mean(y))^2))
var <- with(wr.coors, sum((y - x)^2))
wr.rsqrd <- round(1 - (var / total), digits = 3)
wr.rsqrd <- paste0("R^2 = ", wr.rsqrd)
wr.rsqrd # 0.637

wr.plot.madden %<a-% {
  plot(wr.coors$x, wr.coors$y,
     cex = 0.8,
     xlim = c(0, 350),
     ylim = c(0, 450),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(70, 420, labels = wr.rsqrd)
  title(main = "QB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# wr.plot

# 0.255 overall, speed, injury
# 0.268 overall. speed, catching



te.data <- player.data[["TE"]]
te.data <- te.data[!duplicated(te.data[c("year", "name")]),]

for(i in 1:ncol(te.data)){
  if (is.numeric(te.data[,i])) {
    te.data[is.na(te.data[,i]), i] <- median(te.data[,i], na.rm = TRUE) 
  }
}

te.formula <- formula(fantpt ~ overall + catching)
te.model <- plm(te.formula, data = te.data, index = c("name","year"), model="pooling")
summary(te.model)

# for each player in the data set
te.coors = data.frame(x=numeric(0), y=numeric(0))
med.pts <- median(te.data$fantpt, na.rm = TRUE)
for (i in 1:nrow(te.data)) {
  player <- te.data[i,]
  te.coors <- rbind(
     te.coors,
     list(
        x = sum(c(1, player$overall, player$catching) * te.model$coefficients, na.rm = TRUE),
        y = player$fantpt
     )
  )
}

# only keep the cases where we know next season's score
te.coors <- te.coors[complete.cases(te.coors),]

# calculate R-squared
total <- with(te.coors, sum((y - mean(y))^2))
var <- with(te.coors, sum((y - x)^2))
te.rsqrd <- round(1 - (var / total), digits = 3)
te.rsqrd <- paste0("R^2 = ", te.rsqrd)
te.rsqrd # 0.637

te.plot.madden %<a-% {
  plot(te.coors$x, te.coors$y,
     cex = 0.8,
     xlim = c(0, 350),
     ylim = c(0, 450),
     ann=FALSE)
  abline(0, 1, col = 'red', lty = 'dashed', lwd = 2)
  text(70, 420, labels = te.rsqrd)
  title(main = "QB", line = 0.5)
  title(xlab = "estimate", ylab = "actual", line = 2.25)
}
# te.plot

# 0.278 overall + speed

