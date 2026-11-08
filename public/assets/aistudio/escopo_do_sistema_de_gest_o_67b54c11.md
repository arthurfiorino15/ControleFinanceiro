# Escopo de Projeto: Sistema Web de Gestão Financeira para Veículo Terceirizado

## 1. Visão Geral e Contexto
* **Objetivo:** Desenvolver um aplicativo web simples, moderno e intuitivo para o acompanhamento financeiro de um único veículo terceirizado operado por um único motorista.
* **Usuário:** Dono/Gestor do veículo.
* **Frequência de Lançamento:** Diária, semanal ou mensal (flexível).
* **Foco Principal:** Exibir um Dashboard de controle mensal consolidado de receitas, despesas e lucro líquido.

---

## 2. Diretrizes de Design & Interface (UI/UX)
Para garantir uma experiência visual atraente, moderna e agradável, a aplicação deve seguir rigorosamente as diretrizes abaixo:

* **Estilo Visual (Claymorphism):** 
  * Elementos de interface (cards, botões, inputs, painéis) devem utilizar o estilo *Claymorphism*.
  * Utilizar sombras suaves e difusas combinadas com bordas arredondadas generosas (`border-radius: 20px` ou `24px`) e destaque sutil nas bordas internas (`inset shadow`) para criar um efeito tridimensional, macio e tátil (semelhante a massinha/argila moldada).
* **Paleta de Cores (Bem Colorida e Vibrante):**
  * **Fundo Geral (`background`):** Tons pastéis suaves e aconchegantes (ex: azul claro suave ou lilás pastel acinzentado) para dar destaque aos elementos em relevo.
  * **Cards e Blocos:** Cores vibrantes e alegres mas com boa legibilidade (ex: Coral/Laranja vibrante, Verde menta, Amarelo sol, Roxo profundo e Azul oceano).
  * **Texto e Ícones:** Alto contraste em relação aos fundos dos cards (usar branco ou tons de cinza muito escuro/preto suave) para garantir excelente legibilidade.

---

## 3. Requisitos Funcionais (Módulos da Aplicação)

### 3.1. Dashboard Mensal (Tela Principal)
* **Resumo Financeiro do Mês:** Cards grandes em estilo Claymorphic destacando:
  * Receita Bruta Total.
  * Despesas Totais.
  * **Lucro Líquido Real** (Destaque principal com cor positiva, ex: Verde menta).
* **Gráficos/Indicadores rápidos:** Visualização do comparativo de receitas e despesas.

### 3.2. Módulo de Lançamento de Receitas
* **Campos:**
  * Data do lançamento (com opção retroativa).
  * Valor Bruto (Campo numérico livre, pois o valor varia conforme a produção/corridas).
  * Botão de salvar estilizado em Claymorphism com cor de destaque.

### 3.3. Módulo de Lançamento de Despesas (Pagamento Imediato)
* **Categorias de Despesas:**
  * **Motorista (Diária):** Valor base fixo + campo opcional para acréscimos/bônus.
  * **Combustível:** Valor gasto no abastecimento.
  * **Manutenção:** Custos com reparos, peças ou óleo.
  * **Outros:** Gastos diversos eventuais.
* **Campos:** Data, Categoria, Valor e Descrição opcional.

---

## 4. Fora do Escopo (O que NÃO implementar nesta versão)
* Gestão de múltiplos veículos ou múltiplos motoristas.
* Relatórios exportáveis em PDF ou planilhas.
* Controle de reembolso ou despesas feitas do bolso do motorista (apenas pagamentos imediatos).
* Autenticação de usuários complexa (pode ser uma interface de uso direto, sem login obrigatório para simplificar).

---

## 5. Instrução para a IA Geradora de Código
* Crie o projeto em **um único arquivo HTML** (utilizando Tailwind CSS via CDN e blocos de estilos CSS personalizados para o efeito *Claymorphism* com sombras complexas `box-shadow`).
* Garanta que a interface seja responsiva e funcione perfeitamente tanto no celular quanto no computador.
* Adicione interatividade básica (ex: formulários funcionais salvando em `localStorage` do navegador para simular os lançamentos e atualizar o Dashboard em tempo real).