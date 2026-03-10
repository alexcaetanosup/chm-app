import { Edit, Plus, Save, Stethoscope, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from '../Pacientes/Pacientes.module.css';

export const Especialidades: React.FC = () => {
    const [dados, setDados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [item, setItem] = useState({ CDESPECIAL: null, DCESPECIAL: '' });

    const carregar = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/api/especialidades');
            const data = await res.json();
            setDados(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    };

    useEffect(() => { carregar(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('http://localhost:4000/api/especialidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (res.ok) { setIsModalOpen(false); carregar(); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#0ea5e9' }}><Stethoscope color="#fff" /></div>
                    <h1>Especialidades</h1>
                </div>
                <button className={styles.btnPrimary} onClick={() => { setItem({ CDESPECIAL: null, DCESPECIAL: '' }); setIsModalOpen(true); }}>
                    <Plus size={18} /> Nova Especialidade
                </button>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.alignRight}>Cód.</th>
                            <th>Especialidade</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.filter(i => i.DCESPECIAL.toLowerCase().includes(busca.toLowerCase())).map(i => (
                            <tr key={i.CDESPECIAL}>
                                <td className={styles.alignRight}>{i.CDESPECIAL}</td>
                                <td>{i.DCESPECIAL}</td>
                                <td style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                    <button onClick={() => { setItem(i); setIsModalOpen(true); }} className={styles.btnIconEdit}><Edit size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Especialidade</h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Descrição</label>
                                <input required value={item.DCESPECIAL} onChange={e => setItem({ ...item, DCESPECIAL: e.target.value.toUpperCase() })} />
                            </div>
                            <button type="submit" className={styles.btnSave}><Save size={18} /> Salvar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};