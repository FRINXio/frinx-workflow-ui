// @flow
export const jsonParse = json => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};
