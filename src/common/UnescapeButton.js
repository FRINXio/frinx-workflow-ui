import React, { useState } from 'react';
import unescapeJs from 'unescape-js';
import { Button } from 'semantic-ui-react';

const UnescapeButton = ({ target, size }) => {
  const [isUnescaped, setIsUnescaped] = useState(false);

  function doUnescape() {
    setIsUnescaped(!isUnescaped);

    if (!isUnescaped) {
      document.getElementById(target).setAttribute('data-escaped', document.getElementById(target).innerHTML);
      document.getElementById(target).innerHTML = unescapeJs(document.getElementById(target).innerHTML);
    } else {
      document.getElementById(target).innerHTML = document.getElementById(target).getAttribute('data-escaped');
    }
  }

  return (
    <Button size={size} compact onClick={() => doUnescape()}>
      {isUnescaped ? 'Escape' : 'Unescape'}
    </Button>
  );
};

export default UnescapeButton;
