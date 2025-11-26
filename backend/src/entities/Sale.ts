import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CashRegister } from "./CashRegister";
import { Deposit } from "./Deposit";

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "cash_register_id" })
  cash_register_id!: string;

  @ManyToOne(() => CashRegister, cashRegister => cashRegister.sales, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cash_register_id" })
  cashRegister!: CashRegister;

  @OneToMany(() => Deposit, deposit => deposit.sale)
  deposits!: Deposit[];

  @Column({ type: "date" })
  sale_date!: Date;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  cash!: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  pix!: number;

  @Column({ name: "digital_wallets", type: "decimal", precision: 15, scale: 2, default: 0 })
  digital_wallets!: number;

  @Column({ name: "credit_card", type: "decimal", precision: 15, scale: 2, default: 0 })
  credit_card!: number;

  @Column({ name: "debit_card", type: "decimal", precision: 15, scale: 2, default: 0 })
  debit_card!: number;

  @Column({ name: "net_sales", type: "decimal", precision: 15, scale: 2, default: 0 })
  net_sales!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}