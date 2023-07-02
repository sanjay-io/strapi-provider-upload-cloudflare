'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const axios = require("axios");

function upload(config, file) {
  return axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/images/v1`,
    {
      file: file.stream || file.buffer
    }, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'multipart/form-data',
      }
    }
  ).then((response) => {
    const result = response.data.result;
    const filename = result.filename;
    const split = filename.split('.');
    const type = split.length > 0 ? split[split.length - 1] : '';
    let url = result.variants[0];
    if (config.variant && config.variant.length > 0) {
      url = `${url.split('/').slice(0, -1).join('/')}/${config.variant}`;
    }
    file.url = url;
    file.provider_metadata = {
      public_id: result.id,
      resource_type: type,
    };
    return file;
  });
}

module.exports = {
  init(config) {
    return {
      upload: (file) => upload(config, file),
      uploadStream: (file) => upload(config, file),
      delete: (file) => axios({
        method: "DELETE",
        url: `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/images/v1/${(file.provider_metadata.public_id)}`,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }).catch((error) => {
        if (error.status === 404) {
          console.log(`Image not found on Cloudflare: ${error.message}`);
        } else {
          throw new Error(`Error with deleting on Cloudflare: ${error.message}`);
        }
      }),
    };
  },
};
