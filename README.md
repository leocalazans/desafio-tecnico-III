# Plataforma Médica Nx

Este projeto é uma plataforma médica para **gerenciamento de pacientes e exames DICOM**, construída com **NestJS (backend)** e **Angular (frontend)** usando **Nx monorepo**, seguindo boas práticas RESTful, transações ACID, código modular e testes automatizados.

---

## 🔧 Tecnologias

- **Backend:** NestJS, TypeORM, PostgreSQL  
- **Frontend:** Angular standalone + Material 3 expressive  
- **Monorepo:** Nx  
- **Testes:** Jest, Supertest, Angular TestBed  
- **Infraestrutura:** Docker, Docker Compose, futuro suporte a Kubernetes e Terraform  

---

## 🚀 Pré-requisitos

- Node.js >= 20  
- npm ou yarn  
- Docker & Docker Compose (opcional para subir containers)  

---

## ⚡ Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd <repo-root>

# Instalar dependências
npm install
# ou
yarn

🏗️ Rodando localmente (sem Docker)
Backend
# Subir backend
nx serve backend

# Testes unitários
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e

Frontend
# Subir frontend
nx serve frontend


O frontend estará disponível em http://localhost:4200 e o backend em http://localhost:3333 (ou conforme configurado).

🐳 Rodando com Docker
1️⃣ Subir serviços (Postgres, backend, frontend)
docker-compose up --build


Postgres: 5432

Backend: 3333

Frontend: 4200

2️⃣ Rodar testes dentro do container
# Entrar no container backend
docker exec -it <backend-container> bash

# Rodar testes
npm run test
npm run test:coverage

🧪 Testes
Testes unitários
npm run test           # executa todos os testes
npm run test:watch     # executa e mantém watch
npm run test:coverage  # gera relatório de cobertura

Testes E2E
npm run test:e2e       # executa testes de integração


Relatórios de cobertura são gerados em coverage/backend/index.html.

🗂️ Estrutura do projeto
apps/
├── backend/             # NestJS + TypeORM
├── frontend/            # Angular standalone + Material 3
libs/
├── shared/              # DTOs, enums e tipos compartilhados
docker-compose.yml
.env
nx.json
package.json

📌 Features implementadas

Cadastro e edição de pacientes

Cadastro e listagem de exames com idempotency

Paginação e validação de campos obrigatórios

UI/UX Material 3 Expressive com signals

Requisições seguras, transações ACID

Testes unitários e integração, cobertura >= 80%

API Swagger documentada

📚 Referências

Nx

NestJS

Angular Standalone Components

TypeORM

Material 3 Angular
