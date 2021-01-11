// @flow
import React, { useCallback, useEffect, useState } from 'react';
import { Divider, Dropdown, Grid, Icon, Input, Menu, Popup, Sidebar } from 'semantic-ui-react';

import './Sidemenu.css';
import SideMenuItem from './SideMenuItem';
import { getTaskInputsRegex, getWfInputsRegex, hash } from '../builder-utils';
import { version } from '../../../../package.json';
import { jsonParse } from '../../../common/utils';

const icons = taskDef => {
  const task = taskDef.name;
  switch (task) {
    case 'start':
      return <div className="circle-icon">{task.substring(0, 1).toUpperCase()}</div>;
    case 'end':
      return <div className="circle-icon">{task.substring(0, 1).toUpperCase()}</div>;
    case 'terminate':
    case 'http':
    case 'raw':
    case 'event':
    case 'wait':
    case 'lambda':
      return <div className="default-icon">{task.substring(0, 1).toUpperCase()}</div>;
    case 'js':
    case 'py':
      return <div className="default-icon">{task.substring(0, 2).toUpperCase()}</div>;
    case 'graphQL':
      return <div className="default-icon">gQL</div>;
    case 'fork':
      return <div className="fork-icon">{task.substring(0, 1).toUpperCase()}</div>;
    case 'join':
      return <div className="join-icon">{task.substring(0, 1).toUpperCase()}</div>;
    case 'while':
      return <div className="while-icon">W</div>;
    case 'while_end':
      return <div className="while_end-icon">E</div>;
    case 'decision':
      return <div className="decision-icon">{task.substring(0, 1).toUpperCase()}</div>;
    case 'dynamic_fork':
      return <div className="dynamicFork-icon">{task.substring(0, 1).toUpperCase()}F</div>;
    default:
      break;
  }
};

const sub_workflow = wf => ({
  name: wf.name,
  taskReferenceName: wf.name.toLowerCase().trim() + '_ref_' + hash(),
  description: wf.description,
  inputParameters: getWfInputsRegex(wf),
  type: 'SUB_WORKFLOW',
  subWorkflowParam: {
    name: wf.name,
    version: wf.version,
  },
  optional: false,
  startDelay: 0,
});

const sub_task = t => ({
  name: t.name,
  taskReferenceName: t.name.toLowerCase().trim() + '_ref_' + hash(),
  description: t.description,
  inputParameters: getTaskInputsRegex(t),
  type: 'SIMPLE',
  optional: false,
  startDelay: 0,
});

