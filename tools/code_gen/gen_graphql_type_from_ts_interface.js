const camelCase = require('lodash/camelCase');

const input = `
  ts: Date;
  sum_km: number;
  count: string;
  year: number;
  month: string;`;
for (const line of input.split('\n')) {
  if (line.trim() && line.includes(':')) {
    let l = line.trim();
    let name = l.match(/(\w+)\??:\s*(\w+)/)[1];
    let typeRaw = l.match(/(\w+)\??:\s*(\w+)/)[2];
    let type;
    let nullable = true;
    let typeMap = {
      Date: ['Date'],
      number: ['number', `{ type: 'float', nullable:true }`],
      json: ['() => GraphqlJson'],
    };
    type = typeMap[typeRaw] || ['string'];
    console.log(`\n@Field(${nullable ? '{ nullable: true }' : ''})`);

    console.log(`${name}: ${type[0] || ''};`);
  }
}
