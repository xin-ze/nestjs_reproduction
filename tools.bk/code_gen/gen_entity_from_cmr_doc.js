const camelCase = require('lodash/camelCase');

const input = `        user_id: <string>
        date: <date>
        trips: <integer>
        km: <float>
        overall: <float>
        accel: <float>
        brake: <float>
        turn: <float>
        speeding: <float>
        distraction: <float>`;
for (const line of input.split('\n')) {
  if (line.trim() && line.includes(':')) {
    let l = line.trim();
    let name = l.match(/(\w+):\s*<(\w+)>/)[1];
    let typeRaw = l.match(/(\w+):\s*<(\w+)>/)[2];
    let type;
    let typeMap = {
      date: ['Date'],
      float: ['number', `{ type: 'float', nullable:true }`],
      integer: ['number', `{ type: 'int', nullable:true }`],
    };
    type = typeMap[typeRaw] || ['string'];
    console.log(`\n  @Column(${type[1] || ''})
  ${camelCase(name)}: ${type[0] || ''};`);
  }
}
