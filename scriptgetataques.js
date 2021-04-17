/* Tamper

// ==UserScript==
// @name         Load Ataques da Tribo para Discord Webhook
// @namespace    http://tampermonkey.net/
// @version      1
// @description   Load Ataques da Tribo
// @author       Bugalho aka Makavelii - Bugalho#1234
// @match        https://*.tribalwars.com.pt/game.php?*village=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    javascript:$.getScript('https://dl.dropbox.com/s/ikunxd5d59059b4/scriptMostrarAtaquesACaminho.js?dl=0');void(0);
})();

*/

// function from https://forum.tribalwars.net/index.php?members/shinko-to-kuma.121220/
$.getAll = function (
  urls, // array of URLs
  onLoad, // called when any URL is loaded, params (index, data)
  onDone, // called when all URLs successfully loaded, no params
  onError // called when a URL load fails or if onLoad throws an exception, params (error)
) {
  var numDone = 0;
  var lastRequestTime = 0;
  var minWaitTime = 200; // ms between requests
  loadNext();

  function loadNext() {
    if (numDone == urls.length) {
      onDone();
      return;
    }

    let now = Date.now();
    let timeElapsed = now - lastRequestTime;
    if (timeElapsed < minWaitTime) {
      let timeRemaining = minWaitTime - timeElapsed;
      setTimeout(loadNext, timeRemaining);
      return;
    }
    console.log('Getting ', urls[numDone]);
    $('#progress').css('width', `${((numDone + 1) / urls.length) * 100}%`);
    $('#progress')[0].innerText = numDone + ' / ' + urls.length;
    lastRequestTime = now;
    $.get(urls[numDone])
      .done((data) => {
        try {
          onLoad(numDone, data);
          ++numDone;
          loadNext();
        } catch (e) {
          onError(e);
        }
      })
      .fail((xhr) => {
        onError(xhr);
      });
  }
};

function loadAtaques() {
  var info = {
    attacks: [],
  };
  console.log('novo');
  var content = `<div class="popup_box_container">
      <table class="vis"><tbody>
      <tr><th width="280" class="nowrap">Nome</th><th width="40" class="nowrap">Ataques</th></tr>
      </tbody></table>
      </div>`;
  Dialog.show('Supportfilter', content);

  $('.popup_box')
    .eq(0)
    .prepend(
      `<div id="progressbar" style="width: 100%; background-color: #4CAF50;"><div id="progress" style="width: 0%; height: 35px; background-color: #ffb438; text-align: center; line-height: 32px; color: black;"></div> </div>`
    );

  var linksAtaquesMembros = [];
  var urlGeral =
    '/game.php?village=' +
    game_data.village.id +
    '&screen=ally&mode=members_troops';
  if (game_data.player.sitter != '0') {
    urlGeral += '&t=' + game_data.player.id;
  }
  $.get(urlGeral)
    .done((data) => {
      var options = $(data).find('.input-nicer option:not([disabled])');
      var values = $.map(options, function (option) {
        var url =
          '/game.php?screen=ally&mode=members_troops&player_id=' +
          option.value +
          '&village=' +
          game_data.village.id +
          '';
        if (game_data.player.sitter != '0') {
          url += '&t=' + game_data.player.id;
        }
        linksAtaquesMembros.push(url);
        return option.value;
      });

      $.getAll(
        linksAtaquesMembros,
        (i, data) => {
          // para quem tem permissoes document.querySelector()
          var nCol = 0;
          if (game_data.units.includes('archer')) {
            nCol = 16;
          } else nCol = 14;

          var numAtaques = -1;
          if (
            $(data).find(
              '#ally_content > div > div > table > tbody > tr:nth-child(1) > th:nth-child(2) > strong'
            )[0]
          ) {
            numAtaques = $(data)
              .find(
                '#ally_content > div > div > table > tbody > tr:nth-child(1) > th:nth-child(2) > strong'
              )[0]
              .innerText.replace('(', '')
              .replace(')', '');
          } else if (
            $(data).find(
              '#ally_content > div > div > table > tbody > tr:nth-child(1) > th:nth-child(' +
                nCol +
                ') > strong'
            )[0]
          ) {
            numAtaques = $(data)
              .find(
                '#ally_content > div > div > table > tbody > tr:nth-child(1) > th:nth-child(' +
                  nCol +
                  ') > strong'
              )[0]
              .innerText.replace('(', '')
              .replace(')', '');
          }

          if (numAtaques != -1 && numAtaques > 0) {
            $(
              '#popup_box_Supportfilter > div.popup_box_content > div > table > tbody'
            ).eq(0).append(`
                      <tr class="row_${i % 2 == 0 ? 'a' : 'b'}">
                          <td class="lit-item">
                              <a target="_blank" href="/game.php?village=${
                                game_data.village.id
                              }&screen=info_player&id=${values[i]}">${$(data)
              .find('.input-nicer option:selected')
              .text()
              .trim()}</a>
                          </td>
                          <td ${
                            numAtaques > 0
                              ? 'style="background-color: #ff7575;"'
                              : ''
                          } class="lit-item"><b>(${numAtaques})</b></td>
                      </tr>`);

            var object = {
              nome: $(data).find('.input-nicer option:selected').text().trim(),
              numAtaques: numAtaques,
            };
            console.log(object);
            info.attacks.push(object);
          }
        },
        () => {
          console.log('uploading to bot');
          $.ajax({
            url: '', //put here the server url
            type: 'POST',
            ContentType: 'application/json',
            cors: true,
            data: $.param(info),
            complete: function (response) {},
          });
          $('#progress')[0].innerText = 'Tudo carregado! xd';
        },
        () => console.log('Terminou com erro!')
      );
      console.log('before the load');
    })
    .fail((xhr) => {
      onError(xhr);
    });
}

var missao = `<div class="quest opened" id="mostrarAtaques" style="background-color: #1bff12;background-image: url('https://dspt.innogamescdn.com/asset/${
  game_data.version.split(' ')[0]
}/graphic/unit/att.png');"><div class="quest_progress"></div><div class="quest_new pt">Novo</div></div>`;
$('.questlog').eq(0).prepend(missao);
var ataques = document.querySelector('#mostrarAtaques');
if (ataques) {
  ataques.addEventListener('click', loadAtaques, false);
}
