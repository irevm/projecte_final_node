import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export const USER_ROLES = ['admin', 'member'] as const;
export type UserRole = (typeof USER_ROLES)[number];
// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: UserRole;
//   active: boolean;
//   createdAt: string;
// }
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  role!: UserRole;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn() //CreateDateColumn
  createdAt!: Date;
}
