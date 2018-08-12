import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";

const xhttp = new XMLHttpRequest();
let data: any = {};
xhttp.onreadystatechange = function() {
  if (this.readyState === 4 && this.status === 200) {
    // Typical action to be performed when the document is ready:
    data = JSON.parse(xhttp.responseText);

    ReactDOM.render(<App playerData={data} />, document.getElementById(
      "root"
    ) as HTMLElement);
    registerServiceWorker();
  }
};

xhttp.open("GET", `${process.env.PUBLIC_URL}/forecast.json`, true);
xhttp.send();
