import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import reducers, { initialState } from "./reducers";

export type StoreState = Readonly<typeof initialState>;

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware())
);
