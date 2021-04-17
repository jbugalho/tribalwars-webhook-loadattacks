const express = require('express');
const webhook = require('webhook-discord');
const dotenv = require('dotenv').config();
const hook = new webhook.Webhook(process.env.WEBHOOK_URL);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  var infos = req.body.attacks;
  var msg = '';
  console.log('Updating attack information!');
  for (var i = 0; i < infos.length; i++) {
    console.log(
      `Recieved info from ${infos[i].nome}, is recieving ${infos[i].numAtaques} attacks!`
    );
    msg += `O jogador ${infos[i].nome} está a levar ${infos[i].numAtaques} ataques!\n`;
  }
  hook.info('VT@', msg);
});

app.listen(PORT, (req, res) => {
  console.log('Server is up');
  console.log(`Pinging to webhook server: ${process.env.WEBHOOK_URL}`);
});
