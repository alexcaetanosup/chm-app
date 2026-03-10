import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Calendar, Filter, Printer, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './Relatorios.module.css';

export const Relatorios: React.FC = () => {
    const [lancamentos, setLancamentos] = useState<any[]>([]);
    const [medicos, setMedicos] = useState<any[]>([]);

    // Estados dos Filtros
    const [filtroMedico, setFiltroMedico] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');

    useEffect(() => {
        // Carrega dados iniciais
        Promise.all([
            fetch('http://localhost:4000/api/lancamentos').then(res => res.json()),
            fetch('http://localhost:4000/api/medicos').then(res => res.json())
        ]).then(([dLanc, dMed]) => {
            // ORDENAÇÃO DECRESCENTE: Mais recentes primeiro
            const ordenados = dLanc.sort((a: any, b: any) =>
                new Date(b.DATATEND).getTime() - new Date(a.DATATEND).getTime()
            );
            setLancamentos(ordenados);
            setMedicos(dMed);
        });
    }, []);

    // Lógica de Filtragem (Mantém a ordem já definida no estado)
    const dadosFiltrados = useMemo(() => {
        return lancamentos.filter(l => {
            const dataAtend = l.DATATEND.split('T')[0];
            const matchMedico = filtroMedico === '' || l.MEDICO === filtroMedico;
            const matchInicio = dataInicio === '' || dataAtend >= dataInicio;
            const matchFim = dataFim === '' || dataAtend <= dataFim;
            const matchStatus = filtroStatus === 'TODOS' ||
                (filtroStatus === 'PAGO' && l.ABERTO === 'N') ||
                (filtroStatus === 'PENDENTE' && l.ABERTO === 'S');

            return matchMedico && matchInicio && matchFim && matchStatus;
        });
    }, [lancamentos, filtroMedico, dataInicio, dataFim, filtroStatus]);

    const gerarPDFPersonalizado = () => {
        const doc = new jsPDF();

        // Cálculos Financeiros baseados nos filtrados
        const subtotal = dadosFiltrados.reduce((acc, curr) => acc + Number(curr.VLPARCELA), 0);
        const taxa = subtotal * 0.05;
        const totalGeral = subtotal - taxa;

        const tableBody = dadosFiltrados.map(l => [
            new Date(l.DATATEND).toLocaleDateString('pt-BR'),
            l.PACIENTE,
            l.MEDICO,
            l.PLANO,
            Number(l.VLPARCELA).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            l.ABERTO === 'S' ? 'Pendente' : 'Pago'
        ]);

        autoTable(doc, {
            head: [['Data', 'Paciente', 'Médico', 'Plano', 'Valor (R$)', 'Status']],
            body: tableBody,
            startY: 40,
            headStyles: { fillColor: [30, 41, 59] },
            columnStyles: { 4: { halign: 'right' } },
            theme: 'striped',
            margin: { top: 40, bottom: 25 },

            didDrawPage: (data) => {
                doc.setFontSize(16);
                doc.setTextColor(40);
                doc.setFont("helvetica", "bold");
                doc.text("CHM - Caixa de Honorários Médicos", 14, 15);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(`Período: ${dataInicio || 'Início'} até ${dataFim || 'Hoje'}`, 14, 22);
                doc.text(`Médico: ${filtroMedico || 'Todos'}`, 14, 27);
                doc.text(`Status: ${filtroStatus}`, 14, 32);

                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

                doc.setDrawColor(200);
                doc.setLineWidth(0.2);
                doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

                doc.setFontSize(9);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(100);
                doc.text("ACS.Info - Alex Caetano dos Santos", 14, pageHeight - 10);

                const str = "Página " + doc.getNumberOfPages();
                doc.text(str, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        const f = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let currentY = finalY + 15;
        if (currentY > 250) {
            doc.addPage();
            currentY = 45;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);

        const startX = 130;
        doc.text(`Subtotal:`, startX, currentY);
        doc.text(`${f(subtotal)}`, 196, currentY, { align: 'right' });

        doc.setFont("helvetica", "normal");
        doc.text(`Taxa ADM (5%):`, startX, currentY + 7);
        doc.setTextColor(150, 0, 0);
        doc.text(`- ${f(taxa)}`, 196, currentY + 7, { align: 'right' });

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(startX, currentY + 10, 196, currentY + 10);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(`Total Líquido:`, startX, currentY + 17);
        doc.text(`${f(totalGeral)}`, 196, currentY + 17, { align: 'right' });

        doc.save(`Relatorio_CHM_${Date.now()}.pdf`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Central de Relatórios</h1>
                <p>Filtre as informações para gerar documentos em PDF</p>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div className={styles.filterGroup}>
                        <label><User size={14} /> Médico</label>
                        <input
                            list="medicos-list"
                            placeholder="Todos os médicos"
                            value={filtroMedico}
                            onChange={(e) => setFiltroMedico(e.target.value)}
                        />
                        <datalist id="medicos-list">
                            {medicos.map((m, i) => <option key={i} value={m.DCMEDICO} />)}
                        </datalist>
                    </div>

                    <div className={styles.filterGroup}>
                        <label><Calendar size={14} /> Data Inicial</label>
                        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                    </div>

                    <div className={styles.filterGroup}>
                        <label><Calendar size={14} /> Data Final</label>
                        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                    </div>

                    <div className={styles.filterGroup}>
                        <label><Filter size={14} /> Status</label>
                        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="TODOS">Todos os Status</option>
                            <option value="PAGO">Somente Pagos</option>
                            <option value="PENDENTE">Somente Pendentes</option>
                        </select>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button onClick={() => {
                        setFiltroMedico(''); setDataInicio(''); setDataFim(''); setFiltroStatus('TODOS');
                    }} className={styles.btnReset}>Limpar Filtros</button>

                    <button onClick={gerarPDFPersonalizado} className={styles.btnPrint}>
                        <Printer size={18} /> Gerar PDF do Resultado
                    </button>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <span>Resultado da busca: <strong>{dadosFiltrados.length} atendimentos</strong></span>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Paciente</th>
                                <th>Médico</th>
                                <th style={{ textAlign: 'right' }}>Valor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosFiltrados.map((l, i) => (
                                <tr key={i}>
                                    <td>{new Date(l.DATATEND).toLocaleDateString('pt-BR')}</td>
                                    <td>{l.PACIENTE}</td>
                                    <td>{l.MEDICO}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {Number(l.VLPARCELA).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td>{l.ABERTO === 'S' ? 'Pendente' : 'Pago'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};