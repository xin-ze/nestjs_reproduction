const input = `
  id: String!
  driveId: String!
  userId: String!
  category: TripCategory
  start: JSON!
  startTime: DateTime!
  end: JSON!
  endTime: DateTime!
  distanceKm: Float!
  waypoints: [JSON!]
  starRating: Float
  starRatingAccel: Float
  starRatingBrake: Float
  starRatingTurn: Float
  starRatingSpeeding: Float
  starRatingPhoneMotion: Float
  expenseDeduction: Float
  expenseParking: Float
  expenseToll: Float
  expenseGas: Float
  receiptIds: [String!]
  createdAt: DateTime!
  updatedAt: DateTime
  archivedAt: DateTime
  archiveReason: String`;
for (const line of input.split('\n')) {
  if (line.trim() && line.includes(':')) {
    let l = line.trim();
    let name = l.match(/(\w+)\??:\s*(.+)/)[1];
    let typeRaw = l.match(/(\w+)\??:\s*(.+)/)[2];
    let typePure = typeRaw.replace(/\W/, '');
    // console.log(name, typeRaw);
    let type;
    let typeMap = {
      Float: 'GraphQLFloat',
      String: 'GraphQLString',
      DateTime: 'GraphQLString',
      JSON: 'GraphQLJSON',
      Boolean: 'GraphQLBoolean',
    };
    type = typeMap[typePure] || ['GraphQLString'];
    if (typeRaw.includes('!')) {
      type = `new GraphQLNonNull( ${type} )`;
    }
    if (typeRaw.includes('[')) {
      type = `new GraphQLList( ${type} )`;
    }
    console.log(`${name}: { type:  ${type}},`);
  }
}
