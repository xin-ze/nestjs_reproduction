const camelCase = require('lodash/camelCase');
const input = `
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @Column()
  driverId: string;

  @Column()
  cmtUserId: string;

  @Column()
  date: Date; // date the scores belongs to

  // cmt data
  @Column({ type: 'int', nullable: true })
  totalTrips: number; // cmt: trips

  @Column({ type: 'float', nullable: true })
  totalMileageKm: number; // cmt: km

  @Column({ type: 'float', nullable: true })
  totalExpense: number;
  // scores

  @Column({ type: 'float', nullable: true })
  overall: number;

  @Column({ type: 'float', nullable: true })
  accelerate: number; // cmt: accel

  @Column({ type: 'float', nullable: true })
  brake: number;

  @Column({ type: 'float', nullable: true })
  turn: number;

  @Column({ type: 'float', nullable: true })
  speeding: number;

  @Column({ type: 'float', nullable: true })
  distraction: number;

  // cmt data end

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  `;
for (const line of input.split('\n')) {
  if (line.trim() && line.includes(':')) {
    let l = line.trim();
    if (l.startsWith('@')) {
      continue;
    }
    console.log(line);
  }
}
