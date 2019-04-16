import {Card, H5} from '@blueprintjs/core';
import * as React from 'react';
import Media from 'react-media';
import {Route} from 'react-router';
import {NewPathControl} from './new-path-control';
import {PathnameLabel} from './pathname-label';

interface HistoryConsumerProps {
  readonly idSpecifier: string;
}

export function HistoryConsumer({
  idSpecifier
}: HistoryConsumerProps): JSX.Element {
  return (
    <Card style={{margin: '20px'}}>
      <H5>History Consumer {idSpecifier.toUpperCase()}</H5>

      <Route>
        {({location}) => (
          <PathnameLabel
            idSpecifier={idSpecifier}
            pathname={location.pathname}
          />
        )}
      </Route>

      <Media query="(max-width: 370px)">
        {matches => (
          <Route>
            {({history}) => (
              <NewPathControl
                history={history}
                idSpecifier={idSpecifier}
                vertical={matches}
              />
            )}
          </Route>
        )}
      </Media>
    </Card>
  );
}
