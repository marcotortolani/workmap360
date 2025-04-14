// lib/offline.ts
import Dexie, { Table } from 'dexie'

type RepairData = Table<{
  timestamp: number
  projectId: string
  drop: number
  level: number
  repairType: string
  images: { survey: Blob; progress: Blob; finish: Blob }
}>

// Extendemos Dexie para tipar la base de datos
class OfflineDB extends Dexie {
  repairs!: Table<RepairData, number> // Tipamos la tabla con RepairData y clave primaria number

  constructor() {
    super('OfflineDB')
    this.version(1).stores({
      repairs: 'timestamp, projectId, drop, level, repairType, images', // Índices
    })
  }
}

// Instanciamos la base de datos
const db = new OfflineDB()

// Guardar una reparación offline
export async function saveRepairOffline(repair: RepairData): Promise<void> {
  await db.repairs.add(repair)
}

// Obtener todas las reparaciones pendientes
export async function getPendingRepairs(): Promise<RepairData[]> {
  return await db.repairs.toArray()
}

// Eliminar una reparación pendiente por timestamp
export async function deletePendingRepair(timestamp: number): Promise<void> {
  await db.repairs.where('timestamp').equals(timestamp).delete()
}
