# DataCanvas

Transform Your Data into Beautiful Visualizations

![DataCanvas](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

## Features

- **Smart Data Detection** - Automatically detect data types (numbers, dates, categories, emails, URLs)
- **Auto-Visualization** - AI-powered visualization suggestions based on your data
- **Multiple Chart Types** - Bar, Line, Area, Pie, Donut, Scatter, Gauge charts
- **Dashboard Builder** - Create custom dashboards with drag-and-drop
- **Export Options** - Export visualizations as PNG, SVG, or PDF
- **Shareable Links** - Share your dashboards with a public link
- **Authentication** - Secure authentication with Google & GitHub OAuth

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts, Chart.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **File Parsing**: PapaParse (CSV), Native JSON

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Neon account (for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/jameslewis-git/DataCanvas.git
cd datacanvas
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
DATABASE_URL="postgresql://user:password@your-neon-url/datacanvas?sslmode=require"
DIRECT_URL="postgresql://user:password@your-neon-url/datacanvas?sslmode=require"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

4. Generate Prisma Client
```bash
npm run db:generate
```

5. Push database schema
```bash
npm run db:push
```

6. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using DataCanvas.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   └── api/                # API routes
├── components/
│   ├── charts/             # Chart components
│   ├── dashboard/           # Dashboard builder components
│   └── ui/                 # UI components
├── lib/
│   ├── analytics/          # Data analysis & detection
│   ├── db/                 # Database utilities
│   └── parser.ts           # File parsing utilities
├── hooks/                  # Custom React hooks
├── services/               # External services
└── types/                  # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Features in Development

- [ ] Drag-and-drop dashboard builder
- [ ] More chart types (treemap, heatmap, network graph)
- [ ] PDF export
- [ ] Embed codes for websites
- [ ] AI-powered insights
- [ ] Natural language queries
- [ ] Team collaboration
- [ ] Commercial license for proprietary use

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- You are free to use, modify, and distribute this software
- If you deploy this software on a network server, you must make the source code available
- For commercial/proprietary use, please contact us for a commercial license

See [LICENSE](LICENSE) for full details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📖 Documentation (Coming soon)
- 🐛 Issues: [GitHub Issues](https://github.com/jameslewis-git/DataCanvas/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/jameslewis-git/DataCanvas/discussions)

---

Made with ❤️ by the DataCanvas Team
