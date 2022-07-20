'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const axios = require("axios");
const FormData = require("form-data");
const { Readable } = require('stream');

module.exports = {
  init(config) {
    const accountId = config.accountId;
    const apiKey = config.apiKey;
    const variant = config.variant;
    return {
      upload(file) {
        const stream = new Readable({
          read() {
            this.push(file.buffer);
            this.push(null);
          },
        })
        var data = new FormData();
        data.append("file", stream, `${file.hash}${file.ext}`);
        return axios({
          method: "POST",
          url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            ...data.getHeaders(),
          },
          data: data,
        }).then((response) => {
          const result = response.data.result;
          const filename = result.filename;
          const split = filename.split('.');
          const type = split.length > 0 ? split[split.length - 1] : '';
          let url = result.variants[0];
          if (variant && variant.length > 0) {
            url = `${url.split('/').slice(0, -1).join('/')}/${variant}`;
          }
          file.url = url;
          file.provider_metadata = {
            public_id: result.id,
            resource_type: type,
          };
          return file;
        });
      },
      delete(file) {
        const { public_id } = file.provider_metadata;
        return axios({
          method: "DELETE",
          url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${public_id}`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }).catch((error) => {
          if (error.status === 404) {
            console.log(`Image not found on Cloudflare: ${error.message}`);
          } else {
            throw new Error(`Error with deleting on Cloudflare: ${error.message}`);
          }
        });
      },
    };
  },
};