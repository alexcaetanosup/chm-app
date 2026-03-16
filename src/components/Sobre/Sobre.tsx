import React from "react";
import { APP_TITLE } from "../../App";
import styles from "./Sobre.module.css";

export const Sobre: React.FC = () => {
    return (
        <div className={styles.sobreContainer}>

            <h1>{APP_TITLE}</h1>

            <p className={styles.descricao}>
                O <strong>CHM – Caixa de Honorários Médicos</strong> é um sistema
                desenvolvido para auxiliar no controle financeiro e administrativo
                de honorários médicos em clínicas e consultórios.
            </p>

            <section>
                <h2>Objetivo</h2>
                <p>
                    O sistema tem como objetivo organizar os registros financeiros
                    relacionados aos atendimentos médicos, permitindo um controle
                    claro e eficiente dos valores recebidos e pendentes.
                </p>
            </section>

            <section>
                <h2>Principais Recursos</h2>

                <ul>
                    <li>Cadastro de pacientes</li>
                    <li>Cadastro de médicos</li>
                    <li>Gerenciamento de especialidades</li>
                    <li>Controle de lançamentos financeiros</li>
                    <li>Relatórios gerenciais</li>
                    <li>Painel de indicadores (Dashboard)</li>
                </ul>
            </section>

            <section>
                <h2>Benefícios</h2>

                <ul>
                    <li>Organização das informações financeiras</li>
                    <li>Controle de honorários médicos</li>
                    <li>Facilidade na geração de relatórios</li>
                    <li>Melhor acompanhamento da movimentação financeira</li>
                </ul>
            </section>

            <section>
                <h2>Tecnologia</h2>

                <p>
                    O sistema foi desenvolvido utilizando tecnologias modernas da web,
                    como <strong>React</strong>, <strong>TypeScript</strong> e
                    <strong> Node.js</strong>, garantindo desempenho, segurança
                    e facilidade de manutenção.
                </p>
            </section>
            <section>
                <h2>Desenvolvimento</h2>

                <p>
                    Sistema desenvolvido por: <strong>ACS-info - Alex Caetano dos Santos - (15) 99696-5727</strong>.
                </p>

                <p>
                    Desenvolvedor responsável pela concepção, arquitetura e
                    implementação do sistema CHM.
                </p>

                <p>
                    Tecnologias utilizadas: React, TypeScript, Node.js e API REST.
                </p>

            </section>

            <div className={styles.rodape}>
                <p>© {new Date().getFullYear()} - Sistema CHM - Todos os direitos reservados</p>
            </div>

        </div>
    );
};