import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Calendar,
    CheckSquare,
    Filter,
    Printer,
    Square,
    Trash2
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './RelatorioItens.module.css';

export const RelatorioItens: React.FC = () => {
    const [lancamentos, setLancamentos] = useState<any[]>([]);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());

    const [flags, setFlags] = useState({
        porMedico: true,
        porPaciente: false,
        porData: false,
        porPlano: false,
        porMedicoAno: false
    });

    useEffect(() => {
        fetch('http://localhost:4000/api/lancamentos')
            .then(res => res.json())
            .then(dados => {
                const ordenados = dados.sort((a: any, b: any) =>
                    new Date(b.DATATEND).getTime() - new Date(a.DATATEND).getTime()
                );
                setLancamentos(ordenados);
            })
            .catch(err => console.error("Erro ao carregar lançamentos:", err));
    }, []);

    // Solução para o erro TS2802: Usando Array.from()
    const listaAnos = useMemo(() => {
        const anos = lancamentos.map(l => new Date(l.DATATEND).getFullYear().toString());
        const unicos = Array.from(new Set(anos));
        return unicos.sort((a, b) => b.localeCompare(a));
    }, [lancamentos]);

    const selecionarFlag = (key: keyof typeof flags) => {
        const novoEstado = Object.keys(flags).reduce((acc: any, k) => {
            acc[k] = k === key;
            return acc;
        }, {});
        setFlags(novoEstado);
    };

    const limparFiltros = () => {
        setDataInicio('');
        setDataFim('');
        setAnoSelecionado(new Date().getFullYear().toString());
        selecionarFlag('porMedico');
    };

    const dadosFiltrados = useMemo(() => {
        return lancamentos.filter(l => {
            const dataAtendObj = new Date(l.DATATEND);

            if (flags.porMedicoAno) {
                return dataAtendObj.getFullYear().toString() === anoSelecionado;
            }

            const dataAtendStr = l.DATATEND.split('T')[0];
            const matchInicio = dataInicio === '' || dataAtendStr >= dataInicio;
            const matchFim = dataFim === '' || dataAtendStr <= dataFim;
            return matchInicio && matchFim;
        });
    }, [lancamentos, dataInicio, dataFim, anoSelecionado, flags.porMedicoAno]);

    const gerarRelatorioMestre = () => {
        if (dadosFiltrados.length === 0) return alert("Não há dados para os filtros selecionados.");

        const doc = new jsPDF();
        let currentY = 20;

        doc.setFontSize(16);
        doc.text("Relatório Analítico CHM", 14, 15);

        doc.setFontSize(10);
        const subtitulo = flags.porMedicoAno
            ? `Exercício Base: ${anoSelecionado}`
            : `Período: ${dataInicio || 'Início'} até ${dataFim || 'Hoje'}`;
        doc.text(subtitulo, 14, 22);

        const agrupado = dadosFiltrados.reduce((acc: any, curr) => {
            let chave = "";
            if (flags.porMedico) chave = curr.MEDICO || "Não informado";
            else if (flags.porPaciente) chave = curr.PACIENTE || "Não informado";
            else if (flags.porPlano) chave = curr.PLANO || "PARTICULAR";
            else if (flags.porData) chave = new Date(curr.DATATEND).toLocaleDateString('pt-BR');
            else if (flags.porMedicoAno) chave = `Médico: ${curr.MEDICO} - Exercício ${anoSelecionado}`;

            if (!acc[chave]) acc[chave] = [];
            acc[chave].push(curr);
            return acc;
        }, {});

        Object.keys(agrupado).forEach((grupo) => {
            if (currentY > 240) { doc.addPage(); currentY = 20; }

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(grupo, 14, currentY + 10);

            const totalGrupo = agrupado[grupo].reduce((sum: number, l: any) => sum + Number(l.VLPARCELA), 0);

            autoTable(doc, {
                head: [['Data', 'Paciente', 'Plano', 'Valor', 'Status']],
                body: agrupado[grupo].map((l: any) => [
                    new Date(l.DATATEND).toLocaleDateString('pt-BR'),
                    l.PACIENTE,
                    l.PLANO,
                    Number(l.VLPARCELA).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    l.ABERTO === 'S' ? 'Pendente' : 'Pago'
                ]),
                startY: currentY + 15,
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59] },
                styles: { fontSize: 8 },
                foot: [[{ content: `Subtotal do Grupo: ${totalGrupo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }]],
                didDrawPage: (d) => { if (d.cursor) currentY = d.cursor.y + 10; }
            });

            currentY = (doc as any).lastAutoTable.finalY + 10;
        });

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text("ACS.Info - Alex Caetano dos Santos | CHM Gestão", 14, 285);
            doc.text(`Página ${i} de ${pageCount}`, 180, 285);
        }

        doc.save(`Relatorio_${flags.porMedicoAno ? 'Anual' : 'Analitico'}.pdf`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Configuração de Relatórios</h1>
                <p>Personalize os agrupamentos e filtros para exportação</p>
            </div>

            <div className={styles.configGrid}>
                <div className={styles.card}>
                    <h3><Calendar size={18} /> Filtro Temporal</h3>

                    {flags.porMedicoAno ? (
                        <div className={styles.inputGroupVertical}>
                            <label>Selecione o Ano do Exercício:</label>
                            <select
                                className={styles.selectAno}
                                value={anoSelecionado}
                                onChange={e => setAnoSelecionado(e.target.value)}
                            >
                                {listaAnos.length > 0 ? (
                                    listaAnos.map(ano => <option key={ano} value={ano}>{ano}</option>)
                                ) : (
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                )}
                            </select>
                        </div>
                    ) : (
                        <div className={styles.inputGroup}>
                            <div className={styles.dateField}>
                                <label>Início</label>
                                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                            </div>
                            <div className={styles.dateField}>
                                <label>Fim</label>
                                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.card}>
                    <h3><Filter size={18} /> Agrupar Relatório por:</h3>
                    <div className={styles.flagGrid}>
                        <div className={styles.flagItem} onClick={() => selecionarFlag('porMedico')}>
                            {flags.porMedico ? <CheckSquare color="#38bdf8" /> : <Square color="#94a3b8" />}
                            <span className={flags.porMedico ? styles.activeText : ''}>Médico (Geral)</span>
                        </div>
                        <div className={styles.flagItem} onClick={() => selecionarFlag('porMedicoAno')}>
                            {flags.porMedicoAno ? <CheckSquare color="#38bdf8" /> : <Square color="#94a3b8" />}
                            <span className={flags.porMedicoAno ? styles.activeText : ''}>Médico / Ano</span>
                        </div>
                        <div className={styles.flagItem} onClick={() => selecionarFlag('porPaciente')}>
                            {flags.porPaciente ? <CheckSquare color="#38bdf8" /> : <Square color="#94a3b8" />}
                            <span className={flags.porPaciente ? styles.activeText : ''}>Paciente</span>
                        </div>
                        <div className={styles.flagItem} onClick={() => selecionarFlag('porPlano')}>
                            {flags.porPlano ? <CheckSquare color="#38bdf8" /> : <Square color="#94a3b8" />}
                            <span className={flags.porPlano ? styles.activeText : ''}>Plano / Convênio</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actionArea}>
                <button className={styles.btnReset} onClick={limparFiltros}>
                    <Trash2 size={18} /> Limpar Filtros
                </button>
                <button className={styles.btnPrimary} onClick={gerarRelatorioMestre}>
                    <Printer size={20} /> Gerar PDF Analítico
                </button>
            </div>
        </div>
    );
};