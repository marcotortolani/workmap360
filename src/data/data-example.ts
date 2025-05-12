// data/data-example.ts
import type { ProjectData } from '@/types/project-types'

export const EXAMPLE_PROJECTS: ProjectData[] = [
  {
    id: 1,
    name: '957 George Av',
    clientName: 'Walter Perez',
    clientId: 100,
    elevations: [
      { name: 'Norte', drops: 11, levels: 7 },
      { name: 'Sur', drops: 9, levels: 8 },
      { name: 'Oeste', drops: 10, levels: 9 },
      { name: 'Este', drops: 8, levels: 8 },
    ],
    repairTypes: [
      {
        repairTypeId: 1,
        repairType: 'CR1',
        phases: 4,
        price: 1500,
        unitToCharge: 'Lt',
      },
      {
        repairTypeId: 15,
        repairType: 'MR',
        phases: 3,
        price: 1200,
        unitToCharge: 'm2',
      },
    ],
    technicians: [
      {
        technicianId: 10,
        technicianName: 'Jose Hernandez',
        technicianAvatar: 'https://example.com/avatar/jose.jpg',
      },
      {
        technicianId: 11,
        technicianName: 'Maria Lopez',
        technicianAvatar: 'https://example.com/avatar/maria.jpg',
      },
    ],
    googleDriveUrl: 'https://drive.google.com/folder/xyz',
    createdBy: 'John Doe',
    createdByUser: 123,
    createdAt: 1698777600000,
    updatedAt: 1698777600000,
    status: 'completed',
  },
  {
    id: 2,
    name: '123 Main St',
    clientName: 'Jane Smith',
    clientId: 101,
    elevations: [
      { name: 'Norte', drops: 11, levels: 7 },
      { name: 'Sur', drops: 9, levels: 8 },
      { name: 'Oeste', drops: 10, levels: 9 },
      { name: 'Este', drops: 8, levels: 8 },
    ],
    repairTypes: [
      {
        repairTypeId: 1,
        repairType: 'CR2',
        phases: 4,
        price: 1500,
        unitToCharge: 'Lt',
      },
      {
        repairTypeId: 15,
        repairType: 'MR',
        phases: 3,
        price: 1200,
        unitToCharge: 'm2',
      },
    ],
    technicians: [
      {
        technicianId: 10,
        technicianName: 'Jose Hernandez',
        technicianAvatar: 'https://example.com/avatar/jose.jpg',
      },
      {
        technicianId: 11,
        technicianName: 'Maria Lopez',
        technicianAvatar: 'https://example.com/avatar/maria.jpg',
      },
    ],
    googleDriveUrl: 'https://drive.google.com/folder/xyz',
    createdBy: 'John Doe',
    createdByUser: 123,
    createdAt: 1698777600000,
    updatedAt: 1698777600000,
    status: 'pending',
  },
  {
    id: 3,
    name: '789 Oak St',
    clientName: 'Bob Johnson',
    clientId: 102,
    elevations: [
      { name: 'Norte', drops: 11, levels: 7 },
      { name: 'Sur', drops: 9, levels: 8 },
      { name: 'Oeste', drops: 10, levels: 9 },
      { name: 'Este', drops: 8, levels: 8 },
    ],
    repairTypes: [
      {
        repairTypeId: 1,
        repairType: 'CR2',
        phases: 4,
        price: 1500,
        unitToCharge: 'Lt',
      },
      {
        repairTypeId: 15,
        repairType: 'MR',
        phases: 3,
        price: 1200,
        unitToCharge: 'm2',
      },
    ],
    technicians: [
      {
        technicianId: 10,
        technicianName: 'Jose Hernandez',
        technicianAvatar: 'https://example.com/avatar/jose.jpg',
      },
      {
        technicianId: 11,
        technicianName: 'Maria Lopez',
        technicianAvatar: 'https://example.com/avatar/maria.jpg',
      },
    ],
    googleDriveUrl: 'https://drive.google.com/folder/xyz',
    createdBy: 'John Doe',
    createdByUser: 123,
    createdAt: 1698777600000,
    updatedAt: 1698777600000,
    status: 'in-progress',
  },
]
