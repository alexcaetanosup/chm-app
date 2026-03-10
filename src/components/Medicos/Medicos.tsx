import { Save, Search, Stethoscope, UserPlus, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './Medicos.module.css';

export const Medicos: React.FC = () => {
    const [medicos, setMedicos] = useState<any[]>([]);
    const [especialidades, setEspecialidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form, setForm] = useState({
        DCMEDICO: '',
        CRM: '',
        CDESPECIALIDADE: '',
        CELULAR: ''
    });

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resM, resE] = await Promise.all([
                fetch('http://localhost:4000/api/medicos'),
                fetch('http://localhost:4000/api/especialidades')
            ]);
            setMedicos(await resM.json());
            setEspecialidades(await resE.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { carregarDados(); }, []);

    const filtrados = useMemo(() => {
        return medicos.filter(m => m.DCMEDICO?.toUpperCase().includes(busca.toUpperCase()));
    }, [busca, medicos]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de salvar...
        setIsModalOpen(false);
        carregarDados();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#0ea5e9' }}>
                        <Stethoscope color="#fff" />
                    </div>
                    <div>
                        <h1>Corpo Clínico</h1>
                        <p>{medicos.length} Médicos Ativos</p>
                    </div>
                </div>
                <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={20} /> Novo Médico
                </button>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar médico..."
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
                            <th>Nome do Médico</th>
                            <th>CRM</th>
                            <th>Especialidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className={styles.noData}>A carregar...</td></tr>
                        ) : (
                            filtrados.map((m, i) => (
                                <tr key={i}>
                                    <td className={styles.codeCol}>{m.CDMEDICO}</td>
                                    <td><strong>{m.DCMEDICO}</strong></td>
                                    <td>{m.CRM}</td>
                                    <td><span className={styles.badge}>{m.ESPECIALIDADE}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Cadastro de Médico</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Nome Completo</label>
                                <input required value={form.DCMEDICO} onChange={e => setForm({ ...form, DCMEDICO: e.target.value.toUpperCase() })} />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}><label>CRM</label>
                                    <input value={form.CRM} onChange={e => setForm({ ...form, CRM: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}><label>Especialidade</label>
                                    <input list="lista-esp" value={form.CDESPECIALIDADE} onChange={e => setForm({ ...form, CDESPECIALIDADE: e.target.value })} />
                                    <datalist id="lista-esp">
                                        {especialidades.map(e => <option key={e.CDESPECIAL} value={e.DSESPECIAL} />)}
                                    </datalist>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.btnConfirm} style={{ backgroundColor: '#0ea5e9' }}>
                                    <Save size={18} /> Salvar Médico
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};