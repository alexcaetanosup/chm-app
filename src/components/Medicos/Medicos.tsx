import { Edit2, Loader2, Search, Stethoscope, Trash2, UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './Medicos.module.css';

interface Medico {
    CDMEDICO: number;
    DCMEDICO: string;
    CRM: string;
    CDESPECIALIDADE: number;
    ESPECIALIDADE: string;
    CELULAR: string;
}

export const Medicos: React.FC = () => {
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form, setForm] = useState<Partial<Medico>>({
        DCMEDICO: '',
        CRM: '',
        CDESPECIALIDADE: 0,
        CELULAR: ''
    });

    // Função para carregar médicos do servidor
    const carregarMedicos = useCallback(async (termoBusca: string) => {
        setLoading(true);
        try {
            // Se houver busca, passamos o parâmetro na URL
            const url = termoBusca
                ? `http://localhost:4000/api/medicos?nome=${encodeURIComponent(termoBusca)}`
                : 'http://localhost:4000/api/medicos';

            const res = await fetch(url);
            const data = await res.json();
            setMedicos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao carregar médicos:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efeito de busca com atraso (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            carregarMedicos(busca);
        }, 400);

        return () => clearTimeout(timer);
    }, [busca, carregarMedicos]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/medicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setForm({ DCMEDICO: '', CRM: '', CDESPECIALIDADE: 0, CELULAR: '' });
                carregarMedicos(busca);
            }
        } catch (err) {
            console.error("Erro ao salvar médico:", err);
        }
    };

    const handleEdit = (m: Medico) => {
        setForm(m);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle}>
                        <Stethoscope color="#fff" />
                    </div>
                    <div>
                        <h1>Corpo Clínico</h1>
                        <p>{loading ? 'Buscando...' : `${medicos.length} médicos listados`}</p>
                    </div>
                </div>
                <button className={styles.btnPrimary} onClick={() => {
                    setForm({ DCMEDICO: '', CRM: '', CDESPECIALIDADE: 0, CELULAR: '' });
                    setIsModalOpen(true);
                }}>
                    <UserPlus size={20} /> Novo Médico
                </button>
            </div>

            {/* BARRA DE PESQUISA IGUAL À DE PACIENTES */}
            <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    {loading ? (
                        <Loader2 className={`${styles.searchIcon} ${styles.spin}`} size={20} />
                    ) : (
                        <Search className={styles.searchIcon} size={20} />
                    )}
                    <input
                        type="text"
                        placeholder="Pesquisar médico pelo nome..."
                        className={styles.searchInput}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        autoFocus
                    />
                    {busca && (
                        <button className={styles.clearSearch} onClick={() => setBusca('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nome do Médico</th>
                            <th>Especialidade</th>
                            <th>CRM</th>
                            <th>Celular</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicos.length > 0 ? (
                            medicos.map((m) => (
                                <tr key={m.CDMEDICO}>
                                    <td className={styles.nameCol}>{m.DCMEDICO}</td>
                                    <td>
                                        <span className={styles.especialidadeBadge}>
                                            {m.ESPECIALIDADE || 'Não definida'}
                                        </span>
                                    </td>
                                    <td className={styles.crmText}>{m.CRM}</td>
                                    <td>{m.CELULAR || '---'}</td>
                                    <td className={styles.actionsCol}>
                                        <button className={styles.btnIcon} onClick={() => handleEdit(m)}>
                                            <Edit2 size={18} color="#0ea5e9" />
                                        </button>
                                        <button className={styles.btnIcon}>
                                            <Trash2 size={18} color="#ef4444" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className={styles.noData}>
                                    {loading ? 'Consultando banco...' : 'Nenhum médico encontrado.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* O Modal continua aqui... */}
        </div>
    );
};