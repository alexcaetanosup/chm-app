import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Calculator,
    DollarSign,
    Eye,
    Plus,
    Save,
    Search,
    X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { APP_TITLE } from '../../App';
import styles from './Lancamentos.module.css';

interface Parcela {
    DTPARCELA: string;
    VLPARCELA: number;
    PARCELA: number;
}

export const Lancamentos: React.FC = () => {
    const [lancamentos, setLancamentos] = useState<any[]>([]);
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [medicos, setMedicos] = useState<any[]>([]);
    const [especialidades, setEspecialidades] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busca, setBusca] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [item, setItem] = useState({
        DATATEND: new Date().toISOString().split('T')[0],
        VALOR_TOTAL: '',
        CDPACIENTE: '',
        CDMEDICO: '',
        CDESPECIAL: '',
        PLANO: 'PARTICULAR',
        QTD_PARCELAS: '1'
    });

    const [parcelas, setParcelas] = useState<Parcela[]>([]);

    const carregarTudo = async () => {
        setLoading(true);
        try {
            const [resL, resP, resM, resE] = await Promise.all([
                fetch('http://localhost:4000/api/lancamentos'),
                fetch('http://localhost:4000/api/pacientes'),
                fetch('http://localhost:4000/api/medicos'),
                fetch('http://localhost:4000/api/especialidades')
            ]);

            const dadosL = await resL.json();
            const ordenados = dadosL.sort((a: any, b: any) =>
                new Date(b.DATATEND).getTime() - new Date(a.DATATEND).getTime()
            );

            setLancamentos(ordenados);
            setPacientes(await resP.json());
            setMedicos(await resM.json());
            setEspecialidades(await resE.json());
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarTudo(); }, []);

    const lancamentosFiltrados = useMemo(() => {
        return lancamentos.filter(l =>
            l.PACIENTE?.toUpperCase().includes(busca.toUpperCase()) ||
            l.MEDICO?.toUpperCase().includes(busca.toUpperCase())
        );
    }, [busca, lancamentos]);

    const gerarPDFComprovante = (listaParcelas: Parcela[]) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        // USO DA CONSTANTE GLOBAL
        doc.text(APP_TITLE, 14, 15);
        // doc.text("Comprovante de Lançamento", 14, 15);

        doc.setFontSize(11);
        doc.text("Comprovante de Atendimento", 14, 22);

        doc.setFontSize(10);
        doc.text(`Paciente: ${item.CDPACIENTE}`, 14, 25);
        doc.text(`Médico: ${item.CDMEDICO}`, 14, 30);
        doc.text(`Data: ${new Date(item.DATATEND).toLocaleDateString('pt-BR')}`, 14, 35);

        const rows = listaParcelas.map(p => [
            p.PARCELA,
            new Date(p.DTPARCELA).toLocaleDateString('pt-BR'),
            Number(p.VLPARCELA).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ]);

        autoTable(doc, {
            head: [['Parc.', 'Vencimento', 'Valor']],
            body: rows,
            startY: 45,
            headStyles: { fillColor: [245, 158, 11] }
        });

        doc.save(`Lancamento_${item.CDPACIENTE.replace(/\s+/g, '_')}.pdf`);
    };

    const gerarParcelas = () => {
        const total = parseFloat(item.VALOR_TOTAL);
        const qtd = parseInt(item.QTD_PARCELAS);
        if (isNaN(total) || total <= 0 || isNaN(qtd) || qtd <= 0) return alert("Verifique valores e parcelas.");

        const valorBase = parseFloat((total / qtd).toFixed(2));
        const novas: Parcela[] = [];
        for (let i = 1; i <= qtd; i++) {
            const dt = new Date(item.DATATEND);
            dt.setMonth(dt.getMonth() + (i - 1));
            novas.push({
                DTPARCELA: dt.toISOString().split('T')[0],
                VLPARCELA: i === qtd ? parseFloat((total - (valorBase * (qtd - 1))).toFixed(2)) : valorBase,
                PARCELA: i
            });
        }
        setParcelas(novas);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (parcelas.length === 0) return alert("Gere as parcelas!");

        const nrVenda = Date.now();
        try {
            const promises = parcelas.map(p => {
                const body = { ...item, ...p, PARCELAM: item.QTD_PARCELAS, NRVENDA: nrVenda, ABERTO: 'S' };
                return fetch('http://localhost:4000/api/lancamentos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            });

            await Promise.all(promises);
            gerarPDFComprovante(parcelas);
            alert("Sucesso! PDF gerado.");
            setIsModalOpen(false);
            setParcelas([]);
            setItem({ ...item, VALOR_TOTAL: '', CDPACIENTE: '', CDMEDICO: '', CDESPECIAL: '', QTD_PARCELAS: '1' });
            carregarTudo();
        } catch (err) { alert("Erro ao salvar."); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <div className={styles.iconCircle} style={{ backgroundColor: '#f59e0b' }}><DollarSign color="#fff" /></div>
                    <div>
                        <h1>Lançamentos</h1>
                        <p>Gestão de Atendimentos e Cobranças</p>
                    </div>
                </div>
                <div>
                    <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Novo Atendimento
                    </button>
                </div>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por paciente ou médico..."
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
                            <th>Data Atend.</th>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Valor Parcela</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Carregando...</td></tr>
                        ) : (
                            lancamentosFiltrados.map((l, idx) => (
                                <tr key={idx}>
                                    <td>{new Date(l.DATATEND).toLocaleDateString('pt-BR')}</td>
                                    <td>{l.PACIENTE}</td>
                                    <td>{l.MEDICO}</td>
                                    <td>{Number(l.VLPARCELA).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${l.ABERTO === 'S' ? styles.pendente : styles.pago}`}>
                                            {l.ABERTO === 'S' ? 'Pendente' : 'Pago'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.btnIcon} onClick={() => setSelectedItem(true)}>
                                            <Eye size={18} color="#6366f1" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '750px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Novo Atendimento</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Paciente</label>
                                <input list="l-pac" required value={item.CDPACIENTE} onChange={(e) => setItem({ ...item, CDPACIENTE: e.target.value })} placeholder="Digite o nome..." />
                                <datalist id="l-pac">{pacientes.map((p, i) => <option key={i} value={p.DCPACIENTE} />)}</datalist>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Médico</label>
                                    <input list="l-med" required value={item.CDMEDICO} onChange={(e) => setItem({ ...item, CDMEDICO: e.target.value })} placeholder="Selecione o médico..." />
                                    <datalist id="l-med">{medicos.map((m, i) => <option key={i} value={m.DCMEDICO} />)}</datalist>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Especialidade</label>
                                    <input list="l-esp" required value={item.CDESPECIAL} onChange={(e) => setItem({ ...item, CDESPECIAL: e.target.value })} placeholder="Especialidade..." />
                                    <datalist id="l-esp">{especialidades.map((esp, i) => <option key={i} value={esp.DCESPECIAL} />)}</datalist>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Valor Total</label>
                                    <input type="number" step="0.01" value={item.VALOR_TOTAL} onChange={(e) => setItem({ ...item, VALOR_TOTAL: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Qtd. Parcelas</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="number" min="1" value={item.QTD_PARCELAS} onChange={(e) => setItem({ ...item, QTD_PARCELAS: e.target.value })} />
                                        <button type="button" onClick={gerarParcelas} className={styles.btnSecondary}><Calculator size={16} /> Gerar</button>
                                    </div>
                                </div>
                            </div>

                            {parcelas.length > 0 && (
                                <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    {parcelas.map((p, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', minWidth: '45px' }}>Parc {p.PARCELA}</span>
                                            <input type="date" value={p.DTPARCELA} onChange={(e) => {
                                                const n = [...parcelas]; n[i].DTPARCELA = e.target.value; setParcelas(n);
                                            }} />
                                            <input type="number" step="0.01" value={p.VLPARCELA} onChange={(e) => {
                                                const n = [...parcelas]; n[i].VLPARCELA = parseFloat(e.target.value); setParcelas(n);
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.btnConfirm} disabled={parcelas.length === 0}>
                                    <Save size={18} /> Salvar e Imprimir PDF
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};