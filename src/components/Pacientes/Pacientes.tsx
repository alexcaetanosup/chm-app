import { Edit, FileText, MapPin, Save, Search, Trash2, User, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from './Pacientes.module.css';

interface Paciente {
    CDPACIENTE: string;
    DCPACIENTE: string;
    CPF: string;
    CELULAR: string;
    RG?: string;
    SEXO?: string;
    TELEFONE?: string;
    CEP?: string;
    ENDERECO?: string;
    BAIRRO?: string;
    CIDADE?: string;
    UF?: string;
    OBSERVA?: string;
}

export const Pacientes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busca, setBusca] = useState('');
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);

    const initialForm = {
        CDPACIENTE: '', DCPACIENTE: '', CPF: '', RG: '', SEXO: 'M',
        CELULAR: '', TELEFONE: '', CEP: '', ENDERECO: '',
        BAIRRO: '', CIDADE: '', UF: '', OBSERVA: ''
    };

    const [form, setForm] = useState(initialForm);

    const carregaDados = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/pacientes');
            const data = await response.json();
            setPacientes(data);
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregaDados(); }, []);

    // --- MÁSCARAS ---
    const mCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
    const mCEP = (v: string) => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
    const mCel = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
    const mTel = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 14);

    const buscarCEP = async (cep: string) => {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setForm(prev => ({
                        ...prev,
                        ENDERECO: data.logradouro.toUpperCase(),
                        BAIRRO: data.bairro.toUpperCase(),
                        CIDADE: data.localidade.toUpperCase(),
                        UF: data.uf.toUpperCase()
                    }));
                }
            } catch (err) { console.error(err); }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            const focusableElements = e.currentTarget.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
                'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
            );
            const index = Array.from(focusableElements).indexOf(e.target as any);
            if (index > -1 && index < focusableElements.length - 1) focusableElements[index + 1].focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                alert("Paciente gravado com sucesso!");
                setIsModalOpen(false);
                carregaDados();
                setForm(initialForm);
            } else {
                const errorData = await response.json();
                alert("Erro ao salvar: " + (errorData.error || "Erro desconhecido"));
            }
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    };

    const excluirPaciente = async (id: string, nome: string) => {
        if (window.confirm(`Deseja excluir o paciente ${nome}?`)) {
            try {
                const res = await fetch(`http://localhost:4000/api/pacientes/${id}`, { method: 'DELETE' });
                if (res.ok) { carregaDados(); }
                else { const err = await res.json(); alert(err.error); }
            } catch (err) { alert("Erro ao excluir."); }
        }
    };

    const pacientesFiltrados = pacientes.filter(p =>
        p.DCPACIENTE?.toLowerCase().includes(busca.toLowerCase()) || p.CPF?.includes(busca)
    );

    return (
        <div className={styles.pageContainer}>
            {/* ÁREA FIXA */}
            <div className={styles.fixedHeader}>
                <div className={styles.headerPage}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className={styles.iconCircle} style={{ backgroundColor: '#3b82f6' }}>
                            <User color="#fff" size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>Pacientes</h2>
                            <small style={{ color: '#64748b' }}>Gestão de Cadastros</small>
                        </div>
                    </div>
                    <div className={styles.searchBar} style={{ marginBottom: '20px' }}>
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Pesquisar paciente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </div>
                    <button onClick={() => { setForm(initialForm); setIsModalOpen(true); }} className={styles.btnSave}>
                        <UserPlus size={18} /> NOVO PACIENTE
                    </button>
                </div>
            </div>

            {/* ÁREA DE SCROLL */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '100px', paddingLeft: '24px' }}>CÓD</th>
                            <th>NOME DO PACIENTE</th>
                            <th>CPF</th>
                            <th style={{ textAlign: 'center', width: '120px' }}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientesFiltrados.map((p) => (
                            <tr key={p.CDPACIENTE}>
                                <td>{p.CDPACIENTE}</td>
                                <td><strong>{p.DCPACIENTE}</strong></td>
                                <td>{p.CPF}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                        <Edit size={16} color="#1e293b" style={{ cursor: 'pointer' }} onClick={() => { setForm(p as any); setIsModalOpen(true); }} />
                                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => excluirPaciente(p.CDPACIENTE, p.DCPACIENTE)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.overlay}>
                    <form className={styles.modal} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                        <div className={styles.headerModal}>
                            <h2>{form.CDPACIENTE ? 'Editar Paciente' : 'Novo Cadastro'}</h2>
                            <X onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
                        </div>

                        <div className={styles.scroll}>
                            <div className={styles.sectionTitle}><User size={16} /> Dados Pessoais</div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 8' }}>
                                    <label className={styles.label}>NOME COMPLETO</label>
                                    {/* <input required className={styles.input} value={form.DCPACIENTE} onChange={e => setForm({ ...form, DCPACIENTE: e.target.value.toUpperCase() })} /> */}
                                    <input
                                        className={styles.input}
                                        maxLength={60} // Limita no visual
                                        value={form.ENDERECO}
                                        onChange={e => setForm({ ...form, ENDERECO: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 4' }}>
                                    <label className={styles.label}>SEXO</label>
                                    <select className={styles.input} value={form.SEXO} onChange={e => setForm({ ...form, SEXO: e.target.value })}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 4' }}>
                                    <label className={styles.label}>CPF</label>
                                    <input className={styles.input} value={form.CPF} onChange={e => setForm({ ...form, CPF: mCPF(e.target.value) })} />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 4' }}>
                                    <label className={styles.label}>RG</label>
                                    <input className={styles.input} value={form.RG} onChange={e => setForm({ ...form, RG: e.target.value })} />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 4' }}>
                                    <label className={styles.label}>CELULAR</label>
                                    <input className={styles.input} value={form.CELULAR} onChange={e => setForm({ ...form, CELULAR: mCel(e.target.value) })} />
                                </div>
                            </div>

                            <div className={styles.sectionTitle}><MapPin size={16} /> Endereço</div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 3' }}>
                                    <label className={styles.label}>CEP</label>
                                    <input className={styles.input} value={form.CEP} onChange={e => { const v = mCEP(e.target.value); setForm({ ...form, CEP: v }); buscarCEP(v); }} />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 9' }}>
                                    <label className={styles.label}>LOGRADOURO</label>
                                    <input className={styles.input} value={form.ENDERECO} onChange={e => setForm({ ...form, ENDERECO: e.target.value.toUpperCase() })} />
                                </div>
                            </div>

                            <div className={styles.sectionTitle}><FileText size={16} /> Observações</div>
                            <textarea className={styles.input} style={{ width: '100%', minHeight: '80px' }} value={form.OBSERVA} onChange={e => setForm({ ...form, OBSERVA: e.target.value.toUpperCase() })} />
                        </div>

                        <div className={styles.footer}>
                            <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>CANCELAR</button>
                            <button type="submit" className={styles.btnSave}><Save size={18} /> {form.CDPACIENTE ? 'SALVAR ALTERAÇÕES' : 'GRAVAR PACIENTE'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};