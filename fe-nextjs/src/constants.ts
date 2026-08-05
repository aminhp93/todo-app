import { BackendOption } from './types';

export const BACKENDS: BackendOption[] = [
  {
    id: 'node-express',
    name: 'Node + Express',
    url: 'http://localhost:5001',
    framework: 'Node.js (TypeScript)',
    port: 5001,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    requiresAuth: true,
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    url: 'http://localhost:5003',
    framework: 'NestJS (TypeScript)',
    port: 5003,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    requiresAuth: false,
  },
  {
    id: 'fastapi',
    name: 'FastAPI Python',
    url: 'http://localhost:5004',
    framework: 'FastAPI (Python 3.9)',
    port: 5004,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    requiresAuth: false,
  },
];
