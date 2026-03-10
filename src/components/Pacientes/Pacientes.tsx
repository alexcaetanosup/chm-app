import {
    Edit,
    FileText, MapPin, Save,
    Search,
    Trash2,
    User, UserPlus,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from './Pacientes.module.css';

interface Paciente {
    ID: string;
    CDPACIENTE: string;
    DCPACIENTE: string;
    CPF: string;
    CELULAR: string;
}

export const Pacientes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busca, setBusca] = useState('');
    const [pacientes, setPacientes] = useState<Paciente[]>([]);

    const [form, setForm] = useState({
        DCPACIENTE: '', CPF: '', RG: '', SEXO: 'M',
        CELULAR: '', TELEFONE: '', CEP: '', ENDERECO: '',
        BAIRRO: '', CIDADE: '', UF: '', ENDERECO2: '',
        BAIRRO2: '', CIDADE2: '', UF2: '', RECIBO: '',
        OBSERVA: ''
    });

    const carregaDados = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/pacientes');
            const data = await response.json();
            setPacientes(data);
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        }
    };

    useEffect(() => {
        carregaDados();
    }, []);

    // FUNÇÃO PARA SUBSTITUIR ENTER POR TAB
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            // Se for um textarea, deixamos o Enter funcionar normalmente
            if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

            // Previne o envio do formulário ao apertar Enter
            e.preventDefault();

            const formElement = e.currentTarget;
            const focusableElements = formElement.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
                'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
            );

            const index = Array.from(focusableElements).indexOf(e.target as any);

            if (index > -1 && index < focusableElements.length - 1) {
                focusableElements[index + 1].focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            alert("Paciente cadastrado com sucesso!");
            setIsModalOpen(false);
            carregaDados();
            setForm({
                DCPACIENTE: '', CPF: '', RG: '', SEXO: 'M',
                CELULAR: '', TELEFONE: '', CEP: '', ENDERECO: '',
                BAIRRO: '', CIDADE: '', UF: '', ENDERECO2: '',
                BAIRRO2: '', CIDADE2: '', UF2: '', RECIBO: '',
                OBSERVA: ''
            });
        } catch (error) {
            alert("Erro ao salvar cadastro.");
        }
    };

    const filtrar = (lista: Paciente[], termo: string) => {
        if (!termo) return [];
        const t = termo.toLowerCase();
        return lista.filter(p =>
            (p.DCPACIENTE?.toLowerCase() || "").includes(t) ||
            (p.CPF || "").includes(termo)
        );
    };

    const pacientesFiltrados = pacientes.filter(p => {
        const nome = p.DCPACIENTE ? p.DCPACIENTE.toLowerCase() : "";
        const cpf = p.CPF ? p.CPF : "";
        const termoBusca = busca.toLowerCase();
        return nome.includes(termoBusca) || cpf.includes(busca);
    });

    const sugestoesModal = form.DCPACIENTE.length >= 3 ? filtrar(pacientes, form.DCPACIENTE) : [];

    return (
        <div className={styles.pageContainer} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.headerPage}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '50%', border: '1px solid #ffe0b2' }}>
                        <User color="#ff9800" size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px' }}>Pacientes</h2>
                        <small style={{ color: '#64748b' }}>Gestão de Cadastros</small>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(true)} className={styles.btnSave}>
                    <UserPlus size={18} /> NOVO PACIENTE
                </button>
            </div>

            <div className={styles.searchBar} >
                <Search size={18} color="#94a3b8" />
                <input
                    type="text"
                    placeholder="Pesquisar paciente por nome ou CPF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <div className={styles.contentArea} style={{ flex: 1, overflowY: 'auto' }}>
                {/* <div className={styles.searchBar}>
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Pesquisar paciente por nome ou CPF..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div> */}

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>ID</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>NOME</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>CPF</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '12px', textAlign: 'right' }}>CELULAR</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientesFiltrados.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', fontSize: '13px' }}>{p.CDPACIENTE}</td>
                                <td style={{ padding: '12px', fontSize: '14px', fontWeight: 500 }}>{p.DCPACIENTE}</td>
                                <td style={{ padding: '12px', fontSize: '14px' }}>{p.CPF}</td>
                                <td style={{ padding: '12px', fontSize: '14px', color: '#475569', textAlign: 'right' }}>
                                    {p.CELULAR}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <Edit size={16} color="#1e293b" style={{ cursor: 'pointer', marginRight: '10px' }} />
                                    <Trash2 size={16} color="#000" style={{ cursor: 'pointer' }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.overlay}>
                    {/* ADICIONADO ONKEYDOWN NO FORMULÁRIO */}
                    <form className={styles.modal} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                        <div className={styles.headerModal}>
                            <h2 style={{ margin: 0, fontSize: '18px' }}>Novo Cadastro</h2>
                            <X onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
                        </div>

                        <div className={styles.scroll}>
                            <div className={styles.sectionTitle}><User size={16} /> Dados Pessoais</div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 8', position: 'relative' }}>
                                    <label className={styles.label}>NOME COMPLETO</label>
                                    <input
                                        required
                                        className={styles.input}
                                        value={form.DCPACIENTE}
                                        onChange={e => setForm({ ...form, DCPACIENTE: e.target.value.toUpperCase() })}
                                    />
                                    {sugestoesModal.length > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            backgroundColor: '#fff', border: '1px solid #e2e8f0',
                                            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            zIndex: 99, maxHeight: '150px', overflowY: 'auto'
                                        }}>
                                            {sugestoesModal.map(p => (
                                                <div key={p.CDPACIENTE} style={{ padding: '8px 12px', fontSize: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Já cadastrado: </span>
                                                    {p.DCPACIENTE}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    <input className={styles.input} value={form.CPF} onChange={e => setForm({ ...form, CPF: e.target.value })} />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 4' }}>
                                    <label className={styles.label}>RG</label>
                                    <input className={styles.input} value={form.RG} onChange={e => setForm({ ...form, RG: e.target.value })} />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 4' }}>
                                    <label className={styles.label}>CELULAR</label>
                                    <input className={styles.input} value={form.CELULAR} onChange={e => setForm({ ...form, CELULAR: e.target.value })} />
                                </div>
                            </div>

                            <div className={styles.sectionTitle}><MapPin size={16} /> Endereço</div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 3' }}>
                                    <label className={styles.label}>CEP</label>
                                    <input className={styles.input} value={form.CEP} onChange={e => setForm({ ...form, CEP: e.target.value })} />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 9' }}>
                                    <label className={styles.label}>LOGRADOURO</label>
                                    <input className={styles.input} value={form.ENDERECO} onChange={e => setForm({ ...form, ENDERECO: e.target.value })} />
                                </div>
                            </div>

                            <div className={styles.sectionTitle}><FileText size={16} /> Observações</div>
                            <textarea
                                className={styles.input}
                                style={{ width: '100%', minHeight: '80px' }}
                                value={form.OBSERVA}
                                onChange={e => setForm({ ...form, OBSERVA: e.target.value })}
                            />
                        </div>

                        <div className={styles.footer}>
                            <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>CANCELAR</button>
                            <button type="submit" className={styles.btnSave}>
                                <Save size={18} /> SALVAR ALTERAÇÕES
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};