const systemTasks = (type, props) => {
  switch (type) {
    case 'fork': {
      return {
        name: 'forkTask',
        taskReferenceName: 'forkTaskRef_' + hash(),
        type: 'FORK_JOIN',
        forkTasks: [],
        optional: false,
        startDelay: 0,
      };
    }
    case 'join': {
      return {
        name: 'joinTask',
        taskReferenceName: 'joinTaskRef_' + hash(),
        type: 'JOIN',
        joinOn: [],
        optional: false,
        startDelay: 0,
      };
    }
    case 'while': {
      const taskReferenceName = 'whileTaskRef_' + hash();
      return {
        name: 'whileTask',
        taskReferenceName: taskReferenceName,
        type: 'DO_WHILE',
        loopOver: [],
        loopCondition: `$.${taskReferenceName}['iteration'] < $.iterations`,
        inputParameters: {
          iterations: 10,
        },
        optional: false,
        startDelay: 0,
      };
    }
    case 'while_end': {
      return {
        name: 'whileTask_end',
        taskReferenceName: 'while_end' + hash(),
        type: 'WHILE_END',
        optional: false,
        startDelay: 0,
      };
    }
    case 'decision': {
      return {
        name: 'decisionTask',
        taskReferenceName: 'decisionTaskRef_' + hash(),
        inputParameters: {
          param: 'true',
        },
        type: 'DECISION',
        caseValueParam: 'param',
        decisionCases: {
          true: [],
        },
        defaultCase: [],
        optional: false,
        startDelay: 0,
      };
    }
    case 'lambda': {
      return {
        name: 'LAMBDA_TASK',
        taskReferenceName: 'lambdaTaskRef_' + hash(),
        type: 'LAMBDA',
        inputParameters: {
          lambdaValue: '${workflow.input.lambdaValue}',
          scriptExpression:
            'if ($.lambdaValue == 1) {\n  return {testvalue: true} \n} else { \n  return {testvalue: false}\n}',
        },
        optional: false,
        startDelay: 0,
      };
    }
    case 'js': {
      return {
        name: 'GLOBAL___js',
        taskReferenceName: 'lambdaJsTaskRef_' + hash(),
        type: 'SIMPLE',
        inputParameters: {
          lambdaValue: '${workflow.input.lambdaValue}',
          scriptExpression: `if ($.lambdaValue == 1) {
  return {testvalue: true};
} else {
  return {testvalue: false};
}`,
        },
        optional: false,
        startDelay: 0,
      };
    }
    case 'py': {
      return {
        name: 'GLOBAL___py',
        taskReferenceName: 'lambdaPyTaskRef_' + hash(),
        type: 'SIMPLE',
        inputParameters: {
          lambdaValue: '${workflow.input.lambdaValue}',
          scriptExpression: `if inputData["lambdaValue"] == "1":
  return {"testValue": True}
else:
  return {"testValue": False}`,
        },
        optional: false,
        startDelay: 0,
      };
    }
    case 'graphQL': {
      // graphQL task is a simple facade on top of HTTP task
      return {
        name: props.prefixHttpTask + 'HTTP_task',
        taskReferenceName: 'graphQLTaskRef_' + hash(),
        inputParameters: {
          http_request: {
            uri: '${workflow.input.uri}',
            method: 'POST',
            body: {
              variables: {},
              query: `query queryResourceTypes {
     QueryResourceTypes{
         ID
         Name
     }
 }`,
            },
            contentType: 'application/json',
            headers: {},
            timeout: 3600,
          },
        },
        optional: false,
        startDelay: 0,
        type: 'SIMPLE',
      };
    }
    case 'terminate': {
      return {
        name: 'TERMINATE_TASK',
        taskReferenceName: 'terminateTaskRef_' + hash(),
        inputParameters: {
          terminationStatus: 'COMPLETED',
          workflowOutput: 'Expected workflow output',
        },
        type: 'TERMINATE',
        startDelay: 0,
        optional: false,
      };
    }
    case 'http': {
      return {
        name: props.prefixHttpTask + 'HTTP_task',
        taskReferenceName: 'httpRequestTaskRef_' + hash(),
        inputParameters: {
          http_request: {
            uri: '${workflow.input.uri}',
            method: 'GET',
            contentType: 'application/json',
            headers: {},
            timeout: 3600,
          },
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false,
      };
    }
    case 'event': {
      return {
        name: 'EVENT_TASK',
        taskReferenceName: 'eventTaskRef' + hash(),
        inputParameters: {
          targetWorkflowId: '${workflow.input.targetWorkflowId}',
          targetTaskRefName: '${workflow.input.targetTaskRefName}',
          action: 'complete_task',
        },
        type: 'EVENT',
        sink: 'conductor',
        startDelay: 0,
        optional: false,
      };
    }
    case 'wait': {
      return {
        name: 'WAIT_TASK',
        taskReferenceName: 'waitTaskRef' + hash(),
        type: 'WAIT',
        startDelay: 0,
        optional: false,
      };
    }
    case 'raw': {
      return {
        name: 'RAW',
        inputParameters: {
          raw: '',
        },
      };
    }
    case 'dynamic_fork': {
      return {
        name: 'DYNAMIC_FORK',
        taskReferenceName: 'dynamicForkRef' + hash(),
        inputParameters: {
          expectedName: '${workflow.input.expectedName}',
          expectedType: 'SIMPLE',
          dynamic_tasks: '${workflow.input.dynamic_tasks}',
          dynamic_tasks_i: '${workflow.input.dynamic_tasks_i}',
        },
        type: 'SUB_WORKFLOW',
        startDelay: 0,
        subWorkflowParam: {
          name: 'Dynamic_fork',
          version: 1,
        },
        optional: false,
        asyncComplete: false,
      };
    }
    default:
      break;
  }
};

const favorites = props => {
  return props.workflows
    .map((wf, i) => {
      const wfObject = sub_workflow(wf);
      if (wf.description && wf.description.includes('FAVOURITE')) {
        return (
          <SideMenuItem
            key={`wf${i}`}
            model={{
              type: 'default',
              wfObject,
              name: wf.name,
            }}
            name={wf.name}
          />
        );
      }
    })
    .filter(item => item !== undefined);
};

const workflows = props => {
  return props.workflows.map((wf, i) => {
    const wfObject = sub_workflow(wf);
    return (
      <SideMenuItem
        key={`wf${i}`}
        model={{
          type: 'default',
          wfObject,
          name: wf.name,
        }}
        name={wf.name}
      />
    );
  });
};

const tasks = props => {
  return props.tasks.map((task, i) => {
    const wfObject = sub_task(task);
    return (
      <SideMenuItem
        key={`wf${i}`}
        model={{
          type: 'default',
          wfObject,
          name: task.name,
        }}
        name={task.name.replace(props.prefixHttpTask, '')}
      />
    );
  });
};

const system = props => {
  return props.system
    .filter(task => props.disabledTasks?.includes(task.name) == false)
    .map((task, i) => {
      const wfObject = systemTasks(task.name, props);
      return (
        <SideMenuItem
          key={`st${i}`}
          model={{
            type: task.name,
            wfObject,
            name: task.name,
          }}
          name={task.name.toUpperCase()}
          icon={icons(task)}
        />
      );
    });
};

const custom = (props, custom) => {
  return props.workflows
    .map((wf, i) => {
      const wfObject = sub_workflow(wf);
      if (wf.description && wf.description.includes(custom)) {
        return (
          <SideMenuItem
            key={`wf${i}`}
            model={{
              type: 'default',
              wfObject,
              name: wf.name,
            }}
            name={wf.name}
          />
        );
      }
    })
    .filter(item => item !== undefined);
};

const getCustoms = props => {
  return [
    ...new Set(
      props.workflows
        .map(wf => {
          const labels = jsonParse(wf.description)?.labels || [];
          return labels.filter(l => l.toLowerCase().includes('custom'));
        })
        .flat(),
    ),
  ];
};

const Sidemenu = props => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState([]);
  const [customs, setCustoms] = useState([]);
  const [open, setOpen] = useState();

  const getContent = useCallback(
    which => {
      switch (which) {
        case 'Workflows':
          setContent(workflows(props));
          break;
        case 'Favorites':
          setContent(favorites(props));
          break;
        case 'Tasks':
          setContent(tasks(props));
          break;
        case 'System Tasks':
          setContent(system(props));
          break;
        default:
          setContent(custom(props, which));
          break;
      }
    },
    [props],
  );

  useEffect(() => {
    setTimeout(() => setVisible(true), 1000);
    if (customs.length < 1) {
      setCustoms(getCustoms(props));
    }
    getContent(open);
  }, [props, customs.length, getContent, open]);

  const handleOpen = which => {
    if (which === open) {
      setOpen();
      return setExpanded(false);
    }
    getContent(which);
    props.openCard(which);
    setOpen(which);
    setExpanded(true);
  };

  const shortcutsInfo = () => {
    return (
      <Grid columns="equal" style={{ width: '350px' }}>
        <Grid.Column style={{ textAlign: 'right' }}>
          <p>
            Save <kbd>Ctrl</kbd>+<kbd>S</kbd>
          </p>
          <p>
            Zoom In <kbd>Ctrl</kbd>+<kbd>+</kbd>
          </p>
          <p>
            Zoom Out <kbd>Ctrl</kbd>+<kbd>-</kbd>
          </p>
          <p>
            Expand <kbd>Ctrl</kbd>+<kbd>X</kbd>
          </p>
        </Grid.Column>
        <Grid.Column style={{ textAlign: 'right' }}>
          <p>
            Delete <kbd>LMB</kbd>+<kbd>Delete</kbd>
          </p>
          <p>
            Lock <kbd>Ctrl</kbd>+<kbd>L</kbd>
          </p>
          <p>
            Execute <kbd>Alt</kbd>+<kbd>Enter</kbd>
          </p>
        </Grid.Column>
      </Grid>
    );
  };

  const handleLabelChange = (e, { _, value }) => {
    props.updateQuery(null, value);
  };

  return (
    <div style={{ zIndex: 11 }}>
      <Sidebar
        id="sidebar-primary"
        as={Menu}
        animation="overlay"
        onHide={() => setVisible(true)}
        visible={visible}
        vertical
        icon
      >
        <Menu.Item as="a" title="Workflows" active={open === 'Workflows'} onClick={() => handleOpen('Workflows')}>
          <Icon name="folder open" />
        </Menu.Item>
        <Menu.Item as="a" title="Tasks" active={open === 'Tasks'} onClick={() => handleOpen('Tasks')}>
          <Icon name="tasks" />
        </Menu.Item>
        <Menu.Item
          as="a"
          title="System Tasks"
          active={open === 'System Tasks'}
          onClick={() => handleOpen('System Tasks')}
        >
          <Icon name="code" />
        </Menu.Item>
        <Menu.Item as="a" title="Favorites" active={open === 'Favorites'} onClick={() => handleOpen('Favorites')}>
          <Icon name="favorite" />
        </Menu.Item>
        {customs.map((custom, i) => (
          <Menu.Item as="a" title={`${custom}`} active={open === custom} onClick={() => handleOpen(custom)}>
            {i + 1}
          </Menu.Item>
        ))}
        <div className="bottom">
          <Popup
            style={{ transform: 'translate3d(60px, 82vh, 0px)' }}
            basic
            content={shortcutsInfo}
            on="click"
            trigger={
              <Menu.Item as="a" title="Shortcuts">
                <Icon name="keyboard" />
              </Menu.Item>
            }
          />
          <Menu.Item
            as="a"
            title="Help"
            onClick={() =>
              window.open('https://docs.frinx.io/frinx-machine/workflow-builder/workflow-builder.html', '_blank')
            }
          >
            <Icon name="help circle" />
          </Menu.Item>
          <Menu.Item style={{ wordWrap: 'break-word', padding: '10px 0 10px 0' }}>
            <small>{version}</small>
          </Menu.Item>
        </div>
      </Sidebar>

      <Sidebar id="sidebar-secondary" as={Menu} animation="overlay" direction="left" vertical visible={expanded}>
        <div className="sidebar-header">
          <h3>{open}</h3>
          <Input fluid onChange={e => props.updateQuery(e.target.value, null)} icon="search" placeholder="Search..." />
          <br />
          <Dropdown
            placeholder="Labels"
            fluid
            multiple
            search
            selection
            onChange={handleLabelChange}
            options={[
              ...new Set(
                [open === 'Tasks' ? props.tasks : props.workflows]
                  .flat()
                  .map(wf => {
                    return jsonParse(wf.description)?.labels || null;
                  })
                  .flat()
                  .filter(item => item !== null),
              ),
            ].map((label, i) => {
              return { key: i, text: label, value: label };
            })}
          />
          <small>Combine search and labels to find {open ? open.toLowerCase() : 'workflows'}</small>
        </div>
        <Divider horizontal section>
          {content.length} results
        </Divider>
        <div className="sidebar-content">{content}</div>
      </Sidebar>
    </div>
  );
};

export default Sidemenu;
