const camelCase = require('lodash/camelCase');

const input = `

\ttotalExpense: number;
\ttotalMileage: number;
\ttotalTripsCnt: number;
\tprimaryCarID: string;
\tworkHours: json;`;
for (const line of input.split('\n')) {
  if (line.trim() && line.includes(':')) {
    let l = line.trim();
    let name = l.match(/(\w+)\??:\s*(\w+)/)[1];
    let typeRaw = l.match(/(\w+)\??:\s*(\w+)/)[2];
    let type;
    let typeMap = {
      Date: ['Date'],
      number: ['number', `{ type: 'float', nullable:true }`],
      json: ['() => GraphqlJson'],
    };
    type = typeMap[typeRaw] || ['string'];
    console.log(`\n  @Column(${type[1] || ''})
  ${camelCase(name)}: ${type[0] || ''};`);
  }
}
