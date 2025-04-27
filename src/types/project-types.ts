export interface Elevation {
  name: string // Nombre de la cara, ej. "Norte", "Sur", "George St"
  drops: number // Cantidad de drops, ej. 11
  levels: number // Cantidad de niveles, ej. 7
}

export interface ProjectRepairType {
  repairTypeId: number // ID del tipo de reparación, ej. 1
  repairType: string // Código del tipo de reparación, ej. "CR"
  phases: number // Cantidad de fases (mín: 3, máx: 10)
  price: number // Precio de la reparación para este proyecto, ej. 1500
}

export interface TechnicianAssignment {
  technicianId: number // ID del técnico, ej. 10
  technicianName: string // Nombre del técnico, ej. "Jose Hernandez"
  technicianAvatar: string // URL o referencia al avatar (como string, ya que es un dato que luego se sincronizará)
}

export interface ProjectData {
  id: number // ID único del proyecto, ej. 1
  name: string // Nombre del proyecto (dirección), ej. "957 George Av"
  clientName: string // Nombre del cliente, ej. "Walter Perez"
  clientId: number // ID del cliente, ej. 100
  elevations: Elevation[] // Array de caras del edificio (mín: 1, máx: 6)
  repairTypes: ProjectRepairType[] // Tipos de reparación permitidos en el proyecto
  technicians: TechnicianAssignment[] // Técnicos asignados al proyecto
  googleDriveUrl: string // URL de la carpeta de Google Drive, ej. "https://drive.google.com/folder/xyz"
  createdBy: string // Nombre del Manager que creó el proyecto
  createdByUser: number // ID del Manager que creó el proyecto
  createdAt: number // Timestamp de creación
  updatedAt?: number // Timestamp de última actualización
}
