import {Button, ControlGroup, InputGroup} from '@blueprintjs/core';
import {History} from 'history';
import * as React from 'react';

export interface NewPathControlProps {
  readonly history: History;
  readonly idSpecifier: string;
  readonly vertical?: boolean;
}

export function NewPathControl({
  history,
  idSpecifier,
  vertical
}: NewPathControlProps): JSX.Element {
  const inputElement = React.useRef<HTMLInputElement | null>(null);

  const changePath = (method: 'push' | 'replace') => {
    if (!inputElement.current) {
      return;
    }

    history[method](inputElement.current.value);
    inputElement.current.value = '';
  };

  return (
    <ControlGroup vertical={vertical}>
      <InputGroup
        id={`new-path-${idSpecifier}`}
        placeholder="Enter a new path..."
        inputRef={ref => (inputElement.current = ref)}
      />
      <Button
        id={`push-${idSpecifier}`}
        text="Push"
        onClick={() => changePath('push')}
      />
      <Button
        id={`replace-${idSpecifier}`}
        text="Replace"
        onClick={() => changePath('replace')}
      />
    </ControlGroup>
  );
}
