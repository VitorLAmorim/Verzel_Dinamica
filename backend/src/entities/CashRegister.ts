import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Unique } from "typeorm";
import { Store } from "./Store";
import { Sale } from "./Sale";
import { Deposit } from "./Deposit";

@Entity("cash_registers")
@Unique(["store_id", "date"])
export class CashRegister {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "store_id" })
  store_id!: string;

  @ManyToOne(() => Store, store => store.cashRegisters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "store_id" })
  store!: Store;

  @Column({ type: "date" })
  date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Sale, sale => sale.cashRegister, { cascade: true })
  sales!: Sale[];

  @OneToMany(() => Deposit, deposit => deposit.cashRegister, { cascade: true })
  deposits!: Deposit[];
}