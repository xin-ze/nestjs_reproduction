const camelCase = require('lodash/camelCase');
const input = `
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  driveId: string; // cmt: driveid

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TripCategory, nullable: true })
  category: TripCategory;

  // cmt data

  @Column({ type: 'point', nullable: false, transformer: new PointTransformer() })
  start: LatLongPoint;

  @Column({ nullable: false })
  startTime: Date;

  @Column({ type: 'point', nullable: false, transformer: new PointTransformer() })
  end: LatLongPoint;

  @Column({ nullable: false })
  endTime: Date; // cms: end.ts

  @Column({ type: 'float', nullable: false })
  distanceKm: number;

  @Column({ type: 'point', array: true, transformer: new PointArrayTransformer() })
  waypoints: LatLongPoint[];

  // ratings

  @Column({ type: 'int', nullable: true })
  starRating: number;

  @Column({ type: 'int', nullable: true })
  starRatingAccel: number;

  @Column({ type: 'int', nullable: true })
  starRatingBrake: number;

  @Column({ type: 'int', nullable: true })
  starRatingTurn: number;

  @Column({ type: 'int', nullable: true })
  starRatingSpeeding: number;

  @Column({ type: 'int', nullable: true })
  starRatingPhoneMotion: number;

  // Expenses
  @Column({ type: 'int', nullable: true })
  expenseDeduction: number; // in cent

  @Column({ type: 'int', nullable: true })
  expenseParking: number; // in cent

  @Column({ type: 'int', nullable: true })
  expenseToll: number; // in cent

  @Column({ type: 'int', nullable: true })
  expenseGas: number; // in cent

  @Column({ array: true, nullable: true })
  receiptIds: string; // array of receipts' id, it's in another DB, so save id here

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Delete
  @DeleteDateColumn()
  archivedAt?: Date;

  @Column({ nullable: true })
  archiveReason?: string;

  // redundancy

  @OneToMany(() => TripRawEntity, (tripRaw) => tripRaw.trip)
  @JoinColumn()
  raw: TripRawEntity;`;

let nullable = false;
for (const line of input.split('\n')) {
  if (line.trim()) {
    let l = line.trim();
    if (l.startsWith('@')) {
      nullable = l.includes('nullable: true');
      continue;
    }
    if (line.includes(':')) {
      console.log(`\n@Field(${nullable ? '{ nullable: true }' : ''})`);
      console.log(line);
    }
  }
}
