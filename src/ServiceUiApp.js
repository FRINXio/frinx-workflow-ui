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
import Header from './common/header/Header'

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

function App(props) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path={[props.frontendUrlPrefix + "/:type", props.frontendUrlPrefix + "/:type/:wfid", "/"]}
            render={(pp) =>
              <>
                <Header />
                <WorkflowListReadOnly
                  frontendUrlPrefix={props.frontendUrlPrefix}
                  backendApiUrlPrefix={props.backendApiUrlPrefix}
                  {...pp}
                />
              </>
            }
          />
          <Redirect from={props.frontendUrlPrefix} to={props.frontendUrlPrefix + "/defs"} />
        </Switch>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
