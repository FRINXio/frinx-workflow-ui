import React, {createContext, useState, useEffect} from 'react'

export const GlobalContext = createContext();

export const globalConstants = {
  backendApiUrlPrefix: "/uniflow/api/conductor",
  frontendUrlPrefix: "/uniflow/ui",
  enableScheduling: false,
  disabledTasks: ["js", "py", "graphQL"],
  prefixHttpTask: "",
  // Uncomment below settings when testing frinx-workflow-ui running on host and talking to workflow-proxy in net-auto
  /*
  backendApiUrlPrefix: "/workflow/proxy",
  frontendUrlPrefix: "/workflow/frontend",
  enableScheduling: true,
  disabledTasks: ['lambda'],
  prefixHttpTask: 'GLOBAL___',
 */
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
