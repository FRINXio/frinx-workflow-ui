// @flow
import './css/bootstrap.min.css';
import './css/awesomefonts.css';
import './css/neat.css';
import './css/mono-blue.min.css';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import buildReducer from './store/reducers/builder';
import bulkReducer from './store/reducers/bulk';
import searchReducer from './store/reducers/searchExecs';
import Header from './common/header/Header';
import { GlobalProvider, globalConstants } from './common/GlobalContext';
import WorkflowListReadOnly from './pages/workflowList/WorkflowListReadOnly';

const rootReducer = combineReducers({
  bulkReducer,
  searchReducer,
  buildReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

const { frontendUrlPrefix } = globalConstants;

function ServiceUIApp(props) {
  return (
    <GlobalProvider {...props}>
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Redirect
              exact
              from={[
                (props.frontendUrlPrefix || frontendUrlPrefix) + '/builder',
                (props.frontendUrlPrefix || frontendUrlPrefix) + '/builder/:h/:vno',
              ]}
              to={(props.frontendUrlPrefix || frontendUrlPrefix) + '/defs'}
            />
            <Route
              exact
              path={[
                (props.frontendUrlPrefix || frontendUrlPrefix) + '/:type',
                (props.frontendUrlPrefix || frontendUrlPrefix) + '/:type/:wfid',
                '/',
              ]}
              render={() => (
                <>
                  <Header />
                  <WorkflowListReadOnly />
                </>
              )}
            />
            <Redirect to={(props.frontendUrlPrefix || frontendUrlPrefix) + '/defs'} />
          </Switch>
        </BrowserRouter>
      </Provider>
    </GlobalProvider>
  );
}

export default ServiceUIApp;
