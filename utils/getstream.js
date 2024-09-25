const { StreamVideoClient, StreamClient } = require("@stream-io/node-sdk")
require("dotenv").config()

const apiKey = process.env.GETSTREAM_API_KEY
const secret = process.env.GETSTREAM_API_SECRET

const client = new StreamClient(apiKey, secret, { timeout: 6000 });

const createStreamUser = async (data) => {
     const newUser = {
          id: data.id,
          role: 'user',
          custom: {
               username: data.username,
          },
          name: data.name,
          image: process.env.SERVER_ORIGINAL_URL + data.image,
     };
     await client.upsertUsers({
          users: {
               [newUser.id]: newUser,
          },
     });
     return { newUser, create: true };
}

const createStreamToken = async (userId) => {
     // token time 10 hours
     const time = Math.floor(Date.now() / 1000) + 36000;
     const token = client.createToken(userId, time);
     return token;
}

module.exports = { createStreamUser, createStreamToken };