# strapi-provider-upload-cloudflare

## Resources

- [LICENSE](LICENSE)

## Links

- [Strapi website](https://strapi.io/)
- [Strapi documentation](https://docs.strapi.io)
- [Strapi community on Discord](https://discord.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)

## Installation

```bash
# using yarn
yarn add strapi-provider-upload-cloudflare

# using npm
npm install strapi-provider-upload-cloudflare
```

## Configurations

Your configuration is passed down to the provider.

See the [using a provider](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#using-a-provider) documentation for information on installing and using a provider. And see the [environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables) for setting and using environment variables in your configs.

### Provider Configuration

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'cloudflare',
      providerOptions: {
        accountId: env('STRAPI_UPLOAD_CLOUDFLARE_ACCOUNT_ID'),
        apiKey: env('STRAPI_UPLOAD_CLOUDFLARE_API_KEY'),
      },
    },
  },
  // ...
});
```

To find your Cloudflare accountId and apiKey, log into Cloudflare and click "Images". On that page you should see "Account ID" under Developer Resources. Additionally, if you click the "Use API" tab you'll see a link next to "API Token" to generate an apiKey. The only permission that API Token needs is "Account.Cloudflare Images".

If you have multiple image variants the first one will be selected. If you'd like to be able to pick a specific image variant, make an issue or pull-request. :) 

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'imagedelivery.net'],
          'media-src': ["'self'", 'data:', 'blob:', 'imagedelivery.net'],
          upgradeInsecureRequests: null,
        },
      },
    },
  }, 
  // ...
];
```