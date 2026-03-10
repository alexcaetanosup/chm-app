import { Save, Search, User, UserPlus, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './Pacientes.module.css';

export const Pacientes: React.FC = () => {
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form, setForm] = useState({
        DCPACIENTE: '',
        CPF: '',
        CELULAR: '',
        SEXO: 'M'
    });

    const carregarDados = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/api/pacientes');

            // Se a resposta for erro (500, 404, etc)
            if (!response.ok) {
                console.error("Erro no servidor ao buscar pacientes");
                setPacientes([]); // Garante que é um array vazio
                return;
            }

            const data = await response.json();

            // Verifica se 'data' realmente é uma lista antes de salvar
            if (Array.isArray(data)) {
                setPacientes(data);
            } else {
                setPacientes([]);
            }
        } catch (err) {
            console.error("Erro de conexão:", err);
            setPacientes([]); // Evita que o .map quebre
        } finally {
            setLoading(false);
        }
    };

    // USEFFECT para carregar os pacientes ao montar o componente
    useEffect(() => { carregarDados(); }, []);

    const filtrados = useMemo(() => {
        return pacientes.filter(p =>
            (p.DCPACIENTE || "").toUpperCase().includes(busca.toUpperCase()) ||
            (p.CPF || "").includes(busca)
        );
    }, [busca, pacientes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:4000/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            setIsModalOpen(false);
            setForm({ DCPACIENTE: '', CPF: '', CELULAR: '', SEXO: 'M' });
            carregarDados();
        } catch (error) { alert("Erro ao salvar."); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#6366f1' }}>
                        <User color="#fff" />
                    </div>
                    <div>
                        <h1>Pacientes</h1>
                        <p>{pacientes.length} Registados</p>
                    </div>
                </div>
                <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={20} /> Novo Paciente
                </button>
            </div>

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
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Telemóvel</th>
                            <th style={{ textAlign: 'center' }}>Sexo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.noData}>A carregar...</td></tr>
                        ) : (
                            filtrados.map((p, i) => (
                                <tr key={i}>
                                    <td className={styles.codeCol}>{p.CDPACIENTE}</td>
                                    <td><strong>{p.DCPACIENTE}</strong></td>
                                    <td>{p.CPF}</td>
                                    <td>{p.CELULAR}</td>
                                    <td style={{ textAlign: 'center' }}>{p.SEXO}</td>
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
                            <h2>Novo Cadastro</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Nome do Paciente</label>
                                <input required value={form.DCPACIENTE} onChange={e => setForm({ ...form, DCPACIENTE: e.target.value.toUpperCase() })} />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}><label>CPF</label>
                                    <input value={form.CPF} onChange={e => setForm({ ...form, CPF: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}><label>Sexo</label>
                                    <select value={form.SEXO} onChange={e => setForm({ ...form, SEXO: e.target.value })}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}><label>Telemóvel</label>
                                <input value={form.CELULAR} onChange={e => setForm({ ...form, CELULAR: e.target.value })} />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.btnConfirm}><Save size={18} /> Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};