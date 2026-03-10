import { AlertCircle, CheckCircle, DollarSign, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from '../Pacientes/Pacientes.module.css';

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        TOTAL_ATENDIMENTOS: 0,
        FATURAMENTO_TOTAL: 0,
        TOTAL_PENDENTE: 0,
        TOTAL_PAGO: 0
    });
    const [loading, setLoading] = useState(true);

    const carregarStats = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/dashboard/stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Erro ao carregar dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarStats(); }, []);

    const formatarMoeda = (valor: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    if (loading) return <div style={{ padding: '20px' }}>Carregando indicadores...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#6366f1' }}>
                        <TrendingUp color="#fff" />
                    </div>
                    <h1>Dashboard Financeiro</h1>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginTop: '20px'
            }}>
                {/* Card Total Atendimentos */}
                <CardDash
                    label="Atendimentos"
                    valor={stats.TOTAL_ATENDIMENTOS.toString()}
                    icon={<Users color="#6366f1" />}
                    cor="#e0e7ff"
                />

                {/* Card Faturamento Total */}
                <CardDash
                    label="Faturamento Bruto"
                    valor={formatarMoeda(stats.FATURAMENTO_TOTAL)}
                    icon={<DollarSign color="#0ea5e9" />}
                    cor="#e0f2fe"
                />

                {/* Card Pendente */}
                <CardDash
                    label="Contas a Receber"
                    valor={formatarMoeda(stats.TOTAL_PENDENTE)}
                    icon={<AlertCircle color="#f59e0b" />}
                    cor="#fef3c7"
                />

                {/* Card Pago */}
                <CardDash
                    label="Total Recebido"
                    valor={formatarMoeda(stats.TOTAL_PAGO)}
                    icon={<CheckCircle color="#10b981" />}
                    cor="#d1fae5"
                />
            </div>
        </div>
    );
};

const CardDash = ({ label, valor, icon, cor }: any) => (
    <div style={{
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        borderLeft: `6px solid ${cor}`
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{label}</span>
            {icon}
        </div>
        <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0 }}>{valor}</h2>
    </div>
);