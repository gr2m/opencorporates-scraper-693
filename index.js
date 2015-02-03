/* global $ */
var START_URL = 'http://www.rbz.co.zw/publications/banksurveillance.asp';
var casper = require('casper').create({
  clientScripts: [
    './vendor/jquery.js'
  ]
});

casper.on('error', function(msg) {
    this.echo('error caught: ' + msg);
});
casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

console.log('loading ' + START_URL + ' ...');

casper.start(START_URL, function() {
    this.echo(this.getTitle());
});

casper.then(function() {
  var banks = this.evaluate(function() {
    var relevantDataGroups = [
      'Commercial Banks',
      'Merchant Banks',
      'Building Societies',
      'Savings Banks'
    ];
    var groups = {};
    var currentGroup;
    var $trList = $('h1 ~ table').eq(0).find('tr');
    $trList.each(function() {
      var $tr = $(this);
      var text = $tr.text().trim();
      var formlyKnownAs;
      var url;
      if (! text) {
        return;
      }
      if (text === '<< back') {
        return;
      }

      if ( $(this).find('td').is('[bgcolor="#666666"]') ) {
        currentGroup = text;
        return;
      }

      if (! currentGroup) {
        return;
      }

      if (text.match(/\((.*)?\)$/)) {
        formlyKnownAs = text.match(/\((.*)?\)$/).pop();
      }

      // http://stackoverflow.com/questions/8291651/get-full-url-from-a-hyperlink-using-jquery-javascript
      function qualifyURL(url){
          var img = document.createElement('img');
          img.src = url; // set string url
          url = img.src; // get qualified url
          img.src = null; // no server request
          return url;
      }

      url = qualifyURL($tr.find('a').attr('href'));
      groups[currentGroup] = groups[currentGroup] || [];
      groups[currentGroup].push({
        name: text.replace(/\s*\(.*$/, ''),
        formlyKnownAs: text.replace(/\s*\(.*$/, ''),
        type: currentGroup,
        url: url
      });
    });
    var banks = [];
    relevantDataGroups.forEach(function(groupName) {
      banks = banks.concat(groups[groupName]);
    });
    return banks;
  });



  console.log(banks.length + ' banks found');
  banks/*.slice(0,1)*/.forEach(scrapeBankDetailPage);
});

function scrapeBankDetailPage(bank) {
  console.log('opening ' + bank.name + ' at ' + bank.url + ' ...');
  casper.thenOpen(bank.url);
  casper.then(function() {
    var properties = this.evaluate(function() {
      var $trList = $('h1 ~ table + table tr');
      var bank = {};
      $trList.each(function() {
        var $tdList = $(this).find('td');
        var property = $tdList.eq(0).text().trim();
        var value = $tdList.eq(1).text();
        bank[property] = value;
      });

      return bank;
    });
    if (Object.keys(properties).length === 0) {
      console.log(JSON.stringify(bank));
    } else {
      properties.name = bank.name;
      properties.formlyKnownAs = bank.formlyKnownAs;
      properties.url = bank.url;
      console.log(JSON.stringify(properties));
    }
  });
}

// {
//   "formlyKnownAs": "Ecobank",
//   "name": "Ecobank",
//   "type": "Commercial Banks",
//   "url": "http://www.rbz.co.zw/operations/premier.asp"
// },
// {
//   "formlyKnownAs": "FBC Bank Limited",
//   "name": "FBC Bank Limited",
//   "type": "Commercial Banks",
//   "url": "http://www.rbz.co.zw/operations/fbc.asp"
// },
// {
//   "formlyKnownAs": "Interfin Banking Corporation Limited",
//   "name": "Interfin Banking Corporation Limited",
//   "type": "Commercial Banks",
//   "url": "http://www.rbz.co.zw/operations/interfin.asp"
// }

casper.run();
