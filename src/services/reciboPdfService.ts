import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const gerarReciboPDF = (
  listaParcelas: any[],
  dados: any,
  pacienteNome: string,
  medicoNome: string,
  especialidadeNome: string
) => {

  const doc: any = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text("CAIXA DE HONORÁRIOS MÉDICOS", pageWidth / 2, 16, { align: "center" });

  const numeroRecibo = String(Date.now()).slice(-6).padStart(6, "0");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Recibo Nº ${numeroRecibo}`, pageWidth - 20, 16, { align: "right" });

  doc.text(
    `Emitido em: ${new Date().toLocaleDateString("pt-BR")}`,
    pageWidth - 20,
    22,
    { align: "right" }
  );

  doc.setFontSize(13);

  doc.text(
    "RECIBO DE ATENDIMENTO MÉDICO",
    pageWidth / 2,
    26,
    { align: "center" }
  );

  doc.rect(14, 32, pageWidth - 28, 26);

  doc.setFontSize(10);

  doc.text(`Paciente: ${pacienteNome}`, 18, 40);
  doc.text(`Médico: ${medicoNome}`, 18, 46);
  doc.text(`Especialidade: ${especialidadeNome}`, 18, 52);

  doc.text(
    `Data Atendimento: ${new Date(dados.DATATEND || Date.now()).toLocaleDateString("pt-BR")}`,
    120,
    40
  );

  doc.text(`Plano: ${dados.PLANO}`, 120, 46);

  const rows = listaParcelas.map(p => [
    p.PARCELA,
    new Date(p.DTPARCELA).toLocaleDateString("pt-BR"),
    Number(p.VLPARCELA).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  ]);

  autoTable(doc, {
    startY: 65,
    head: [["Parc.", "Vencimento", "Valor"]],
    body: rows,
    theme: "grid"
  });

  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.save(`Recibo_${pacienteNome}.pdf`);
};