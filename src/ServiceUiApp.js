import './css/bootstrap.min.css';
import './css/awesomefonts.css';
import './css/neat.css';
import './css/mono-blue.min.css';
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import WorkflowListReadOnly from "./pages/workflowList/WorkflowListReadOnly";
import buildReducer from "./store/reducers/builder";
import bulkReducer from "./store/reducers/bulk";
import mountedDeviceReducer from "./store/reducers/mountedDevices";
import searchReducer from "./store/reducers/searchExecs";
import { frontendUrlPrefix } from "./constants";

const rootReducer = combineReducers({
  bulkReducer,
  searchReducer,
  buildReducer,
  mountedDeviceReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
);

function App() {
  return (
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route
                exact
                path={[frontendUrlPrefix + "/:type", frontendUrlPrefix + "/:type/:wfid", "/"]}
                component={WorkflowListReadOnly}
            />
            <Redirect from={frontendUrlPrefix} to={frontendUrlPrefix + "/defs"} />
          </Switch>
        </BrowserRouter>
      </Provider>
  );
}

export default App;
