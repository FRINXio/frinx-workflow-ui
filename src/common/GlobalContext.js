import React, {createContext} from 'react'

export const GlobalContext = createContext();

const backendApiUrlPrefix = "/api/conductor";
const frontendUrlPrefix = "/workflows";
const enableScheduling = false;
const disabledTasks = ['js', 'py'];
const prefixHttpTask = '';

export const GlobalProvider = ({ children }) => {
  
    return (
      <GlobalContext.Provider
        value={{
          backendApiUrlPrefix,
          frontendUrlPrefix,
          enableScheduling,
          disabledTasks,
          prefixHttpTask
        }}
      >
        {children}
      </GlobalContext.Provider>
    );
  };