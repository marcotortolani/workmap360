// lib/offline.ts
import Dexie, { Table } from 'dexie'
import { RepairData } from '@/types/repair-type'

// Extendemos Dexie para tipar la base de datos
class OfflineDB extends Dexie {
  repairs!: Table<RepairData, string> // Tipamos la tabla con RepairData y clave primaria number

  constructor() {
    super('AltitudeAccessDB')
    this.version(1).stores({
      repairs:
        'id, timestamp, projectId, drop, level, repairType, repairTypeId, measurements, technician, technicianId, status, images',
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
export async function deletePendingRepair(id: string): Promise<void> {
  await db.repairs.where('id').equals(id).delete()
}
