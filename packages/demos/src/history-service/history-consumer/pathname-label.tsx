import {InputGroup, Label} from '@blueprintjs/core';
import * as React from 'react';

export interface PathnameLabelProps {
  readonly idSpecifier: string;
  readonly pathname: string;
}

export function PathnameLabel({
  idSpecifier,
  pathname
}: PathnameLabelProps): JSX.Element {
  return (
    <Label>
      Pathname
      <InputGroup id={`pathname-${idSpecifier}`} value={pathname} disabled />
    </Label>
  );
}
