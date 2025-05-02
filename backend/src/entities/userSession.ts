import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { User } from './users';
  
  @Entity({ name: 'UserSession', synchronize: true })
  export class UserSession {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
    user: User;
  
    @Column({ type: 'varchar', length: 500 })
    jwtToken: string;
  
    @Column({ type: 'varchar', length: 50 })
    ipAddress: string;
  
    @Column({ type: 'varchar', length: 255 })
    userAgent: string;
  
    @Column({ type: 'boolean', default: true })
    isActive: boolean;
  
    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;
  
    @Column({ type: 'datetime' })
    lastActiveAt: Date;
  }
  