import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { CashRegister } from "./CashRegister";
import { Sale } from "./Sale";

@Entity("deposits")
export class Deposit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "cash_register_id" })
  cash_register_id!: string;

  @ManyToOne(() => CashRegister, deposit => deposit.deposits, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cash_register_id" })
  cashRegister!: CashRegister;

  @Column({ name: "sale_id", nullable: true })
  sale_id!: string;

  @ManyToOne(() => Sale, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "sale_id" })
  sale!: Sale;

  @Column({ length: 100 })
  code!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: "deposit_date", type: "date" })
  deposit_date!: Date;

  @Column({ default: false })
  verified!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}