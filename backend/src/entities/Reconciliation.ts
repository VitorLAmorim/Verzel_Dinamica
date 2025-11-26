import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Store } from "./Store";
import { Analyst } from "./Analyst";
import { EvidenceRequest } from "./EvidenceRequest";

@Entity("reconciliations")
export class Reconciliation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "store_id" })
  store_id!: string;

  @ManyToOne(() => Store, store => store.reconciliations, { onDelete: "CASCADE" })
  @JoinColumn({ name: "store_id" })
  store!: Store;

  @Column({ name: "analyst_id", nullable: true })
  analyst_id!: string;

  @ManyToOne(() => Analyst, { nullable: true })
  @JoinColumn({ name: "analyst_id" })
  analyst!: Analyst;

  @Column({ type: "date" })
  date!: Date;

  @Column({
    type: "varchar",
    length: 20,
    default: "open"
  })
  status!: "open" | "closed" | "pending_return" | "not_integrated";

  @Column({ type: "text", nullable: true })
  notes!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => EvidenceRequest, evidenceRequest => evidenceRequest.reconciliation)
  evidence_requests!: EvidenceRequest[];
}