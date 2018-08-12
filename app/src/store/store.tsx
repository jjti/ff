import { createStore } from "redux";
import reducers, { initialState } from "./reducers";

export type StoreState = Readonly<typeof initialState>;

export const store = createStore(reducers);
