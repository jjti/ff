FROM joyzoursky/python-chromedriver:3.8

COPY ./src/requirements.txt /model/src/requirements.txt
RUN pip install -r ./model/src/requirements.txt

EXPOSE 80
EXPOSE 443

COPY . /model

WORKDIR /model
