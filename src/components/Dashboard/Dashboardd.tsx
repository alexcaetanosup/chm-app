import { AlertCircle, CheckCircle, DollarSign, Loader2, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from '../Pacientes/Pacientes.module.css';

export const Dashboard: React.FC = () => {
    // Iniciamos com valores zerados para evitar o erro de 'undefined'
    const [stats, setStats] = useState({
        TOTAL_ATENDIMENTOS: 0,
        FATURAMENTO_TOTAL: 0,
        TOTAL_PENDENTE: 0,
        TOTAL_PAGO: 0
    });
    const [loading, setLoading] = useState(true);

    const carregarStats = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/dashboard');
            if (!res.ok) throw new Error("Erro na requisição");

            const data = await res.json();

            // Se o data vier nulo ou incompleto, mantemos o padrão
            setStats({
                TOTAL_ATENDIMENTOS: data.TOTAL_ATENDIMENTOS || 0,
                FATURAMENTO_TOTAL: data.FATURAMENTO_TOTAL || 0,
                TOTAL_PENDENTE: data.TOTAL_PENDENTE || 0,
                TOTAL_PAGO: data.TOTAL_PAGO || 0
            });
        } catch (err) {
            console.error("Erro ao carregar dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarStats();
    }, []);

    const formatarMoeda = (valor: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '10px' }}>
                <Loader2 className={styles.spin} /> <span>Carregando Dashboard...</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#6366f1' }}>
                        <TrendingUp color="#fff" />
                    </div>
                    <div>
                        <h1>Dashboard Financeiro</h1>
                        <p>Visão geral da clínica</p>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginTop: '20px'
            }}>
                {/* Usamos Number() e || 0 para blindar contra erros de tipo */}
                <CardDash
                    label="Atendimentos"
                    valor={String(stats?.TOTAL_ATENDIMENTOS ?? 0)}
                    icon={<Users color="#6366f1" />}
                    cor="#6366f1"
                />

                <CardDash
                    label="Faturamento Bruto"
                    valor={formatarMoeda(stats.FATURAMENTO_TOTAL)}
                    icon={<DollarSign color="#0ea5e9" />}
                    cor="#0ea5e9"
                />

                <CardDash
                    label="Contas a Receber"
                    valor={formatarMoeda(stats.TOTAL_PENDENTE)}
                    icon={<AlertCircle color="#f59e0b" />}
                    cor="#f59e0b"
                />

                <CardDash
                    label="Total Recebido"
                    valor={formatarMoeda(stats.TOTAL_PAGO)}
                    icon={<CheckCircle color="#10b981" />}
                    cor="#10b981"
                />
            </div>
        </div>
    );
};

// Componente do Card com proteção visual
const CardDash = ({ label, valor, icon, cor }: any) => (
    <div style={{
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        borderTop: `4px solid ${cor}` // Mudamos para borda superior para um visual mais moderno
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</span>
            {icon}
        </div>
        <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0, fontWeight: '700' }}>{valor}</h2>
    </div>
);