import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Reconciliation } from "./Reconciliation";

@Entity("evidence_requests")
export class EvidenceRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "reconciliation_id" })
  reconciliation_id!: string;

  @ManyToOne(() => Reconciliation, reconciliation => reconciliation.evidence_requests, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reconciliation_id" })
  reconciliation!: Reconciliation;

  @Column({ type: "text" })
  message!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "pending"
  })
  status!: "pending" | "responded" | "canceled";

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}