// tslint:disable:no-implicit-dependencies

import {FeatureAppEnvironment, FeatureServiceBinder} from '@feature-hub/core';
import {stubMethods} from 'jest-stub-methods';
import {
  AsyncSsrManagerConfig,
  AsyncSsrManagerV0,
  asyncSsrManagerDefinition
} from '..';
import {useFakeTimers} from './use-fake-timers';

describe('asyncSsrManagerDefinition', () => {
  let mockEnv: FeatureAppEnvironment<AsyncSsrManagerConfig, {}>;

  beforeEach(() => {
    mockEnv = {
      config: {timeout: 5},
      featureServices: {},
      idSpecifier: undefined
    };
  });

  it('defines an id', () => {
    expect(asyncSsrManagerDefinition.id).toBe('s2:async-ssr-manager');
  });

  it('has no dependencies', () => {
    expect(asyncSsrManagerDefinition.dependencies).toBeUndefined();
    expect(asyncSsrManagerDefinition.optionalDependencies).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 0.1', () => {
      const sharedAsyncSsrManager = asyncSsrManagerDefinition.create(mockEnv);

      expect(sharedAsyncSsrManager['0.1']).toBeDefined();
    });

    for (const invalidConfig of [null, {timeout: false}]) {
      describe(`with an invalid config ${JSON.stringify(
        invalidConfig
      )}`, () => {
        it('throws an error', () => {
          expect(() =>
            asyncSsrManagerDefinition.create({
              featureServices: {},
              config: invalidConfig
            })
          ).toThrowError(new Error('The Async SSR Manager config is invalid.'));
        });
      });
    }
  });

  describe('AsyncSsrManagerV0', () => {
    let asyncSsrManagerBinder: FeatureServiceBinder<AsyncSsrManagerV0>;

    beforeEach(() => {
      asyncSsrManagerBinder = asyncSsrManagerDefinition.create(mockEnv)['0.1'];
    });

    describe('rendering', () => {
      const createAsyncSsrManagerConsumer = (consumerUid: string) => {
        const asyncSsrManager = asyncSsrManagerBinder(consumerUid)
          .featureService;

        let firstRender = true;

        const render = () => {
          if (firstRender) {
            firstRender = false;
            asyncSsrManager.rerenderAfter(Promise.resolve());
          }
        };

        return {render};
      };

      describe('with an integrator as the only consumer', () => {
        it('resolves with the result of the given render function after the first render pass', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');
          const html = await asyncSsrManager.renderUntilCompleted(mockRender);

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });
      });

      describe('with an integrator, and a consumer that triggers a rerender', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer = createAsyncSsrManagerConsumer(
            'test:consumer'
          );

          const mockRender = jest.fn(() => {
            asyncSsrManagerConsumer.render();

            return 'testHtml';
          });

          const html = await asyncSsrManagerIntegrator.renderUntilCompleted(
            mockRender
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and two consumers that both trigger a rerender in the first render pass', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer1 = createAsyncSsrManagerConsumer(
            'test:consumer:1'
          );

          const asyncSsrManagerConsumer2 = createAsyncSsrManagerConsumer(
            'test:consumer:2'
          );

          const mockRender = jest.fn(() => {
            asyncSsrManagerConsumer1.render();
            asyncSsrManagerConsumer2.render();

            return 'testHtml';
          });

          const html = await asyncSsrManagerIntegrator.renderUntilCompleted(
            mockRender
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('when the given render function throws an error', () => {
        it('rejects with the error', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockError = new Error('Failed to render.');

          const mockRender = jest.fn(() => {
            throw mockError;
          });

          return expect(
            asyncSsrManager.renderUntilCompleted(mockRender)
          ).rejects.toEqual(mockError);
        });
      });

      describe('when rendering takes longer than the configured timeout', () => {
        it('rejects with an error after the configured timeout', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => {
            asyncSsrManager.rerenderAfter(new Promise<void>(() => undefined));

            return 'testHtml';
          });

          return expect(
            useFakeTimers(
              async () => asyncSsrManager.renderUntilCompleted(mockRender),
              5
            )
          ).rejects.toEqual(new Error('Got rendering timeout after 5 ms.'));
        });
      });

      describe('when no timeout is configured', () => {
        beforeEach(() => {
          asyncSsrManagerBinder = asyncSsrManagerDefinition.create({
            config: undefined,
            featureServices: {}
          })['0.1'];
        });

        it('logs a warning', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');
          const stubbedConsole = stubMethods(console);

          await useFakeTimers(async () =>
            asyncSsrManager.renderUntilCompleted(mockRender)
          );

          expect(console.warn).toHaveBeenCalledWith(
            'No timeout is configured for the Async SSR Manager. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!'
          );

          stubbedConsole.restore();
        });
      });
    });
  });
});