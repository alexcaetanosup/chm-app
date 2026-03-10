import { Save, Search, User, UserPlus, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './Pacientes.module.css';

export const Pacientes: React.FC = () => {
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [busca, setBusca] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form, setForm] = useState({
        CDPACIENTE: '',
        DCPACIENTE: '',
        CPF: '',
        CELULAR: '',
        SEXO: 'M'
    });

    const carregarDados = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/api/pacientes');
            const data = await response.json();
            setPacientes(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarDados(); }, []);

    // Padronização com useMemo (igual ao Lancamentos)
    const filtrados = useMemo(() => {
        return pacientes.filter(p =>
            (p.DCPACIENTE || "").toUpperCase().includes(busca.toUpperCase()) ||
            (p.CPF || "").includes(busca)
        );
    }, [busca, pacientes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setForm({ CDPACIENTE: '', DCPACIENTE: '', CPF: '', CELULAR: '', SEXO: 'M' });
                carregarDados();
            }
        } catch (error) {
            alert("Erro ao salvar.");
        }
    };

    return (
        <div className={styles.container}>
            {/* HEADER PADRONIZADO */}
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#6366f1' }}>
                        <User color="#fff" />
                    </div>
                    <div>
                        <h1>Gestão de Pacientes</h1>
                        <p>Total de {pacientes.length} registros</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={20} /> Novo Paciente
                    </button>
                </div>
            </div>

            {/* BARRA DE BUSCA PADRONIZADA */}
            <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou CPF..."
                        className={styles.searchInput}
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Cód.</th>
                            <th>Nome do Paciente</th>
                            <th>CPF</th>
                            <th>Celular</th>
                            <th style={{ textAlign: 'center' }}>Sexo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.noData}>Carregando...</td></tr>
                        ) : (
                            filtrados.map((p, i) => (
                                <tr key={i}>
                                    <td className={styles.codeCol}>{p.CDPACIENTE}</td>
                                    <td className={styles.nameCol}>{p.DCPACIENTE}</td>
                                    <td>{p.CPF || '---'}</td>
                                    <td>{p.CELULAR || '---'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={styles.sexBadge}>{p.SEXO}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL PADRONIZADO (LANCAMENTOS STYLE) */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Cadastro de Paciente</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={form.DCPACIENTE}
                                    onChange={e => setForm({ ...form, DCPACIENTE: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>CPF</label>
                                    <input type="text" value={form.CPF} onChange={e => setForm({ ...form, CPF: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Sexo</label>
                                    <select value={form.SEXO} onChange={e => setForm({ ...form, SEXO: e.target.value })}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Celular</label>
                                <input type="text" value={form.CELULAR} onChange={e => setForm({ ...form, CELULAR: e.target.value })} />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.btnConfirm}><Save size={18} /> Salvar Paciente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};