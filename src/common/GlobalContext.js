import React, {createContext, useState, useEffect} from 'react'

export const GlobalContext = createContext();

export const globalConstants = {
  backendApiUrlPrefix: "/api/conductor",
  frontendUrlPrefix: "/workflows",
  enableScheduling: false,
  disabledTasks: ["js", "py"],
  prefixHttpTask: "",
};

export const GlobalProvider = (props) => {
  const [global, setGlobal] = useState(globalConstants);

  useEffect(() => {
    setGlobal({...global, ...props})
  }, [props])

  return (
    <GlobalContext.Provider
      value={global}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};