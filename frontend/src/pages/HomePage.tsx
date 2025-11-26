import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";

interface Closure {
	store_id: number;
	store_name: string;
	date: string;
	total_sales: number;
	total_deposits: number;
	balance: number;
	reconciliation_status: string;
	has_register: boolean;
}

export default function HomePage() {
	const [closures, setClosures] = useState<Closure[]>([]);

	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

    const today = new Date().toISOString().split("T")[0];

	useEffect(() => {
		axios
			.get(`${API_URL}/stores/closure?date=${today}`)
			.then((res) => {
				setClosures(res.data.closures);
			})
			.catch((err) => console.error("Erro ao buscar dados:", err));
	}, []);

	return (
		<div className="min-h-screen bg-[#10143B] text-white p-6">
			<header className="flex justify-between items-center mb-10">
				<img src="/images/logo.png" alt="logo" className="w-20" />
				<h1 className="text-2xl font-semibold">Conciliação de Caixas</h1>

				<div className="flex gap-3">
					<button className="bg-black text-white px-4 py-2 rounded shadow hover:bg-white hover:text-black transition">Filtrar por data</button>
					<button className="bg-black text-white px-4 py-2 rounded shadow hover:bg-white hover:text-black transition">Filtrar por Situação</button>
				</div>
			</header>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
				{closures.map((c, i) => (
					<Card key={i} loja={c.store_name} data={c.date} vendas={c.total_sales} conciliacao={c.reconciliation_status} depositos={c.total_deposits} saldo={c.balance} />
				))}
			</div>
		</div>
	);
}
