// @flow
import React from "react";
import { Label } from "semantic-ui-react";
import { wfLabelsColor } from "../constants";

const WfLabels = props => {
  let color =
    props.index >= wfLabelsColor.length
      ? wfLabelsColor[0]
      : wfLabelsColor[props.index];
  return (
    <Label
      onClick={e => {
        e.stopPropagation();
        if (props.search) props.search();
      }}
      circular
      size="mini"
      style={{ backgroundColor: color, color: "white", cursor: "pointer" }}
      {...props}
    >
      <p>{props.label}</p>
    </Label>
  );
};

export default WfLabels;
