# OIDC Demo

This project demonstrates how an OIDC login flow works
in a Crafting sandbox.

## About the Callback URL

Crafting sandbox is able to expose Endpoints which serve
the application as well as callbacks for OIDC auth flow.
However, the DNS names of endpoints are different per
sandboxes as they are named after the sandbox name.
For some OIDC providers, like Google, the configuration becomes
tricky as it requires exact match of the callback URL.
While other OIDC providers, like Okta, allow wildcard matching
on the callback hostname which makes it friendly to sandbox endpoints.

### Okta Configuration

When using Okta as OIDC provider, check the _Allow wildcard * in login URI redirect_
and enter something like following to the _Signin redirect URIs_:

- `https://*-ORG.sandboxes.run/PATH`

This will make this single configuration work with endpoints from all sandboxes in the
same org. And the endpoint must be _unauthenticated_, for example:

```yaml
endpoints:
- name: app
  http:
    routes:
    - path_prefix: /
      backend:
        ...
    auth_proxy:
      disabled: true # Make the endpoint unauthenticated, for callbacks.
```

The callback URL in the OIDC client config can be:

- `https://ENDPOINT--SANDBOX-ORG.sandboxes.run/PATH`

### Google Configuration

When using Google as OIDC provider, the callback URL must be matched exactly.
To support endpoints from multiple sandboxes, set the endpoints to the _PASSTHROUGH_ mode
and use a single callback URL in Google's config:

- `https://login.sandboxes.cloud/oauth/callback`

And enable the _PASSTHROUGH_ mode in the endpoint:

```yaml
endpoints:
- name: app
  http:
    routes:
    - path_prefix: /
      backend:
        ...
    auth_proxy:
      mode: PASSTHROUGH
      oauth_callback_path: /auth/google # can be something else, just path.
```

In the OIDC client config, only set callback URL to `https://login.sandboxes.cloud/oauth/callback`.

## About this Demo

This demo provides both configurations for Okta and Google.
From [template.yaml](.sandbox/template.yaml), 2 endpoints are defined:

- `app`: the regular, unauthenticated endpoint, used for Okta callback (must use wildcard in Okat config);
- `google`: the _PASSTHROUGH_ endpoint, specially used for Google callback.

The template will use secrets for Okta and Google configuration.

For example, `okta.conf`:

```json
{
    "domain": "dev-123456.okta.com",
    "clientID": "abcd.....",
    "clientSecret": "3Def....."
}
```

and `google.conf`:

```json
{
    "clientID": "1234567890-dsfadsrf.....apps.googleusercontent.com",
    "clientSecret": "GOG..-abcd............"
}
```

Create secrets from these config files:

```sh
cs secret create --shared okta-oidc-conf -f okta.conf
cs secret create --shared google-oidc-conf -f google.conf
```

Launch a sandbox (assume name `oidc-demo` in org `foo`) from the template, and visit:
- `https://app--oidc-demo-foo.sandboxes.run/login/okta` for Okta login flow;
- `https://google--oidc-demo-foo.sandboxes.run/login/google` for Google login flow.
