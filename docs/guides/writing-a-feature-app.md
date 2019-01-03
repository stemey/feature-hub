---
id: writing-a-feature-app
title: Writing a Feature App
sidebar_label: Writing a Feature App
---

A Feature App is described by a consumer definition object. It consists of an
`id`, an optional `dependencies` object, and a `create` method:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  dependencies: {
    'acme:some-feature-service': '^2.0'
  },

  create(env) {
    // ...
  }
};
```

If a Feature App module is to be loaded asynchronously with the
`FeatureAppManager` or React `FeatureAppLoader`, it must provide a definition
object as its default export:

```js
export default myFeatureAppDefinition;
```

## `id`

It is recommended to use namespaces for the Feature App ID to avoid naming
conflicts, e.g. `'acme:my-feature-app'`. This ID is used to look up the config
for a Feature App. Furthermore, it is used as a consumer ID for
[binding][feature-service-binder] the required Feature Services to the dependent
Feature App.

## `dependencies`

Required Feature Services are declared with their ID and a [semver][semver]
version string, e.g. `{'acme:some-feature-service': '^2.0'}`.

## `create`

The `create` method takes the single argument `env`, which has the following
properties:

1. `config` — A Feature App config object that is [provided][providing-configs]
   by the integrator:

   ```js
   const myFeatureAppDefinition = {
     id: 'acme:my-feature-app',

     create(env) {
       const {foo} = env.config;

       // ...
     }
   };
   ```

1. `featureServices` — An object of required Feature Services that are
   [semver-compatible][semver] with the declared dependencies in the Feature App
   definition:

   ```js
   const myFeatureAppDefinition = {
     id: 'acme:my-feature-app',

     dependencies: {
       'acme:some-feature-service': '^2.0'
     },

     create(env) {
       const someFeatureService =
         env.featureServices['acme:some-feature-service'];

       someFeatureService.foo(42);

       // ...
     }
   };
   ```

1. `idSpecifier` — An optional [ID specifier][idspecifier] that distinguishes
   the Feature App instance from other Feature App instances with the same ID.

The return value of the `create` method can vary depending on the integration
solution used. Assuming the [`@feature-hub/react` package][react-api] is used, a
Feature App can be either a **React Feature App** or a **DOM Feature App**.

### React Feature App

A React Feature App definition's `create` method returns a Feature App instance
with a `render` method that itself returns a `ReactNode`:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  create(env) {
    return {
      render() {
        return <div>Foo</div>;
      }
    };
  }
};
```

**Note:** Since this element is directly rendered by React, the standard React
lifecyle methods can be used (if `render` returns an instance of a React
`ComponentClass`).

### DOM Feature App

A DOM Feature App definition's `create` method returns a Feature App instance
with an `attachTo` method that accepts a DOM container element:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  create(env) {
    return {
      attachTo(container) {
        container.innerText = 'Foo';
      }
    };
  }
};
```

This type of Feature App allows the use of other frontend technologies such as
Vue.js or Angular, although React is used as an integration solution.

## `ownFeatureServiceDefinitions`

A Feature App can also register its own Feature Services by declaring
`ownFeatureServiceDefinitions`:

```js
import {myFeatureServiceDefinition} from './my-feature-service';
```

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  dependencies: {
    'acme:my-feature-service': '^1.0'
  },

  ownFeatureServiceDefinitions: [myFeatureServiceDefinition],

  create(env) {
    const myFeatureService = env.featureServices['acme:my-feature-service'];

    // ...
  }
};
```

This technique allows teams to quickly get Feature Apps off the ground, without
being dependent on the integrator. However, as soon as other teams need to use
this Feature Service, it should be published and included in the global set of
Feature Services by the integrator.

**Note:** If the Feature Service to be registered has already been registered,
the new Feature Service is ignored and a warning is emitted.

[feature-service-binder]:
  /docs/guides/writing-a-feature-service#feature-service-binder
[idspecifier]: /docs/guides/integrating-the-feature-hub#idspecifier
[providing-configs]: /docs/guides/integrating-the-feature-hub#providing-configs
[react-api]: https://feature-hub.netlify.com/@feature-hub/react/
[semver]: https://semver.org