import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CashRegister } from "./CashRegister";
import { Reconciliation } from "./Reconciliation";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 14, unique: true, nullable: true })
  cnpj!: string;

  @Column({ type: "text", nullable: true })
  address!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => CashRegister, cashRegister => cashRegister.store)
  cashRegisters!: CashRegister[];

  @OneToMany(() => Reconciliation, reconciliation => reconciliation.store)
  reconciliations!: Reconciliation[];
}