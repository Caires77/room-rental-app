# Sistema de Aluguel de Salas Comerciais

Este é um sistema web para gerenciamento de salas comerciais, permitindo aluguel mensal e diário.

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Autenticação e Banco de Dados)
- FullCalendar

## Funcionalidades

- Página pública com listagem de salas
- Sistema de autenticação (login/registro)
- Diferentes níveis de acesso (proprietário, inquilino, visitante)
- Calendário de disponibilidade
- Sistema de reservas
- Gerenciamento de créditos para inquilinos

## Pré-requisitos

- Node.js 18.17 ou superior
- Conta no Supabase

## Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd room-rental-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
src/
  ├── app/                    # Rotas da aplicação
  │   ├── (auth)/            # Rotas de autenticação
  │   ├── dashboard/         # Dashboards por tipo de usuário
  │   └── calendar/          # Páginas de calendário
  ├── components/            # Componentes React
  │   ├── ui/               # Componentes de UI
  │   ├── layout/           # Componentes de layout
  │   └── shared/           # Componentes compartilhados
  ├── lib/                  # Utilitários e configurações
  └── hooks/                # Custom hooks
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica os tipos TypeScript

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
