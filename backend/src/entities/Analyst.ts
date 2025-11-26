import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Reconciliation } from "./Reconciliation";

@Entity("analysts")
export class Analyst {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 200, unique: true })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Reconciliation, reconciliation => reconciliation.analyst)
  reconciliations!: Reconciliation[];
}