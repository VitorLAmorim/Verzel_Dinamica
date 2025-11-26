import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";

interface Closure {
	store_id: number;
	nome_loja: string;
	data: string;
	total_vendas: number;
	total_depositos: number;
	saldo: number;
	status_conciliacao: string;
	has_register: boolean;
	atendimentos?: number;
}

export default function HomePage() {
	const [closures, setClosures] = useState<Closure[]>([]);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		axios
			.get(`${API_URL}/closure`)
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
					<Card key={i} loja={c.nome_loja} data={c.data} vendas={c.total_vendas.toString()} atendimentos={c.atendimentos ?? 0} depositos={c.total_depositos.toString()} saldo={c.saldo.toString()} />
				))}
			</div>
		</div>
	);
}
