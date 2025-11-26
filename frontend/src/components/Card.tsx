interface CardProps {
	loja: string;
	data: string;
	vendas: number;
    conciliacao: string;
	depositos:  number;
	saldo: number;
}

export default function Card({ loja, data, vendas, conciliacao, depositos, saldo }: CardProps) {
	return (
		<div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl text-white w-64 border border-white/10 hover:scale-105 transition-transform">
			<div className="flex justify-between items-center mb-2">
				<h2 className="font-semibold text-lg">{loja}</h2>
				<span className="bg-green-500 text-white text-xs px-2 py-1 rounded">{conciliacao}</span>
			</div>

			<p className="text-sm opacity-80">Data de criação: {data}</p>
			<p className="text-sm opacity-80">Total de vendas: R${vendas}</p>
			<p className="text-sm opacity-80">Total de depósitos: R${depositos}</p>
			<p className="text-sm opacity-80 font-semibold mt-1">Saldo: R${saldo.toFixed(2)}</p>
		</div>
	);
}
