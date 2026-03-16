import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

interface Lancamento {
    data: string;
    subtotal: number;
    status?: string;
}

export const Dashboard: React.FC = () => {

    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");

    const [totais, setTotais] = useState({
        honorarios: 0,
        recebido: 0,
        aberto: 0,
        quantidade: 0
    });

    useEffect(() => {
        carregarLancamentos();
    }, []);

    useEffect(() => {
        filtrarDashboard()
    }, [dataInicio, dataFim, lancamentos])

    // const carregarLancamentos = async () => {
    //     try {

    //         const resp = await fetch("http://localhost:4000/api/lancamentos");
    //         const dados = await resp.json();

    //         setLancamentos(dados);
    //         calcularTotais(dados);

    //     } catch (erro) {
    //         console.error("Erro ao carregar lançamentos:", erro);
    //     }
    // };

    const carregarLancamentos = async () => {
        try {

            const resp = await fetch("http://localhost:4000/api/lancamentos");
            const dados = await resp.json();

            console.log("Dados da API:", dados);

            setLancamentos(dados);
            calcularTotais(dados);

        } catch (erro) {
            console.error("Erro ao carregar lançamentos:", erro);
        }
    };

    const filtrarDashboard = () => {

        const filtrados = lancamentos.filter((l: Lancamento) => {

            if (!l.data) return false;

            const dataLanc = new Date(l.data);
            dataLanc.setHours(0, 0, 0, 0);

            if (dataInicio) {
                const inicio = new Date(dataInicio);
                inicio.setHours(0, 0, 0, 0);

                if (dataLanc < inicio) return false;
            }

            if (dataFim) {
                const fim = new Date(dataFim);
                fim.setHours(23, 59, 59, 999);

                if (dataLanc > fim) return false;
            }

            return true;
        });

        calcularTotais(filtrados);
    };

    const calcularTotais = (dados: Lancamento[]) => {

        const totalHonorarios = dados.reduce(
            (total, l) => total + Number(l.subtotal || 0),
            0
        );

        const totalRecebido = dados
            .filter(l => l.status === "pago")
            .reduce((total, l) => total + Number(l.subtotal || 0), 0);

        const totalAberto = totalHonorarios - totalRecebido;

        setTotais({
            honorarios: totalHonorarios,
            recebido: totalRecebido,
            aberto: totalAberto,
            quantidade: dados.length
        });
    };

    return (
        <div className={styles.dashboard}>

            <h1>Dashboard Financeiro</h1>

            <div className={styles.filtros}>

                <div className={styles.campo}>
                    <label>Data Inicial</label>
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                    />
                </div>

                <div className={styles.campo}>
                    <label>Data Final</label>
                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                    />
                </div>

                <button onClick={filtrarDashboard}>
                    Pesquisar
                </button>
                <button
                    onClick={() => {
                        setDataInicio("")
                        setDataFim("")
                        calcularTotais(lancamentos)
                    }}
                >
                    Limpar
                </button>

            </div>

            <div className={styles.cards}>

                <Card
                    titulo="Total Honorários"
                    valor={totais.honorarios}
                />

                <Card
                    titulo="Total Recebido"
                    valor={totais.recebido}
                />

                <Card
                    titulo="Total em Aberto"
                    valor={totais.aberto}
                />

                <Card
                    titulo="Lançamentos"
                    valor={totais.quantidade}
                    simples
                />

            </div>

        </div>
    );
};

interface CardProps {
    titulo: string;
    valor: number;
    simples?: boolean;
}

const Card: React.FC<CardProps> = ({ titulo, valor, simples }) => {

    return (
        <div className={styles.card}>

            <h3>{titulo}</h3>

            <p>
                {simples
                    ? valor
                    : valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    })}
            </p>

        </div>
    );
};