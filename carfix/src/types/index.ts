export type BodyType = 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback'

export type CarPart =
  | 'engine'
  | 'transmission'
  | 'exhaust'
  | 'fuel_system'
  | 'cooling'
  | 'electrical'
  | 'brakes'
  | 'suspension'
  | 'tires'
  | 'catalytic_converter'
  | 'o2_sensor'
  | 'air_intake'
  | 'battery'
  | 'alternator'
  | 'starter'
  | 'radiator'
  | 'ac_compressor'
  | 'steering'
  | 'abs_module'
  | 'spark_plugs'
  | 'ignition_coil'
  | 'maf_sensor'
  | 'throttle_body'
  | 'evap_system'

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'professional'
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface DiagnosticEntry {
  id: string
  code: string
  description: string
  affectedPart: CarPart
  severity: Severity
  fixSteps: string[]
  partsNeeded: string[]
  estimatedCost: string
  difficulty: Difficulty
  addedAt: string
}

export interface CarPhoto {
  id: string
  filename: string
  originalName: string
  caption: string
  url: string
  uploadedAt: string
}

export interface Message {
  id: string
  sender: string
  text: string
  createdAt: string
}

export interface Car {
  id: string
  make: string
  model: string
  year: number
  trim: string
  color: string
  bodyType: BodyType
  vin: string
  mileage: number
  engine: string
  transmission: string
  notes: string
  diagnostics: DiagnosticEntry[]
  photos: CarPhoto[]
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface DiagnosticCodeInfo {
  code: string
  description: string
  affectedPart: CarPart
  severity: Severity
  fixSteps: string[]
  partsNeeded: string[]
  estimatedCost: string
  difficulty: Difficulty
  commonCauses: string[]
}

export type CreateCarInput = Pick<
  Car,
  'make' | 'model' | 'year' | 'trim' | 'color' | 'bodyType' | 'vin' | 'mileage' | 'engine' | 'transmission' | 'notes'
>
