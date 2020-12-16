// @flow
import React, { createContext, useEffect, useState } from 'react';

export const GlobalContext = createContext();

export const globalConstants = {
  backendApiUrlPrefix: 'https://localhost/uniflow/api/conductor',
  frontendUrlPrefix: '/uniflow/ui',
  enableScheduling: true,
  disabledTasks: ['js', 'py', 'while', 'while_end'],
  prefixHttpTask: '',
  // Uncomment below settings when testing frinx-workflow-ui running on host and talking to workflow-proxy in net-auto
  /*
  backendApiUrlPrefix: "/workflow/proxy",
  frontendUrlPrefix: "/workflow/frontend",
  enableScheduling: true,
  disabledTasks: ['lambda'],
  prefixHttpTask: 'GLOBAL___',
 */
};

export const GlobalProvider = props => {
  const [global, setGlobal] = useState(globalConstants);

  useEffect(() => {
    setGlobal({ ...global, ...props });
  }, [props]);

  return <GlobalContext.Provider value={global}>{props.children}</GlobalContext.Provider>;
};
