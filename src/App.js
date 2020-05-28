// @flow
import './css/bootstrap.min.css';
import './css/awesomefonts.css';
import './css/neat.css';
import './css/mono-blue.min.css';
import React from "react";
import { Provider } from "react-redux";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import DiagramBuilder from "./pages/diagramBuilder/DiagramBuilder";
import WorkflowList from "./pages/workflowList/WorkflowList";
import buildReducer from "./store/reducers/builder";
import bulkReducer from "./store/reducers/bulk";
import mountedDeviceReducer from "./store/reducers/mountedDevices";
import searchReducer from "./store/reducers/searchExecs";

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

function App(props : { setBuilderActive?: (param: boolean) => void }) {
  const hideHeader = () => {
    return props?.setBuilderActive ? props.setBuilderActive(true) : null;
  };

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path={[props.frontendUrlPrefix + "/builder", props.frontendUrlPrefix + "/builder/:name/:version"]}
            render={(pp) => (
              <DiagramBuilder 
                frontendUrlPrefix={props.frontendUrlPrefix} 
                backendApiUrlPrefix={props.backendApiUrlPrefix} 
                hideHeader={hideHeader} 
                {...pp}
              />
            )}
          />
          <Route
            exact
            path={[props.frontendUrlPrefix + "/:type", props.frontendUrlPrefix + "/:type/:wfid", "/"]}
            render={(pp) => (
              <WorkflowList
                frontendUrlPrefix={props.frontendUrlPrefix}
                backendApiUrlPrefix={props.backendApiUrlPrefix}
                enableScheduling={props.enableScheduling}
                {...pp}
              />
            )}
          />
          <Redirect from={props.frontendUrlPrefix} to={props.frontendUrlPrefix + "/defs"} />
        </Switch>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
