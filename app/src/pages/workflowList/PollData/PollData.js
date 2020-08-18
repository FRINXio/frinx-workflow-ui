import React, { useState, useEffect, useContext } from "react";
import { Table, Input, Icon } from "semantic-ui-react";
import moment from "moment";
import { HttpClient as http } from "../../../common/HttpClient";
import { GlobalContext } from "../../../common/GlobalContext";
import {sortAscBy, sortDescBy} from "../workflowUtils";

function PollData() {
  const global = useContext(GlobalContext);
  const [data, setData] = useState([]);
  const [sorted, setSorted] = useState(false);
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    http.get(global.backendApiUrlPrefix + "/queue/data").then((data) => {
      if (data.polldata) {
        setData(data.polldata);
      }
    });
  }, []);

  const sortArray = (key) => {
    let sortedArray = data;

    sortedArray.sort(sorted ? sortDescBy(key) : sortAscBy(key));
    setSorted(!sorted);
    setData(sortedArray);
  };

  const filteredRows = () => {
    const results = !keywords
      ? data
      : data.filter((e) => {
          let searchedKeys = ["queueName", "qsize", "lastPollTime", "workerId"];

          for (let i = 0; i < searchedKeys.length; i += 1) {
            if (searchedKeys[i] === "lastPollTime") {
              if (
                moment(e[searchedKeys[i]])
                  .format("MM/DD/YYYY, HH:mm:ss:SSS")
                  .toString()
                  .toLowerCase()
                  .includes(keywords.toLocaleLowerCase())
              ) {
                return true;
              }
            }
            if (
              e[searchedKeys[i]]
                .toString()
                .toLowerCase()
                .includes(keywords.toLocaleLowerCase())
            ) {
              return true;
            }
          }
          return false;
        });

    return results.map((e) => {
      return (
        <Table.Row key={e.queueName}>
          <Table.Cell>{e.queueName}</Table.Cell>
          <Table.Cell>{e.qsize}</Table.Cell>
          <Table.Cell>
            {moment(e.lastPollTime).format("MM/DD/YYYY, HH:mm:ss:SSS")}
          </Table.Cell>
          <Table.Cell>{e.workerId}</Table.Cell>
        </Table.Row>
      );
    });
  };

  const pollTable = () => {
    return (
      <Table celled compact sortable color="blue">
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell onClick={() => sortArray("queueName")}>
              Name (Domain)
            </Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray("qsize")}>
              Size
            </Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray("lastPollTime")}>
              Last Poll Time
            </Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray("workerId")}>
              Last Polled By
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{filteredRows()}</Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="4"></Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  };

  return (
    <div>
      <Input iconPosition="left" fluid icon placeholder="Search...">
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)(e)}
        />
        <Icon name="search" />
      </Input>
      {pollTable()}
    </div>
  );
}

export default PollData;
