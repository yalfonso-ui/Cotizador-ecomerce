/**
 * Accesos de infraestructura, telefonía y sistemas core por empleado.
 *
 * Estructura:
 *   dominio   → true/false  (Active Directory: usuario de red)
 *   vpn       → true/false  (Acceso VPN corporativo)
 *   telefonia → { genesys, avaya, issabel } cada uno con { activo, extension }
 *   sistemas   → { sia, eva } cada uno con { activo }
 *
 * Si un campo no aparece, se considera false / sin asignar (gris deshabilitado).
 */

const DEFAULT_ACCESS = () => ({
  dominio: false,
  vpn: false,
  telefonia: {
    genesys: { activo: false, extension: '' },
    avaya: { activo: false, extension: '' },
    issabel: { activo: false, extension: '' }
  },
  sistemas: {
    sia: { activo: false },
    eva: { activo: false }
  }
})

const POOLS = {
  COL_EXTENSIONS: ['4101', '4102', '4103', '4104', '4105', '4210', '4211', '4212', '4230', '4231', '4305', '4402'],
  MEX_EXTENSIONS: ['5201', '5202', '5203', '5210', '5211', '5220', '5230', '5240', '5301', '5302'],
  USAEX_EXTENSIONS: ['6001', '6002', '6003', '6010', '6011', '6020', '6030', '6040']
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length]
}

function hash(id) {
  let h = 0
  for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) | 0
  return h
}

/**
 * Devuelve un objeto `access` determinístico para un empleado.
 * Se usa en el seed inicial; las modificaciones del usuario se persisten en
 * `EMPLOYEE_ACCESS_OVERRIDES` para sobrevivir entre renders.
 */
export function getDefaultAccess(employee) {
  const h = hash(employee.id)
  const sedeKey = `${employee.sede}_EXTENSIONS`
  const pool = POOLS[sedeKey] || POOLS.COL_EXTENSIONS
  const access = DEFAULT_ACCESS()

  access.dominio = true
  access.vpn = h % 3 !== 0
  access.telefonia.genesys = { activo: h % 2 === 0, extension: pick(pool, h) }
  access.telefonia.avaya = { activo: h % 4 === 0, extension: pick(pool, h + 1) }
  access.telefonia.issabel = { activo: h % 5 === 0, extension: pick(pool, h + 2) }
  access.sistemas.sia = { activo: employee.sede !== 'USAEX' || h % 2 === 0 }
  access.sistemas.eva = { activo: h % 3 === 0 }

  if (employee.estado !== 'activo') {
    access.vpn = false
    access.telefonia.genesys.activo = false
    access.telefonia.avaya.activo = false
    access.telefonia.issabel.activo = false
    access.sistemas.sia.activo = false
    access.sistemas.eva.activo = false
  }

  return access
}

/**
 * Override in-memory store. El componente EmployeesView guarda aquí los cambios
 * del usuario (toggle on/off, edición de extensiones) para que sobrevivan
 * entre mounts / navegación sin necesidad de backend.
 */
export const EMPLOYEE_ACCESS_OVERRIDES = new Map()

export function getEmployeeAccess(employee) {
  const override = EMPLOYEE_ACCESS_OVERRIDES.get(employee.id)
  if (override) return override
  const fresh = getDefaultAccess(employee)
  EMPLOYEE_ACCESS_OVERRIDES.set(employee.id, fresh)
  return fresh
}

export function setEmployeeAccess(employeeId, next) {
  EMPLOYEE_ACCESS_OVERRIDES.set(employeeId, next)
}