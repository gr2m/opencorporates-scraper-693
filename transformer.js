process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  var json;
  try {
    json = JSON.parse(data);

    // WE HAVE:
    // - name
    // - formelyKnownAs
    // - url
    // - Associate Companies
    // - Auditors
    // - Chairman
    // - Chief Executive Officer
    // - Date of establishment
    // - Email
    // - Fax
    // - Head Office
    // - History
    // - Number of branches
    // - Number of employees
    // - Ownership
    // - Postal Address
    // - Telephone
    // - Telex
    // - Type of bank
    // - Website

    // WE WANT: https://github.com/openc/openc-schema/blob/master/schemas/licence-schema.json
    // - sample_date
    // - start_date
    // - end_date
    // - source_jurisdiction
    // - company
    // - data

    var today = new Date().toJSON().substr(0, 10);
    var transformedData = {
      source_url: json.url,
      sample_date: today,
      source_jurisdiction: 'Zimbabwe',
      company: {
        name: json.name,
        jurisdiction: 'Zimbabwe',
        company_number: undefined,
        identifier: undefined
      },
      data: []
    };
    process.stdout.write(JSON.stringify(transformedData) + '\n');

  } catch(error) {
    // ignoring log messages not containing JSON
  }
});
