import { RoleEnum } from '../utils/roleEnum';
import * as bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { UserSession } from './userSession';

@Entity({ name: 'User', synchronize: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.User })
  role: RoleEnum;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @BeforeInsert()
  async hashPassword() {
    if(this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds)
    }
  }

}