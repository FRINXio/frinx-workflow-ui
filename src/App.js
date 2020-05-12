import './css/bootstrap.min.css';
import './css/awesomefonts.css';
import './css/neat.css';
import './css/mono-blue.min.css';
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import DiagramBuilder from "./pages/diagramBuilder/DiagramBuilder";
import WorkflowList from "./pages/workflowList/WorkflowList";
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

function App(props : { adminMode: boolean, setBuilderActive?: (param: boolean) => void }) {
  const hideHeader = () => {
    return props?.setBuilderActive ? props.setBuilderActive(true) : null;
  };
  return (
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route
                exact
                path={[frontendUrlPrefix + "/builder", frontendUrlPrefix + "/builder/:name/:version"]}
                render={(ps) => (
                    props.adminMode ?
                        (<DiagramBuilder hideHeader={hideHeader} {...ps} />) : null
                )}
            />
            <Route
                exact
                path={[frontendUrlPrefix + "/:type", frontendUrlPrefix + "/:type/:wfid", "/"]}
                render={(ps) => <WorkflowList {...ps} adminMode={props.adminMode}/>}
            />
            <Redirect from={frontendUrlPrefix} to={frontendUrlPrefix + "/defs"} />
          </Switch>
        </BrowserRouter>
      </Provider>
  );
}

export default App;
